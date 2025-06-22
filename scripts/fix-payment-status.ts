import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { sql } from 'drizzle-orm';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function fixPaymentStatus() {
  try {
    console.log('Fixing payment status values...');
    
    // Update invalid payment status values to 'pending'
    const paymentResult = await db.execute(sql`
      UPDATE orders 
      SET payment_status = 'pending' 
      WHERE payment_status NOT IN ('pending', 'success', 'failed', 'refunded')
    `);
    
    console.log(`Updated ${paymentResult.rowCount} orders with invalid payment status`);
    
    // Update invalid order status values to 'pending'
    const statusResult = await db.execute(sql`
      UPDATE orders 
      SET status = 'pending' 
      WHERE status NOT IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')
    `);
    
    console.log(`Updated ${statusResult.rowCount} orders with invalid order status`);
    
    // Verify the updates
    const paymentStatuses = await db.execute(sql`SELECT DISTINCT payment_status FROM orders`);
    const orderStatuses = await db.execute(sql`SELECT DISTINCT status FROM orders`);
    
    console.log('Current payment statuses:', paymentStatuses.rows.map(row => row.payment_status));
    console.log('Current order statuses:', orderStatuses.rows.map(row => row.status));
    
    console.log('Data fix completed successfully!');
  } catch (error) {
    console.error('Error fixing payment status:', error);
  } finally {
    await pool.end();
  }
}

fixPaymentStatus(); 