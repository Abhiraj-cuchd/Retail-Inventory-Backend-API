import { Controller, Get, Query, Route, Security, Tags, Response } from "tsoa"
import { InvoiceRepository } from "../infrastructure/repositories/invoice.repository"
import { StockRepository } from "../infrastructure/repositories/stock.repository"
import { ProductRepository } from "../infrastructure/repositories/product.repository"
import { InvoiceStatus } from "../domain/models/invoice.model"

interface SalesReportItem {
  date: string
  invoiceCount: number
  totalSales: number
  totalTax: number
  totalDiscount: number
  netSales: number
}

interface ProductSalesReportItem {
  productId: string
  productName: string
  quantitySold: number
  totalRevenue: number
  totalProfit: number
}

interface StockReportItem {
  productId: string
  productName: string
  totalStock: number
  lowStock: boolean
}

interface ProfitReportItem {
  date: string
  revenue: number
  costOfGoods: number
  grossProfit: number
  grossMargin: number
}

@Route("reports")
@Tags("Reports")
export class ReportController extends Controller {
  private invoiceRepository: InvoiceRepository
  private stockRepository: StockRepository
  private productRepository: ProductRepository

  constructor() {
    super()
    this.invoiceRepository = new InvoiceRepository()
    this.stockRepository = new StockRepository()
    this.productRepository = new ProductRepository()
  }

  /**
   * Get sales report
   */
  @Security("jwt", ["admin", "storemanager"])
  @Response(401, "Unauthorized")
  @Get("sales")
  public async getSalesReport(@Query() startDate?: string, @Query() endDate?: string): Promise<SalesReportItem[]> {
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30))
    const end = endDate ? new Date(endDate) : new Date()

    const invoices = await this.invoiceRepository.findAll({
      status: InvoiceStatus.PAID,
      createdAt: { $gte: start, $lte: end } as any,
    })

    const salesByDate = new Map<string, SalesReportItem>()

    for (const invoice of invoices) {
      const dateStr = invoice.createdAt!.toISOString().split("T")[0]

      if (!salesByDate.has(dateStr)) {
        salesByDate.set(dateStr, {
          date: dateStr,
          invoiceCount: 0,
          totalSales: 0,
          totalTax: 0,
          totalDiscount: 0,
          netSales: 0,
        })
      }

      const salesData = salesByDate.get(dateStr)!
      salesData.invoiceCount++
      salesData.totalSales += invoice.subtotal
      salesData.totalTax += invoice.tax
      salesData.totalDiscount += invoice.discount
      salesData.netSales += invoice.total
    }

    return Array.from(salesByDate.values()).sort((a, b) => a.date.localeCompare(b.date))
  }

  /**
   * Get product sales report
   */
  @Get("product-sales")
  @Security("jwt", ["admin", "storemanager"])
  @Response(401, "Unauthorized")
  public async getProductSalesReport(
    @Query() startDate?: string,
    @Query() endDate?: string,
  ): Promise<ProductSalesReportItem[]> {
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30))
    const end = endDate ? new Date(endDate) : new Date()

    const invoices = await this.invoiceRepository.findAll({
      status: InvoiceStatus.PAID,
      createdAt: { $gte: start, $lte: end } as any,
    })

    const productSales = new Map<string, ProductSalesReportItem>()

    for (const invoice of invoices) {
      for (const item of invoice.items) {
        if (!productSales.has(item.productId)) {
          const product = await this.productRepository.findById(item.productId)
          productSales.set(item.productId, {
            productId: item.productId,
            productName: product ? product.name : "Unknown Product",
            quantitySold: 0,
            totalRevenue: 0,
            totalProfit: 0,
          })
        }

        const salesData = productSales.get(item.productId)!
        salesData.quantitySold += item.quantity
        salesData.totalRevenue += item.total

        // Calculate profit
        const product = await this.productRepository.findById(item.productId)
        if (product) {
          salesData.totalProfit += (item.price - product.costPrice) * item.quantity
        }
      }
    }

    return Array.from(productSales.values()).sort((a, b) => b.totalRevenue - a.totalRevenue)
  }

  /**
   * Get stock report
   */
  @Get('stock')
  @Security('jwt', ['admin', 'storemanager'])
  @Response(401, 'Unauthorized')
  public async getStockReport(
    @Query() lowStockThreshold?: number
  ): Promise<StockReportItem[]> {
    const threshold = lowStockThreshold || 10;
    const stocks = await this.stockRepository.findAll();
    
    const stockByProduct = new Map<string, StockReportItem>();
    
    for (const stock of stocks) {
      if (!stockByProduct.has(stock.productId)) {
        const product = await this.productRepository.findById(stock.productId);
        stockByProduct.set(stock.productId, {
          productId: stock.productId,
          productName: product ? product.name : 'Unknown Product',
          totalStock: 0,
          lowStock: false,
        });
      }
      
      const stockData = stockByProduct.get(stock.productId)!;
      stockData.totalStock += stock.quantity;
      stockData.lowStock = stockData.totalStock < threshold;
    }
    
    return Array.from(stockByProduct.values()).sort((a, b) => a.totalStock - b.totalStock);
  }

  /**
   * Get daily profit report
   */
  @Get("profit")
  @Security("jwt", ["admin"])
  @Response(401, "Unauthorized")
  @Response(403, "Forbidden")
  public async getProfitReport(@Query() startDate?: string, @Query() endDate?: string): Promise<ProfitReportItem[]> {
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30))
    const end = endDate ? new Date(endDate) : new Date()

    const invoices = await this.invoiceRepository.findAll({
      status: InvoiceStatus.PAID,
      createdAt: { $gte: start, $lte: end } as any,
    })

    const profitByDate = new Map<string, ProfitReportItem>()

    for (const invoice of invoices) {
      const dateStr = invoice.createdAt!.toISOString().split("T")[0]

      if (!profitByDate.has(dateStr)) {
        profitByDate.set(dateStr, {
          date: dateStr,
          revenue: 0,
          costOfGoods: 0,
          grossProfit: 0,
          grossMargin: 0,
        })
      }

      const profitData = profitByDate.get(dateStr)!
      profitData.revenue += invoice.total

      // Calculate cost of goods
      for (const item of invoice.items) {
        const product = await this.productRepository.findById(item.productId)
        if (product) {
          profitData.costOfGoods += product.costPrice * item.quantity
        }
      }
    }

    // Calculate gross profit and margin
    for (const profitData of profitByDate.values()) {
      profitData.grossProfit = profitData.revenue - profitData.costOfGoods
      profitData.grossMargin = profitData.revenue > 0 ? (profitData.grossProfit / profitData.revenue) * 100 : 0
    }

    return Array.from(profitByDate.values()).sort((a, b) => a.date.localeCompare(b.date))
  }

  /**
   * Get returns and refunds report
   */
  @Get("returns")
  @Security("jwt", ["admin", "storemanager"])
  @Response(401, "Unauthorized")
  public async getReturnsReport(@Query() startDate?: string, @Query() endDate?: string): Promise<SalesReportItem[]> {
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30))
    const end = endDate ? new Date(endDate) : new Date()

    const invoices = await this.invoiceRepository.findAll({
      status: InvoiceStatus.REFUNDED,
      createdAt: { $gte: start, $lte: end } as any,
    })

    const returnsByDate = new Map<string, SalesReportItem>()

    for (const invoice of invoices) {
      const dateStr = invoice.createdAt!.toISOString().split("T")[0]

      if (!returnsByDate.has(dateStr)) {
        returnsByDate.set(dateStr, {
          date: dateStr,
          invoiceCount: 0,
          totalSales: 0,
          totalTax: 0,
          totalDiscount: 0,
          netSales: 0,
        })
      }

      const returnsData = returnsByDate.get(dateStr)!
      returnsData.invoiceCount++
      returnsData.totalSales += invoice.subtotal
      returnsData.totalTax += invoice.tax
      returnsData.totalDiscount += invoice.discount
      returnsData.netSales += invoice.total
    }

    return Array.from(returnsByDate.values()).sort((a, b) => a.date.localeCompare(b.date))
  }
}
