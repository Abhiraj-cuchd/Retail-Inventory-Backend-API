import mongoose, { type Document, Schema } from "mongoose"
import { DiscountType, type IDiscount } from "../../../domain/models/discount.model"

export interface IDiscountDocument extends IDiscount, Document {}

const DiscountSchema = new Schema<IDiscountDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(DiscountType),
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    code: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    minimumPurchase: {
      type: Number,
      min: 0,
    },
    maximumDiscount: {
      type: Number,
      min: 0,
    },
    productIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    categoryIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
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

export const DiscountModel = mongoose.model<IDiscountDocument>("Discount", DiscountSchema)
