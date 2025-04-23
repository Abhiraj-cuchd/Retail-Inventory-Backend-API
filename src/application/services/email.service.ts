import nodemailer from "nodemailer"
import { logger } from "../../utils/logger"
import config from "../../config"

export interface EmailOptions {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.port === 465,
      auth: {
        user: config.mail.user,
        pass: config.mail.password,
      },
    })
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: config.mail.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      }

      await this.transporter.sendMail(mailOptions)
      logger.info(`Email sent to ${options.to}`)
      return true
    } catch (error) {
      logger.error("Error sending email:", error)
      return false
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const subject = "Welcome to our Inventory Management System"
    const html = `
      <h1>Welcome, ${name}!</h1>
      <p>Thank you for registering with our Inventory Management System.</p>
      <p>We're excited to have you on board.</p>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
    `

    return this.sendEmail({
      to: email,
      subject,
      html,
    })
  }

  async sendInvoiceEmail(email: string, name: string, invoiceNumber: string, invoicePdf: Buffer): Promise<boolean> {
    const subject = `Invoice #${invoiceNumber}`
    const html = `
      <h1>Invoice #${invoiceNumber}</h1>
      <p>Dear ${name},</p>
      <p>Please find attached your invoice #${invoiceNumber}.</p>
      <p>Thank you for your business!</p>
    `

    return this.sendEmail({
      to: email,
      subject,
      html,
      attachments: [
        {
          filename: `invoice-${invoiceNumber}.pdf`,
          content: invoicePdf,
          contentType: "application/pdf",
        },
      ],
    })
  }
}
