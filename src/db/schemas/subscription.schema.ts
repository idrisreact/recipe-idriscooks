import { pgTable, text, timestamp, boolean, integer, numeric, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./user.schema";

// Enums for subscription system
export const planTypeEnum = pgEnum('plan_type', ['free', 'premium', 'pro', 'enterprise']);
export const billingCycleEnum = pgEnum('billing_cycle', ['monthly', 'yearly']);
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired'
]);
export const paymentStatusEnum = pgEnum('payment_status', [
  'pending', 'succeeded', 'failed', 'canceled', 'requires_action'
]);

// Subscription Plans - Enhanced version replacing the basic price_plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  planType: planTypeEnum('plan_type').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(), // Store as decimal for accuracy
  billingCycle: billingCycleEnum('billing_cycle').notNull(),
  trialDays: integer('trial_days').default(0),
  isActive: boolean('is_active').notNull().default(true),
  features: jsonb('features').$type<{
    maxRecipes: number | null; // null means unlimited
    maxFavorites: number | null;
    canCreateRecipes: boolean;
    canExportPdf: boolean;
    canAccessPremiumRecipes: boolean;
    hasAdvancedSearch: boolean;
    hasMealPlanning: boolean;
    hasNutritionalInfo: boolean;
    hasRecipeSharing: boolean;
    hasRecipeCollections: boolean;
    maxRecipeCollections: number | null;
    hasShoppingLists: boolean;
    hasOfflineAccess: boolean;
    prioritySupport: boolean;
    customization: {
      themes: boolean;
      layout: boolean;
    };
  }>().notNull(),
  limits: jsonb('limits').$type<{
    dailyApiCalls: number | null;
    monthlyExports: number | null;
    storageQuotaMB: number | null;
  }>(),
  stripePriceId: text('stripe_price_id'), // For Stripe integration
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// User Subscriptions - Track user's current subscription
export const userSubscriptions = pgTable("user_subscriptions", {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  planId: text('plan_id').notNull().references(() => subscriptionPlans.id),
  status: subscriptionStatusEnum('status').notNull(),
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  trialStart: timestamp('trial_start'),
  trialEnd: timestamp('trial_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  canceledAt: timestamp('canceled_at'),
  endedAt: timestamp('ended_at'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripeCustomerId: text('stripe_customer_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Usage Tracking - Track user's feature usage against plan limits
export const userUsage = pgTable("user_usage", {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  month: integer('month').notNull(), // YYYYMM format
  year: integer('year').notNull(),
  apiCalls: integer('api_calls').default(0),
  pdfExports: integer('pdf_exports').default(0),
  recipesCreated: integer('recipes_created').default(0),
  storageUsedMB: numeric('storage_used_mb', { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Billing History - Track all payment transactions
export const billingHistory = pgTable("billing_history", {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  subscriptionId: text('subscription_id').references(() => userSubscriptions.id),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('usd'),
  status: paymentStatusEnum('status').notNull(),
  description: text('description'),
  invoiceUrl: text('invoice_url'),
  stripeInvoiceId: text('stripe_invoice_id'),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  billingDate: timestamp('billing_date').notNull(),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Plan Change History - Track subscription changes for analytics
export const subscriptionHistory = pgTable("subscription_history", {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  fromPlanId: text('from_plan_id').references(() => subscriptionPlans.id),
  toPlanId: text('to_plan_id').notNull().references(() => subscriptionPlans.id),
  changeReason: text('change_reason'), // 'upgrade', 'downgrade', 'trial_ended', 'admin_change'
  effectiveDate: timestamp('effective_date').notNull(),
  proration: numeric('proration', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Feature Flags - For A/B testing and gradual rollouts
export const featureFlags = pgTable("feature_flags", {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  isEnabled: boolean('is_enabled').notNull().default(false),
  rolloutPercentage: integer('rollout_percentage').default(0), // 0-100
  targetPlans: jsonb('target_plans').$type<string[]>(), // Plan IDs that get this feature
  config: jsonb('config').$type<Record<string, any>>(), // Feature-specific configuration
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});