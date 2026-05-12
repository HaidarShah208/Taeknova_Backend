import { StatusCodes } from "http-status-codes";
import { ApiError } from "@common/exceptions/ApiError";
import { CategoryRepository } from "@modules/categories/category.repository";
import { ProductRepository } from "@modules/products/product.repository";
import { ProductVariantRepository } from "@modules/products/productVariant.repository";
import { ProductStatus, StockStatus } from "@modules/products/product.types";
import { UploadService } from "@modules/uploads/upload.service";

type CreateVariantInput = {
  size: string;
  color: string;
  sku: string;
  stockQuantity: number;
  variantPrice?: number;
};

export class ProductService {
  constructor(
    private readonly productRepository = new ProductRepository(),
    private readonly variantRepository = new ProductVariantRepository(),
    private readonly categoryRepository = new CategoryRepository(),
    private readonly uploadService = new UploadService(),
  ) {}

  private evaluateStockStatus(totalStock: number): StockStatus {
    if (totalStock <= 0) return StockStatus.OUT_OF_STOCK;
    if (totalStock <= 10) return StockStatus.LOW_STOCK;
    return StockStatus.IN_STOCK;
  }

  async create(
    payload: {
      name: string;
      slug: string;
      description?: string;
      basePrice: number;
      categoryId: string;
      isFeatured?: boolean;
      variants: CreateVariantInput[];
    },
    adminId: string,
  ) {
    const existing = await this.productRepository.findBySlug(payload.slug);
    if (existing) throw new ApiError(StatusCodes.CONFLICT, "Product slug already exists");

    const category = await this.categoryRepository.findById(payload.categoryId);
    if (!category) throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid category");

    const totalStock = payload.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);
    const product = this.productRepository.create({
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      basePrice: payload.basePrice,
      categoryId: payload.categoryId,
      createdById: adminId,
      isFeatured: payload.isFeatured ?? false,
      stockStatus: this.evaluateStockStatus(totalStock),
      /** Admin CMS: new items are published; use edit to change status if needed. */
      status: ProductStatus.APPROVED,
    });

    const savedProduct = await this.productRepository.save(product);

    const variantPromises = payload.variants.map((variant) =>
      this.variantRepository.save(
        this.variantRepository.create({
          ...variant,
          productId: savedProduct.id,
        }),
      ),
    );
    await Promise.all(variantPromises);

    return this.productRepository.findById(savedProduct.id);
  }

  async list(query: { page: number; limit: number; search?: string; status?: ProductStatus }) {
    const [products, total] = await this.productRepository.findPaginated(query);
    return {
      items: products,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    };
  }

  async update(productId: string, payload: Partial<{ name: string; slug: string; description?: string; basePrice: number; categoryId: string; isFeatured: boolean; status: ProductStatus }>) {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");

    if (payload.slug && payload.slug !== product.slug) {
      const existingSlug = await this.productRepository.findBySlug(payload.slug);
      if (existingSlug) throw new ApiError(StatusCodes.CONFLICT, "Product slug already exists");
    }

    if (payload.categoryId) {
      const category = await this.categoryRepository.findById(payload.categoryId);
      if (!category) throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid category");
    }

    Object.assign(product, payload);
    return this.productRepository.save(product);
  }

  async remove(productId: string) {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
    await this.productRepository.remove(product);
  }

  async setApprovalStatus(productId: string, status: ProductStatus) {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
    product.status = status;
    return this.productRepository.save(product);
  }

  async uploadImage(productId: string, fileBuffer: Buffer) {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");

    const uploaded = await this.uploadService.uploadProductImage(fileBuffer);
    product.imageUrls = [...(product.imageUrls ?? []), uploaded.secure_url];
    return this.productRepository.save(product);
  }

  async patchVariantAttributes(productId: string, variantId: string, body: { size: string; color: string }) {
    const variant = await this.variantRepository.findById(variantId);
    if (!variant || variant.productId !== productId) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Variant not found");
    }
    const siblings = await this.variantRepository.findByProduct(productId);
    const conflict = siblings.some(
      (v) => v.id !== variantId && v.size === body.size && v.color === body.color,
    );
    if (conflict) {
      throw new ApiError(StatusCodes.CONFLICT, "Another variant already uses this size and color");
    }
    variant.size = body.size;
    variant.color = body.color;
    await this.variantRepository.save(variant);
    return this.productRepository.findById(productId);
  }
}
