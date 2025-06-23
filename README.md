# GheeRoots E-Commerce Website

GheeRoots is a professional, full-stack e-commerce website built for a family-owned ghee business. It features a complete shopping experience, from product browsing to a secure, multi-step checkout process. The backend is powered by Express and TypeScript, with a production-ready PostgreSQL database, while the frontend is a modern React application.

## Key Features

- **Full E-Commerce Flow**: Browse products, add items to the cart, and complete orders.
- **Online & Offline Payments**: Supports both online payments via Cashfree and Cash on Delivery (COD).
- **Robust Backend**: Built with Express.js, TypeScript, and Drizzle ORM for type-safe database queries.
- **Production-Ready Database**: Uses PostgreSQL with a normalized schema, indexes, and data validation constraints.
- **Secure Admin Panel**: JWT-based authentication for admin area to view and manage all customer orders.
- **Modern Frontend**: A responsive and interactive UI built with React, Vite, and Tailwind CSS.
- **Comprehensive Testing**: Includes unit and API tests to ensure backend reliability.
- **Cash on Delivery (COD) Validation**: Phone numbers are now validated on the client to match Indian mobile formats (starts with 6-9, 10 digits, optional +91/91), preventing order failures due to DB constraints.
- **CORS Robustness**: The backend now handles minor Origin header formatting issues (e.g., trailing semicolons) for production deployments.

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, pino (for logging)
- **Database**: PostgreSQL, Drizzle ORM
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Testing**: Vitest, Supertest

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- A running PostgreSQL database instance

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd Ghee_Website
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    - Copy the `example.env` file to a new file named `.env`.
    - Fill in the required values, especially `DATABASE_URL`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.

4.  **Apply database schema:**
    - The schema is defined in `/shared/schemas`. To apply it to your database, run:
    ```bash
    npm run db:push
    ```

5.  **Seed an admin user:**
    - Run the admin seed script to create an admin user:
    ```bash
    npx tsx scripts/seed-admin-user.ts
    ```

### Running the Application

This project requires two terminals to run both the frontend and backend servers concurrently.

1.  **Start the backend server:**
    ```bash
    npm run dev:server
    ```
    The backend will be available at `http://localhost:5000`.

2.  **Start the frontend development server:**
    ```bash
    npm run dev:client
    ```
    The frontend will be available at `http://localhost:5173` and will proxy API requests to the backend.

## Admin Panel

- **Access**: Navigate to `/admin`.
- **Login**: Use your admin email and password (seeded or set in `.env`).
- **Features**: View a paginated list of all customer orders, update order statuses, and export data.
- **Authentication**: Uses JWT access and refresh tokens. All admin API requests require a Bearer access token.

## Migration to JWT-Based Admin Authentication (2025-06)

- Replaced static ADMIN_API_TOKEN authentication with JWT-based email/password login for admin panel.
- Backend `/api/auth/login` issues access and refresh tokens; refresh token is set as HttpOnly cookie.
- All admin routes now require a Bearer JWT access token in the Authorization header.
- Frontend admin login page updated to use email/password and POST to `/api/auth/login`.
- Admin orders page and all admin API calls now use the JWT access token.
- Vite dev server proxy configured to forward `/api` and `/api/auth` requests to backend.
- `useAdminAuth` hook updated to use `admin_access_token` for token storage.
- `/auth` route mounted at `/api/auth` in backend for proxy compatibility.
- Added migration SQL for `users` table and seed script for admin user.

### Troubleshooting & Key Errors
- **users table does not exist**: Fixed by running migration SQL via psql to create the table in Railway Postgres.
- **psql not found**: Fixed by installing PostgreSQL and adding its `bin` directory to PATH.
- **Vite proxy not working for /auth**: Fixed by using `/api/auth` for all auth endpoints and updating both frontend and backend accordingly.
- **Unexpected end of JSON input**: Fixed by ensuring backend `/api/auth/login` always returns a JSON response, even for errors.
- **404 on /auth/login**: Fixed by mounting `/api/auth` directly on the main Express app and updating all fetch calls to use `/api/auth/login`.
- **Admin orders page stuck on loading**: Fixed by ensuring the JWT token key was consistent (`admin_access_token`) across login, storage, and API calls.
- **500 error on order placement (COD)**: Ensure the phone number is a valid Indian mobile (starts with 6-9, 10 digits, with or without +91/91). The client and DB both enforce this format.
- **CORS error with production domain**: The backend now strips trailing semicolons from the Origin header to avoid CORS failures.

## Documentation
For detailed architectural and feature documentation, refer to [gheewebsite.md](gheewebsite.md).

## Table of Contents
- [Project Overview](#project-overview)
- [Core Features Implemented](#core-features-implemented)
- [Admin Panel](#admin-panel)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Key Technologies & Libraries](#key-technologies--libraries)
- [Security Best Practices](#security-best-practices)
- [Future Development & Considerations](#future-development--considerations)
- [Production Database (PostgreSQL)](#production-database-postgresql)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

This is a professional e-commerce website for GSR, a trusted family-owned ghee (clarified butter) business with 50 years of heritage. It showcases their product line, brand story, and allows customers to order products.

## Project Overview

*   **Client (Frontend):** Built with React, TypeScript, Vite, Tailwind CSS.
    *   Located in the `client` directory.
    *   Uses `wouter` for routing.
    *   Uses `@tanstack/react-query` for data fetching and server state management.
    *   Uses `zustand` for client-side state management (e.g., shopping cart).
    *   UI components from `shadcn/ui` (using Radix UI primitives).
    *   Styling with Tailwind CSS and custom themes defined in `client/src/index.css`. The active theme is `heritage-theme`.
    *   Animations using `framer-motion`.
*   **Server (Backend):** Built with Node.js, Express, TypeScript.
    *   Located in the `server` directory.
    *   Serves API endpoints for products, orders, and contacts.
    *   Integrates with Cashfree for payment processing (sandbox mode by default).
    *   Uses helmet for security headers and CORS for cross-origin protection.
*   **Shared Code:**
    *   Located in the `shared` directory.
    *   Contains database schema definitions using Drizzle ORM (`shared/schema.ts`) for PostgreSQL.
    *   Zod schemas for data validation.
*   **Data Storage (Development):**
    *   Currently uses in-memory storage (`server/storage.ts - MemStorage`) for products, orders, and contacts during development.
    *   Product data includes variants (different sizes for the same product line).

## Core Features Implemented

*   **Product Showcase:** Displays products with multiple variants (sizes, prices). Users can select variants and add them to the cart.
*   **Company Heritage Section:** Highlights the 50-year brand story with a timeline and family values. Includes subtle scroll animations.
*   **Contact Form & Information:** Allows users to send messages and displays business contact details.
*   **Product Ordering System:**
    *   Shopping cart functionality.
    *   Dedicated Cart Page (`/cart`) to view and manage cart items.
    *   Checkout process with Cashfree and Cash on Delivery (COD).
    *   Cart is now cleared after both Cashfree and COD orders.
*   **Visual Theme:** "Heritage Theme" activated globally, using colors like cream, gold, and brown.
*   **Optimized image delivery:** All images are served as WebP with JPG/PNG fallback for compatibility and performance.
*   **Robust checkout & payment flow:** Cart → Checkout (customer info) → Payment (Cashfree or COD) → Success page.
*   **Admin Panel:** Secure admin interface for order management (see below). Now robust against infinite fetch loops due to improved useEffect dependency management.
*   **Secure /api/orders endpoint:** Protected by an admin token for order management.

## Admin Panel

A secure admin panel is available for order management:
- **Login:** Accessible at `/admin`, requires the API token (ADMIN_API_TOKEN).
- **Token Storage:** Token is stored in localStorage and used for all admin API requests.
- **Order List:** View all customer orders, including order ID, customer info, payment method, total, created date, and item breakdown.
- **Logout:** Clears the token and returns to the login page.
- **Error Handling:** Handles 401 Unauthorized by auto-logging out, and displays clear error messages for failed requests.
- **Minimal, clean UI:** Responsive and easy to use.
- **Infinite Fetch Loop Fix:** The admin orders page previously suffered from an infinite fetch loop due to unstable dependencies in the useEffect hook. This has been fixed by only including stable dependencies ([isLoggedIn, token, authLoading]) in the effect, ensuring reliable data fetching.

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm (comes with Node.js)
*   (Optional, for production database) PostgreSQL server

### Installation

1.  Clone the repository (if applicable).
2.  Navigate to the project root directory.
3.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

1.  To start the development server (which runs both client and server, with hot reloading):
    ```bash
    npm run dev
    ```
    This uses `cross-env` to set `NODE_ENV=development` and `tsx` to run the TypeScript server.
2.  The website will be accessible at `http://localhost:5000`.

### Available Scripts

*   `npm run dev`: Starts the development server.
*   `npm run build`: Builds the frontend and backend for production (outputs to `dist` and client build folders).
*   `npm run start`: Starts the production server (after running `npm run build`).
*   `npm run check`: Runs TypeScript type checking.
*   `npm run db:push`: (For Drizzle ORM with PostgreSQL) Pushes schema changes to the database. Requires database connection configured.
*   `npm run db:constraints`: Applies production constraints, indexes, and views to the PostgreSQL database.

## Project Structure

```
/
├── client/                 # Frontend (React, Vite)
│   ├── public/             # Static assets
│   ├── src/                # Frontend source code
│   │   ├── components/     # Reusable UI components (Navbar, Products, Heritage, etc.)
│   │   │   ├── ui/         # shadcn/ui components
│   │   │   └── admin/      # Admin panel components (OrderCard, etc.)
│   │   ├── hooks/          # Custom React hooks (e.g., use-toast)
│   │   ├── lib/            # Utility functions, queryClient, zustand store, useAdminAuth
│   │   ├── pages/          # Page components (Home, Cart, NotFound, Admin, etc.)
│   │   │   └── admin/      # Admin login and orders pages
│   │   ├── App.tsx         # Main app component with routing
│   │   ├── main.tsx        # React entry point
│   │   └── index.css       # Global styles and Tailwind directives
│   ├── index.html          # Main HTML file
│   └── vite.config.ts      # Vite configuration
├── server/                 # Backend (Node.js, Express)
│   ├── index.ts            # Server entry point (helmet, CORS, error handling)
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # In-memory storage (for development)
│   └── vite.ts             # Vite middleware setup for Express
├── shared/                 # Shared code (schema, types)
│   └── schema.ts           # Drizzle ORM schema, Zod schemas, TypeScript types
├── .gitignore
├── components.json         # shadcn/ui configuration
├── drizzle.config.ts     # Drizzle ORM configuration (for DB operations)
├── package.json
├── package-lock.json
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration (root)
└── README.md               # This file
```

## Key Technologies & Libraries

*   **Frontend:**
    *   React
    *   TypeScript
    *   Vite (build tool)
    *   Tailwind CSS (styling)
    *   shadcn/ui (UI components)
    *   `wouter` (routing)
    *   `@tanstack/react-query` (server state)
    *   `zustand` (client state)
    *   `framer-motion` (animations)
    *   `lucide-react` (icons)
*   **Backend:**
    *   Node.js
    *   Express.js
    *   TypeScript
    *   `tsx` (TypeScript execution)
    *   `helmet` (security headers)
    *   `cors` (CORS middleware)
*   **Database & Schema:**
    *   Drizzle ORM (for PostgreSQL)
    *   Zod (validation)
*   **Payments:**
    *   Cashfree (Node.js SDK for backend, JS SDK for frontend) - currently setup for sandbox.
        *   Environment variables needed for Cashfree: `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`, `CASHFREE_ENV` (production/sandbox)

## Security Best Practices

*   `.env` and all secret files are git-ignored and never committed.
*   Admin API endpoints are protected by a secure token (ADMIN_API_TOKEN).
*   Helmet is used for HTTP security headers.
*   CORS is restricted to trusted origins.
*   All user input is validated with Zod.
*   Sensitive endpoints require authentication.
*   HTTPS is recommended for production deployments.

## Future Development & Considerations

*   **Persistent Database:**
    *   The backend now uses **PostgreSQL** as the default for production, with a normalized schema and Drizzle ORM migrations.
    *   Run `npm run db:push` after schema changes to update the database.
    *   Run `npm run db:constraints` to apply production constraints, indexes, and views.
*   **User Authentication:** Implement user accounts (e.g., using Passport.js or a similar library) for order history, saved addresses, etc.
*   **Full Checkout Flow:**
    *   Develop the frontend UI for the checkout process (shipping address, order summary, payment method selection).
    *   Integrate the Cashfree payment flow on the client-side using `cashfree.sandbox.js` (or production version).
    *   Handle payment success/failure callbacks and update order status in the database.
*   **Order Management System (Admin Panel):**
    *   Add features like CSV export, order status updates, and advanced filtering to the admin panel.
    *   Add product management and admin user management.
*   **Image Hosting:** Currently using Unsplash/Pixabay URLs. For production, product images should be hosted reliably (e.g., cloud storage like AWS S3, Cloudinary, or self-hosted).
*   **Search Functionality:** Implement product search.
*   **Support Pages:** Create actual content for FAQ, Shipping Info, Return Policy, Privacy Policy.
*   **Testing:** Add unit tests (e.g., with Vitest) and end-to-end tests (e.g., with Playwright or Cypress).
*   **Deployment:**
    *   Choose a hosting platform (e.g., Vercel, Netlify for frontend; Render, Fly.io, AWS for backend and database).
    *   Configure environment variables for production (database credentials, Cashfree live keys, etc.).

## Production Database (PostgreSQL)

- The backend now uses a **production-grade PostgreSQL database** (hosted on Railway) with a fully normalized schema.
- **Drizzle ORM** is used for schema management and migrations.
- **Indexes** and **constraints** are in place for fast queries and strong data integrity.
- **Foreign key relationships** and **ON DELETE CASCADE** are enforced for order and item consistency.
- **Database-level validation** (CHECK constraints) ensures only valid data is stored.
- **Views** are created for analytics (order summary, popular products).

### Applying Schema & Constraints

- To apply schema changes:  
  ```bash
  npx drizzle-kit push
  ```
- To apply production constraints, indexes, and views:  
  ```bash
  npm run db:constraints
  ```

### Backups

- **Backups:** Enable daily/weekly PostgreSQL backups in the Railway dashboard for disaster recovery.
- For extra safety, consider exporting regular SQL dumps externally.

## Environment Variables

Before running, copy `.env.example` to `.env` and fill in your values.

The following environment variables are used or will be needed:

*   `NODE_ENV`: Set to `development` or `production`.
*   `CASHFREE_APP_ID`: Your Cashfree App ID.
*   `CASHFREE_SECRET_KEY`: Your Cashfree Secret Key.
*   `CASHFREE_ENV`: Set to `sandbox` for testing or `production` for live payments.
*   `ADMIN_API_TOKEN`: Token for admin panel and secure order management.
*   (For Persistent DB) `DATABASE_URL`: Connection string for your PostgreSQL database.

## Contributing
Contributions are welcome! Please open issues or pull requests. Before submitting, ensure you run:

```bash
npm run lint:fix
npm run format
```

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Production Checklist

### Image Optimization
- ✅ Serve WebP with JPG/PNG fallbacks
- ✅ Apply `loading="lazy"` to below-the-fold images
- ✅ Implement `srcset` for responsive images

### Cart Data Consistency
- ✅ Normalized cart item structure enforced
- ✅ Type checks for numeric pricing
- ❌ Removed legacy product.* references

## 2024-06: End-to-End Order Placement & Admin Panel

- Cash on Delivery (COD) and online order placement now work end-to-end.
- Orders placed by customers appear in the Admin Panel for management and status updates.
- Fixed a frontend bug where the `items` field was sent as a string instead of an array; the backend now receives the correct format.
- Troubleshooting:
  - If you see `EADDRINUSE`, kill the process using port 5000 before restarting the backend.
  - Cashfree payment endpoints require `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`, and `CASHFREE_ENV` in your `.env` file.

## 2024-06: Order Status API & CSV Export

- **PATCH /api/orders/:id/status**: Allows admins to update the status of any order (pending, processing, shipped, delivered, cancelled). Protected by admin authentication. Validates status using Zod. Returns the updated order on success.
- **GET /api/orders/export/csv**: Exports all orders as a CSV file, including key order fields and item details. Supports optional query parameters:
  - `status`: Filter orders by status (e.g., pending, shipped)
  - `startDate`, `endDate`: Filter by order creation date range (ISO format)
  - Protected by admin authentication.
  - Download button is available in the Admin Panel to trigger CSV download.