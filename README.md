# Sistema de Inventario y Ventas

## Table of Contents
1.  [Description](#description)
2.  [Features](#features)
3.  [Technologies Used](#technologies-used)
4.  [Prerequisites](#prerequisites)
5.  [Installation and Setup](#installation-and-setup)
6.  [Running the Application](#running-the-application)
7.  [Project Structure](#project-structure)
8.  [Database Schema Overview](#database-schema-overview)
9.  [API Endpoints](#api-endpoints)
    *   [Authentication (`/auth`)](#authentication-auth)
    *   [Products (`/products`)](#products-products)
    *   [Categories (`/categories`)](#categories-categories)
    *   [Alerts (`/alerts`)](#alerts-alerts)
    *   [Dashboard (`/dashboard`)](#dashboard-dashboard)
    *   [Notifications (`/notifications`)](#notifications-notifications)
    *   [Purchases (`/purchases`)](#purchases-purchases)
    *   [Reports (`/reports`)](#reports-reports)
    *   [Sales (`/sales`)](#sales-sales)
    *   [Suppliers (`/suppliers`)](#suppliers-suppliers)
10. [Key System Features](#key-system-features)
    *   [Authentication](#authentication-1)
    *   [Reporting](#reporting)
    *   [Excel Data Import](#excel-data-import)
11. [Contributing](#contributing)
12. [License](#license)

## Description
This is a backend system designed for managing inventory, sales, purchases, products, categories, suppliers, and user authentication. It also includes features for generating reports, handling low stock alerts, and notifications.

## Features
*   User Management (Authentication, Roles: Admin, Seller)
*   Product Management (CRUD operations, stock control, minimum stock alerts)
*   Category Management
*   Sales Processing (creating sales, tracking sale details, different payment methods)
*   Purchase Tracking (managing purchases from suppliers)
*   Supplier Management
*   Dashboard Analytics (summarized data for quick insights)
*   Report Generation (e.g., sales reports, inventory reports - likely in PDF format)
*   Notification System
*   Low Stock Alerts

## Technologies Used
*   Node.js
*   Express.js
*   PostgreSQL
*   Prisma
*   JSON Web Tokens (JWT)
*   bcrypt
*   pdfkit
*   xlsx

## Prerequisites

*   Node.js (latest LTS version recommended)
*   npm (or yarn)
*   PostgreSQL database server

## Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd sistema-inventario 
    ```
    *(Replace `<repository-url>` with the actual URL of the repository)*
2.  **Install dependencies:**
    ```bash
    npm install
    ```
    (or `yarn install`)
3.  **Set up environment variables:**
    Create a `.env` file in the root of the project. If an `.env.example` file exists, copy its contents to `.env`. Otherwise, create `.env` from scratch.
    Fill in the required variables, especially `DATABASE_URL` for connecting to your PostgreSQL database.
    Example `.env` structure:
    ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME?schema=public"
    JWT_SECRET="your_jwt_secret_key_here"
    PORT=3000 
    # Add other environment variables as needed
    ```
4.  **Run database migrations:**
    This command will set up the database schema based on your Prisma schema file (`prisma/schema.prisma`).
    ```bash
    npx prisma migrate dev
    ```
    *(This will also generate Prisma Client)*

## Running the Application

*   **Development Mode (with auto-reload using Nodemon, if configured):**
    ```bash
    npm run dev
    ```
*   **Production Mode:**
    First, ensure your project has a build step if necessary (e.g., for TypeScript projects). If it's plain JavaScript, this might not be needed.
    ```bash
    npm run build 
    npm start
    ```
    *(The `build` script might not be present if not using TypeScript or a build process)*

The application will typically start on the port specified in your `.env` file (e.g., 3000) or a default port if `PORT` is not set. Check the application's startup logs for the exact URL.

## Project Structure

```
sistema-inventario/
├── prisma/ # Contains database schema, migrations
│   ├── schema.prisma # Defines database models and relations
│   └── migrations/   # Database migration history
├── src/ # Source code
│   ├── config/         # Configuration files (e.g., Prisma client setup)
│   ├── controllers/    # Request handlers, business logic for API endpoints
│   ├── middleware/     # Custom middleware (e.g., authentication)
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic services (e.g., PDF generation, notifications)
│   ├── utils/          # Utility scripts (e.g., Excel import)
│   └── index.js        # Main application entry point
├── .env                # Environment variables (needs to be created)
├── package.json        # Project dependencies and scripts
└── README.md           # This file
```

*   `prisma/`: Contains all database-related files managed by Prisma.
    *   `schema.prisma`: The heart of your Prisma setup. It defines your database models, their fields, and relationships.
    *   `migrations/`: Stores the SQL migration files generated by Prisma Migrate as your schema evolves.
*   `src/`: Contains the main application source code.
    *   `config/`: Holds configuration files, such as the Prisma client initialization (`prismaClient.js`).
    *   `controllers/`: These are responsible for handling incoming HTTP requests, processing them (often by calling services), and sending back responses. They contain the core business logic for each API endpoint.
    *   `middleware/`: Contains custom middleware functions used in the Express.js request-response cycle. Examples include authentication checks (`authMiddleware.js`), error handling, or logging.
    *   `routes/`: Defines the API routes. Each file typically groups routes related to a specific resource (e.g., `products.routes.js`, `auth.routes.js`).
    *   `services/`: Houses more specialized business logic that can be reused across different controllers or parts of the application. For instance, PDF generation (`pdfService.js`) or notification handling.
    *   `utils/`: Contains utility functions and scripts that support various parts of the application, like the Excel data import functionality (`excelImporter.js`).
    *   `index.js`: The main entry point for the application. It typically initializes the Express server, sets up middleware, connects to the database, and starts listening for requests.

## Database Schema Overview

The application uses Prisma to manage its database schema. Below is a summary of the main models. The complete schema, including all fields, types, and relations, can be found in `prisma/schema.prisma`.

*   **`Category`**: Stores product categories (e.g., Electronics, Books, Clothing). Each product is linked to a category.
*   **`Product`**: Represents items available for sale in the inventory. It includes details such as a unique code, name, description, purchase price, sale price, current stock level, and a minimum stock threshold for generating low stock alerts. It is linked to a `Category`.
*   **`Sale`**: Records sales transactions. This includes the total amount of the sale, the date of the sale, its current status (e.g., Pending, Completed, Cancelled), the payment method used, and links to multiple `SaleDetail` entries.
*   **`SaleDetail`**: Contains specific information for each product included in a `Sale`. This includes the quantity sold, the sale price at the time of the transaction, and the subtotal for that line item.
*   **`User`**: Manages user accounts for accessing the system. It stores a username, a hashed password for security, the user's full name, and their role (e.g., 'Admin', 'Seller'), which determines their access permissions.
*   **`BlacklistedToken`**: Stores JSON Web Tokens (JWTs) that have been invalidated, typically after a user logs out, to prevent their reuse.
*   **`Purchase`**: Tracks purchases made from suppliers to replenish inventory. It includes details like a document number (e.g., invoice number), the total amount of the purchase, the date of purchase, and its status. It is linked to a `Supplier` and multiple `PurchaseDetail` entries.
*   **`PurchaseDetail`**: Details each product included in a `Purchase`. This includes the quantity purchased and the price paid per unit.
*   **`Supplier`**: Stores information about external suppliers from whom products are purchased. This includes the supplier's name, RUC (tax identification number), and contact details like phone number and email.

For a detailed understanding of field types, constraints, and relationships (e.g., one-to-many, many-to-many), please refer to the `prisma/schema.prisma` file.

## API Endpoints

This section details the available API endpoints.
(Assuming a global prefix `/api` for all routes, which is common. Adjust if your setup is different, e.g. `/api/v1`)

### Authentication (`/auth`)

Base Path: `/api/auth`

#### `POST /auth/init-admin`
Initializes the first administrator account.
*   **Permissions:** None. Fails if an admin user already exists.

---

#### `POST /auth/register`
Registers a new user.
*   **Permissions:** `verifyToken`, `isAdmin`

---

#### `POST /auth/login`
Authenticates an existing user and returns a JWT.
*   **Permissions:** None

---

#### `POST /auth/logout`
Logs out the current user by blacklisting their JWT.
*   **Permissions:** `verifyToken`

---

### Products (`/products`)

Base Path: `/api/products`

#### `GET /products`
Retrieves a list of all products.
*   **Permissions:** `verifyToken`

---

#### `GET /products/search`
Searches for products by code or name.
*   **Query Parameters:** `query` (string)
*   **Permissions:** `verifyToken`

---

#### `GET /products/:id`
Retrieves a specific product by its ID.
*   **Permissions:** `verifyToken`

---

#### `GET /products/barcode/:code`
Retrieves a product by its barcode.
*   **Permissions:** `verifyToken`, `isSeller`

---

#### `POST /products`
Creates a new product.
*   **Permissions:** `verifyToken`, `isAdmin`

---

#### `PUT /products/:id`
Updates an existing product.
*   **Permissions:** `verifyToken`, `isAdmin`

---

### Categories (`/categories`)

Base Path: `/api/categories`

#### `GET /categories`
Retrieves a list of all categories.
*   **Permissions:** None (Note: May be globally protected)

---

#### `POST /categories`
Creates a new category.
*   **Permissions:** None (Note: May be globally protected, ideally Admin only)

---

### Alerts (`/alerts`)

Base Path: `/api/alerts`
*   **Global Permissions:** `verifyToken`, `isAdmin`

#### `GET /alerts/inventory`
Retrieves low stock/out of stock product alerts.

---

#### `GET /alerts/summary`
Retrieves stock summary by category.

---

### Dashboard (`/dashboard`)

Base Path: `/api/dashboard`

#### `GET /dashboard/stats`
Retrieves comprehensive dashboard statistics.
*   **Permissions:** `verifyToken`, `isAdmin`

---

### Notifications (`/notifications`)

Base Path: `/api/notifications`

#### `GET /notifications/low-stock`
Retrieves low stock/out of stock notification summary.
*   **Permissions:** `verifyToken`

---

### Purchases (`/purchases`)

Base Path: `/api/purchases`
*   **Global Permissions:** `verifyToken`, `isAdmin`

#### `POST /purchases`
Creates a new purchase.
*   **Request Body:** (Example)
    ```json
    {
      "supplierId": 1,
      "documentNumber": "INV-2023-001",
      "details": [
        { "productId": 1, "quantity": 10, "price": 750.00 }
      ]
    }
    ```

---

#### `GET /purchases`
Retrieves a list of all purchases.

---

#### `GET /purchases/:id`
Retrieves a specific purchase by its ID.

---

#### `POST /purchases/:id/cancel`
Cancels an existing purchase.
*   **Request Body:** (Optional)
    ```json
    { "reason": "Supplier error" }
    ```

---

### Reports (`/reports`)

Base Path: `/api/reports`
*   **Global Permissions:** `verifyToken`, `isAdmin`

#### `GET /reports/daily`
Retrieves a summary of sales for a specific day.
*   **Query Parameters:** `date` (string, optional, YYYY-MM-DD)

---

#### `GET /reports/monthly`
Retrieves a summary of sales for a specific month.
*   **Query Parameters:** `year` (number, optional), `month` (number, optional, 1-12)

---

#### `GET /reports/top-products`
Retrieves a list of top-selling products.
*   **Query Parameters:** `startDate` (string, optional, YYYY-MM-DD), `endDate` (string, optional, YYYY-MM-DD), `limit` (number, optional)

---

### Sales (`/sales`)

Base Path: `/api/sales`

#### `POST /sales`
Creates a new sale.
*   **Permissions:** `verifyToken`, `isSeller`
*   **Request Body:** (Example)
    ```json
    {
      "paymentMethod": "CASH",
      "products": [
        { "productId": 1, "quantity": 2, "price": 1200.00 }
      ]
    }
    ```

---

#### `GET /sales`
Retrieves a list of all sales (Admin only).
*   **Permissions:** `verifyToken`, `isAdmin`

---

#### `GET /sales/detail/:id`
Retrieves a specific sale by its ID (Seller or Admin).
*   **Permissions:** `verifyToken`, `isSeller`

---

#### `GET /sales/:id/invoice`
Retrieves data for generating a sale invoice (Admin only).
*   **Permissions:** `verifyToken`, `isAdmin`

---

#### `POST /sales/:id/cancel`
Cancels an existing sale (Admin only).
*   **Request Body:** (Optional)
    ```json
    { "reason": "Customer request" }
    ```
*   **Permissions:** `verifyToken`, `isAdmin`

---

### Suppliers (`/suppliers`)

Base Path: `/api/suppliers`
*   **Global Permissions for this module:** `verifyToken`, `isAdmin` (Applied to all routes in this module)

#### `POST /suppliers`
Creates a new supplier.
*   **Request Body:**
    ```json
    {
      "name": "Supplier Inc.",
      "ruc": "12345678901",
      "address": "123 Main St, Anytown",
      "phone": "555-1234",
      "email": "contact@supplierinc.com"
    }
    ```
*   **Response (Success 201):**
    ```json
    {
      "id": 1,
      "name": "Supplier Inc.",
      "ruc": "12345678901",
      "address": "123 Main St, Anytown",
      "phone": "555-1234",
      "email": "contact@supplierinc.com",
      "createdAt": "2023-10-28T18:00:00.000Z",
      "updatedAt": "2023-10-28T18:00:00.000Z"
    }
    ```

---

#### `GET /suppliers`
Retrieves a list of all suppliers. Includes a count of purchases associated with each supplier.
*   **Response (Success 200):** An array of supplier objects.
    ```json
    [
      {
        "id": 1,
        "name": "Supplier Inc.",
        "ruc": "12345678901",
        // ... other fields
        "_count": { "purchases": 5 } 
      }
      // ... other suppliers
    ]
    ```

---

#### `GET /suppliers/:id`
Retrieves a specific supplier by its ID. Includes a count of purchases.
*   **Example URL:** `/api/suppliers/1`
*   **Response (Success 200):** A single supplier object.
    ```json
    {
      "id": 1,
      "name": "Supplier Inc.",
      // ... other fields
      "_count": { "purchases": 5 } 
    }
    ```
*   **Response (Error 404):** If supplier not found.

---

#### `PUT /suppliers/:id`
Updates an existing supplier.
*   **Example URL:** `/api/suppliers/1`
*   **Request Body:** (Provide fields to update)
    ```json
    {
      "phone": "555-5678",
      "email": "newcontact@supplierinc.com"
    }
    ```
*   **Response (Success 200):** The updated supplier object.
    ```json
    {
      "id": 1,
      "name": "Supplier Inc.",
      "phone": "555-5678",
      "email": "newcontact@supplierinc.com",
      // ... other fields, including _count
    }
    ```

---

**Note on Permissions for Categories:** The `categoryRoutes.js` does not explicitly define `verifyToken` or `isAdmin` middleware for its routes. This is unusual for `POST` operations. It's possible that:
1.  Authentication is handled globally for all `/api/*` routes in `index.js`.
2.  This is an oversight, and these routes should be protected (e.g., creating categories should likely be an Admin task).
For the purpose of this documentation, I've noted the permissions as derived *directly* from the provided `categoryRoutes.js`. If global middleware applies, the actual permissions would be stricter.

---
## Key System Features

### Authentication

The system uses JSON Web Tokens (JWT) for authentication.
*   **Registration:** New users can be registered via `POST /auth/register` (typically by an Admin). An initial admin can be created using `POST /auth/init-admin` if no admin exists.
*   **Login:** Users log in with their `username` and `password` at `POST /auth/login` to obtain a JWT. This token must be included in the `Authorization` header for protected routes (e.g., `Authorization: Bearer <token>`).
*   **Logout:** The `POST /auth/logout` endpoint invalidates the current user's token by adding it to a blacklist (`BlacklistedToken` model), preventing its reuse.
*   **Roles:** The system utilizes user roles (e.g., `ADMIN`, `SELLER`) defined in the `User` model. Middleware (`verifyToken`, `isAdmin`, `isSeller` located in `src/middleware/auth.js`) protects endpoints, ensuring only authorized users can access certain functionalities. Specific role requirements are detailed in the API Endpoints section.

### Reporting

The application provides several reporting capabilities accessible via API endpoints.
*   Reports can be generated for daily sales, monthly sales, and top-selling products. These are available under the `/api/reports/` path (e.g., `GET /api/reports/daily`, `GET /api/reports/monthly`).
*   The `pdfkit` library is listed among the project's technologies, suggesting an intention for PDF report generation. However, the current report controllers (`src/controllers/reportController.js`) return JSON data. PDF generation might be implemented in a separate service (`src/services/pdfService.js` exists but its usage is not shown in report routes) or handled client-side.
*   For detailed information on report generation, refer to the "Reports (`/reports`)" section under API Endpoints.

### Excel Data Import

The system includes a utility for importing data from Excel (`.xlsx`) files, primarily for bulk product import.
*   This functionality is handled by the script `src/utils/importExcel.js`.
*   It uses the `xlsx` library to parse Excel files. The script is designed to read product data (code, name, category, purchase price, sale price, stock, min stock) and import it into the database.
*   **To run the script:**
    ```bash
    node src/utils/importExcel.js path/to/your/excel_file.xlsx
    ```
    (e.g., `node src/utils/importExcel.js "Inventario 2025.xlsx"`)
*   Ensure your `.env` file is correctly configured with database connection details before running.
*   The script expects specific column names in the Excel file: 'CODIGO', 'NOMBRE_PRODUCTO', 'CATEGORIA', 'PRECIO_COMPRA', 'PRECIO_VENTA', 'STOCK_INICIAL', 'STOCK_MINIMO'. Category names from the Excel file must exist in the database or be created beforehand for the import to succeed for those products.
*   There is no dedicated API endpoint to trigger this import; it is a command-line utility.

---

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these general steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix (`git checkout -b feature/your-feature-name` or `bugfix/your-bug-fix`).
3.  Make your changes and commit them with clear, descriptive messages.
4.  Push your changes to your fork (`git push origin feature/your-feature-name`).
5.  Create a Pull Request to the main repository's `main` or `develop` branch.

Please ensure your code adheres to any existing coding standards and include tests if applicable.

## License

This project is licensed under the ISC License. See the `LICENSE` file for more details (if a separate LICENSE file exists, otherwise this statement is sufficient).

---
