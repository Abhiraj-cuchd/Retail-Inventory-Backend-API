import { type IPromotion, Promotion } from "../../domain/models/promotion.model"
import type { IPromotionRepository } from "../../domain/repositories/promotion.repository"
import { PromotionModel } from "../database/schemas/promotion.schema"
import { ApiError } from "../../utils/apiError"

export class PromotionRepository implements IPromotionRepository {
  async findById(id: string): Promise<IPromotion | null> {
    try {
      const promotion = await PromotionModel.findById(id)
      return promotion ? new Promotion(promotion.toJSON()) : null
    } catch (error) {
      throw new ApiError(500, `Error finding promotion by ID: ${error}`)
    }
  }

  async findAll(filter: Partial<IPromotion> = {}): Promise<IPromotion[]> {
    try {
      const promotions = await PromotionModel.find(filter)
      return promotions.map((promotion) => new Promotion(promotion.toJSON()))
    } catch (error) {
      throw new ApiError(500, `Error finding promotions: ${error}`)
    }
  }

  async create(promotionData: IPromotion): Promise<IPromotion> {
    try {
      const promotion = new PromotionModel(promotionData)
      await promotion.save()
      return new Promotion(promotion.toJSON())
    } catch (error) {
      throw new ApiError(500, `Error creating promotion: ${error}`)
    }
  }

  async update(id: string, promotionData: Partial<IPromotion>): Promise<IPromotion | null> {
    try {
      const promotion = await PromotionModel.findByIdAndUpdate(
        id,
        { $set: promotionData },
        { new: true, runValidators: true },
      )
      return promotion ? new Promotion(promotion.toJSON()) : null
    } catch (error) {
      throw new ApiError(500, `Error updating promotion: ${error}`)
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await PromotionModel.findByIdAndDelete(id)
      return !!result
    } catch (error) {
      throw new ApiError(500, `Error deleting promotion: ${error}`)
    }
  }

  async findActivePromotions(): Promise<IPromotion[]> {
    try {
      const now = new Date()
      const promotions = await PromotionModel.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
      return promotions.map((promotion) => new Promotion(promotion.toJSON()))
    } catch (error) {
      throw new ApiError(500, `Error finding active promotions: ${error}`)
    }
  }
}
