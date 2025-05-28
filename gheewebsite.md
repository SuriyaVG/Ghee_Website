# GheeRoots Website Documentation

## Project Overview
GheeRoots is a professional e-commerce website for GSR, a family-owned ghee business. The site features a product showcase, company history, contact information, and a robust ordering system. The project is structured with `client`, `server`, and `shared` directories. The client uses React/TypeScript and Vite.

---

## Major Features Added
- **Product Showcase**: Displays all ghee products and their variants (250ml, 500ml, 1000ml) with images, prices, and size selection.
- **Company Heritage Section**: Tells the story of GSR with a timeline and family values, now using local images.
- **Hero Section**: Features a prominent hero image and call-to-action, now using a local image.
- **Cart and Ordering System**: Users can add products to a cart and place orders.
- **Contact Section**: Allows users to send inquiries.
- **Color Themes and Animations**: Enhanced visual appeal and user experience.
- **Robust Image Handling**: All images now use a custom React `<Image />` component for graceful loading and fallback.

---

## Database Schema (Current)

### products
| Field       | Type     | Description                                 |
|-------------|----------|---------------------------------------------|
| id          | serial   | Primary key                                 |
| name        | text     | Product name                                |
| description | text     | Product description                         |
| is_popular  | boolean  | Whether the product is popular              |

### product_variants
| Field             | Type     | Description                                 |
|-------------------|----------|---------------------------------------------|
| id                | serial   | Primary key                                 |
| product_id        | integer  | Foreign key to products                     |
| size              | text     | Variant size (e.g., 250ml, 500ml, 1000ml)   |
| price             | decimal  | Price for this variant                      |
| image_url         | text     | **Now uses local images (e.g., /images/ghee-250ml.jpg)** |
| best_value_badge  | text     | Optional badge (e.g., Best Value)           |
| sku               | text     | Optional SKU                                |
| stock_quantity    | integer  | Inventory count                             |

### orders
| Field            | Type     | Description                                 |
|------------------|----------|---------------------------------------------|
| id               | serial   | Primary key                                 |
| customerName     | text     | Customer name                               |
| customerEmail    | text     | Customer email                              |
| customerPhone    | text     | Customer phone                              |
| items            | text     | JSON string of cart items                   |
| total            | decimal  | Order total                                 |
| status           | text     | Order status                                |
| paymentId        | text     | Payment ID                                  |
| paymentStatus    | text     | Payment status                              |
| razorpayOrderId  | text     | Razorpay order ID                           |
| createdAt        | timestamp| Order creation time                         |

### contacts
| Field        | Type     | Description                                 |
|--------------|----------|---------------------------------------------|
| id           | serial   | Primary key                                 |
| firstName    | text     | First name                                  |
| lastName     | text     | Last name                                   |
| email        | text     | Email address                               |
| phone        | text     | Phone number                                |
| message      | text     | Message content                             |
| createdAt    | timestamp| Contact creation time                       |

---

## Migrations
- **Product Variant Images**: Migrated all product variant images from external URLs to local images (`/images/ghee-250ml.jpg`, `/images/ghee-500ml.jpg`, `/images/ghee-1000ml.jpg`).
- **Frontend Image Handling**: Replaced all `<img>` tags with a custom `<Image />` component for better error handling and loading states.

---

## Issues Faced & Resolutions

### 1. **Images Not Displaying / 400 Bad Request**
- **Cause**: Product and section images were using external URLs (Pixabay, Unsplash) that were either broken or rate-limited.
- **Resolution**: All images were moved to `client/public/images` and referenced locally. The backend was updated to serve local image URLs for all product variants.

### 2. **Image URLs Not Updating After Code Change**
- **Cause**: The backend uses in-memory storage, so changes to image URLs in code only take effect after a server restart.
- **Resolution**: Restarted the backend server after updating image URLs in `server/storage.ts`.

### 3. **Port 5000 Already in Use (EADDRINUSE)**
- **Cause**: An old backend process was still running, blocking the port.
- **Resolution**: Used `netstat -ano | findstr :5000` and `taskkill /PID <PID> /F` to kill the process, then restarted the backend.

### 4. **Frontend/Backend Not Syncing**
- **Cause**: Sometimes the frontend or backend was not restarted after changes.
- **Resolution**: Always restart both servers after major changes, especially when updating in-memory data or static assets.

---

## How to Preview Locally
- Start the backend: `npm run dev:server`
- Start the frontend: `npm run dev:client`
- Visit: [http://localhost:5000/](http://localhost:5000/)

---

## Next Steps
- Continue to document all schema changes and migrations here.
- Update this file after every major feature or milestone.

---

## Post-Code Review 1.0 Fixes

Here's a summary of the significant changes and fixes applied based on the code review document (`code review 280525 .txt`):

1.  **Corrected Cashfree Online Payment Flow (Critical Fix #1):**
    *   Modified the client-side payment logic (`client/src/components/payment.tsx`) to prevent premature order creation in the database. It now temporarily stores order details (customer info, items, total) in `sessionStorage` keyed by a `cashfreeOrderId` and initiates the Cashfree payment.
    *   The `returnUrl` for Cashfree checkout now includes this `cashfreeOrderId`.
    *   Created a new payment success page (`client/src/pages/payment-success.tsx`) at the `/payment-success` route. This page handles the redirect from Cashfree.
    *   The success page retrieves the `cashfreeOrderId` from the URL and the temporary order data from `sessionStorage`.
    *   It then calls a backend endpoint (`/api/verify-cashfree-payment`) with all necessary data (Cashfree order ID, customer info, items, total) to securely verify the payment status with Cashfree (checking amount and status PAID) and then create the order in the local database.
    *   The `onSuccess` and `onError` callbacks in the success page handle UI updates, cart clearing, and `sessionStorage` cleanup.
    *   Added the corresponding route for `/payment-success` in `client/src/App.tsx`.
    *   The backend endpoint `/api/verify-cashfree-payment` in `server/routes.ts` was updated to perform these verification steps and create the order using `storage.createOrder()` only after successful verification.

2.  **Implemented Secure Cashfree Webhook (Critical Fix #2):**
    *   Added a new backend POST endpoint `/api/cashfree-webhook` in `server/routes.ts` to receive asynchronous payment updates from Cashfree.
    *   Implemented signature verification for incoming webhooks using HMAC SHA256 and the `clientSecret`. This involves:
        *   Extracting the received signature from the webhook payload (assumed to be in `req.body.signature`).
        *   Creating a payload string by sorting the remaining webhook data by keys and concatenating their values.
        *   Generating a signature using `node:crypto` and comparing it to the received signature.
    *   If the signature is valid, the endpoint processes the event. This includes:
        *   Extracting relevant data like `order_id` (Cashfree's order ID), `cf_payment_id`, and `order_status`.
        *   Fetching the corresponding local order from the database using `storage.getOrderByPaymentId()` (where `paymentId` stores Cashfree's `order_id`).
        *   Updating the local order's `status` and `paymentStatus` based on the webhook's `order_status` (e.g., mapping 'PAID' to 'paid'/'completed').
        *   Implementing basic idempotency by checking if the order status actually needs an update before calling `storage.updateOrderStatus()`.
    *   The endpoint responds with a 200 OK to Cashfree upon successful receipt and verification, or an appropriate error code (400/401/500) if issues occur.

3.  **Integrated Code Quality Tools - ESLint & Prettier (Critical Fix #3):**
    *   Installed ESLint, Prettier, and essential plugins/configurations as dev dependencies (`eslint`, `prettier`, `eslint-config-prettier`, `eslint-plugin-prettier`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`).
    *   Created ESLint configuration file (`.eslintrc.js`) with recommended settings for TypeScript, React, JSX A11y, and Prettier integration.
    *   Created Prettier configuration file (`.prettierrc.js`) with defined formatting styles (e.g., single quotes, trailing commas, print width).
    *   Added ignore files (`.eslintignore`, `.prettierignore`) to exclude `node_modules/`, `dist/`, build artifacts, and config files from linting/formatting.
    *   Added `lint`, `lint:fix`, and `format` scripts to `package.json` to facilitate checking and fixing code style and quality issues.

4.  **Addressed Runtime Issues:**
    *   Resolved an issue with setting the `NODE_ENV` environment variable on Windows for the `npm start` script by incorporating `cross-env` into the script in `package.json`.
    *   Provided guidance on how to resolve `EADDRINUSE` (address already in use) errors when starting the server by finding and stopping previously running instances of the application.

5.  **Centralized Server-Side Error Handling (Critical Fix #4):**
    *   Replaced the basic error handler in `server/index.ts` with a more comprehensive centralized error handling middleware placed as the last `app.use()` call.
    *   This middleware logs detailed error information (timestamp, route, request body summary, error name, message, stack in dev, cause).
    *   It specifically handles `ZodError` instances, returning a 400 status with structured validation error details.
    *   Includes an example for handling Axios errors and provides differentiated JSON responses for production (generic messages, no stack traces) and development (detailed messages, stack traces for non-Zod errors).
    *   Refactored all route handlers in `server/routes.ts` to use `next(error)` for error propagation, removing local `try...catch` blocks and direct error responses.
    *   For 404 scenarios (e.g., product/order not found), custom `Error` objects with a `statusCode` are created and passed to `next()`.

6.  **Zod Validation as Middleware (II.1):**
    *   Created a `validateRequest` middleware function in `server/routes.ts`. This higher-order function takes a Zod schema and a request property (`body`, `query`, `params`, defaulting to `body`).
    *   The middleware uses `schema.parseAsync(req[property])` to validate and potentially transform data, replacing the original request property with the validated version.
    *   If validation fails, it calls `next(error)` with the ZodError.
    *   Applied this middleware to the `POST /api/orders` and `POST /api/contacts` routes, removing inline `schema.parse()` calls.

7.  **Environment Variables with `dotenv` (II.2):**
    *   Installed the `dotenv` package.
    *   Instructed to create `.env.example` (template for Git) and `.env` (local secrets, ignored by Git) files for managing Cashfree keys, environment settings (`NODE_ENV`, `CASHFREE_ENV`, `VITE_CASHFREE_ENV`).
    *   Added `import 'dotenv/config';` at the top of `server/index.ts` to load variables from `.env`.
    *   Modified `server/routes.ts` to remove hardcoded fallback values for Cashfree credentials and to default the Cashfree API `baseUrl` to sandbox if `CASHFREE_ENV` is not 'production'. Added a startup check to ensure essential Cashfree server environment variables are present.
    *   Updated `client/src/components/payment.tsx` to remove hardcoded `'sandbox'` for `import.meta.env.VITE_CASHFREE_ENV` and added a check to log an error/show a toast if it's not set.

8.  **ESLint & Prettier Setup Finalization and Error Resolution (Critical Fix #3 Continued):**
    *   Successfully resolved persistent configuration issues with ESLint (v9) and Prettier. This involved:
        *   Migrating from `.eslintrc.cjs` to the new flat config `eslint.config.js`.
        *   Ensuring `eslint.config.js` correctly imports and configures plugins like `@typescript-eslint/eslint-plugin`, `eslint-plugin-react`, `eslint-plugin-jsx-a11y`, and `eslint-plugin-prettier`.
        *   Removing the deprecated `.eslintignore` file, as ignore patterns are now managed within `eslint.config.js`.
        *   Updating `package.json` scripts (`lint`, `lint:fix`, `format`) to remove outdated `--config` flags and ensure they work with the new setup.
        *   Installing/updating necessary dependencies such as `typescript-eslint` (as a direct dependency) and `globals`.
        *   Renaming `.prettierrc.js` to `.prettierrc.cjs` to resolve module loading issues.
        *   Systematically debugging and fixing errors related to ESLint's new configuration system (e.g., "root key not supported", "module not found", "TypeError: Key 'languageOptions': Key 'globals': Expected an object").
    *   Addressed all ESLint *errors* that were reported after the setup was stabilized. This included fixing:
        *   `react/no-unescaped-entities`: Escaped special characters (like apostrophes) in JSX text content across multiple files (e.g., `contact.tsx`, `hero.tsx`).
        *   `jsx-a11y/anchor-is-valid`: Ensured `<a>` tags had valid `href` attributes or were converted to `<button>` elements if their purpose was not navigational (e.g., social media links in `footer.tsx`).
        *   `jsx-a11y/anchor-has-content`: Ensured all anchor tags had accessible content, for example, by providing default content for `PaginationLink` if no children were passed.
        *   `jsx-a11y/heading-has-content`: Corrected components like `AlertTitle` to ensure heading elements always render content.
        *   `react/no-unknown-property`: Removed invalid HTML attributes from JSX elements (e.g., `cmdk-input-wrapper` in `command.tsx`).
        *   The codebase now passes `npm run lint` with 0 errors, leaving only some warnings (primarily related to unused variables and Prettier formatting suggestions).

9.  **Enhanced Server-Side Logging with Pino (II.3 / II.4 from review):**
    *   Installed `pino` (for core logging), `pino-http` (for Express request logging), and `pino-pretty` (for human-readable development logs).
    *   Created a centralized logger configuration in `server/logger.ts`. This setup provides structured JSON logging in production and prettified, colorized console output in development.
    *   Integrated `pino-http` as middleware in `server/index.ts` to automatically log all incoming requests and their responses, including request IDs and response times.
    *   Updated the centralized error handling middleware in `server/index.ts` to use the configured Pino logger for detailed error reporting, replacing the previous `console.error` calls.
    *   Removed the old custom logging middleware from `server/index.ts`.

10. **Configured CORS for API Security and Accessibility (II.5 from review):**
    *   Installed the `cors` package and its type definitions (`@types/cors`).
    *   Added and configured the `cors` middleware in `server/index.ts`.
    *   The CORS policy is set up to allow requests from specific origins: `http://localhost:5000` and `http://127.0.0.1:5000` are whitelisted for development.
    *   A placeholder is included to add the production frontend URL when the site is deployed.
    *   `credentials: true` is enabled to support scenarios involving cookies or authorization headers if needed in the future.
    *   This ensures that the browser permits cross-origin requests from the frontend to the backend API, preventing common connectivity issues.

11. **Addressed Environment Variable Startup Check:**
    *   The server includes a startup check for essential Cashfree environment variables (`CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`, `CASHFREE_ENV`).
    *   To facilitate development without actual credentials, guidance was provided to use placeholder values in the `.env` file. This allows the server to start and general site functionality to be tested, though actual payment processing would require valid credentials.
