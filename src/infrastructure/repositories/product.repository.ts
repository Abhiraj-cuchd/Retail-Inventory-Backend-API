import { type IProduct, Product } from "../../domain/models/product.model"
import type { IProductRepository } from "../../domain/repositories/product.repository"
import { ProductModel } from "../database/schemas/product.schema"
import { ApiError } from "../../utils/apiError"

export class ProductRepository implements IProductRepository {
  async findById(id: string): Promise<IProduct | null> {
    try {
      const product = await ProductModel.findById(id)
      return product ? new Product(product.toJSON()) : null
    } catch (error) {
      throw new ApiError(500, `Error finding product by ID: ${error}`)
    }
  }

  async findBySku(sku: string): Promise<IProduct | null> {
    try {
      const product = await ProductModel.findOne({ sku })
      return product ? new Product(product.toJSON()) : null
    } catch (error) {
      throw new ApiError(500, `Error finding product by SKU: ${error}`)
    }
  }

  async findAll(filter: Partial<IProduct> = {}): Promise<IProduct[]> {
    try {
      const products = await ProductModel.find(filter)
      return products.map((product) => new Product(product.toJSON()))
    } catch (error) {
      throw new ApiError(500, `Error finding products: ${error}`)
    }
  }

  async create(productData: IProduct): Promise<IProduct> {
    try {
      const product = new ProductModel(productData)
      await product.save()
      return new Product(product.toJSON())
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ApiError(409, "Product with this SKU already exists")
      }
      throw new ApiError(500, `Error creating product: ${error}`)
    }
  }

  async update(id: string, productData: Partial<IProduct>): Promise<IProduct | null> {
    try {
      const product = await ProductModel.findByIdAndUpdate(
        id,
        { $set: productData },
        { new: true, runValidators: true },
      )
      return product ? new Product(product.toJSON()) : null
    } catch (error) {
      throw new ApiError(500, `Error updating product: ${error}`)
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await ProductModel.findByIdAndDelete(id)
      return !!result
    } catch (error) {
      throw new ApiError(500, `Error deleting product: ${error}`)
    }
  }

  async findByCategory(categoryId: string): Promise<IProduct[]> {
    try {
      const products = await ProductModel.find({ categoryId })
      return products.map((product) => new Product(product.toJSON()))
    } catch (error) {
      throw new ApiError(500, `Error finding products by category: ${error}`)
    }
  }
}
