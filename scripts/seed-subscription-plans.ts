import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { subscriptionPlans } from '../src/db/schemas/subscription.schema';
import { config } from 'dotenv';

config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

const subscriptionPlansData = [
  {
    id: 'free-plan',
    name: 'Free',
    description: 'Perfect for casual home cooks exploring new recipes',
    planType: 'free' as const,
    price: '0.00',
    billingCycle: 'monthly' as const,
    trialDays: 0,
    isActive: true,
    features: {
      maxRecipeViews: 10,
      maxFavorites: 25,
      maxCollections: 0,
      maxMealPlans: 0,
      canCreateRecipes: false,
      canExportPdf: false,
      canShareRecipes: false,
      hasNutritionInfo: false,
      hasOfflineAccess: false,
      hasCustomThemes: false,
      hasPrioritySupport: false,
      hasAdvancedSearch: false,
    },
    limits: {
      monthlyRecipeViews: 10,
      totalFavorites: 25,
      totalCollections: 0,
      activeMealPlans: 0,
      sharedRecipesPerMonth: 0,
      pdfExportsPerMonth: 0,
    },
    sortOrder: 1,
  },
  {
    id: 'premium-monthly',
    name: 'Premium',
    description: 'For passionate cooks who want unlimited access and meal planning',
    planType: 'premium' as const,
    price: '9.99',
    billingCycle: 'monthly' as const,
    trialDays: 14,
    isActive: true,
    features: {
      canCreateRecipes: true,
      canExportPdf: true,
      canShareRecipes: false,
      hasNutritionInfo: true,
      hasOfflineAccess: false,
      hasCustomThemes: true,
      hasPrioritySupport: false,
      hasAdvancedSearch: true,
    },
    limits: {
      totalCollections: 10,
      activeMealPlans: 5,
      sharedRecipesPerMonth: 0,
      pdfExportsPerMonth: 50,
    },
    sortOrder: 2,
  },
  {
    id: 'premium-yearly',
    name: 'Premium (Yearly)',
    description: 'Premium features with 2 months free when paid annually',
    planType: 'premium' as const,
    price: '99.99',
    billingCycle: 'yearly' as const,
    trialDays: 14,
    isActive: true,
    features: {
      canCreateRecipes: true,
      canExportPdf: true,
      canShareRecipes: false,
      hasNutritionInfo: true,
      hasOfflineAccess: false,
      hasCustomThemes: true,
      hasPrioritySupport: false,
      hasAdvancedSearch: true,
    },
    limits: {
      totalCollections: 10,
      activeMealPlans: 5,
      sharedRecipesPerMonth: 0,
      pdfExportsPerMonth: 50,
    },
    sortOrder: 3,
  },
  {
    id: 'pro-monthly',
    name: 'Pro',
    description: 'For culinary professionals and serious home chefs with advanced features',
    planType: 'pro' as const,
    price: '19.99',
    billingCycle: 'monthly' as const,
    trialDays: 14,
    isActive: true,
    features: {
      canCreateRecipes: true,
      canExportPdf: true,
      canShareRecipes: true,
      hasNutritionInfo: true,
      hasOfflineAccess: true,
      hasCustomThemes: true,
      hasPrioritySupport: true,
      hasAdvancedSearch: true,
    },
    limits: {
      sharedRecipesPerMonth: 100,
    },
    sortOrder: 4,
  },
  {
    id: 'pro-yearly',
    name: 'Pro (Yearly)',
    description: 'Pro features with 2 months free when paid annually',
    planType: 'pro' as const,
    price: '199.99',
    billingCycle: 'yearly' as const,
    trialDays: 14,
    isActive: true,
    features: {
      canCreateRecipes: true,
      canExportPdf: true,
      canShareRecipes: true,
      hasNutritionInfo: true,
      hasOfflineAccess: true,
      hasCustomThemes: true,
      hasPrioritySupport: true,
      hasAdvancedSearch: true,
    },
    limits: {
      sharedRecipesPerMonth: 100,
    },
    sortOrder: 5,
  },
];

async function seedSubscriptionPlans() {
  try {
    console.log('🌱 Starting subscription plans seeding...');
    
    // Check existing table structure first
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'subscription_plans'
      ORDER BY ordinal_position;
    `);
    console.log('📋 Table structure:', result.rows);
    
    // Insert subscription plans based on actual table structure
    for (const plan of subscriptionPlansData) {
      const planData = {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        plan_type: plan.planType,
        price: plan.price,
        billing_cycle: plan.billingCycle,
        trial_days: plan.trialDays,
        is_active: plan.isActive,
        features: plan.features,
        limits: plan.limits,
        sort_order: plan.sortOrder
      };
      
      await pool.query(`
        INSERT INTO subscription_plans (id, name, description, plan_type, price, billing_cycle, trial_days, is_active, features, limits, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO NOTHING
      `, [
        planData.id,
        planData.name,
        planData.description,
        planData.plan_type,
        planData.price,
        planData.billing_cycle,
        planData.trial_days,
        planData.is_active,
        JSON.stringify(planData.features),
        JSON.stringify(planData.limits),
        planData.sort_order
      ]);
    }
    
    console.log('✅ Subscription plans seeded successfully!');
    console.log(`📊 Inserted ${subscriptionPlansData.length} subscription plans`);
    
  } catch (error) {
    console.error('❌ Error seeding subscription plans:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedSubscriptionPlans()
    .then(() => {
      console.log('🎉 Subscription plans seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Subscription plans seeding failed:', error);
      process.exit(1);
    });
}

export { seedSubscriptionPlans };