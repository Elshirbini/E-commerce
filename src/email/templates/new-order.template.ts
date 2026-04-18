import { OrderDocument } from "../../order/schemas/order.schema";
import { EmailTemplate } from "./email-template.interface";

const getLocalizedValue = (value: any) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.ar || value.en || "";
};

const renderProductDetails = (item: any) => {
  const product = item.product || item.productId || {};
  const productName = getLocalizedValue(product.name) || "منتج";
  const productDescription = getLocalizedValue(product.description);
  const productWeight = product.weight ? ` | ${product.weight}` : "";
  const discountText =
    product.discount !== undefined ? ` | خصم ${product.discount}%` : "";
  const lineTotal = (item.quantity || 0) * (item.price || 0);

  return `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">
        <strong>${productName}</strong>
        ${
          productDescription
            ? `<div style="color:#666; font-size:12px; margin-top:4px;">${productDescription}</div>`
            : ""
        }
        <div style="color:#777; font-size:12px; margin-top:4px;">
          ${productWeight}${discountText}
        </div>
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align:center;">${
        item.quantity
      }</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align:center;">${(
        item.price || 0
      ).toFixed(2)} دينار كويتي</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align:center;">${lineTotal.toFixed(
        2,
      )} دينار كويتي</td>
    </tr>
  `;
};

export class NewOrderTemplateForAdmin implements EmailTemplate {
  constructor(
    private readonly recipient: string,
    private readonly order: Partial<OrderDocument>,
    private readonly user?: { fullName: string; email: string },
  ) {}

  get to() {
    return this.recipient;
  }

  subject(): string {
    return `🛒 طلب جديد – رقم الطلب #${this.order.orderNumber}`;
  }

  html(): string {
    const {
      firstName,
      lastName,
      phone,
      cartItems,
      totalPrice,
      paymentMethod,
      isPaid,
      shippingAddress,
    } = this.order || {};

    // ✅ استخدم بيانات المستخدم لو بيانات الأوردر ناقصة
    const fullName =
      `${firstName ?? ""} ${lastName ?? ""}`.trim() ||
      this.user?.fullName ||
      "عميل غير محدد";

    const paymentText =
      paymentMethod === "card" ? "بطاقة بنكية" : "الدفع عند الاستلام";
    const paidStatus = isPaid ? "✅ مدفوع" : "💵 غير مدفوع";

    const address = shippingAddress
      ? `
        <div style="margin-top: 10px; line-height:1.6;">
          <strong>عنوان الشحن:</strong><br/>
          ${shippingAddress.country ?? ""} - ${shippingAddress.governorate ?? ""} - ${shippingAddress.area ?? ""}<br/>
          شارع ${shippingAddress.street ?? ""} - مبنى ${shippingAddress.buildingNumber ?? ""}</small>
        </div>
      `
      : "<em>لم يتم إدخال عنوان شحن</em>";

    const itemsHtml = (cartItems ?? []).map(renderProductDetails).join("");

    return `
      <div style="font-family: 'Tahoma', Arial, sans-serif; padding: 20px; background-color: #f8f9fa;">
        <div style="max-width: 650px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 0 10px rgba(0,0,0,0.1); direction: rtl; text-align: right;">
          <h2 style="color: #333;">📢 إشعار بطلب جديد</h2>
          <p style="font-size: 16px; color: #555;">
            تم إنشاء طلب جديد بواسطة العميل <strong style="color:#007bff;">${fullName}</strong>.
          </p>

          <div style="background-color:#fafafa; border-radius:8px; padding:15px; margin-top:15px; line-height:1.8;">
          <p><strong>رقم الطلب:</strong> # ${this.order.orderNumber}</p>
            <p><strong>رقم الهاتف:</strong> ${phone}</p>
            <p><strong>طريقة الدفع:</strong> ${paymentText}</p>
            <p><strong>حالة الدفع:</strong> ${paidStatus}</p>
          </div>

          <h3 style="margin-top: 25px; color: #007bff;">🧾 تفاصيل الطلب:</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background-color: #f8f8f8;">
                <th style="padding: 8px; border-bottom: 1px solid #ddd; text-align:right;">المنتج</th>
                <th style="padding: 8px; border-bottom: 1px solid #ddd; text-align:center;">الكمية</th>
                <th style="padding: 8px; border-bottom: 1px solid #ddd; text-align:center;">السعر</th>
                <th style="padding: 8px; border-bottom: 1px solid #ddd; text-align:center;">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="text-align: left; margin-top: 15px;">
            <strong style="font-size: 18px;">الإجمالي: ${totalPrice?.toFixed(2)} دينار كويتي</strong>
          </div>

          ${address}

          <div style="margin-top: 30px; font-size: 14px; color: #555;">
            <p>📅 تم إنشاء الطلب في: <strong>${new Date(
              this.order.createdAt ??
                new Date(Date.now()).toLocaleString("en-KW"),
            )}</strong></p>
            <p style="margin-top:10px;">يرجى مراجعة لوحة التحكم لمتابعة حالة الطلب واتخاذ الإجراءات اللازمة.</p>
          </div>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />

          <p style="font-size: 13px; color: #777; text-align: center;">
            🚀 هذا إشعار آلي من <strong>المتجر</strong> — لا ترد على هذا البريد.
          </p>
        </div>
      </div>
    `;
  }
}
export class NewOrderTemplateForUser implements EmailTemplate {
  constructor(
    private readonly recipient: string,
    private readonly order: Partial<OrderDocument>,
    private readonly user?: { fullName: string; email: string },
  ) {}

  get to() {
    return this.recipient;
  }

  subject(): string {
    return `🛒 طلب جديد`;
  }

  html(): string {
    const {
      firstName,
      lastName,
      phone,
      cartItems,
      totalPrice,
      paymentMethod,
      isPaid,
      shippingAddress,
    } = this.order || {};

    // ✅ استخدم بيانات المستخدم لو بيانات الأوردر ناقصة
    const fullName =
      `${firstName ?? ""} ${lastName ?? ""}`.trim() ||
      this.user?.fullName ||
      "عميل غير محدد";

    const paymentText =
      paymentMethod === "card" ? "بطاقة بنكية" : "الدفع عند الاستلام";
    const paidStatus = isPaid ? "✅ مدفوع" : "💵 غير مدفوع";

    const address = shippingAddress
      ? `
        <div style="margin-top: 10px; line-height:1.6;">
          <strong>عنوان الشحن:</strong><br/>
          ${shippingAddress.country ?? ""} - ${shippingAddress.governorate ?? ""} - ${shippingAddress.area ?? ""}<br/>
          شارع ${shippingAddress.street ?? ""} - مبنى ${shippingAddress.buildingNumber ?? ""}</small>
        </div>
      `
      : "<em>لم يتم إدخال عنوان شحن</em>";

    const itemsHtml = (cartItems ?? []).map(renderProductDetails).join("");

    return `
      <div style="font-family: 'Tahoma', Arial, sans-serif; padding: 20px; background-color: #f8f9fa;">
        <div style="max-width: 650px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 0 10px rgba(0,0,0,0.1); direction: rtl; text-align: right;">
          <h2 style="color: #333;">📢 إشعار بطلب جديد</h2>
          <p style="font-size: 16px; color: #555;">
            تم إنشاء طلب جديد بواسطة العميل <strong style="color:#007bff;">${fullName}</strong>.
          </p>

          <div style="background-color:#fafafa; border-radius:8px; padding:15px; margin-top:15px; line-height:1.8;">
          <p><strong>رقم الطلب:</strong> # ${this.order.orderNumber}</p>
            <p><strong>رقم الهاتف:</strong> ${phone}</p>
            <p><strong>طريقة الدفع:</strong> ${paymentText}</p>
            <p><strong>حالة الدفع:</strong> ${paidStatus}</p>
          </div>

          <h3 style="margin-top: 25px; color: #007bff;">🧾 تفاصيل الطلب:</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background-color: #f8f8f8;">
                <th style="padding: 8px; border-bottom: 1px solid #ddd; text-align:right;">المنتج</th>
                <th style="padding: 8px; border-bottom: 1px solid #ddd; text-align:center;">الكمية</th>
                <th style="padding: 8px; border-bottom: 1px solid #ddd; text-align:center;">السعر</th>
                <th style="padding: 8px; border-bottom: 1px solid #ddd; text-align:center;">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="text-align: left; margin-top: 15px;">
            <strong style="font-size: 18px;">الإجمالي: ${totalPrice?.toFixed(2)} دينار كويتي</strong>
          </div>

          ${address}

          <div style="margin-top: 30px; font-size: 14px; color: #555;">
            <p>📅 تم إنشاء الطلب في: <strong>${new Date(
              this.order.createdAt ??
                new Date(Date.now()).toLocaleString("en-KW"),
            )}</strong></p>
            <p style="margin-top:10px;">يرجى مراجعة لوحة التحكم لمتابعة حالة الطلب واتخاذ الإجراءات اللازمة.</p>
          </div>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />

          <p style="font-size: 13px; color: #777; text-align: center;">
            🚀 هذا إشعار آلي من <strong>المتجر</strong> — لا ترد على هذا البريد.
          </p>
        </div>
      </div>
    `;
  }
}
