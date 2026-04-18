import cron from "node-cron";
import { logger } from "../config/logger";
import { deleteUnconfirmedOrdersAbove6H } from "../order/order.repository";

const deleteUnconfirmedOrders = async () => {
  try {
    await deleteUnconfirmedOrdersAbove6H();

    logger.info(
      "[CRON] ✅ Unconfirmed orders older than 6 hours have been deleted successfully.",
    );
  } catch (error) {
    logger.error(`[CRON] ❌ Failed to delete unconfirmed orders: ${error}`);
  }
};

// Schedule to run every day at 1:00 AM
cron.schedule("0 1 * * *", async () => {
  logger.info("[CRON] 🕐 Starting scheduled task: deleteUnconfirmedOrders...");
  await deleteUnconfirmedOrders();
});
