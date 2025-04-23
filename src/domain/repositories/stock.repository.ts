import type { IStock } from "../models/stock.model"

export interface IStockRepository {
  findById(id: string): Promise<IStock | null>
  findByProductId(productId: string): Promise<IStock[]>
  findByLocationId(locationId: string): Promise<IStock[]>
  findByProductAndLocation(productId: string, locationId: string): Promise<IStock | null>
  findAll(filter?: Partial<IStock>): Promise<IStock[]>
  create(stock: IStock): Promise<IStock>
  update(id: string, stock: Partial<IStock>): Promise<IStock | null>
  updateQuantity(id: string, quantity: number): Promise<IStock | null>
  delete(id: string): Promise<boolean>
}
