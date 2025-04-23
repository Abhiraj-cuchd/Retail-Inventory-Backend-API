import PDFDocument from "pdfkit"
import type { IInvoice } from "../domain/models/invoice.model"
import type * as PDFKit from "pdfkit"

export async function generatePdf(invoice: IInvoice): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 })

      const buffers: Buffer[] = []
      doc.on("data", buffers.push.bind(buffers))
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers)
        resolve(pdfData)
      })

      // Add content to PDF
      generateInvoiceContent(doc, invoice)

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

function generateInvoiceContent(doc: PDFKit.PDFDocument, invoice: IInvoice): void {
  // Header
  doc.fontSize(20).text("INVOICE", { align: "center" })
  doc.moveDown()

  // Invoice details
  doc.fontSize(12)
  doc.text(`Invoice Number: ${invoice.invoiceNumber}`)
  doc.text(`Date: ${invoice.createdAt ? invoice.createdAt.toLocaleDateString() : "N/A"}`)
  doc.text(`Status: ${invoice.status}`)
  doc.moveDown()

  // Customer info
  doc.text(`Customer ID: ${invoice.customerId}`)
  doc.moveDown()

  // Items table
  doc.fontSize(10)
  const tableTop = doc.y
  const itemX = 50
  const quantityX = 250
  const priceX = 300
  const discountX = 350
  const totalX = 400

  doc.text("Item", itemX, tableTop)
  doc.text("Qty", quantityX, tableTop)
  doc.text("Price", priceX, tableTop)
  doc.text("Discount", discountX, tableTop)
  doc.text("Total", totalX, tableTop)

  doc
    .moveTo(itemX, tableTop + 20)
    .lineTo(totalX + 50, tableTop + 20)
    .stroke()

  let tableY = tableTop + 30

  // Items
  for (const item of invoice.items) {
    doc.text(item.productId, itemX, tableY)
    doc.text(item.quantity.toString(), quantityX, tableY)
    doc.text(`$${item.price.toFixed(2)}`, priceX, tableY)
    doc.text(`$${item.discount.toFixed(2)}`, discountX, tableY)
    doc.text(`$${item.total.toFixed(2)}`, totalX, tableY)

    tableY += 20
  }

  doc
    .moveTo(itemX, tableY)
    .lineTo(totalX + 50, tableY)
    .stroke()

  tableY += 20

  // Summary
  doc.text("Subtotal:", 300, tableY)
  doc.text(`$${invoice.subtotal.toFixed(2)}`, totalX, tableY)

  tableY += 20
  doc.text("Tax:", 300, tableY)
  doc.text(`$${invoice.tax.toFixed(2)}`, totalX, tableY)

  tableY += 20
  doc.text("Discount:", 300, tableY)
  doc.text(`$${invoice.discount.toFixed(2)}`, totalX, tableY)

  tableY += 20
  doc.fontSize(12).text("Total:", 300, tableY)
  doc.fontSize(12).text(`$${invoice.total.toFixed(2)}`, totalX, tableY)

  // Footer
  doc.fontSize(10)
  const footerTop = tableY + 50
  doc.text("Thank you for your business!", 50, footerTop)

  if (invoice.notes) {
    doc.moveDown()
    doc.text(`Notes: ${invoice.notes}`)
  }
}
