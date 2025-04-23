import { type ICategory, Category } from "../../domain/models/category.model"
import type { ICategoryRepository } from "../../domain/repositories/category.repository"
import { CategoryModel } from "../database/schemas/category.schema"
import { ApiError } from "../../utils/apiError"

export class CategoryRepository implements ICategoryRepository {
  async findById(id: string): Promise<ICategory | null> {
    try {
      const category = await CategoryModel.findById(id)
      return category ? new Category(category.toJSON()) : null
    } catch (error) {
      throw new ApiError(500, `Error finding category by ID: ${error}`)
    }
  }

  async findByName(name: string): Promise<ICategory | null> {
    try {
      const category = await CategoryModel.findOne({ name })
      return category ? new Category(category.toJSON()) : null
    } catch (error) {
      throw new ApiError(500, `Error finding category by name: ${error}`)
    }
  }

  async findAll(filter: Partial<ICategory> = {}): Promise<ICategory[]> {
    try {
      const categories = await CategoryModel.find(filter)
      return categories.map((category) => new Category(category.toJSON()))
    } catch (error) {
      throw new ApiError(500, `Error finding categories: ${error}`)
    }
  }

  async create(categoryData: ICategory): Promise<ICategory> {
    try {
      const category = new CategoryModel(categoryData)
      await category.save()
      return new Category(category.toJSON())
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ApiError(409, "Category with this name already exists")
      }
      throw new ApiError(500, `Error creating category: ${error}`)
    }
  }

  async update(id: string, categoryData: Partial<ICategory>): Promise<ICategory | null> {
    try {
      const category = await CategoryModel.findByIdAndUpdate(
        id,
        { $set: categoryData },
        { new: true, runValidators: true },
      )
      return category ? new Category(category.toJSON()) : null
    } catch (error) {
      throw new ApiError(500, `Error updating category: ${error}`)
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await CategoryModel.findByIdAndDelete(id)
      return !!result
    } catch (error) {
      throw new ApiError(500, `Error deleting category: ${error}`)
    }
  }
}
