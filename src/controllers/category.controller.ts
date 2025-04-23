import { Body, Controller, Delete, Get, Path, Post, Put, Route, Security, Tags, Response } from "tsoa"
import { CategoryRepository } from "../infrastructure/repositories/category.repository"
import { type ICategory, Category } from "../domain/models/category.model"

interface CreateCategoryRequest {
  name: string
  description?: string
  isActive?: boolean
}

interface UpdateCategoryRequest {
  name?: string
  description?: string
  isActive?: boolean
}

@Route("categories")
@Tags("Categories")
export class CategoryController extends Controller {
  private categoryRepository: CategoryRepository

  constructor() {
    super()
    this.categoryRepository = new CategoryRepository()
  }

  /**
   * Get all categories
   */
  @Get()
  @Security("jwt", ["admin", "storemanager"])
  @Response(401, "Unauthorized")
  public async getCategories(): Promise<ICategory[]> {
    return this.categoryRepository.findAll()
  }

  /**
   * Get category by ID
   */
  @Get('{id}')
  @Security('jwt', ['admin', 'storemanager'])
  @Response(401, 'Unauthorized')
  @Response(404, 'Category not found')
  public async getCategoryById(@Path('id') id: string): Promise<ICategory> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      this.setStatus(404);
      throw new Error('Category not found');
    }
    return category;
  }

  /**
   * Create category
   */
  @Post()
  @Security('jwt', ['admin'])
  @Response(401, 'Unauthorized')
  @Response(403, 'Forbidden')
  @Response(400, 'Bad Request')
  @Response(409, 'Category with this name already exists')
  public async createCategory(@Body() requestBody: CreateCategoryRequest): Promise<ICategory> {
    const category = new Category({
      name: requestBody.name,
      description: requestBody.description,
      isActive: requestBody.isActive !== undefined ? requestBody.isActive : true,
    });

    return this.categoryRepository.create(category);
  }

  /**
   * Update category
   */
  @Put("{id}")
  @Security("jwt", ["admin"])
  @Response(401, "Unauthorized")
  @Response(403, "Forbidden")
  @Response(404, "Category not found")
  public async updateCategory(@Path() id: string, @Body() requestBody: UpdateCategoryRequest): Promise<ICategory> {
    const updatedCategory = await this.categoryRepository.update(id, requestBody)
    if (!updatedCategory) {
      this.setStatus(404)
      throw new Error("Category not found")
    }
    return updatedCategory
  }

  /**
   * Delete category
   */
  @Delete('{id}')
  @Security('jwt', ['admin'])
  @Response(401, 'Unauthorized')
  @Response(403, 'Forbidden')
  @Response(404, 'Category not found')
  public async deleteCategory(@Path() id: string): Promise<void> {
    const deleted = await this.categoryRepository.delete(id);
    if (!deleted) {
      this.setStatus(404);
      throw new Error('Category not found');
    }
  }
}
