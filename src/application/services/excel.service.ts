import xlsx from "xlsx"
import type { IProduct } from "../../domain/models/product.model"
import type { IStock } from "../../domain/models/stock.model"
import { ApiError } from "../../utils/apiError"

export class ExcelService {
  validateProductData(data: any[]): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const rowNumber = i + 2 // +2 because of 0-indexing and header row

      if (!row.name) {
        errors.push(`Row ${rowNumber}: Product name is required`)
      }

      if (!row.sku) {
        errors.push(`Row ${rowNumber}: SKU is required`)
      }

      if (isNaN(Number.parseFloat(row.price)) || Number.parseFloat(row.price) < 0) {
        errors.push(`Row ${rowNumber}: Price must be a positive number`)
      }

      if (isNaN(Number.parseFloat(row.costPrice)) || Number.parseFloat(row.costPrice) < 0) {
        errors.push(`Row ${rowNumber}: Cost price must be a positive number`)
      }

      if (!row.categoryId) {
        errors.push(`Row ${rowNumber}: Category ID is required`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  validateStockData(data: any[]): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const rowNumber = i + 2 // +2 because of 0-indexing and header row

      if (!row.productId) {
        errors.push(`Row ${rowNumber}: Product ID is required`)
      }

      if (isNaN(Number.parseInt(row.quantity)) || Number.parseInt(row.quantity) < 0) {
        errors.push(`Row ${rowNumber}: Quantity must be a positive integer`)
      }

      if (!row.locationId) {
        errors.push(`Row ${rowNumber}: Location ID is required`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  parseExcelFile(buffer: Buffer): any[] {
    try {
      const workbook = xlsx.read(buffer, { type: "buffer" })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      return xlsx.utils.sheet_to_json(worksheet)
    } catch (error) {
      throw ApiError.badRequest("Invalid Excel file")
    }
  }

  createProductsExcel(products: IProduct[]): Buffer {
    const worksheet = xlsx.utils.json_to_sheet(
      products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        sku: product.sku,
        barcode: product.barcode,
        price: product.price,
        costPrice: product.costPrice,
        categoryId: product.categoryId,
        isActive: product.isActive ? "Yes" : "No",
      })),
    )

    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, "Products")

    return xlsx.write(workbook, { type: "buffer", bookType: "xlsx" })
  }

  createStocksExcel(stocks: IStock[]): Buffer {
    const worksheet = xlsx.utils.json_to_sheet(
      stocks.map((stock) => ({
        id: stock.id,
        productId: stock.productId,
        quantity: stock.quantity,
        locationId: stock.locationId,
        batchNumber: stock.batchNumber,
        expiryDate: stock.expiryDate ? stock.expiryDate.toISOString().split("T")[0] : "",
      })),
    )

    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, "Stocks")

    return xlsx.write(workbook, { type: "buffer", bookType: "xlsx" })
  }

  createProductTemplate(): Buffer {
    const template = [
      {
        name: "",
        description: "",
        sku: "",
        barcode: "",
        price: "",
        costPrice: "",
        categoryId: "",
        isActive: "Yes",
      },
    ]

    const worksheet = xlsx.utils.json_to_sheet(template)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, "Products Template")

    return xlsx.write(workbook, { type: "buffer", bookType: "xlsx" })
  }

  createStockTemplate(): Buffer {
    const template = [
      {
        productId: "",
        quantity: "",
        locationId: "",
        batchNumber: "",
        expiryDate: "",
      },
    ]

    const worksheet = xlsx.utils.json_to_sheet(template)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, "Stocks Template")

    return xlsx.write(workbook, { type: "buffer", bookType: "xlsx" })
  }
}
