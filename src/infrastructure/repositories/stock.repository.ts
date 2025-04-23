import { type IStock, Stock } from "../../domain/models/stock.model"
import type { IStockRepository } from "../../domain/repositories/stock.repository"
import { StockModel } from "../database/schemas/stock.schema"
import { ApiError } from "../../utils/apiError"

export class StockRepository implements IStockRepository {
  async findById(id: string): Promise<IStock | null> {
    try {
      const stock = await StockModel.findById(id)
      return stock ? new Stock(stock.toJSON()) : null
    } catch (error) {
      throw new ApiError(500, `Error finding stock by ID: ${error}`)
    }
  }

  async findByProductId(productId: string): Promise<IStock[]> {
    try {
      const stocks = await StockModel.find({ productId })
      return stocks.map((stock) => new Stock(stock.toJSON()))
    } catch (error) {
      throw new ApiError(500, `Error finding stock by product ID: ${error}`)
    }
  }

  async findByLocationId(locationId: string): Promise<IStock[]> {
    try {
      const stocks = await StockModel.find({ locationId })
      return stocks.map((stock) => new Stock(stock.toJSON()))
    } catch (error) {
      throw new ApiError(500, `Error finding stock by location ID: ${error}`)
    }
  }

  async findByProductAndLocation(productId: string, locationId: string): Promise<IStock | null> {
    try {
      const stock = await StockModel.findOne({ productId, locationId })
      return stock ? new Stock(stock.toJSON()) : null
    } catch (error) {
      throw new ApiError(500, `Error finding stock by product and location: ${error}`)
    }
  }

  async findAll(filter: Partial<IStock> = {}): Promise<IStock[]> {
    try {
      const stocks = await StockModel.find(filter)
      return stocks.map((stock) => new Stock(stock.toJSON()))
    } catch (error) {
      throw new ApiError(500, `Error finding stocks: ${error}`)
    }
  }

  async create(stockData: IStock): Promise<IStock> {
    try {
      const stock = new StockModel(stockData)
      await stock.save()
      return new Stock(stock.toJSON())
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ApiError(409, "Stock for this product and location already exists")
      }
      throw new ApiError(500, `Error creating stock: ${error}`)
    }
  }

  async update(id: string, stockData: Partial<IStock>): Promise<IStock | null> {
    try {
      const stock = await StockModel.findByIdAndUpdate(id, { $set: stockData }, { new: true, runValidators: true })
      return stock ? new Stock(stock.toJSON()) : null
    } catch (error) {
      throw new ApiError(500, `Error updating stock: ${error}`)
    }
  }

  async updateQuantity(id: string, quantity: number): Promise<IStock | null> {
    try {
      const stock = await StockModel.findByIdAndUpdate(id, { $inc: { quantity } }, { new: true, runValidators: true })
      return stock ? new Stock(stock.toJSON()) : null
    } catch (error) {
      throw new ApiError(500, `Error updating stock quantity: ${error}`)
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await StockModel.findByIdAndDelete(id)
      return !!result
    } catch (error) {
      throw new ApiError(500, `Error deleting stock: ${error}`)
    }
  }
}
