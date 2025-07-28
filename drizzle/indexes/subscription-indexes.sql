-- Subscription System Database Optimization Indexes
-- These indexes improve query performance for subscription-related operations

-- User Subscriptions Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_user_id 
ON user_subscriptions (user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_status 
ON user_subscriptions (status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_plan_id 
ON user_subscriptions (plan_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_current_period 
ON user_subscriptions (current_period_start, current_period_end);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_trial 
ON user_subscriptions (trial_start, trial_end) 
WHERE trial_start IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_stripe 
ON user_subscriptions (stripe_subscription_id) 
WHERE stripe_subscription_id IS NOT NULL;

-- Subscription Plans Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscription_plans_plan_type 
ON subscription_plans (plan_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscription_plans_active 
ON subscription_plans (is_active) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscription_plans_billing_cycle 
ON subscription_plans (billing_cycle);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscription_plans_sort_order 
ON subscription_plans (sort_order);

-- User Usage Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_usage_user_id_month 
ON user_usage (user_id, year, month);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_usage_month_year 
ON user_usage (year, month);

-- Billing History Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_billing_history_user_id 
ON billing_history (user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_billing_history_subscription_id 
ON billing_history (subscription_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_billing_history_status 
ON billing_history (status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_billing_history_billing_date 
ON billing_history (billing_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_billing_history_stripe_invoice 
ON billing_history (stripe_invoice_id) 
WHERE stripe_invoice_id IS NOT NULL;

-- Subscription History Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscription_history_user_id 
ON subscription_history (user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscription_history_effective_date 
ON subscription_history (effective_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscription_history_change_reason 
ON subscription_history (change_reason);

-- Feature Flags Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feature_flags_enabled 
ON feature_flags (is_enabled) 
WHERE is_enabled = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feature_flags_rollout 
ON feature_flags (rollout_percentage) 
WHERE rollout_percentage > 0;

-- Premium Features Indexes

-- Recipe Collections Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_collections_user_id 
ON recipe_collections (user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_collections_visibility 
ON recipe_collections (visibility);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_collections_default 
ON recipe_collections (user_id, is_default) 
WHERE is_default = true;

-- Recipe Collection Items Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_collection_items_collection_id 
ON recipe_collection_items (collection_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_collection_items_recipe_id 
ON recipe_collection_items (recipe_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_collection_items_sort_order 
ON recipe_collection_items (collection_id, sort_order);

-- Meal Plans Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_meal_plans_user_id 
ON meal_plans (user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_meal_plans_date_range 
ON meal_plans (start_date, end_date);

-- Meal Plan Items Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_meal_plan_items_meal_plan_id 
ON meal_plan_items (meal_plan_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_meal_plan_items_scheduled_date 
ON meal_plan_items (scheduled_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_meal_plan_items_meal_type 
ON meal_plan_items (meal_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_meal_plan_items_completed 
ON meal_plan_items (is_completed) 
WHERE is_completed = false;

-- Shopping Lists Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shopping_lists_user_id 
ON shopping_lists (user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shopping_lists_active 
ON shopping_lists (user_id, is_active) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shopping_lists_meal_plan 
ON shopping_lists (meal_plan_id) 
WHERE meal_plan_id IS NOT NULL;

-- Shopping List Items Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shopping_list_items_list_id 
ON shopping_list_items (shopping_list_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shopping_list_items_category 
ON shopping_list_items (category);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shopping_list_items_purchased 
ON shopping_list_items (shopping_list_id, is_purchased);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shopping_list_items_sort_order 
ON shopping_list_items (shopping_list_id, sort_order);

-- Recipe Reviews Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_reviews_recipe_id 
ON recipe_reviews (recipe_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_reviews_user_id 
ON recipe_reviews (user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_reviews_rating 
ON recipe_reviews (recipe_id, rating);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_reviews_helpful 
ON recipe_reviews (recipe_id, helpful_count DESC);

-- Recipe Nutrition Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_nutrition_recipe_id 
ON recipe_nutrition (recipe_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_nutrition_verified 
ON recipe_nutrition (is_verified) 
WHERE is_verified = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_nutrition_allergens 
ON recipe_nutrition USING GIN (allergens);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_nutrition_dietary_tags 
ON recipe_nutrition USING GIN (dietary_tags);

-- Recipe Shares Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_shares_recipe_id 
ON recipe_shares (recipe_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_shares_shared_by 
ON recipe_shares (shared_by_user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_shares_shared_with 
ON recipe_shares (shared_with_user_id) 
WHERE shared_with_user_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_shares_email 
ON recipe_shares (shared_with_email) 
WHERE shared_with_email IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_shares_expires 
ON recipe_shares (expires_at) 
WHERE expires_at IS NOT NULL;

-- User Preferences Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_preferences_user_id 
ON user_preferences (user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_preferences_dietary 
ON user_preferences USING GIN (dietary_restrictions);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_preferences_allergens 
ON user_preferences USING GIN (allergens);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_preferences_skill_level 
ON user_preferences (skill_level);

-- Recipe Categories Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_categories_slug 
ON recipe_categories (slug);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_categories_parent 
ON recipe_categories (parent_id) 
WHERE parent_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_categories_premium 
ON recipe_categories (is_premium) 
WHERE is_premium = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_categories_sort_order 
ON recipe_categories (parent_id, sort_order);

-- Composite indexes for common queries

-- Find active subscriptions with plan details
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_active_plan 
ON user_subscriptions (status, plan_id) 
WHERE status = 'active';

-- Find expiring trials
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_expiring_trials 
ON user_subscriptions (trial_end, status) 
WHERE status = 'trialing' AND trial_end IS NOT NULL;

-- Find users needing billing
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_billing_due 
ON user_subscriptions (current_period_end, status) 
WHERE status IN ('active', 'trialing');

-- Recipe access with plan restrictions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_type_created 
ON recipes (created_at DESC) 
WHERE recipe_type IS NOT NULL;

-- User collections with recipe counts
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_collection_items_count 
ON recipe_collection_items (collection_id, added_at DESC);

-- Monthly usage aggregation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_usage_aggregation 
ON user_usage (year, month, user_id);

-- Performance monitoring queries index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_billing_history_revenue 
ON billing_history (billing_date, status, amount) 
WHERE status = 'succeeded';

-- Plan conversion tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscription_history_conversions 
ON subscription_history (effective_date, from_plan_id, to_plan_id, change_reason);