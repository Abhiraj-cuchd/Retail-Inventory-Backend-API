import { Body, Controller, Delete, Get, Path, Post, Put, Route, Security, Tags, Response, UploadedFile } from "tsoa"
import { ProductRepository } from "../infrastructure/repositories/product.repository"
import { type IProduct, Product } from "../domain/models/product.model"
import { ExcelService } from "../application/services/excel.service"
import { ApiError } from "../utils/apiError"

interface CreateProductRequest {
  name: string
  description: string
  sku: string
  barcode?: string
  price: number
  costPrice: number
  categoryId: string
  imageUrl?: string
  isActive?: boolean
}

interface UpdateProductRequest {
  name?: string
  description?: string
  sku?: string
  barcode?: string
  price?: number
  costPrice?: number
  categoryId?: string
  imageUrl?: string
  isActive?: boolean
}

interface BulkImportResponse {
  success: boolean
  message: string
  imported: number
  errors?: string[]
}

@Route("products")
@Tags("Products")
export class ProductController extends Controller {
  private productRepository: ProductRepository
  private excelService: ExcelService

  constructor() {
    super()
    this.productRepository = new ProductRepository()
    this.excelService = new ExcelService()
  }

  /**
   * Get all products
   */
  @Get()
  @Security("jwt", ["admin", "storemanager"])
  @Response(401, "Unauthorized")
  public async getProducts(): Promise<IProduct[]> {
    return this.productRepository.findAll()
  }

  /**
   * Get product by ID
   */
  @Get('{id}')
  @Security('jwt', ['admin', 'storemanager'])
  @Response(401, 'Unauthorized')
  @Response(404, 'Product not found')
  public async getProductById(@Path() id: string): Promise<IProduct> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      this.setStatus(404);
      throw new Error('Product not found');
    }
    return product;
  }

  /**
   * Create product
   */
  @Post()
  @Security('jwt', ['admin', 'storemanager'])
  @Response(401, 'Unauthorized')
  @Response(400, 'Bad Request')
  @Response(409, 'Product with this SKU already exists')
  public async createProduct(@Body() requestBody: CreateProductRequest): Promise<IProduct> {
    const product = new Product({
      name: requestBody.name,
      description: requestBody.description,
      sku: requestBody.sku,
      barcode: requestBody.barcode,
      price: requestBody.price,
      costPrice: requestBody.costPrice,
      categoryId: requestBody.categoryId,
      imageUrl: requestBody.imageUrl,
      isActive: requestBody.isActive !== undefined ? requestBody.isActive : true,
    });

    return this.productRepository.create(product);
  }

  /**
   * Update product
   */
  @Put("{id}")
  @Security("jwt", ["admin", "storemanager"])
  @Response(401, "Unauthorized")
  @Response(404, "Product not found")
  public async updateProduct(@Path() id: string, @Body() requestBody: UpdateProductRequest): Promise<IProduct> {
    const updatedProduct = await this.productRepository.update(id, requestBody)
    if (!updatedProduct) {
      this.setStatus(404)
      throw new Error("Product not found")
    }
    return updatedProduct
  }

  /**
   * Delete product
   */
  @Delete('{id}')
  @Security('jwt', ['admin'])
  @Response(401, 'Unauthorized')
  @Response(403, 'Forbidden')
  @Response(404, 'Product not found')
  public async deleteProduct(@Path() id: string): Promise<void> {
    const deleted = await this.productRepository.delete(id);
    if (!deleted) {
      this.setStatus(404);
      throw new Error('Product not found');
    }
  }

  /**
   * Import products from Excel
   */
  @Post('import')
  @Security('jwt', ['admin', 'storemanager'])
  @Response(401, 'Unauthorized')
  @Response(400, 'Bad Request')
  public async importProducts(
    @UploadedFile() file: Express.Multer.File
  ): Promise<BulkImportResponse> {
    try {
      const data = this.excelService.parseExcelFile(file.buffer);
      
      const validation = this.excelService.validateProductData(data);
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
          const product = new Product({
            name: item.name,
            description: item.description,
            sku: item.sku,
            barcode: item.barcode,
            price: Number.parseFloat(item.price),
            costPrice: Number.parseFloat(item.costPrice),
            categoryId: item.categoryId,
            isActive: item.isActive === 'Yes',
          });
          
          await this.productRepository.create(product);
          importedCount++;
        } catch (error: any) {
          errors.push(`Error importing product ${item.sku}: ${error.message}`);
        }
      }
      
      return {
        success: importedCount > 0,
        message: `Imported ${importedCount} products`,
        imported: importedCount,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error: any) {
      throw ApiError.badRequest(`Error processing file: ${error.message}`);
    }
  }

  /**
   * Export products to Excel
   */
  @Get("export")
  @Security("jwt", ["admin", "storemanager"])
  @Response(401, "Unauthorized")
  public async exportProducts(): Promise<Buffer> {
    const products = await this.productRepository.findAll()
    return this.excelService.createProductsExcel(products)
  }

  /**
   * Get product template
   */
  @Get("template")
  @Security("jwt", ["admin", "storemanager"])
  @Response(401, "Unauthorized")
  public getProductTemplate(): Buffer {
    return this.excelService.createProductTemplate()
  }
}
