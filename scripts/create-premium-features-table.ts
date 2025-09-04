import { Pool } from 'pg';
import { config } from 'dotenv';

config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createPremiumFeaturesTable() {
  try {
    console.log('🔨 Creating premium_features table...');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS "premium_features" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "feature" varchar(50) NOT NULL,
        "granted_at" timestamp DEFAULT now(),
        "expires_at" timestamp,
        "metadata" jsonb
      );

      CREATE INDEX IF NOT EXISTS "premium_features_user_id_idx" ON "premium_features" ("user_id");
      CREATE INDEX IF NOT EXISTS "premium_features_feature_idx" ON "premium_features" ("feature");  
      CREATE INDEX IF NOT EXISTS "premium_features_expires_at_idx" ON "premium_features" ("expires_at");
      CREATE UNIQUE INDEX IF NOT EXISTS "premium_features_user_feature_unique" ON "premium_features" ("user_id", "feature");
    `;

    await pool.query(createTableSQL);
    
    console.log('✅ premium_features table created successfully!');
    
    // Verify table exists
    const checkTable = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'premium_features' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Table structure:', checkTable.rows);

  } catch (error) {
    console.error('❌ Error creating table:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  createPremiumFeaturesTable()
    .then(() => {
      console.log('🎉 Table creation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Table creation failed:', error);
      process.exit(1);
    });
}

export { createPremiumFeaturesTable };