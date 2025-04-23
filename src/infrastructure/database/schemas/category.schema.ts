import mongoose, { type Document, Schema } from "mongoose"
import type { ICategory } from "../../../domain/models/category.model"

export interface ICategoryDocument extends ICategory, Document {}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  },
)

export const CategoryModel = mongoose.model<ICategoryDocument>("Category", CategorySchema)
