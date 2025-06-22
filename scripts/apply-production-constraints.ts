import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { dataIntegrityConstraints, performanceIndexes, commonViews } from '../shared/schemas/migrations.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function applyProductionConstraints() {
  console.log('🚀 Applying production constraints and optimizations...');
  
  try {
    // Apply data integrity constraints
    console.log('📋 Applying data integrity constraints...');
    for (const constraint of dataIntegrityConstraints) {
      try {
        await db.execute(constraint);
        console.log('✅ Applied constraint');
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          console.log('⚠️  Constraint already exists, skipping...');
        } else {
          console.error('❌ Failed to apply constraint:', error.message);
        }
      }
    }

    // Apply performance indexes
    console.log('⚡ Applying performance indexes...');
    for (const index of performanceIndexes) {
      try {
        await db.execute(index);
        console.log('✅ Applied index');
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          console.log('⚠️  Index already exists, skipping...');
        } else {
          console.error('❌ Failed to apply index:', error.message);
        }
      }
    }

    // Create common views
    console.log('👁️  Creating common views...');
    for (const view of commonViews) {
      try {
        await db.execute(view);
        console.log('✅ Created view');
      } catch (error: any) {
        console.error('❌ Failed to create view:', error.message);
      }
    }

    console.log('🎉 Production constraints and optimizations applied successfully!');
    
  } catch (error) {
    console.error('💥 Error applying production constraints:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  applyProductionConstraints()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { applyProductionConstraints }; 