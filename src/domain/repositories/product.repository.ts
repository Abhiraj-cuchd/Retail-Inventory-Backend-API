import type { IProduct } from "../models/product.model"

export interface IProductRepository {
  findById(id: string): Promise<IProduct | null>
  findBySku(sku: string): Promise<IProduct | null>
  findAll(filter?: Partial<IProduct>): Promise<IProduct[]>
  create(product: IProduct): Promise<IProduct>
  update(id: string, product: Partial<IProduct>): Promise<IProduct | null>
  delete(id: string): Promise<boolean>
  findByCategory(categoryId: string): Promise<IProduct[]>
}
