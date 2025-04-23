import { Body, Controller, Delete, Get, Path, Post, Put, Route, Security, Tags, Response, UploadedFile } from "tsoa"
import { StockRepository } from "../infrastructure/repositories/stock.repository"
import { type IStock, Stock } from "../domain/models/stock.model"
import { ExcelService } from "../application/services/excel.service"
import { ApiError } from "../utils/apiError"

interface CreateStockRequest {
  productId: string
  quantity: number
  locationId: string
  batchNumber?: string
  expiryDate?: Date
}

interface UpdateStockRequest {
  quantity?: number
  batchNumber?: string
  expiryDate?: Date
}

interface BulkImportResponse {
  success: boolean
  message: string
  imported: number
  errors?: string[]
}

@Route("stocks")
@Tags("Stocks")
export class StockController extends Controller {
  private stockRepository: StockRepository
  private excelService: ExcelService

  constructor() {
    super()
    this.stockRepository = new StockRepository()
    this.excelService = new ExcelService()
  }

  /**
   * Get all stocks
   */
  @Get()
  @Security("jwt", ["admin", "storemanager"])
  @Response(401, "Unauthorized")
  public async getStocks(): Promise<IStock[]> {
    return this.stockRepository.findAll()
  }

  /**
   * Get stock by ID
   */
  @Get('{id}')
  @Security('jwt', ['admin', 'storemanager'])
  @Response<ApiError>(401, 'Unauthorized')
  @Response<ApiError>(404, 'Stock not found')
  public async getStockById(@Path() id: string): Promise<IStock> {
    const stock = await this.stockRepository.findById(id);
    if (!stock) {
      this.setStatus(404);
      throw new Error('Stock not found');
    }
    return stock;
  }

  /**
   * Get stocks by product ID
   */
  @Get('product/{productId}')
  @Security('jwt', ['admin', 'storemanager'])
  @Response(401, 'Unauthorized')
  public async getStocksByProductId(@Path() productId: string): Promise<IStock[]> {
    return this.stockRepository.findByProductId(productId);
  }

  /**
   * Create stock
   */
  @Post()
  @Security('jwt', ['admin', 'storemanager'])
  @Response(401, 'Unauthorized')
  @Response(400, 'Bad Request')
  @Response(409, 'Stock for this product and location already exists')
  public async createStock(@Body() requestBody: CreateStockRequest): Promise<IStock> {
    const stock = new Stock({
      productId: requestBody.productId,
      quantity: requestBody.quantity,
      locationId: requestBody.locationId,
      batchNumber: requestBody.batchNumber,
      expiryDate: requestBody.expiryDate,
    });

    return this.stockRepository.create(stock);
  }

  /**
   * Update stock
   */
  @Put("{id}")
  @Security("jwt", ["admin", "storemanager"])
  @Response(401, "Unauthorized")
  @Response(404, "Stock not found")
  public async updateStock(@Path() id: string, @Body() requestBody: UpdateStockRequest): Promise<IStock> {
    const updatedStock = await this.stockRepository.update(id, requestBody)
    if (!updatedStock) {
      this.setStatus(404)
      throw new Error("Stock not found")
    }
    return updatedStock
  }

  /**
   * Update stock quantity
   */
  @Put("{id}/quantity/{quantity}")
  @Security("jwt", ["admin", "storemanager"])
  @Response(401, "Unauthorized")
  @Response(404, "Stock not found")
  public async updateStockQuantity(@Path() id: string, @Path() quantity: number): Promise<IStock> {
    const updatedStock = await this.stockRepository.updateQuantity(id, quantity)
    if (!updatedStock) {
      this.setStatus(404)
      throw new Error("Stock not found")
    }
    return updatedStock
  }

  /**
   * Delete stock
   */
  @Delete('{id}')
  @Security('jwt', ['admin'])
  @Response(401, 'Unauthorized')
  @Response(403, 'Forbidden')
  @Response(404, 'Stock not found')
  public async deleteStock(@Path() id: string): Promise<void> {
    const deleted = await this.stockRepository.delete(id);
    if (!deleted) {
      this.setStatus(404);
      throw new Error('Stock not found');
    }
  }

  /**
   * Import stocks from Excel
   */
  @Post('import')
  @Security('jwt', ['admin', 'storemanager'])
  @Response(401, 'Unauthorized')
  @Response(400, 'Bad Request')
  public async importStocks(
    @UploadedFile() file: Express.Multer.File
  ): Promise<BulkImportResponse> {
    try {
      const data = this.excelService.parseExcelFile(file.buffer);
      
      const validation = this.excelService.validateStockData(data);
      if (!validation.valid) {
        return {
          success: false,
          message: 'Validation failed',
          imported: 0,
          errors: validation.errors,
        };
      }
      
      let importedCount = 0;
      const errors: string[] = [];
      
      for (const item of data) {
        try {
          const stock = new Stock({
            productId: item.productId,
            quantity: Number.parseInt(item.quantity),
            locationId: item.locationId,
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
          });
          
          await this.stockRepository.create(stock);
          importedCount++;
        } catch (error: any) {
          errors.push(`Error importing stock for product ${item.productId}: ${error.message}`);
        }
      }
      
      return {
        success: importedCount > 0,
        message: `Imported ${importedCount} stocks`,
        imported: importedCount,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error: any) {
      throw ApiError.badRequest(`Error processing file: ${error.message}`);
    }
  }

  /**
   * Export stocks to Excel
   */
  @Get("export")
  @Security("jwt", ["admin", "storemanager"])
  @Response(401, "Unauthorized")
  public async exportStocks(): Promise<Buffer> {
    const stocks = await this.stockRepository.findAll()
    return this.excelService.createStocksExcel(stocks)
  }

  /**
   * Get stock template
   */
  @Get("template")
  @Security("jwt", ["admin", "storemanager"])
  @Response(401, "Unauthorized")
  public getStockTemplate(): Buffer {
    return this.excelService.createStockTemplate()
  }
}
