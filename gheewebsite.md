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
