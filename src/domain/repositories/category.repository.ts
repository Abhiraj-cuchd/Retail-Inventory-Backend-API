import type { ICategory } from "../models/category.model"

export interface ICategoryRepository {
  findById(id: string): Promise<ICategory | null>
  findByName(name: string): Promise<ICategory | null>
  findAll(filter?: Partial<ICategory>): Promise<ICategory[]>
  create(category: ICategory): Promise<ICategory>
  update(id: string, category: Partial<ICategory>): Promise<ICategory | null>
  delete(id: string): Promise<boolean>
}
