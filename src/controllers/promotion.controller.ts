import { Body, Controller, Delete, Get, Path, Post, Put, Route, Security, Tags, Response } from "tsoa"
import { PromotionRepository } from "../infrastructure/repositories/promotion.repository"
import { type IPromotion, Promotion } from "../domain/models/promotion.model"

interface CreatePromotionRequest {
  name: string
  description: string
  startDate: Date
  endDate: Date
  discountId?: string
  bannerImage?: string
  isActive?: boolean
}

interface UpdatePromotionRequest {
  name?: string
  description?: string
  startDate?: Date
  endDate?: Date
  discountId?: string
  bannerImage?: string
  isActive?: boolean
}

@Route("promotions")
@Tags("Promotions")
export class PromotionController extends Controller {
  private promotionRepository: PromotionRepository

  constructor() {
    super()
    this.promotionRepository = new PromotionRepository()
  }

  /**
   * Get all promotions
   */
  @Get()
  @Security("jwt", ["admin", "storemanager"])
  @Response(401, "Unauthorized")
  public async getPromotions(): Promise<IPromotion[]> {
    return this.promotionRepository.findAll()
  }

  /**
   * Get promotion by ID
   */
  @Get('{id}')
  @Security('jwt', ['admin', 'storemanager'])
  @Response(401, 'Unauthorized')
  @Response(404, 'Promotion not found')
  public async getPromotionById(@Path('id') id: string): Promise<IPromotion> {
    const promotion = await this.promotionRepository.findById(id);
    if (!promotion) {
      this.setStatus(404);
      throw new Error('Promotion not found');
    }
    return promotion;
  }

  /**
   * Get active promotions
   */
  @Get("active")
  @Security("jwt", ["admin", "storemanager"])
  @Response(401, "Unauthorized")
  public async getActivePromotions(): Promise<IPromotion[]> {
    const now = new Date()
    return this.promotionRepository.findAll({
      isActive: true,
      startDate: { $lte: now } as any,
      endDate: { $gte: now } as any,
    })
  }

  /**
   * Create promotion
   */
  @Post()
  @Security('jwt', ['admin'])
  @Response(401, 'Unauthorized')
  @Response(403, 'Forbidden')
  @Response(400, 'Bad Request')
  public async createPromotion(@Body() requestBody: CreatePromotionRequest): Promise<IPromotion> {
    const promotion = new Promotion({
      name: requestBody.name,
      description: requestBody.description,
      startDate: requestBody.startDate,
      endDate: requestBody.endDate,
      discountId: requestBody.discountId,
      bannerImage: requestBody.bannerImage,
      isActive: requestBody.isActive !== undefined ? requestBody.isActive : true,
    });

    return this.promotionRepository.create(promotion);
  }

  /**
   * Update promotion
   */
  @Put("{id}")
  @Security("jwt", ["admin"])
  @Response(401, "Unauthorized")
  @Response(403, "Forbidden")
  @Response(404, "Promotion not found")
  public async updatePromotion(@Path() id: string, @Body() requestBody: UpdatePromotionRequest): Promise<IPromotion> {
    const updatedPromotion = await this.promotionRepository.update(id, requestBody)
    if (!updatedPromotion) {
      this.setStatus(404)
      throw new Error("Promotion not found")
    }
    return updatedPromotion
  }

  /**
   * Delete promotion
   */
  @Delete('{id}')
  @Security('jwt', ['admin'])
  @Response(401, 'Unauthorized')
  @Response(403, 'Forbidden')
  @Response(404, 'Promotion not found')
  public async deletePromotion(@Path() id: string): Promise<void> {
    const deleted = await this.promotionRepository.delete(id);
    if (!deleted) {
      this.setStatus(404);
      throw new Error('Promotion not found');
    }
  }
}
