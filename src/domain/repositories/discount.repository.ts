import type { IDiscount } from "../models/discount.model"

export interface IDiscountRepository {
  findById(id: string): Promise<IDiscount | null>
  findByCode(code: string): Promise<IDiscount | null>
  findAll(filter?: Partial<IDiscount>): Promise<IDiscount[]>
  create(discount: IDiscount): Promise<IDiscount>
  update(id: string, discount: Partial<IDiscount>): Promise<IDiscount | null>
  delete(id: string): Promise<boolean>
  findActiveDiscounts(): Promise<IDiscount[]>
}
