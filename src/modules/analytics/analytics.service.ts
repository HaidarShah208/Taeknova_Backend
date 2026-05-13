import { AppDataSource } from "@database/data-source";
import { Order } from "@modules/orders/order.entity";
import { OrderStatus } from "@modules/orders/order.types";

export class AnalyticsService {
  async getAdminOverview() {
    const orderRepo = AppDataSource.getRepository(Order);
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const totalRaw = await orderRepo
      .createQueryBuilder("o")
      .select("COUNT(*)", "allOrders")
      .where("o.status != :cancelled", { cancelled: OrderStatus.CANCELLED })
      .getRawOne<{ allOrders: string }>();

    const rollingRaw = await orderRepo
      .createQueryBuilder("o")
      .select("COUNT(*)", "ordersLast30d")
      .addSelect("COALESCE(SUM(o.totalAmount), 0)", "revenue30d")
      .where("o.createdAt >= :since", { since: since.toISOString() })
      .andWhere("o.status != :cancelled", { cancelled: OrderStatus.CANCELLED })
      .getRawOne<{ ordersLast30d: string; revenue30d: string }>();

    return {
      allOrders: Number(totalRaw?.allOrders ?? 0),
      ordersLast30d: Number(rollingRaw?.ordersLast30d ?? 0),
      revenue30d: Number(rollingRaw?.revenue30d ?? 0),
      currency: "USD",
      windowDays: 30,
    };
  }
}
