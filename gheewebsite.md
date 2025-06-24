# GheeRoots Website Documentation

## Table of Contents
- [Project Overview](#project-overview)
- [Major Features Added](#major-features-added)
- [Admin Panel & Secure Order Management](#admin-panel--secure-order-management)
- [Database Schema (Current)](#database-schema-current)
- [Migrations](#migrations)
- [Issues Faced & Resolutions](#issues-faced--resolutions)
- [Getting Started](#getting-started)
- [Roadmap](#roadmap)
- [Post-Code Review 1.0 Fixes](#post-code-review-10-fixes)
- [Production Hosting on Railway](#production-hosting-on-railway)
- [Security Best Practices](#security-best-practices)
- [API Testing with Vitest & Supertest](#api-testing-with-vitest--supertest)
- [Post-Code Review 2024-06 Patches & Improvements](#post-code-review-2024-06-patches--improvements)
- [2024-06: Image Optimization & Payment Flow Updates](#2024-06-image-optimization--payment-flow-updates)
- [2024-06: PostgreSQL Migration & Normalized Schema Implementation](#2024-06-postgresql-migration--normalized-schema-implementation)
- [2024-06: Validation Layer & Error Handling Refactor](#2024-06-validation-layer--error-handling-refactor)
- [2024-06: End-to-End Order Placement & Admin Panel](#2024-06-end-to-end-order-placement--admin-panel)
- [2024-06: Order Status API & CSV Export](#2024-06-order-status-api--csv-export)
- [2024-06: Production-Ready PostgreSQL Improvements](#2024-06-production-ready-postgresql-improvements)
- [2025-06: Migration to JWT-Based Admin Authentication (and Debug Log)](#2025-06-migration-to-jwt-based-admin-authentication-and-debug-log)

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
- **Admin Panel Infinite Fetch Loop Fix**: Fixed a bug in the admin orders page where the orders fetch would run in an infinite loop due to unstable dependencies in the useEffect hook. The dependency array was corrected to only include [isLoggedIn, token, authLoading].

---

## Admin Panel & Secure Order Management

### Admin Panel Features
- **Login Page (`/admin`)**: Secure login with API token (ADMIN_API_TOKEN), stored in localStorage.
- **Order List Page (`/admin/orders`)**: Fetches and displays all orders in a table. Shows order ID, customer info, payment method, total, created date, and item breakdown.
- **Logout**: Clears the token and returns to login.
- **Error Handling**: Handles 401 Unauthorized by auto-logging out, and displays clear error messages for failed requests.
- **Minimal, clean UI**: Responsive and easy to use.
- **File Structure**:
  - `client/src/pages/admin/index.tsx` (login page)
  - `client/src/pages/admin/orders.tsx` (orders list)
  - `client/src/components/admin/OrderCard.tsx` (order display)
  - `client/src/lib/useAdminAuth.ts` (auth hook)
- **Infinite Fetch Loop Fix**: The admin orders page previously suffered from an infinite fetch loop due to unstable dependencies in the useEffect hook. This was resolved by updating the dependency array to only include stable values ([isLoggedIn, token, authLoading]).

### Secure /api/orders Endpoint
- **GET /api/orders**: Returns all orders, protected by an Authorization Bearer token (ADMIN_API_TOKEN).
- **Admin authentication**: Token must be sent in the Authorization header. 401 Unauthorized if missing/invalid.
- **Pagination**: Supports `?limit=50&offset=0` query params.
- **Error Handling**: Returns JSON error messages for unauthorized or server errors.

### Security Improvements
- **Helmet**: HTTP security headers enabled via helmet middleware.
- **CORS**: Only trusted origins allowed.
- **.env**: All secrets and tokens are stored in .env, which is git-ignored.
- **Admin API Token**: Never committed to git, always set via environment variable.
- **Cart Clearing**: Cart is now cleared after both Cashfree and COD orders.

## Security Best Practices
- `.env` and all secret files are git-ignored and never committed.
- Admin API endpoints are protected by a secure token (ADMIN_API_TOKEN).
- Helmet is used for HTTP security headers.
- CORS is restricted to trusted origins.
- All user input is validated with Zod.
- Sensitive endpoints require authentication.
- HTTPS is recommended for production deployments.
- Admin dashboard navigation buttons (View Orders, Inventory Management) are now hidden unless the admin is logged in, preventing unauthenticated users from seeing or attempting to access admin pages.
- CORS is now strictly restricted: in production, only the deployed frontend domain (`https://gsrghee-production.up.railway.app`) is allowed; in development, only `http://localhost:5173` is allowed. Wildcard origins are no longer permitted.

## Roadmap (Updated)
- [x] Admin Panel for order management (login, view, logout, error handling)
- [x] Secure /api/orders endpoint with token authentication
- [x] Cart clearing after all successful orders
- [x] Add helmet and improve CORS
- [ ] CSV export and order status update in admin panel
- [ ] Persistent database integration
- [ ] User authentication for customers
- [ ] Product management for admins

## Environment Variables (Updated)
- `ADMIN_API_TOKEN`: Token for admin panel and secure order management (must be set in .env, never committed)

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
| stock_quantity    | integer  | Inventory count (**CHECK: >= 0, decremented on order**) |

### orders
| Field            | Type     | Description                                 |
|------------------|----------|---------------------------------------------|
| id               | serial   | Primary key                                 |
| customerName     | text     | Customer name                               |
| customerEmail    | text     | Customer email                              |
| customerPhone    | text     | Customer phone (must match Indian phone format: ^(\+91|91)?[6-9]\d{9}$, validated client-side and DB) |
| total            | decimal  | Order total                                 |
| status           | text     | Order status                                |
| paymentId        | text     | Payment ID                                  |
| paymentStatus    | text     | Payment status                              |
| razorpayOrderId  | text     | Razorpay order ID                           |
| createdAt        | timestamp| Order creation time                         |

### order_items
| Field             | Type     | Description                                 |
|-------------------|----------|---------------------------------------------|
| id                | serial   | Primary key                                 |
| order_id          | integer  | Foreign key to orders (CASCADE delete)      |
| product_id        | integer  | Foreign key to products                     |
| product_name      | text     | Product name at time of order               |
| quantity          | integer  | Quantity ordered                            |
| price_per_item    | decimal  | Price per item at time of order             |

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
- **Database Normalization**: Added `order_items` table and removed `items` JSON column from `orders` table for proper relational structure.

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

### 5. **Admin Orders Page Infinite Fetch Loop**
- **Cause**: The useEffect hook in `client/src/pages/admin/orders.tsx` included function references (`logout`, `navigate`) in its dependency array, causing the effect to re-run on every render and resulting in an infinite fetch loop.
- **Resolution**: The dependency array was updated to only include `[isLoggedIn, token, authLoading]`, which are stable values. This prevents unnecessary re-renders and fetches, resolving the infinite loop.

### 6. **Cash on Delivery (COD) 500 Error**
- **Cause**: Phone numbers not matching strict Indian format required by DB constraint.
- **Resolution**: Client-side validation now ensures phone numbers start with 6-9 and are 10 digits (optionally +91/91). Backend CORS also fixed to handle trailing semicolons in Origin header.

---

## Getting Started
## How to Preview Locally
- Start the backend: `npm run dev:server`
- Start the frontend: `npm run dev:client`
- Visit: [http://localhost:5000/](http://localhost:5000/)

---

## API Testing with Vitest & Supertest

The project utilizes Vitest as its test runner and Supertest for making HTTP assertions against the API endpoints. This setup is crucial for ensuring the reliability and correctness of the backend services, helping to catch regressions and validate functionality as the codebase evolves.

### Test File Location and Naming

Test files are typically located alongside the code they are testing, or in a dedicated `__tests__` subdirectory. For API tests, they are generally found within the `server/` directory (e.g., `server/routes/your-route.test.ts` or `server/tests/your-route.spec.ts`). Test files follow the naming convention `*.test.ts` or `*.spec.ts` as defined in `vitest.config.ts`.

### Running Tests

To execute the test suite, use the following npm scripts:

- `npm test`: Runs all tests once and exits. Ideal for CI environments or a one-off check.
- `npm run test:watch`: Runs tests in watch mode, automatically re-running them when files change. Useful during development.

Configuration for Vitest can be found in `vitest.config.ts`.

---

## Roadmap
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

---

## Production Hosting on Railway

### Summary
As of May 29, 2025, the GheeRoots website has been successfully deployed to Railway. The application is served via Caddy (static frontend) with API requests proxied to the Node.js backend on port 5000.

### Issues Faced
- Static assets and front-end routes returning 404 due to Caddy configuration
- `npm: command not found` errors in build, caused by overriding default provider packages in `nixpacks.toml`
- `start.sh` script not executing (missing execute permission and misplacement under phases)
- Railway's default start command only launching Caddy, not the backend
- Incorrect use of `aptPkgs` and custom `nixPkgs` overrides led to build failures

### Attempts and Iterations
1. Added `start.sh` to launch backend and Caddy in parallel, with logging and `sleep` for initialization
2. Modified `Caddyfile` to proxy `/api` to `http://localhost:5000` and serve `dist/public` for SPA routing
3. Configured executable permissions on `start.sh` via `chmod +x start.sh`
4. Initially added `aptPkgs` and `nixPkgs` to install Node.js and npm, then rolled back after discovering unsupported overrides
5. Updated `nixpacks.toml`:
   - Installed dependencies with `npm ci` only
   - Bundled static files with Vite's `npm run build`
   - Ensured `start.sh` is executed by moving the start command to the top-level `[start]` section
6. Removed global `npm` upgrade and custom package manager steps to rely on Nixpacks' Node provider defaults
7. Monitored Railway build logs; confirmed successful `npm ci`, build, and `chmod +x start.sh`
8. Pushed commits to GitHub; Railway automatically triggered and completed the deployment

### Outcome
- The website is now live on Railway with both frontend and backend functioning correctly
- Static and dynamic routes resolved without 404 errors
- API endpoints are accessible under `/api` and respond as expected
- The deployment pipeline is stable and repeatable via `nixpacks.toml` configurations

---

## Post-Deployment Changelog (2025-05-30)

- **Caddy Proxy IPv6 Issue**: API requests were failing with `connection refused` because Caddy resolved `localhost` to IPv6 `::1`. We fixed this by updating the `Caddyfile` to proxy `/api` to `127.0.0.1:5000`.

- **Invalid Arg Type on `import.meta.dirname`**: The production build errored with `ERR_INVALID_ARG_TYPE` when resolving `import.meta.dirname`. We refactored both `server/vite.ts` and `vite.config.ts` to use `fileURLToPath(import.meta.url)` and define `__dirname`.

- **Startup Crash on Missing Cashfree Env Vars**: The backend threw a fatal error if Cashfree credentials were not set. We removed the hard crash and now conditionally register Cashfree payment endpoints only when `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`, and `CASHFREE_ENV` are present, logging a warning otherwise.

- **304 Not Modified Caching**: Frontend API calls were returning 304 and no data refresh. We bypassed browser caching by adding `cache: 'no-store'` to the `fetch` options in our React Query setup.

- **Port 5000 in Use (`EADDRINUSE`)**: Local restarts sometimes failed because the port was still bound. We documented using `netstat -ano | findstr :5000` and `taskkill /PID <PID> /F` or `npx kill-port 5000` to free the port.

- **Prefix Stripping Causing 502s**: Caddy's `strip_prefix /api` was rewriting requests so Express routes no longer matched. We removed the `strip_prefix` directive so `/api/*` is forwarded untouched.

- **CSS Minification Warnings**: Build logs showed minor CSS syntax warnings from the `cmdk` utility classes. These are non-blocking and have been noted for a future CSS cleanup pass.

- **Deployment/Development Workflow Clarified**: Documented the steps for rapid local development (`npm run dev:server` + `npm run dev:client`), local production testing (`npm run build` + `npm start` / `start.sh`), and Railway's auto-deploy on git push.

---

## Post-Deployment Changelog (2025-06-01)

- **Railway Port Conflict (`EADDRINUSE`)**: Resolved an "address already in use" error on Railway. The Node.js backend was incorrectly using `process.env.PORT` (e.g., 8080), which conflicted with Caddy. Modified `server/index.ts` to ensure the backend consistently listens on an internal port `5000`, allowing Caddy to manage the public-facing port `$PORT` and proxy requests correctly. This stabilized the Railway deployment.

- **Missing WhatsApp Icon (502 Error)**: Fixed a 502 Bad Gateway error for `/images/whatsapp-icon.svg`. The icon file was missing from `client/public/images/`. Added the `whatsapp-icon.svg` to the correct directory, ensuring it gets included in the build and served properly by Caddy.

---

## Post-Code Review 2024-06 Patches & Improvements

### Major Features & Fixes

1. **Cashfree Payment Flow Refactor**
   - The cart and payment flow was refactored to store order data in sessionStorage until payment is confirmed.
   - `/payment-success` page now verifies payment and creates the order only after successful payment.
   - No premature order creation before payment.

2. **Cashfree Webhook Integration**
   - Added `/api/cashfree-webhook` endpoint with secure HMAC signature validation.
   - Webhook updates order status (`paid`, `failed`) asynchronously based on Cashfree events.
   - Storage interface extended with `getOrderByPaymentId` and `updateOrderStatus` methods.

3. **Centralized Error Handling**
   - Added robust error middleware in `server/index.ts` for all API errors.
   - Handles Zod validation errors, Axios errors, and logs with Pino.

4. **Validation Middleware**
   - Introduced `validateRequest` middleware using Zod for all POST endpoints.
   - Ensures all incoming data is validated and errors are handled consistently.

5. **CORS & Security**
   - Configured CORS to allow only whitelisted origins for API access.
   - Environment variables loaded via `dotenv` for secure credential management.

6. **Logging**
   - Integrated `pino` and `pino-http` for structured request and error logging.

7. **Test Coverage**
   - Added/updated tests for order and contact validation (missing/invalid fields).
   - Ensured all validation and error handling is covered by automated tests.

8. **Frontend Cart & Payment Compatibility**
   - Updated cart and payment components to use the new `CartItem` structure (no nested `product` object).
   - Fixed all related linter/type errors.

9. **Fixed: Infinite fetch loop in admin orders page by correcting useEffect dependencies.**

### Database Schema (as of this patch)
- See the [Database Schema (Current)](#database-schema-current) section above for the latest schema, including new fields for payment tracking and webhook support.

### How to Test
- See the "What to Test" checklist in the chat for a full manual QA guide.
- Run `npm test` or `npx vitest` to verify all backend API tests pass.

## 2024-06: Image Optimization & Payment Flow Updates

### Image Handling & Optimization
- All product, hero, and heritage images are now served as `.webp` for modern browsers, with automatic fallback to `.jpg` (or `.png` for the logo).
- The custom `<Image />` React component uses a `<picture>` element to provide both formats.
- All image references in the codebase have been updated to use `.webp` as the primary source.
- Logo uses a `<picture>` element for `/images/logo.webp` with fallback to `/images/logo.png`.
- All images use `loading="lazy"` for performance.
- **Recommended image size:** 50–200 KB per product image (WebP), max 300 KB for banners/hero.
- Both `.webp` and `.jpg` versions must be present in `client/public/images/`.

### Payment & Checkout Flow
- Checkout and payment flow refactored: Cart → Checkout (customer info) → Payment (Cashfree or COD) → Success page (for Cashfree only).
- For **Cashfree**: After payment, user is redirected to `/payment-success` and cart is cleared after confirmation.
- For **Cash on Delivery (COD)**: Order is placed, cart is cleared, but user is **not yet redirected** to a success page (remains on cart with a toast). This is a known limitation and will be addressed in a future update.
- Improved error handling and user feedback throughout checkout and payment.

### Documentation & Code Comments
- All major exported functions, interfaces, and types now have JSDoc-style comments or inline explanations.

### Database Schema Update
- `image_url` fields now point to `.webp` files, with `.jpg` fallback handled in the frontend.

### Conflict Resolution
- All references to image URLs in documentation and code now use `.webp` as the primary format.
- Any old `.jpg`-only references have been updated or clarified to mention fallback behavior.

## 2024-06: PostgreSQL Migration & Normalized Schema Implementation

### Database Schema Normalization
- **order_items table**: Added normalized `order_items` table with foreign key relationships to `orders` and `products`
- **Removed items column**: The `items` JSON string column was removed from the `orders` table
- **Normalized structure**: Orders now use a proper relational structure with separate `order_items` table

### PostgreSQL Storage Implementation
- **PgStorage class**: Implemented PostgreSQL-backed storage using Drizzle ORM
- **Normalized operations**: All order operations now use the normalized schema
- **Backward compatibility**: MemStorage updated to work with normalized structure for testing

### Production Database Integration
- **Railway PostgreSQL**: Successfully connected to production PostgreSQL database on Railway
- **Schema migration**: Applied normalized schema using `npx drizzle-kit push`
- **Production storage**: Switched from MemStorage to PgStorage for production use
- **Database URL**: Configured with secure Railway PostgreSQL connection string

### API Updates
- **POST /api/orders**: Now accepts items as array, inserts into orders and order_items tables
- **GET /api/orders**: Returns orders with normalized items array for admin panel compatibility
- **Validation**: Updated Zod schema to handle items array separately from order data

### Test Results
- **Core functionality**: ✅ Order creation and retrieval with normalized items works correctly
- **Admin panel compatibility**: ✅ Orders display with items array as expected
- **Database migration**: ✅ Production PostgreSQL integration complete
- **Validation tests**: Some validation edge cases need refinement (non-blocking)

### Production Status
- **Database**: ✅ PostgreSQL on Railway with normalized schema
- **Storage**: ✅ PgStorage active for all order operations
- **API**: ✅ POST and GET /api/orders working with normalized structure
- **Admin Panel**: ✅ Compatible with new normalized order format

### Next Steps
- Refine validation test expectations if needed
- Proceed with Order Status Updates or CSV export features
- Monitor production performance with PostgreSQL

---

### 2024-06: Production-Ready PostgreSQL Improvements

#### Schema Hardening
- **Indexes:** Added indexes on all commonly queried fields (order status, created_at, product_id, etc.) for fast admin and user queries.
- **Foreign Keys:** All relationships (order_items → orders, product_variants → products) use foreign keys with `CASCADE` or `SET NULL` for referential integrity.
- **Check Constraints:**
  - Orders: `total > 0`, valid status and payment status, valid email format.
  - Order Items: `quantity > 0`, `price_per_item > 0`.
  - Product Variants: `price > 0`, `stock_quantity >= 0`, valid size.
  - Contacts: valid email format.
- **Default Values:**
  - Orders: `status` and `paymentStatus` default to 'pending'.
  - Product Variants: `stock_quantity` defaults to 0.
- **Unique Constraints:**
  - Products: unique name.
  - Product Variants: unique SKU.
  - Orders: unique payment ID.

#### Data Validation
- All user input is validated at both the API and database level.
- Legacy data was migrated and cleaned to comply with new constraints (see `scripts/fix-payment-status.ts`).

#### Backups & Disaster Recovery
- **Railway Backups:** Enable daily automated backups in the Railway PostgreSQL dashboard.
- **Manual Backups:** Use `pg_dump` for periodic manual backups and before major migrations.
- **Restore Plan:** Test restoring from backup to a staging environment before production changes.

#### Migration Process
- Schema changes are managed in `shared/schemas/` and pushed with `npm run db:push`.
- Data fixes are scripted in `scripts/` and run with `npx tsx`.

#### Performance
- All admin and user queries are optimized with multi-column and single-column indexes.
- Foreign key constraints ensure fast joins and safe deletes.

#### Security
- All sensitive fields are validated and sanitized.
- Only trusted origins can access the API (CORS).
- Admin endpoints require a secure token.
- **CORS Restriction:** CORS policy now only allows requests from the production frontend domain in production, and from localhost:5173 in development. This further secures the API from unauthorized cross-origin requests.

#### Inventory Enforcement
- Orders now check and decrement stock atomically in a transaction. If any item is out of stock, the order is rejected with a 400 error. The `product_variants` table enforces `stock_quantity >= 0` via a CHECK constraint.

## Final Bug Fixes & Stability Improvements (June 2024)

After deploying the production-ready schema, a few persistent bugs were identified and resolved to ensure full stability.

### 1. Order Status Update Failures
- **Problem**: The admin panel failed to update an order's status to `confirmed`, throwing a validation error, even though other statuses worked.
- **Root Cause**: A mismatch between the frontend, backend validation schema, and stale server processes. The frontend correctly sent `'confirmed'`, but an outdated server process was still running with a validation rule expecting `'processing'`.
- **Solution**:
  - The Zod validation schema in `server/routes/orders.ts` was corrected to explicitly expect `'confirmed'`.
  - A command was used to forcefully stop the lingering server process on port 5000.
  - The server was restarted, ensuring the corrected code was active.
  - Error handling in the admin panel was improved to provide more detailed feedback from the backend.

### 2. Duplicated Product Names in Orders
- **Problem**: Order items in the admin panel were showing duplicated sizes in the product name (e.g., "Pure Ghee 500ml 500ml").
- **Root Cause**: The frontend was adding a size to a product name that already contained it, and the backend logic was not robust enough to prevent this.
- **Solution**:
  - The backend `createOrder` function in `server/storage.ts` was updated with defensive logic. It now programmatically removes any existing size from the incoming item name before joining it with the definitive size fetched from the `product_variants` table. This ensures the product name is always correctly formatted.

---

## Getting Started
## How to Preview Locally
- Start the backend: `npm run dev:server`
- Start the frontend: `npm run dev:client`
- Visit: [http://localhost:5000/](http://localhost:5000/)

# Admin Authentication (Updated)

## JWT-based Auth
- Admin login issues an access token (JWT, 15m) and a refresh token (JWT, 7d, HttpOnly cookie at /auth/refresh-token).
- All admin routes now require a valid Bearer access token in the Authorization header.
- Refresh token endpoint is protected with CSRF (csurf) and issues new access tokens.
- ADMIN_API_TOKEN is removed.

## Token Structure
- Access token: `{ userId }`, signed with ACCESS_TOKEN_SECRET, expires in 15 minutes.
- Refresh token: `{ userId }`, signed with REFRESH_TOKEN_SECRET, expires in 7 days, stored as HttpOnly cookie.

## Login Flow
- POST /auth/login with email and password.
- On success: returns `{ accessToken }` and sets refresh token cookie.

## Refresh Flow
- POST /auth/refresh-token (with CSRF token in header and refresh cookie).
- Returns new access token if refresh token is valid.

## Database
- User table must exist with at least: id, email, passwordHash.

## Migration
- Remove any code or documentation referencing ADMIN_API_TOKEN.

## User Table Schema

| Column       | Type    | Constraints         |
|--------------|---------|--------------------|
| id           | SERIAL  | PRIMARY KEY        |
| email        | TEXT    | UNIQUE, NOT NULL   |
| passwordHash | TEXT    | NOT NULL           |

## 2025-06: Migration to JWT-Based Admin Authentication (and Debug Log)

### Major Changes
- Replaced static ADMIN_API_TOKEN authentication with JWT-based email/password login for admin panel.
- Backend `/auth/login` issues access and refresh tokens; refresh token is set as HttpOnly cookie.
- All admin routes now require a Bearer JWT access token in the Authorization header.
- Frontend admin login page updated to use email/password and POST to `/api/auth/login`.
- Admin orders page and all admin API calls now use the JWT access token.
- Vite dev server proxy configured to forward `/api` and `/api/auth` requests to backend.
- `useAdminAuth` hook updated to use `admin_access_token` for token storage.
- `/auth` route mounted at `/api/auth` in backend for proxy compatibility.
- Added migration SQL for `users` table and seed script for admin user.

### Key Errors and Fixes
- **users table does not exist**: Fixed by running migration SQL via psql to create the table in Railway Postgres.
- **psql not found**: Fixed by installing PostgreSQL and adding its `bin` directory to PATH.
- **Vite proxy not working for /auth**: Fixed by using `/api/auth` for all auth endpoints and updating both frontend and backend accordingly.
- **Unexpected end of JSON input**: Fixed by ensuring backend `/auth/login` always returns a JSON response, even for errors.
- **404 on /auth/login**: Fixed by mounting `/api/auth` directly on the main Express app and updating all fetch calls to use `/api/auth/login`.
- **Admin orders page stuck on loading**: Fixed by ensuring the JWT token key was consistent (`admin_access_token`) across login, storage, and API calls.

### Lessons Learned
- Always use consistent token keys between login, storage, and API calls.
- Vite proxy works best with `/api`-prefixed routes for local development.
- Always restart both backend and frontend after config or route changes.
- Use relative URLs in fetch calls to leverage the dev proxy.
- Always check the Network tab and backend logs for debugging API issues.

---

## Architecture Overview

- **Frontend**: Next.js (React) deployed on Vercel, fetches data directly from Supabase Postgres using `@supabase/supabase-js`.
- **Backend**: All business logic and secure endpoints are implemented as Supabase Edge Functions (Deno runtime).
- **Database**: Supabase Postgres, with all tables using UUIDs for primary and foreign keys.

---

## Database Schema (Current, All UUIDs)

### products
| Field       | Type     | Description                                 |
|-------------|----------|---------------------------------------------|
| id          | uuid     | Primary key (default uuid_generate_v4())    |
| name        | text     | Product name                                |
| description | text     | Product description                         |
| is_popular  | boolean  | Whether the product is popular              |
| created_at  | timestamptz | Created timestamp                        |
| updated_at  | timestamptz | Updated timestamp                        |

### product_variants
| Field             | Type     | Description                                 |
|-------------------|----------|---------------------------------------------|
| id                | uuid     | Primary key                                 |
| product_id        | uuid     | Foreign key to products                     |
| size              | text     | Variant size (e.g., 250ml, 500ml, 1000ml)   |
| price             | decimal  | Price for this variant                      |
| image_url         | text     | Local image path (e.g., /images/ghee-250ml.jpg) |
| best_value_badge  | text     | Optional badge (e.g., Best Value)           |
| sku               | text     | Optional SKU                                |
| stock_quantity    | integer  | Inventory count                             |

### orders
| Field            | Type     | Description                                 |
|------------------|----------|---------------------------------------------|
| id               | uuid     | Primary key                                 |
| customer_name    | text     | Customer name                               |
| customer_email   | text     | Customer email                              |
| customer_phone   | text     | Customer phone                              |
| total            | decimal  | Order total                                 |
| status           | text     | Order status                                |
| payment_id       | text     | Payment ID                                  |
| payment_status   | text     | Payment status                              |
| created_at       | timestamptz | Order creation time                       |

### order_items
| Field             | Type     | Description                                 |
|-------------------|----------|---------------------------------------------|
| id                | uuid     | Primary key                                 |
| order_id          | uuid     | Foreign key to orders (CASCADE delete)      |
| product_id        | uuid     | Foreign key to products                     |
| product_name      | text     | Product name at time of order               |
| quantity          | integer  | Quantity ordered                            |
| price_per_item    | decimal  | Price per item at time of order             |

### contacts
| Field        | Type     | Description                                 |
|--------------|----------|---------------------------------------------|
| id           | uuid     | Primary key                                 |
| first_name   | text     | First name                                  |
| last_name    | text     | Last name                                   |
| email        | text     | Email address                               |
| phone        | text     | Phone number                                |
| message      | text     | Message content                             |
| created_at   | timestamptz | Contact creation time                      |

---

## Environment Variables

### Frontend (Vercel)
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (e.g., https://xyzcompany.supabase.co)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase public anon key

### Backend (Supabase Edge Functions)
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon key (use service_role only in secure server-side code, never in frontend)

---

## Deployment Instructions

### Frontend (Vercel)
1. Push your Next.js app to GitHub.
2. Import the repo in Vercel.
3. Set environment variables in Vercel dashboard as above.
4. Deploy.

### Backend (Supabase Edge Functions)
1. Write Edge Functions in the `supabase/functions/` directory.
2. Deploy using the Supabase CLI: `supabase functions deploy <function-name>`
3. Set environment variables in Supabase project settings.

---

## Migration Notes
- All legacy Express.js/Node.js code has been removed.
- All API calls now use the Supabase client directly from the frontend or via Edge Functions.
- Database schema and migrations are tracked in `/migrations` and documented here.

---

## End-to-End Testing Plan
- Visit homepage: Confirm product listing loads from Supabase.
- Place an order: Add items to cart, checkout, and verify order is created in Supabase DB.
- Admin: Login, view orders, update status, and verify changes in Supabase.
- Environment: Test all flows both locally and in deployed environments (Vercel, Supabase).

---
