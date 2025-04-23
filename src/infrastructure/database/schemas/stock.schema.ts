import mongoose, { type Document, Schema } from "mongoose"
import type { IStock } from "../../../domain/models/stock.model"

export interface IStockDocument extends IStock, Document {}

const StockSchema = new Schema<IStockDocument>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    batchNumber: {
      type: String,
      trim: true,
    },
    expiryDate: {
      type: Date,
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

// Compound index to ensure unique product per location
StockSchema.index({ productId: 1, locationId: 1 }, { unique: true })

export const StockModel = mongoose.model<IStockDocument>("Stock", StockSchema)
