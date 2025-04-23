import type { IPromotion } from "../models/promotion.model"

export interface IPromotionRepository {
  findById(id: string): Promise<IPromotion | null>
  findAll(filter?: Partial<IPromotion>): Promise<IPromotion[]>
  create(promotion: IPromotion): Promise<IPromotion>
  update(id: string, promotion: Partial<IPromotion>): Promise<IPromotion | null>
  delete(id: string): Promise<boolean>
  findActivePromotions(): Promise<IPromotion[]>
}
