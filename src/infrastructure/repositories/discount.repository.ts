import { type IDiscount, Discount } from "../../domain/models/discount.model"
import type { IDiscountRepository } from "../../domain/repositories/discount.repository"
import { DiscountModel } from "../database/schemas/discount.schema"
import { ApiError } from "../../utils/apiError"

export class DiscountRepository implements IDiscountRepository {
  async findById(id: string): Promise<IDiscount | null> {
    try {
      const discount = await DiscountModel.findById(id)
      return discount ? new Discount(discount.toJSON()) : null
    } catch (error) {
      throw new ApiError(500, `Error finding discount by ID: ${error}`)
    }
  }

  async findByCode(code: string): Promise<IDiscount | null> {
    try {
      const discount = await DiscountModel.findOne({ code })
      return discount ? new Discount(discount.toJSON()) : null
    } catch (error) {
      throw new ApiError(500, `Error finding discount by code: ${error}`)
    }
  }

  async findAll(filter: Partial<IDiscount> = {}): Promise<IDiscount[]> {
    try {
      const discounts = await DiscountModel.find(filter)
      return discounts.map((discount) => new Discount(discount.toJSON()))
    } catch (error) {
      throw new ApiError(500, `Error finding discounts: ${error}`)
    }
  }

  async create(discountData: IDiscount): Promise<IDiscount> {
    try {
      const discount = new DiscountModel(discountData)
      await discount.save()
      return new Discount(discount.toJSON())
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ApiError(409, "Discount with this code already exists")
      }
      throw new ApiError(500, `Error creating discount: ${error}`)
    }
  }

  async update(id: string, discountData: Partial<IDiscount>): Promise<IDiscount | null> {
    try {
      const discount = await DiscountModel.findByIdAndUpdate(
        id,
        { $set: discountData },
        { new: true, runValidators: true },
      )
      return discount ? new Discount(discount.toJSON()) : null
    } catch (error) {
      throw new ApiError(500, `Error updating discount: ${error}`)
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await DiscountModel.findByIdAndDelete(id)
      return !!result
    } catch (error) {
      throw new ApiError(500, `Error deleting discount: ${error}`)
    }
  }

  async findActiveDiscounts(): Promise<IDiscount[]> {
    try {
      const now = new Date()
      const discounts = await DiscountModel.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
      return discounts.map((discount) => new Discount(discount.toJSON()))
    } catch (error) {
      throw new ApiError(500, `Error finding active discounts: ${error}`)
    }
  }
}
