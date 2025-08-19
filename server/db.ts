import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Configure connection pool for better error handling
neonConfig.poolQueryViaFetch = true;
neonConfig.useSecureWebSocket = true;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Database initialization logging removed for compute optimization

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
});

// Enhanced error handling
pool.on('error', (err) => {
  console.error('❌ Database pool error:', err);
  // Don't exit process - let application handle gracefully
});

// Database connection logging removed for compute optimization

// Removed excessive pool logging - only keep errors
// pool.on('acquire', () => {
//   console.log('🔗 Database client acquired from pool');
// });

// pool.on('remove', () => {
//   console.log('🔌 Database client removed from pool');
// });

export const db = drizzle({ client: pool, schema });

// Initialize database connection and verify it works
export async function initializeDatabase() {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    
    // Test that we can access our schema
    const tableCheck = await pool.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    // Table count logging removed for compute optimization
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Graceful shutdown
export async function closeDatabase() {
  try {
    await pool.end();
    // Database close logging removed for compute optimization
  } catch (error) {
    console.error('❌ Error closing database:', error);
  }
}