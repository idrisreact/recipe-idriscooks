import { Pool } from 'pg';
import { config } from 'dotenv';

config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createRecipeIndexes() {
  try {
    console.log('🚀 Creating optimized database indexes for recipes...');

    const indexQueries = [
      // 1. Text search optimization (for title searches) 
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_title_lower 
       ON recipes (LOWER(title));`,

      // 2. Tag search optimization (GIN index for JSONB)
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_tags_gin 
       ON recipes USING GIN (tags);`,

      // 3. Sorting optimization indexes
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_cook_time 
       ON recipes (cook_time);`,

      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_servings 
       ON recipes (servings);`,

      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_id_desc 
       ON recipes (id DESC);`,

      // 4. Composite index for common search + sort patterns
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_title_id_desc 
       ON recipes (LOWER(title), id DESC);`,

      // 5. Full-text search capability (for future enhancements)
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_title_description_fts 
       ON recipes USING GIN (to_tsvector('english', title || ' ' || description));`,
    ];

    for (const [index, query] of indexQueries.entries()) {
      console.log(`📊 Creating index ${index + 1}/${indexQueries.length}...`);
      await pool.query(query);
      console.log(`✅ Index ${index + 1} created successfully`);
    }

    // Update table statistics for better query planning
    console.log('📈 Analyzing table for optimal query planning...');
    await pool.query('ANALYZE recipes;');

    // Show current table statistics
    const stats = await pool.query(`
      SELECT schemaname, tablename, attname, n_distinct, correlation 
      FROM pg_stats 
      WHERE tablename = 'recipes'
      ORDER BY attname;
    `);

    console.log('📋 Table statistics:');
    console.table(stats.rows);

    console.log('🎉 All recipe indexes created successfully!');

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  createRecipeIndexes()
    .then(() => {
      console.log('✨ Database optimization completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Index creation failed:', error);
      process.exit(1);
    });
}

export { createRecipeIndexes };