import { Repository } from "typeorm";
import { AppDataSource } from "@database/data-source";
import { ProductVariant } from "@modules/products/productVariant.entity";

export class ProductVariantRepository {
  private readonly repo: Repository<ProductVariant> = AppDataSource.getRepository(ProductVariant);

  create(data: Partial<ProductVariant>): ProductVariant {
    return this.repo.create(data);
  }

  save(variant: ProductVariant): Promise<ProductVariant> {
    return this.repo.save(variant);
  }

  findById(id: string): Promise<ProductVariant | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByIdWithProduct(id: string): Promise<ProductVariant | null> {
    return this.repo.findOne({ where: { id }, relations: ["product"] });
  }

  async findByProduct(productId: string): Promise<ProductVariant[]> {
    return this.repo.find({ where: { productId } });
  }
}
