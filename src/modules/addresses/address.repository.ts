import { Repository } from "typeorm";
import { AppDataSource } from "@database/data-source";
import { Address } from "@modules/addresses/address.entity";

export class AddressRepository {
  private readonly repo: Repository<Address> = AppDataSource.getRepository(Address);

  create(data: Partial<Address>): Address {
    return this.repo.create(data);
  }

  save(addr: Address): Promise<Address> {
    return this.repo.save(addr);
  }

  findByUser(userId: string): Promise<Address[]> {
    return this.repo.find({ where: { userId }, order: { isDefault: "DESC", createdAt: "DESC" } });
  }

  findByIdAndUser(id: string, userId: string): Promise<Address | null> {
    return this.repo.findOne({ where: { id, userId } });
  }

  async deleteById(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}
