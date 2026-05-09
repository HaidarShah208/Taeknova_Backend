import { Repository } from "typeorm";
import { AppDataSource } from "@database/data-source";
import { InventoryLog } from "@modules/inventory/inventoryLog.entity";

export class InventoryRepository {
  private readonly repo: Repository<InventoryLog> = AppDataSource.getRepository(InventoryLog);

  create(data: Partial<InventoryLog>): InventoryLog {
    return this.repo.create(data);
  }

  save(log: InventoryLog): Promise<InventoryLog> {
    return this.repo.save(log);
  }

  listByProduct(productId: string): Promise<InventoryLog[]> {
    return this.repo.find({ where: { productId }, order: { createdAt: "DESC" } });
  }
}
