import { Repository } from "typeorm";
import { AppDataSource } from "@database/data-source";
import { Order } from "@modules/orders/order.entity";

export class OrderRepository {
  private readonly repo: Repository<Order> = AppDataSource.getRepository(Order);

  create(data: Partial<Order>): Order {
    return this.repo.create(data);
  }

  save(order: Order): Promise<Order> {
    return this.repo.save(order);
  }

  findByIdWithItems(id: string): Promise<Order | null> {
    return this.repo.findOne({ where: { id }, relations: ["items", "items.variant"] });
  }

  async findByIdAndUser(id: string, userId: string): Promise<Order | null> {
    return this.repo.findOne({
      where: { id, userId },
      relations: ["items", "items.variant"],
    });
  }

  async findByUserPaginated(userId: string, page: number, limit: number): Promise<[Order[], number]> {
    return this.repo.findAndCount({
      where: { userId },
      relations: ["items"],
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findAllPaginated(page: number, limit: number): Promise<[Order[], number]> {
    return this.repo.findAndCount({
      relations: ["items", "user"],
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}
