import { sql } from 'drizzle-orm';

// Database-level constraints for data integrity
export const dataIntegrityConstraints = [
  // Ensure order total is non-negative
  sql`ALTER TABLE orders ADD CONSTRAINT orders_total_positive CHECK (total >= 0)`,
  
  // Ensure order item quantity is positive
  sql`ALTER TABLE order_items ADD CONSTRAINT order_items_quantity_positive CHECK (quantity > 0)`,
  
  // Ensure order item price is non-negative
  sql`ALTER TABLE order_items ADD CONSTRAINT order_items_price_positive CHECK (price_per_item >= 0)`,
  
  // Ensure product variant price is non-negative
  sql`ALTER TABLE product_variants ADD CONSTRAINT product_variants_price_positive CHECK (price >= 0)`,
  
  // Ensure stock quantity is non-negative
  sql`ALTER TABLE product_variants ADD CONSTRAINT product_variants_stock_positive CHECK (stock_quantity >= 0)`,
  
  // Ensure valid order status values
  sql`ALTER TABLE orders ADD CONSTRAINT orders_status_valid CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'failed'))`,
  
  // Ensure valid payment status values
  sql`ALTER TABLE orders ADD CONSTRAINT orders_payment_status_valid CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'))`,
  
  // Ensure customer email format (basic validation)
  sql`ALTER TABLE orders ADD CONSTRAINT orders_email_format CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')`,
  
  // Ensure customer phone format (basic validation for Indian numbers)
  sql`ALTER TABLE orders ADD CONSTRAINT orders_phone_format CHECK (customer_phone ~* '^(\+91|91)?[6-9]\d{9}$')`,
];

// Additional indexes for performance optimization
export const performanceIndexes = [
  // Partial index for active orders (not cancelled/failed)
  sql`CREATE INDEX orders_active_idx ON orders (created_at DESC) WHERE status NOT IN ('cancelled', 'failed')`,
  
  // Partial index for pending payments
  sql`CREATE INDEX orders_pending_payment_idx ON orders (created_at DESC) WHERE payment_status = 'pending'`,
  
  // Index for date range queries
  sql`CREATE INDEX orders_date_range_idx ON orders (created_at DESC, status)`,
  
  // Index for customer lookup
  sql`CREATE INDEX orders_customer_lookup_idx ON orders (customer_email, customer_phone)`,
];

// Views for common queries
export const commonViews = [
  // View for order summary with item count
  sql`
    CREATE OR REPLACE VIEW order_summary AS
    SELECT 
      o.id,
      o.customer_name,
      o.customer_email,
      o.total,
      o.status,
      o.payment_status,
      o.created_at,
      COUNT(oi.id) as item_count,
      SUM(oi.quantity) as total_quantity
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    GROUP BY o.id, o.customer_name, o.customer_email, o.total, o.status, o.payment_status, o.created_at
  `,
  
  // View for popular products
  sql`
    CREATE OR REPLACE VIEW popular_products AS
    SELECT 
      p.id,
      p.name,
      p.description,
      COUNT(oi.id) as order_count,
      SUM(oi.quantity) as total_quantity_sold
    FROM products p
    LEFT JOIN product_variants pv ON p.id = pv.product_id
    LEFT JOIN order_items oi ON pv.id = oi.product_id
    GROUP BY p.id, p.name, p.description
    ORDER BY total_quantity_sold DESC
  `,
];

// Migration: Fix foreign key for order_items.product_id to reference product_variants.id
sql`ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_products_id_fk`;
sql`ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_product_variants_id_fk FOREIGN KEY (product_id) REFERENCES product_variants(id) ON DELETE CASCADE`;

// Update the popular_products view to join via product_variants
sql`
  CREATE OR REPLACE VIEW popular_products AS
  SELECT 
    p.id,
    p.name,
    p.description,
    COUNT(oi.id) as order_count,
    SUM(oi.quantity) as total_quantity_sold
  FROM products p
  LEFT JOIN product_variants pv ON p.id = pv.product_id
  LEFT JOIN order_items oi ON pv.id = oi.product_id
  GROUP BY p.id, p.name, p.description
  ORDER BY total_quantity_sold DESC
`; 