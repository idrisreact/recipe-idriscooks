// Subscription Plan Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  planType: string;
  price: string;
  billingCycle: string;
  trialDays: number;
  isActive: boolean;
  features: PlanFeatures;
  limits: PlanLimits;
  stripePriceId?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanFeatures {
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
}

export interface PlanLimits {
  monthlyRecipeViews?: number;
  totalFavorites?: number;
  totalCollections?: number;
  activeMealPlans?: number;
  sharedRecipesPerMonth?: number;
  pdfExportsPerMonth?: number;
}

// User Subscription Types
export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialStart?: Date;
  trialEnd?: Date;
  canceledAt?: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
  plan?: SubscriptionPlan;
}

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing' | 'unpaid';
export type PlanType = 'free' | 'premium' | 'pro';

// Usage Tracking Types
export interface UserUsage {
  id: string;
  userId: string;
  month: string; // YYYY-MM format
  recipeViews: number;
  favoritesCount: number;
  collectionsCount: number;
  mealPlansCount: number;
  recipesCreated: number;
  pdfExports: number;
  recipesShared: number;
  createdAt: Date;
  updatedAt: Date;
}

// Billing Types
export interface BillingHistory {
  id: string;
  userId: string;
  subscriptionId?: string;
  amount: string;
  currency: string;
  status: BillingStatus;
  type: BillingType;
  description?: string;
  stripeInvoiceId?: string;
  stripePaymentIntentId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export type BillingStatus = 'succeeded' | 'failed' | 'pending' | 'refunded';
export type BillingType = 'subscription' | 'upgrade' | 'refund' | 'credit';

// Subscription History Types
export interface SubscriptionHistory {
  id: string;
  userId: string;
  fromPlanId?: string;
  toPlanId: string;
  changeType: SubscriptionChangeType;
  effectiveDate: Date;
  reason?: string;
  prorationAmount?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  fromPlan?: SubscriptionPlan;
  toPlan?: SubscriptionPlan;
}

export type SubscriptionChangeType = 'upgrade' | 'downgrade' | 'renewal' | 'cancellation';

// Feature Flags Types
export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  rolloutPercentage: number;
  targetPlans?: string[];
  targetUsers?: string[];
  conditions?: FeatureFlagConditions;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureFlagConditions {
  minPlanLevel?: number;
  userSegments?: string[];
  geographies?: string[];
  deviceTypes?: string[];
}

// Premium Features Types
export interface RecipeCollection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color: string;
  isPublic: boolean;
  isDefault: boolean;
  tags?: string[];
  metadata?: CollectionMetadata;
  createdAt: Date;
  updatedAt: Date;
  items?: RecipeCollectionItem[];
}

export interface CollectionMetadata {
  totalRecipes?: number;
  avgRating?: number;
  lastUpdated?: string;
  coverImageUrl?: string;
}

export interface RecipeCollectionItem {
  id: string;
  collectionId: string;
  recipeId: number;
  addedAt: Date;
  notes?: string;
  sortOrder: number;
}

export interface MealPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  weekStartDate: Date;
  status: MealPlanStatus;
  isTemplate: boolean;
  servings: number;
  dietaryPreferences?: DietaryPreferences;
  budget?: string;
  metadata?: MealPlanMetadata;
  createdAt: Date;
  updatedAt: Date;
  items?: MealPlanItem[];
}

export type MealPlanStatus = 'active' | 'archived' | 'template';

export interface DietaryPreferences {
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  dairyFree?: boolean;
  lowCarb?: boolean;
  keto?: boolean;
  paleo?: boolean;
  allergies?: string[];
}

export interface MealPlanMetadata {
  totalCalories?: number;
  totalCost?: number;
  shoppingListGenerated?: boolean;
  nutritionCalculated?: boolean;
}

export interface MealPlanItem {
  id: string;
  mealPlanId: string;
  recipeId?: number;
  dayOfWeek: number;
  mealType: MealType;
  servings: number;
  notes?: string;
  customMealName?: string;
  customIngredients?: string[];
  isCompleted: boolean;
  completedAt?: Date;
  sortOrder: number;
  createdAt: Date;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface ShoppingList {
  id: string;
  userId: string;
  mealPlanId?: string;
  name: string;
  status: ShoppingListStatus;
  estimatedCost?: string;
  actualCost?: string;
  store?: string;
  notes?: string;
  metadata?: ShoppingListMetadata;
  createdAt: Date;
  updatedAt: Date;
  items?: ShoppingListItem[];
}

export type ShoppingListStatus = 'active' | 'completed' | 'archived';

export interface ShoppingListMetadata {
  totalItems?: number;
  completedItems?: number;
  categories?: string[];
  generatedFromMealPlan?: boolean;
}

export interface ShoppingListItem {
  id: string;
  shoppingListId: string;
  name: string;
  quantity: string;
  unit?: string;
  category?: string;
  estimatedPrice?: string;
  actualPrice?: string;
  isCompleted: boolean;
  isPriority: boolean;
  notes?: string;
  recipeIds?: number[];
  sortOrder: number;
  completedAt?: Date;
  createdAt: Date;
}

export interface RecipeNutrition {
  id: string;
  recipeId: number;
  servings: number;
  calories?: number;
  protein?: string;
  carbohydrates?: string;
  fat?: string;
  fiber?: string;
  sugar?: string;
  sodium?: string;
  cholesterol?: string;
  vitamins?: Record<string, number>;
  minerals?: Record<string, number>;
  allergens?: string[];
  dietaryFlags?: NutritionDietaryFlags;
  calculatedAt: Date;
  createdAt: Date;
}

export interface NutritionDietaryFlags {
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  dairyFree?: boolean;
  lowCarb?: boolean;
  keto?: boolean;
  paleo?: boolean;
  lowSodium?: boolean;
}

export interface RecipeReview {
  id: string;
  recipeId: number;
  userId: string;
  rating: number;
  title?: string;
  comment?: string;
  helpfulVotes: number;
  difficultyRating?: number;
  tasteRating?: number;
  wouldMakeAgain?: boolean;
  cookingTime?: number;
  modifications?: string;
  tips?: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  isRecommended?: boolean;
  moderationStatus: ModerationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export interface RecipeShare {
  id: string;
  recipeId: number;
  sharedBy: string;
  sharedWith?: string;
  shareToken: string;
  shareType: ShareType;
  permissions?: SharePermissions;
  expiresAt?: Date;
  accessCount: number;
  lastAccessedAt?: Date;
  isActive: boolean;
  message?: string;
  metadata?: ShareMetadata;
  createdAt: Date;
}

export type ShareType = 'private' | 'public' | 'collection';

export interface SharePermissions {
  canView?: boolean;
  canCopy?: boolean;
  canEdit?: boolean;
  canShare?: boolean;
}

export interface ShareMetadata {
  originalRecipeTitle?: string;
  sharedVia?: string;
  recipientEmail?: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  theme: Theme;
  language: string;
  timezone: string;
  units: UnitsSystem;
  skillLevel: SkillLevel;
  cookingStyle?: string[];
  dietaryRestrictions?: UserDietaryRestrictions;
  kitchenEquipment?: string[];
  preferredCuisines?: string[];
  dislikedIngredients?: string[];
  notifications?: NotificationPreferences;
  privacy?: PrivacySettings;
  createdAt: Date;
  updatedAt: Date;
}

export type Theme = 'light' | 'dark' | 'auto';
export type UnitsSystem = 'metric' | 'imperial';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserDietaryRestrictions {
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  dairyFree?: boolean;
  nutFree?: boolean;
  shellFishFree?: boolean;
  allergies?: string[];
  customRestrictions?: string[];
}

export interface NotificationPreferences {
  emailNewsletter?: boolean;
  emailMealPlanReminders?: boolean;
  emailRecipeRecommendations?: boolean;
  pushMealPlanReminders?: boolean;
  pushNewRecipes?: boolean;
}

export interface PrivacySettings {
  profileVisible?: boolean;
  recipesVisible?: boolean;
  collectionsVisible?: boolean;
  reviewsVisible?: boolean;
}

// Utility Types for Subscription Management
export interface SubscriptionAccessCheck {
  hasAccess: boolean;
  reason?: string;
  remainingUsage?: number;
  upgradeRequired?: boolean;
  featureName?: string;
}

export interface PlanComparison {
  current: SubscriptionPlan;
  target: SubscriptionPlan;
  differences: {
    features: Partial<PlanFeatures>;
    limits: Partial<PlanLimits>;
    priceChange: string;
    billingChange?: string;
  };
  isUpgrade: boolean;
  prorationAmount?: string;
}

export interface UsageReport {
  currentUsage: UserUsage;
  planLimits: PlanLimits;
  utilizationPercentage: Record<string, number>;
  warnings: UsageWarning[];
}

export interface UsageWarning {
  feature: string;
  currentUsage: number;
  limit: number;
  severity: 'low' | 'medium' | 'high';
  message: string;
}