import mongoose, { type Document, Schema } from "mongoose"
import type { IPromotion } from "../../../domain/models/promotion.model"

export interface IPromotionDocument extends IPromotion, Document {}

const PromotionSchema = new Schema<IPromotionDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    discountId: {
      type: Schema.Types.ObjectId,
      ref: "Discount",
    },
    bannerImage: {
      type: String,
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

export const PromotionModel = mongoose.model<IPromotionDocument>("Promotion", PromotionSchema)
