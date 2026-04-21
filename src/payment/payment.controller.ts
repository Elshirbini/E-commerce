import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { success } from "../utils/response";
import { buildOrderForCheckout } from "../order/order.checkout.service";
import {
  createOrder,
  findOrderByIdAndUpdate,
  findOrderById,
} from "../order/order.repository";
import { processOrderConfirmation } from "../order/order.service";
import {
  createPayment,
  findLatestPaymentByOrderId,
  findPaymentById,
  findPaymentByStripeCheckoutSessionId,
  findPaymentByStripePaymentIntentId,
  updatePaymentStatus,
} from "./payment.repository";
import { getStripeClient } from "./stripe/stripe.client";
import { logger } from "../config/logger";

type StripeEvent = {
  type: string;
  data: { object: unknown };
};

type StripePaymentIntent = {
  id: string;
  last_payment_error?: { message?: string | null } | null;
};

type StripeCheckoutSession = {
  id: string;
  payment_intent?: string | null;
};

const stripeWebhookSecret = () => {
  const secret = process.env.WEBHOOK_SECRET_KEY;
  if (!secret) throw new Error("Missing WEBHOOK_SECRET_KEY");
  return secret;
};

export const checkoutCash = async (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || undefined;
  const { orderData, invoice } = await buildOrderForCheckout(req, {
    ...req.body,
    userId,
  });

  const order = await createOrder({ ...orderData, paymentMethod: "cash" });
  const payment = await createPayment({
    orderId: order._id,
    userId: order.userId,
    method: "cash",
    status: "pending",
    amount: invoice.totalPrice,
    currency: "usd",
  });

  return success(res, 201, "Order created successfully", {
    ...invoice,
    orderId: order._id,
    paymentId: payment._id,
    paymentStatus: payment.status,
    paymentMethod: payment.method,
  });
};

export const checkoutStripe = async (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || undefined;
  const { orderData, invoice, amountMinor, currency } =
    await buildOrderForCheckout(req, {
      ...req.body,
      userId,
    });

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new ApiError("Stripe is not configured", 500);
  }

  const order = await createOrder({ ...orderData, paymentMethod: "stripe" });

  const frontendUrl =
    process.env.NODE_ENV === "prod"
      ? process.env.FRONTEND_URL_PROD
      : process.env.FRONTEND_URL;

  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${frontendUrl}/payment-confirm?orderId=${order._id}`,
    cancel_url: `${frontendUrl}/payment-confirm?orderId=${order._id}`,
    client_reference_id: order._id.toString(),
    metadata: { orderId: order._id.toString() },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: amountMinor,
          product_data: {
            name: `Order #${order.orderNumber ?? ""}`.trim() || "Order",
          },
        },
      },
    ],
  });

  const payment = await createPayment({
    orderId: order._id,
    userId: order.userId,
    method: "stripe",
    status: "pending",
    amount: invoice.totalPrice,
    currency,
    stripeCheckoutSessionId: session.id,
    metadata: {
      checkoutSessionCreatedAt: new Date().toISOString(),
    },
  });

  return success(res, 201, "Stripe checkout session created", {
    ...invoice,
    orderId: order._id,
    paymentId: payment._id,
    checkoutSessionId: session.id,
    url: session.url,
  });
};

export const getPaymentStatus = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const payment = await findLatestPaymentByOrderId(orderId);
  if (!payment) throw new ApiError(req.__("Payment not found"), 404);

  return success(res, 200, "Payment status retrieved successfully", {
    paymentId: payment._id,
    status: payment.status,
    method: payment.method,
    paidAt: payment.paidAt,
    failureReason: payment.failureReason,
  });
};

export const markCashPaid = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { paid } = req.body as { paid: boolean };

  const payment = await findPaymentById(id);
  if (!payment) throw new ApiError(req.__("Payment not found"), 404);
  if (payment.method !== "cash") {
    throw new ApiError("Only cash payments supported", 400);
  }

  const updated = await updatePaymentStatus(
    payment._id.toString(),
    paid ? "paid" : "pending",
    {
      paidAt: paid ? new Date() : undefined,
    },
  );

  return success(res, 200, "Payment updated successfully", {
    paymentId: updated?._id,
    status: updated?.status,
    paidAt: updated?.paidAt,
  });
};

export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];
  if (!sig || typeof sig !== "string") {
    throw new ApiError("Missing stripe-signature header", 400);
  }

  const rawBody = (req as any).rawBody as Buffer | undefined;
  if (!rawBody) {
    throw new ApiError("Missing raw request body", 400);
  }

  const stripe = getStripeClient();

  let event: StripeEvent;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      stripeWebhookSecret(),
    ) as StripeEvent;
  } catch (err: any) {
    throw new ApiError(
      `Webhook signature verification failed: ${err.message}`,
      400,
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as StripeCheckoutSession;
      await handleCheckoutSessionCompleted(session);
      break;
    }
    case "payment_intent.succeeded": {
      const pi = event.data.object as StripePaymentIntent;
      await handlePaymentIntent(pi, "paid");
      break;
    }
    case "payment_intent.payment_failed": {
      const pi = event.data.object as StripePaymentIntent;
      await handlePaymentIntent(pi, "failed");
      break;
    }
    case "payment_intent.requires_action": {
      const pi = event.data.object as StripePaymentIntent;
      await handlePaymentIntent(pi, "requires_action");
      break;
    }
    case "payment_intent.canceled": {
      const pi = event.data.object as StripePaymentIntent;
      await handlePaymentIntent(pi, "cancelled");
      break;
    }
    default:
      break;
  }

  return res.status(200).json({ received: true });
};

const handlePaymentIntent = async (
  paymentIntent: StripePaymentIntent,
  status: "paid" | "failed" | "requires_action" | "pending" | "cancelled",
) => {
  const payment = await findPaymentByStripePaymentIntentId(paymentIntent.id);
  if (!payment) {
    logger.warn(
      `Received webhook for unknown payment intent ${paymentIntent.id}`,
    );
    return;
  }

  const patch: any = {};
  if (status === "paid") patch.paidAt = new Date();
  if (status === "failed") {
    patch.failureReason = paymentIntent.last_payment_error?.message;
  }

  await updatePaymentStatus(payment._id.toString(), status, patch);
};

const handleCheckoutSessionCompleted = async (
  session: StripeCheckoutSession,
) => {
  const payment = await findPaymentByStripeCheckoutSessionId(session.id);
  if (!payment) {
    logger.warn(
      `Received checkout.session.completed for unknown session ${session.id}`,
    );
    return;
  }

  const orderCheck = await findOrderById(payment.orderId.toString());
  if (!orderCheck) {
    logger.warn(`Order not found for this payment ${payment._id}`);
    return;
  }

  if (orderCheck.isConfirmed && orderCheck.isPaid) {
    logger.info(
      `Session ${session.id} already processed. Idempotency handled.`,
    );
    return;
  }

  const order = await findOrderByIdAndUpdate(payment.orderId.toString(), {
    isConfirmed: true,
    isPaid: true,
    paidAt: new Date(),
  });
  if (!order) {
    logger.warn(`Order not found for this payment ${payment._id}`);
    return;
  }

  const patch: any = { paidAt: new Date() };
  if (session.payment_intent) {
    patch.stripePaymentIntentId = session.payment_intent;
  }

  await updatePaymentStatus(payment._id.toString(), "paid", patch);

  // Trigger side effects same as cash confirm
  await processOrderConfirmation(order, "paid", "stripe");
};
