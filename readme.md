# Inventory Management API

A comprehensive Inventory Management API built with Node.js, Express, TypeScript, and MongoDB. This API follows clean architecture principles and provides a robust solution for managing inventory, customers, products, stocks, invoices, and more.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (Admin, Store Manager, Customer)
- **Customer Management**: Registration and management of customer accounts
- **Product Management**: CRUD operations for products with categorization
- **Stock Management**: Track inventory levels across different locations
- **Invoice Generation**: Create and manage invoices with line items
- **Email Notifications**: Send emails to customers for various events
- **Discount & Promotion Management**: Create and apply discounts and promotions
- **Reporting**: Generate sales, stock, profit, and returns reports
- **Excel Import/Export**: Import and export products and stocks using Excel files
- **API Documentation**: Automatic API documentation using TSOA

## Tech Stack

- **Node.js & Express**: Server framework
- **TypeScript**: Type-safe JavaScript
- **MongoDB & Mongoose**: Database and ODM
- **TSOA**: OpenAPI specification and route generation
- **JWT**: Authentication
- **Winston**: Logging
- **Helmet & Morgan**: Security and request logging middleware
- **Nodemailer**: Email sending
- **XLSX**: Excel file processing
- **PDFKit**: PDF generation

## Project Structure

The project follows clean architecture principles with the following layers:

- **Domain**: Contains business entities and repository interfaces
- **Application**: Contains business logic and services
- **Infrastructure**: Contains implementations of repositories and external services
- **Presentation**: Contains controllers and routes

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/abhiraj-cuchd/retail-inventory-backend-api.git
   cd inventory-management-api
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a `.env` file in the root directory with the following variables:
   \`\`\`
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/inventory-management
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=1d
   MAIL_HOST=smtp.example.com
   MAIL_PORT=587
   MAIL_USER=user@example.com
   MAIL_PASSWORD=password
   MAIL_FROM=noreply@example.com
   LOG_LEVEL=info
   LOG_DIR=logs
   \`\`\`

4. Generate routes and Swagger specification:
   \`\`\`bash
   npm run tsoa
   \`\`\`

5. Build the project:
   \`\`\`bash
   npm run build
   \`\`\`

6. Start the server:
   \`\`\`bash
   npm start
   \`\`\`

   For development with auto-reload:
   \`\`\`bash
   npm run dev
   \`\`\`

### API Documentation

Once the server is running, you can access the Swagger documentation at:
\`\`\`
http://localhost:3000/docs
\`\`\`

## API Endpoints

The API provides the following endpoints:

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with email and password

### Users
- `GET /users` - Get all users (Admin only)
- `GET /users/{id}` - Get user by ID
- `PUT /users/{id}` - Update user (Admin only)
- `DELETE /users/{id}` - Delete user (Admin only)

### Categories
- `GET /categories` - Get all categories
- `GET /categories/{id}` - Get category by ID
- `POST /categories` - Create category (Admin only)
- `PUT /categories/{id}` - Update category (Admin only)
- `DELETE /categories/{id}` - Delete category (Admin only)

### Products
- `GET /products` - Get all products
- `GET /products/{id}` - Get product by ID
- `POST /products` - Create product
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product (Admin only)
- `POST /products/import` - Import products from Excel
- `GET /products/export` - Export products to Excel
- `GET /products/template` - Get product template

### Stocks
- `GET /stocks` - Get all stocks
- `GET /stocks/{id}` - Get stock by ID
- `GET /stocks/product/{productId}` - Get stocks by product ID
- `POST /stocks` - Create stock
- `PUT /stocks/{id}` - Update stock
- `PUT /stocks/{id}/quantity/{quantity}` - Update stock quantity
- `DELETE /stocks/{id}` - Delete stock (Admin only)
- `POST /stocks/import` - Import stocks from Excel
- `GET /stocks/export` - Export stocks to Excel
- `GET /stocks/template` - Get stock template

### Invoices
- `GET /invoices` - Get all invoices
- `GET /invoices/{id}` - Get invoice by ID
- `GET /invoices/customer/{customerId}` - Get invoices by customer ID
- `POST /invoices` - Create invoice
- `PUT /invoices/{id}` - Update invoice
- `PUT /invoices/{id}/status/{status}` - Update invoice status
- `DELETE /invoices/{id}` - Delete invoice (Admin only)
- `POST /invoices/{id}/send` - Send invoice by email
- `GET /invoices/recent/{limit}` - Get recent invoices

### Discounts
- `GET /discounts` - Get all discounts
- `GET /discounts/{id}` - Get discount by ID
- `GET /discounts/code/{code}` - Get discount by code
- `POST /discounts` - Create discount (Admin only)
- `PUT /discounts/{id}` - Update discount (Admin only)
- `DELETE /discounts/{id}` - Delete discount (Admin only)
- `GET /discounts/validate/{code}` - Validate discount code

### Promotions
- `GET /promotions` - Get all promotions
- `GET /promotions/{id}` - Get promotion by ID
- `GET /promotions/active` - Get active promotions
- `POST /promotions` - Create promotion (Admin only)
- `PUT /promotions/{id}` - Update promotion (Admin only)
- `DELETE /promotions/{id}` - Delete promotion (Admin only)

### Reports
- `GET /reports/sales` - Get sales report
- `GET /reports/product-sales` - Get product sales report
- `GET /reports/stock` - Get stock report
- `GET /reports/profit` - Get profit report (Admin only)
- `GET /reports/returns` - Get returns and refunds report

## License

This project is licensed under the ISC License.
