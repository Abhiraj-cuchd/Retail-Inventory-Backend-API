import { Body, Controller, Delete, Get, Path, Post, Put, Route, Security, Tags, Response } from "tsoa"
import { DiscountRepository } from "../infrastructure/repositories/discount.repository"
import { type DiscountType, type IDiscount, Discount } from "../domain/models/discount.model"

interface CreateDiscountRequest {
  name: string
  description?: string
  type: DiscountType
  value: number
  code?: string
  startDate: Date
  endDate: Date
  isActive?: boolean
  minimumPurchase?: number
  maximumDiscount?: number
  productIds?: string[]
  categoryIds?: string[]
}

interface UpdateDiscountRequest {
  name?: string
  description?: string
  value?: number
  code?: string
  startDate?: Date
  endDate?: Date
  isActive?: boolean
  minimumPurchase?: number
  maximumDiscount?: number
  productIds?: string[]
  categoryIds?: string[]
}

@Route("discounts")
@Tags("Discounts")
export class DiscountController extends Controller {
  private discountRepository: DiscountRepository

  constructor() {
    super()
    this.discountRepository = new DiscountRepository()
  }

  /**
   * Get all discounts
   */
  @Get()
  @Security("jwt", ["admin", "storemanager"])
  @Response(401, "Unauthorized")
  public async getDiscounts(): Promise<IDiscount[]> {
    return this.discountRepository.findAll()
  }

  /**
   * Get discount by ID
   */
  @Get('{id}')
  @Security('jwt', ['admin', 'storemanager'])
  @Response(401, 'Unauthorized')
  @Response(404, 'Discount not found')
  public async getDiscountById(@Path() id: string): Promise<IDiscount> {
    const discount = await this.discountRepository.findById(id);

    if (!discount) {
      this.setStatus(404);
      throw new Error('Discount not found');
    }
    return discount;
  }

  /**
   * Get discount by code
   */
  @Get('code/{code}')
  @Security('jwt', ['admin', 'storemanager'])
  @Response(401, 'Unauthorized')
  @Response(404, 'Discount not found')
  public async getDiscountByCode(@Path() code: string): Promise<IDiscount> {
    const discount = await this.discountRepository.findByCode(code);
    if (!discount) {
      this.setStatus(404);
      throw new Error('Discount not found');
    }
    return discount;
  }

  /**
   * Create discount
   */
  @Post()
  @Security('jwt', ['admin'])
  @Response(401, 'Unauthorized')
  @Response(403, 'Forbidden')
  @Response(400, 'Bad Request')
  public async createDiscount(@Body() requestBody: CreateDiscountRequest): Promise<IDiscount> {
    const discount = new Discount({
      name: requestBody.name,
      description: requestBody.description,
      type: requestBody.type,
      value: requestBody.value,
      code: requestBody.code,
      startDate: requestBody.startDate,
      endDate: requestBody.endDate,
      isActive: requestBody.isActive !== undefined ? requestBody.isActive : true,
      minimumPurchase: requestBody.minimumPurchase,
      maximumDiscount: requestBody.maximumDiscount,
      productIds: requestBody.productIds,
      categoryIds: requestBody.categoryIds,
    });

    return this.discountRepository.create(discount);
  }

  /**
   * Update discount
   */
  @Put("{id}")
  @Security("jwt", ["admin"])
  @Response(401, "Unauthorized")
  @Response(403, "Forbidden")
  @Response(404, "Discount not found")
  public async updateDiscount(@Path() id: string, @Body() requestBody: UpdateDiscountRequest): Promise<IDiscount> {
    const updatedDiscount = await this.discountRepository.update(id, requestBody)
    if (!updatedDiscount) {
      this.setStatus(404)
      throw new Error("Discount not found")
    }
    return updatedDiscount
  }

  /**
   * Delete discount
   */
  @Delete('{id}')
  @Security('jwt', ['admin'])
  @Response(401, 'Unauthorized')
  @Response(403, 'Forbidden')
  @Response(404, 'Discount not found')
  public async deleteDiscount(@Path() id: string): Promise<void> {
    const deleted = await this.discountRepository.delete(id);
    if (!deleted) {
      this.setStatus(404);
      throw new Error('Discount not found');
    }
  }

  /**
   * Validate discount code
   */
  @Get('validate/{code}')
  @Security('jwt', ['admin', 'storemanager'])
  @Response(401, 'Unauthorized')
  public async validateDiscountCode(
    @Path() code: string
  ): Promise<{ valid: boolean; discount?: IDiscount; message?: string }> {
    const discount = await this.discountRepository.findByCode(code);
    
    if (!discount) {
      return {
        valid: false,
        message: 'Discount code not found',
      };
    }
    
    if (!discount.isActive) {
      return {
        valid: false,
        message: 'Discount is inactive',
      };
    }
    
    const now = new Date();
    if (now < discount.startDate || now > discount.endDate) {
      return {
        valid: false,
        message: 'Discount is not valid at this time',
      };
    }
    
    return {
      valid: true,
      discount,
    };
  }
}
