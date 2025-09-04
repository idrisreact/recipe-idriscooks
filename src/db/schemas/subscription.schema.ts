import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  decimal,
  jsonb,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './user.schema';

export const subscriptionPlans = pgTable(
  'subscription_plans',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    planType: text('plan_type').notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    billingCycle: text('billing_cycle').notNull(), // monthly, yearly
    trialDays: integer('trial_days').default(0),
    isActive: boolean('is_active').default(true),
    features: jsonb('features').$type<{
      maxRecipeViews?: number;
      maxFavorites?: number;
      maxCollections?: number;
      maxMealPlans?: number;
      canCreateRecipes?: boolean;
      canExportPdf?: boolean;
      canShareRecipes?: boolean;
      hasNutritionInfo?: boolean;
      hasOfflineAccess?: boolean;
      hasCustomThemes?: boolean;
      hasPrioritySupport?: boolean;
      hasAdvancedSearch?: boolean;
    }>(),
    limits: jsonb('limits').$type<{
      monthlyRecipeViews?: number;
      totalFavorites?: number;
      totalCollections?: number;
      activeMealPlans?: number;
      sharedRecipesPerMonth?: number;
      pdfExportsPerMonth?: number;
    }>(),
    stripePriceId: text('stripe_price_id'),
    sortOrder: integer('sort_order').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    nameIdx: index('subscription_plans_name_idx').on(table.name),
    activeIdx: index('subscription_plans_active_idx').on(table.isActive),
    priceIdx: index('subscription_plans_price_idx').on(table.price),
  })
);

export const userSubscriptions = pgTable(
  'user_subscriptions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    planId: text('plan_id')
      .notNull()
      .references(() => subscriptionPlans.id),
    status: text('status').notNull(), // active, canceled, past_due, incomplete, trialing
    currentPeriodStart: timestamp('current_period_start').notNull(),
    currentPeriodEnd: timestamp('current_period_end').notNull(),
    trialStart: timestamp('trial_start'),
    trialEnd: timestamp('trial_end'),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
    canceledAt: timestamp('canceled_at'),
    endedAt: timestamp('ended_at'),
    stripeSubscriptionId: text('stripe_subscription_id'),
    stripeCustomerId: text('stripe_customer_id'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    userIdIdx: index('user_subscriptions_user_id_idx').on(table.userId),
    statusIdx: index('user_subscriptions_status_idx').on(table.status),
    periodIdx: index('user_subscriptions_period_idx').on(table.currentPeriodEnd),
    stripeSubIdx: index('user_subscriptions_stripe_sub_idx').on(table.stripeSubscriptionId),
    userIdUnique: unique('user_subscriptions_user_id_unique').on(table.userId),
  })
);

export const userUsage = pgTable(
  'user_usage',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    month: text('month').notNull(), // YYYY-MM format to match TypeScript interface
    recipeViews: integer('recipe_views').default(0),
    favoritesCount: integer('favorites_count').default(0),
    collectionsCount: integer('collections_count').default(0),
    mealPlansCount: integer('meal_plans_count').default(0),
    recipesCreated: integer('recipes_created').default(0),
    pdfExports: integer('pdf_exports').default(0),
    recipesShared: integer('recipes_shared').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    userMonthIdx: index('user_usage_user_month_idx').on(table.userId, table.month),
    monthIdx: index('user_usage_month_idx').on(table.month),
    userMonthUnique: unique('user_usage_user_month_unique').on(table.userId, table.month),
  })
);

export const billingHistory = pgTable(
  'billing_history',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    subscriptionId: text('subscription_id').references(() => userSubscriptions.id),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').notNull().default('usd'),
    status: text('status').notNull(), // succeeded, failed, pending, refunded
    description: text('description'),
    invoiceUrl: text('invoice_url'),
    stripeInvoiceId: text('stripe_invoice_id'),
    stripePaymentIntentId: text('stripe_payment_intent_id'),
    billingDate: timestamp('billing_date').notNull(),
    paidAt: timestamp('paid_at'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    userIdIdx: index('billing_history_user_id_idx').on(table.userId),
    statusIdx: index('billing_history_status_idx').on(table.status),
    createdAtIdx: index('billing_history_created_at_idx').on(table.createdAt),
  })
);

export const subscriptionHistory = pgTable(
  'subscription_history',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    fromPlanId: text('from_plan_id').references(() => subscriptionPlans.id),
    toPlanId: text('to_plan_id')
      .notNull()
      .references(() => subscriptionPlans.id),
    changeReason: text('change_reason'),
    effectiveDate: timestamp('effective_date').notNull(),
    proration: decimal('proration', { precision: 10, scale: 2 }),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    userIdIdx: index('subscription_history_user_id_idx').on(table.userId),
    effectiveDateIdx: index('subscription_history_effective_date_idx').on(table.effectiveDate),
  })
);

export const featureFlags = pgTable(
  'feature_flags',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    isEnabled: boolean('is_enabled').default(false),
    rolloutPercentage: integer('rollout_percentage').default(0),
    targetPlans: jsonb('target_plans').$type<string[]>(),
    config: jsonb('config').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    nameIdx: index('feature_flags_name_idx').on(table.name),
    enabledIdx: index('feature_flags_enabled_idx').on(table.isEnabled),
    nameUnique: unique('feature_flags_name_unique').on(table.name),
  })
);

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  userSubscriptions: many(userSubscriptions),
  subscriptionHistoryFrom: many(subscriptionHistory, {
    relationName: 'subscriptionHistoryFromPlan',
  }),
  subscriptionHistoryTo: many(subscriptionHistory, { relationName: 'subscriptionHistoryToPlan' }),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one, many }) => ({
  user: one(user, { fields: [userSubscriptions.userId], references: [user.id] }),
  plan: one(subscriptionPlans, {
    fields: [userSubscriptions.planId],
    references: [subscriptionPlans.id],
  }),
  billingHistory: many(billingHistory),
}));

export const userUsageRelations = relations(userUsage, ({ one }) => ({
  user: one(user, { fields: [userUsage.userId], references: [user.id] }),
}));

export const billingHistoryRelations = relations(billingHistory, ({ one }) => ({
  user: one(user, { fields: [billingHistory.userId], references: [user.id] }),
  subscription: one(userSubscriptions, {
    fields: [billingHistory.subscriptionId],
    references: [userSubscriptions.id],
  }),
}));

export const subscriptionHistoryRelations = relations(subscriptionHistory, ({ one }) => ({
  user: one(user, { fields: [subscriptionHistory.userId], references: [user.id] }),
  fromPlan: one(subscriptionPlans, {
    fields: [subscriptionHistory.fromPlanId],
    references: [subscriptionPlans.id],
    relationName: 'subscriptionHistoryFromPlan',
  }),
  toPlan: one(subscriptionPlans, {
    fields: [subscriptionHistory.toPlanId],
    references: [subscriptionPlans.id],
    relationName: 'subscriptionHistoryToPlan',
  }),
}));
