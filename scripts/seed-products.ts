import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import { products, productVariants } from '../shared/schema';
import { eq } from 'drizzle-orm';

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function seed() {
  // Check if product already exists
  const existing = await db.select().from(products).where(eq(products.name, 'Pure Ghee'));
  if (existing.length > 0) {
    console.log('Products already seeded.');
    process.exit(0);
  }

  // Insert main product
  const [product] = await db.insert(products).values({
    name: 'Pure Ghee',
    description:
      'Crafted with 50 years of tradition, our Pure Ghee is made from the finest quality milk, churned to perfection to bring you an authentic taste and aroma. Ideal for cooking, medicinal purposes, and religious ceremonies.',
    is_popular: true,
  }).returning();

  // Insert variants
  await db.insert(productVariants).values([
    {
      product_id: product.id,
      size: '250ml',
      price: '170.00',
      image_url: '/images/ghee-250ml.jpg',
      best_value_badge: null,
      sku: 'GSR-GHEE-250',
      stock_quantity: 100,
    },
    {
      product_id: product.id,
      size: '500ml',
      price: '325.00',
      image_url: '/images/ghee-500ml.jpg',
      best_value_badge: 'Best Value',
      sku: 'GSR-GHEE-500',
      stock_quantity: 100,
    },
    {
      product_id: product.id,
      size: '1000ml',
      price: '650.00',
      image_url: '/images/ghee-1000ml.jpg',
      best_value_badge: 'Family Pack',
      sku: 'GSR-GHEE-1000',
      stock_quantity: 50,
    },
  ]);

  console.log('Seeded products and variants!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
}); 