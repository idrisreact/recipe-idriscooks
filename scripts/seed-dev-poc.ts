import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { user, recipes } from '../src/db/schemas';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';

config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

const testUser = {
  id: 'dev-user-001',
  name: 'Dev Test User',
  email: 'dev@example.com',
  emailVerified: true,
  image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  createdAt: new Date(),
  updatedAt: new Date()
};

const testSubscription = {
  id: 'dev-subscription-001',
  userId: 'dev-user-001',
  planId: 'premium-monthly',
  status: 'active',
  currentPeriodStart: new Date(),
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  trialStart: null,
  trialEnd: null,
  canceledAt: null,
  cancelAtPeriodEnd: false,
  stripeSubscriptionId: 'sub_dev_test_001',
  stripeCustomerId: 'cus_dev_test_001',
  createdAt: new Date(),
  updatedAt: new Date()
};

const developmentRecipes = [
  {
    title: "Classic Margherita Pizza",
    description: "Traditional Italian pizza with fresh mozzarella, tomatoes, and basil",
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop",
    servings: 4,
    prepTime: 30,
    cookTime: 15,
    ingredients: [
      { name: "Pizza dough", quantity: 1, unit: "lb" },
      { name: "Tomato sauce", quantity: 0.5, unit: "cup" },
      { name: "Fresh mozzarella", quantity: 8, unit: "oz" },
      { name: "Fresh basil leaves", quantity: 10, unit: "pieces" },
      { name: "Olive oil", quantity: 2, unit: "tbsp" }
    ],
    steps: [
      "Preheat oven to 475°F (245°C)",
      "Roll out pizza dough on floured surface",
      "Spread tomato sauce evenly over dough",
      "Add torn mozzarella pieces",
      "Bake for 12-15 minutes until crust is golden",
      "Top with fresh basil and drizzle with olive oil"
    ],
    tags: ["italian", "vegetarian", "pizza", "quick"]
  },
  {
    title: "Chicken Tikka Masala",
    description: "Creamy and flavorful Indian curry with tender chicken pieces",
    imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop",
    servings: 6,
    prepTime: 45,
    cookTime: 30,
    ingredients: [
      { name: "Chicken breast", quantity: 2, unit: "lbs" },
      { name: "Heavy cream", quantity: 1, unit: "cup" },
      { name: "Tomato sauce", quantity: 1, unit: "cup" },
      { name: "Garam masala", quantity: 2, unit: "tsp" },
      { name: "Ginger garlic paste", quantity: 2, unit: "tbsp" }
    ],
    steps: [
      "Marinate chicken in yogurt and spices for 30 minutes",
      "Grill chicken until cooked through",
      "Sauté onions and ginger garlic paste",
      "Add tomato sauce and simmer",
      "Add grilled chicken and cream",
      "Simmer for 10 minutes and garnish with cilantro"
    ],
    tags: ["indian", "curry", "chicken", "spicy"]
  },
  {
    title: "Caesar Salad",
    description: "Crisp romaine lettuce with classic Caesar dressing and parmesan",
    imageUrl: "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=800&h=600&fit=crop",
    servings: 4,
    prepTime: 15,
    cookTime: 0,
    ingredients: [
      { name: "Romaine lettuce", quantity: 2, unit: "heads" },
      { name: "Parmesan cheese", quantity: 0.5, unit: "cup" },
      { name: "Croutons", quantity: 1, unit: "cup" },
      { name: "Caesar dressing", quantity: 0.5, unit: "cup" },
      { name: "Anchovies", quantity: 4, unit: "fillets" }
    ],
    steps: [
      "Wash and chop romaine lettuce",
      "Make Caesar dressing with anchovies, garlic, and lemon",
      "Toss lettuce with dressing",
      "Top with parmesan and croutons",
      "Serve immediately"
    ],
    tags: ["salad", "vegetarian", "quick", "healthy"]
  },
  {
    title: "Beef Tacos",
    description: "Seasoned ground beef tacos with fresh toppings",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop",
    servings: 4,
    prepTime: 20,
    cookTime: 15,
    ingredients: [
      { name: "Ground beef", quantity: 1, unit: "lb" },
      { name: "Taco shells", quantity: 8, unit: "pieces" },
      { name: "Lettuce", quantity: 1, unit: "head" },
      { name: "Tomatoes", quantity: 2, unit: "medium" },
      { name: "Cheddar cheese", quantity: 1, unit: "cup" }
    ],
    steps: [
      "Brown ground beef with taco seasoning",
      "Warm taco shells in oven",
      "Chop lettuce and tomatoes",
      "Fill shells with beef",
      "Top with lettuce, tomatoes, and cheese"
    ],
    tags: ["mexican", "beef", "quick", "family-friendly"]
  },
  {
    title: "Chocolate Chip Cookies",
    description: "Classic homemade chocolate chip cookies that are crispy outside, chewy inside",
    imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&h=600&fit=crop",
    servings: 24,
    prepTime: 15,
    cookTime: 12,
    ingredients: [
      { name: "All-purpose flour", quantity: 2.25, unit: "cups" },
      { name: "Butter", quantity: 1, unit: "cup" },
      { name: "Brown sugar", quantity: 0.75, unit: "cup" },
      { name: "White sugar", quantity: 0.75, unit: "cup" },
      { name: "Chocolate chips", quantity: 2, unit: "cups" }
    ],
    steps: [
      "Preheat oven to 375°F",
      "Cream butter and sugars",
      "Add eggs and vanilla",
      "Mix in flour and chocolate chips",
      "Drop spoonfuls on baking sheet",
      "Bake 9-11 minutes until golden brown"
    ],
    tags: ["dessert", "cookies", "chocolate", "baking"]
  },
  {
    title: "Grilled Salmon",
    description: "Perfectly grilled salmon with lemon and herbs",
    imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop",
    servings: 4,
    prepTime: 10,
    cookTime: 15,
    ingredients: [
      { name: "Salmon fillets", quantity: 4, unit: "pieces" },
      { name: "Lemon", quantity: 1, unit: "whole" },
      { name: "Olive oil", quantity: 3, unit: "tbsp" },
      { name: "Fresh dill", quantity: 2, unit: "tbsp" },
      { name: "Garlic", quantity: 2, unit: "cloves" }
    ],
    steps: [
      "Preheat grill to medium-high heat",
      "Brush salmon with olive oil",
      "Season with salt, pepper, and garlic",
      "Grill 6-8 minutes per side",
      "Garnish with lemon and fresh dill"
    ],
    tags: ["seafood", "healthy", "grilled", "protein"]
  },
  {
    title: "Vegetable Stir Fry",
    description: "Quick and healthy mixed vegetable stir fry with soy sauce",
    imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop",
    servings: 4,
    prepTime: 15,
    cookTime: 10,
    ingredients: [
      { name: "Mixed vegetables", quantity: 4, unit: "cups" },
      { name: "Soy sauce", quantity: 3, unit: "tbsp" },
      { name: "Sesame oil", quantity: 1, unit: "tbsp" },
      { name: "Ginger", quantity: 1, unit: "tbsp" },
      { name: "Garlic", quantity: 3, unit: "cloves" }
    ],
    steps: [
      "Heat oil in large wok or pan",
      "Add garlic and ginger, stir for 30 seconds",
      "Add harder vegetables first",
      "Stir fry for 5-7 minutes",
      "Add soy sauce and softer vegetables",
      "Cook until tender-crisp"
    ],
    tags: ["vegetarian", "healthy", "asian", "quick"]
  },
  {
    title: "BBQ Ribs",
    description: "Slow-cooked barbecue ribs with tangy sauce",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop",
    servings: 6,
    prepTime: 30,
    cookTime: 180,
    ingredients: [
      { name: "Pork ribs", quantity: 3, unit: "lbs" },
      { name: "BBQ sauce", quantity: 1, unit: "cup" },
      { name: "Brown sugar", quantity: 0.5, unit: "cup" },
      { name: "Paprika", quantity: 2, unit: "tbsp" },
      { name: "Garlic powder", quantity: 1, unit: "tbsp" }
    ],
    steps: [
      "Mix dry rub ingredients",
      "Coat ribs with rub and let sit 1 hour",
      "Preheat oven to 275°F",
      "Wrap ribs in foil and bake 2.5 hours",
      "Brush with BBQ sauce",
      "Grill or broil for caramelized finish"
    ],
    tags: ["bbq", "pork", "slow-cooked", "comfort-food"]
  },
  {
    title: "Greek Salad",
    description: "Fresh Mediterranean salad with feta, olives, and tomatoes",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=600&fit=crop",
    servings: 4,
    prepTime: 15,
    cookTime: 0,
    ingredients: [
      { name: "Cucumber", quantity: 1, unit: "large" },
      { name: "Tomatoes", quantity: 3, unit: "large" },
      { name: "Red onion", quantity: 0.5, unit: "medium" },
      { name: "Feta cheese", quantity: 4, unit: "oz" },
      { name: "Kalamata olives", quantity: 0.5, unit: "cup" }
    ],
    steps: [
      "Chop cucumbers and tomatoes",
      "Slice red onion thinly",
      "Combine vegetables in bowl",
      "Add olives and crumbled feta",
      "Drizzle with olive oil and oregano"
    ],
    tags: ["greek", "salad", "vegetarian", "mediterranean"]
  },
  {
    title: "Pancakes",
    description: "Fluffy homemade pancakes perfect for breakfast",
    imageUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop",
    servings: 4,
    prepTime: 10,
    cookTime: 15,
    ingredients: [
      { name: "All-purpose flour", quantity: 1, unit: "cup" },
      { name: "Milk", quantity: 1, unit: "cup" },
      { name: "Eggs", quantity: 1, unit: "large" },
      { name: "Baking powder", quantity: 2, unit: "tsp" },
      { name: "Sugar", quantity: 2, unit: "tbsp" }
    ],
    steps: [
      "Mix dry ingredients in bowl",
      "Whisk wet ingredients separately",
      "Combine wet and dry ingredients",
      "Heat griddle or pan",
      "Pour batter and cook until bubbles form",
      "Flip and cook until golden brown"
    ],
    tags: ["breakfast", "pancakes", "comfort-food", "family-friendly"]
  },
  {
    title: "Chicken Noodle Soup",
    description: "Comforting homemade chicken noodle soup",
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=600&fit=crop",
    servings: 6,
    prepTime: 20,
    cookTime: 45,
    ingredients: [
      { name: "Chicken breast", quantity: 1, unit: "lb" },
      { name: "Egg noodles", quantity: 8, unit: "oz" },
      { name: "Carrots", quantity: 2, unit: "large" },
      { name: "Celery", quantity: 2, unit: "stalks" },
      { name: "Chicken broth", quantity: 6, unit: "cups" }
    ],
    steps: [
      "Sauté diced vegetables",
      "Add chicken broth and bring to boil",
      "Add chicken and simmer 20 minutes",
      "Remove chicken, shred, and return to pot",
      "Add noodles and cook until tender",
      "Season with salt, pepper, and herbs"
    ],
    tags: ["soup", "chicken", "comfort-food", "healthy"]
  },
  {
    title: "Beef Burgers",
    description: "Juicy homemade beef burgers with all the fixings",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
    servings: 4,
    prepTime: 15,
    cookTime: 12,
    ingredients: [
      { name: "Ground beef", quantity: 1, unit: "lb" },
      { name: "Burger buns", quantity: 4, unit: "pieces" },
      { name: "Lettuce", quantity: 4, unit: "leaves" },
      { name: "Tomato", quantity: 1, unit: "large" },
      { name: "Cheese slices", quantity: 4, unit: "pieces" }
    ],
    steps: [
      "Form ground beef into 4 patties",
      "Season with salt and pepper",
      "Grill or pan-fry 5-6 minutes per side",
      "Add cheese in last minute",
      "Toast buns lightly",
      "Assemble with lettuce, tomato, and condiments"
    ],
    tags: ["burgers", "beef", "grilled", "american"]
  },
  {
    title: "Pad Thai",
    description: "Authentic Thai stir-fried rice noodles with shrimp",
    imageUrl: "https://images.unsplash.com/photo-1559314809-0f31657def5e?w=800&h=600&fit=crop",
    servings: 4,
    prepTime: 25,
    cookTime: 15,
    ingredients: [
      { name: "Rice noodles", quantity: 8, unit: "oz" },
      { name: "Shrimp", quantity: 1, unit: "lb" },
      { name: "Bean sprouts", quantity: 2, unit: "cups" },
      { name: "Fish sauce", quantity: 3, unit: "tbsp" },
      { name: "Tamarind paste", quantity: 2, unit: "tbsp" }
    ],
    steps: [
      "Soak rice noodles in warm water",
      "Heat oil in large wok",
      "Stir-fry shrimp until pink",
      "Add drained noodles and sauce",
      "Add bean sprouts and peanuts",
      "Garnish with lime and cilantro"
    ],
    tags: ["thai", "seafood", "asian", "noodles"]
  },
  {
    title: "Chocolate Brownies",
    description: "Rich and fudgy chocolate brownies",
    imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&h=600&fit=crop",
    servings: 16,
    prepTime: 15,
    cookTime: 30,
    ingredients: [
      { name: "Dark chocolate", quantity: 8, unit: "oz" },
      { name: "Butter", quantity: 0.5, unit: "cup" },
      { name: "Sugar", quantity: 1, unit: "cup" },
      { name: "Eggs", quantity: 3, unit: "large" },
      { name: "Flour", quantity: 0.75, unit: "cup" }
    ],
    steps: [
      "Preheat oven to 350°F",
      "Melt chocolate and butter together",
      "Beat in sugar and eggs",
      "Fold in flour",
      "Pour into greased pan",
      "Bake 25-30 minutes until set"
    ],
    tags: ["dessert", "chocolate", "brownies", "baking"]
  },
  {
    title: "Fish and Chips",
    description: "Classic British fish and chips with crispy batter",
    imageUrl: "https://images.unsplash.com/photo-1544982503-9f984c14501a?w=800&h=600&fit=crop",
    servings: 4,
    prepTime: 30,
    cookTime: 20,
    ingredients: [
      { name: "White fish fillets", quantity: 4, unit: "pieces" },
      { name: "Potatoes", quantity: 4, unit: "large" },
      { name: "Flour", quantity: 1, unit: "cup" },
      { name: "Beer", quantity: 1, unit: "cup" },
      { name: "Oil for frying", quantity: 4, unit: "cups" }
    ],
    steps: [
      "Cut potatoes into chips and soak",
      "Make batter with flour and beer",
      "Heat oil to 375°F",
      "Fry chips until golden",
      "Dip fish in batter and fry",
      "Serve with mushy peas and tartar sauce"
    ],
    tags: ["british", "seafood", "fried", "comfort-food"]
  },
  {
    title: "Caprese Salad",
    description: "Simple Italian salad with tomatoes, mozzarella, and basil",
    imageUrl: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=800&h=600&fit=crop",
    servings: 4,
    prepTime: 10,
    cookTime: 0,
    ingredients: [
      { name: "Fresh mozzarella", quantity: 8, unit: "oz" },
      { name: "Tomatoes", quantity: 3, unit: "large" },
      { name: "Fresh basil", quantity: 0.5, unit: "cup" },
      { name: "Balsamic vinegar", quantity: 2, unit: "tbsp" },
      { name: "Extra virgin olive oil", quantity: 3, unit: "tbsp" }
    ],
    steps: [
      "Slice tomatoes and mozzarella",
      "Arrange alternately on plate",
      "Add fresh basil leaves",
      "Drizzle with olive oil",
      "Add balsamic vinegar and season"
    ],
    tags: ["italian", "salad", "vegetarian", "fresh"]
  },
  {
    title: "Chicken Parmesan",
    description: "Breaded chicken breast with marinara and melted cheese",
    imageUrl: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=800&h=600&fit=crop",
    servings: 4,
    prepTime: 25,
    cookTime: 25,
    ingredients: [
      { name: "Chicken breasts", quantity: 4, unit: "pieces" },
      { name: "Breadcrumbs", quantity: 1, unit: "cup" },
      { name: "Parmesan cheese", quantity: 0.5, unit: "cup" },
      { name: "Marinara sauce", quantity: 2, unit: "cups" },
      { name: "Mozzarella cheese", quantity: 1, unit: "cup" }
    ],
    steps: [
      "Pound chicken to even thickness",
      "Dredge in flour, egg, then breadcrumbs",
      "Pan-fry until golden brown",
      "Top with marinara and cheese",
      "Bake until cheese melts",
      "Serve over pasta"
    ],
    tags: ["italian", "chicken", "cheese", "comfort-food"]
  },
  {
    title: "Beef Stew",
    description: "Hearty beef stew with vegetables in rich broth",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    servings: 6,
    prepTime: 30,
    cookTime: 120,
    ingredients: [
      { name: "Beef chuck", quantity: 2, unit: "lbs" },
      { name: "Potatoes", quantity: 4, unit: "medium" },
      { name: "Carrots", quantity: 4, unit: "large" },
      { name: "Onion", quantity: 1, unit: "large" },
      { name: "Beef broth", quantity: 4, unit: "cups" }
    ],
    steps: [
      "Brown beef chunks in oil",
      "Add onions and cook until soft",
      "Add broth and simmer 1.5 hours",
      "Add potatoes and carrots",
      "Simmer until vegetables are tender",
      "Thicken with flour if desired"
    ],
    tags: ["beef", "stew", "comfort-food", "slow-cooked"]
  },
  {
    title: "Shrimp Scampi",
    description: "Garlic butter shrimp over pasta with white wine",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03246963d4d5?w=800&h=600&fit=crop",
    servings: 4,
    prepTime: 15,
    cookTime: 15,
    ingredients: [
      { name: "Large shrimp", quantity: 1, unit: "lb" },
      { name: "Linguine pasta", quantity: 1, unit: "lb" },
      { name: "Garlic", quantity: 6, unit: "cloves" },
      { name: "White wine", quantity: 0.5, unit: "cup" },
      { name: "Butter", quantity: 4, unit: "tbsp" }
    ],
    steps: [
      "Cook pasta according to package directions",
      "Sauté garlic in oil and butter",
      "Add shrimp and cook until pink",
      "Add white wine and lemon juice",
      "Toss with cooked pasta",
      "Garnish with parsley and parmesan"
    ],
    tags: ["seafood", "pasta", "italian", "garlic"]
  },
  {
    title: "Apple Pie",
    description: "Classic American apple pie with flaky crust",
    imageUrl: "https://images.unsplash.com/photo-1621743478914-cc8a86d7e9b5?w=800&h=600&fit=crop",
    servings: 8,
    prepTime: 45,
    cookTime: 50,
    ingredients: [
      { name: "Apples", quantity: 6, unit: "large" },
      { name: "Pie crust", quantity: 2, unit: "pieces" },
      { name: "Sugar", quantity: 0.75, unit: "cup" },
      { name: "Cinnamon", quantity: 1, unit: "tsp" },
      { name: "Butter", quantity: 2, unit: "tbsp" }
    ],
    steps: [
      "Peel and slice apples",
      "Mix with sugar, cinnamon, and flour",
      "Roll out bottom pie crust",
      "Add apple filling and dot with butter",
      "Cover with top crust and seal edges",
      "Bake at 425°F for 45-50 minutes"
    ],
    tags: ["dessert", "pie", "apples", "baking"]
  },
  {
    title: "Chicken Caesar Wrap",
    description: "Grilled chicken Caesar salad wrapped in tortilla",
    imageUrl: "https://images.unsplash.com/photo-1565299585323-38174c4a6309?w=800&h=600&fit=crop",
    servings: 4,
    prepTime: 20,
    cookTime: 15,
    ingredients: [
      { name: "Chicken breasts", quantity: 2, unit: "large" },
      { name: "Large tortillas", quantity: 4, unit: "pieces" },
      { name: "Romaine lettuce", quantity: 1, unit: "head" },
      { name: "Caesar dressing", quantity: 0.5, unit: "cup" },
      { name: "Parmesan cheese", quantity: 0.5, unit: "cup" }
    ],
    steps: [
      "Grill seasoned chicken breasts",
      "Slice chicken into strips",
      "Chop romaine lettuce",
      "Toss lettuce with Caesar dressing",
      "Add chicken and parmesan to wraps",
      "Roll tightly and slice in half"
    ],
    tags: ["chicken", "wrap", "caesar", "lunch"]
  },
  {
    title: "Mushroom Risotto",
    description: "Creamy Italian rice dish with mixed mushrooms",
    imageUrl: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&h=600&fit=crop",
    servings: 4,
    prepTime: 15,
    cookTime: 30,
    ingredients: [
      { name: "Arborio rice", quantity: 1, unit: "cup" },
      { name: "Mixed mushrooms", quantity: 8, unit: "oz" },
      { name: "Chicken broth", quantity: 4, unit: "cups" },
      { name: "White wine", quantity: 0.5, unit: "cup" },
      { name: "Parmesan cheese", quantity: 0.5, unit: "cup" }
    ],
    steps: [
      "Sauté mushrooms until golden",
      "Heat broth in separate pot",
      "Sauté rice until lightly toasted",
      "Add wine and stir until absorbed",
      "Add warm broth one ladle at a time",
      "Stir in cheese and mushrooms"
    ],
    tags: ["italian", "rice", "mushrooms", "vegetarian"]
  },
  {
    title: "BBQ Chicken Pizza",
    description: "Pizza topped with BBQ chicken, red onion, and cilantro",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop",
    servings: 4,
    prepTime: 25,
    cookTime: 15,
    ingredients: [
      { name: "Pizza dough", quantity: 1, unit: "lb" },
      { name: "Cooked chicken", quantity: 2, unit: "cups" },
      { name: "BBQ sauce", quantity: 0.5, unit: "cup" },
      { name: "Red onion", quantity: 0.5, unit: "medium" },
      { name: "Mozzarella cheese", quantity: 2, unit: "cups" }
    ],
    steps: [
      "Preheat oven to 475°F",
      "Roll out pizza dough",
      "Spread BBQ sauce on dough",
      "Top with chicken and onion",
      "Add mozzarella cheese",
      "Bake 12-15 minutes and garnish with cilantro"
    ],
    tags: ["pizza", "bbq", "chicken", "american"]
  },
  {
    title: "French Toast",
    description: "Classic French toast with cinnamon and vanilla",
    imageUrl: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&h=600&fit=crop",
    servings: 4,
    prepTime: 10,
    cookTime: 15,
    ingredients: [
      { name: "Thick bread slices", quantity: 8, unit: "pieces" },
      { name: "Eggs", quantity: 4, unit: "large" },
      { name: "Milk", quantity: 0.5, unit: "cup" },
      { name: "Vanilla extract", quantity: 1, unit: "tsp" },
      { name: "Cinnamon", quantity: 0.5, unit: "tsp" }
    ],
    steps: [
      "Whisk eggs, milk, vanilla, and cinnamon",
      "Dip bread slices in egg mixture",
      "Cook in buttered pan until golden",
      "Flip and cook other side",
      "Serve with maple syrup and butter"
    ],
    tags: ["breakfast", "french-toast", "sweet", "comfort-food"]
  },
  {
    title: "Chicken Quesadillas",
    description: "Crispy flour tortillas filled with chicken and cheese",
    imageUrl: "https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=800&h=600&fit=crop",
    servings: 4,
    prepTime: 15,
    cookTime: 12,
    ingredients: [
      { name: "Flour tortillas", quantity: 4, unit: "large" },
      { name: "Cooked chicken", quantity: 2, unit: "cups" },
      { name: "Cheddar cheese", quantity: 2, unit: "cups" },
      { name: "Bell peppers", quantity: 1, unit: "medium" },
      { name: "Onion", quantity: 0.5, unit: "medium" }
    ],
    steps: [
      "Sauté peppers and onions",
      "Mix chicken with vegetables",
      "Place filling on half of tortilla",
      "Top with cheese and fold",
      "Cook in pan until crispy and cheese melts",
      "Cut into wedges and serve with salsa"
    ],
    tags: ["mexican", "chicken", "cheese", "quick"]
  },
  {
    title: "Meatball Subs",
    description: "Italian meatballs in marinara sauce on crusty sub rolls",
    imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&h=600&fit=crop",
    servings: 4,
    prepTime: 25,
    cookTime: 30,
    ingredients: [
      { name: "Ground beef", quantity: 1, unit: "lb" },
      { name: "Sub rolls", quantity: 4, unit: "pieces" },
      { name: "Marinara sauce", quantity: 2, unit: "cups" },
      { name: "Mozzarella cheese", quantity: 1, unit: "cup" },
      { name: "Breadcrumbs", quantity: 0.5, unit: "cup" }
    ],
    steps: [
      "Mix ground beef with breadcrumbs and egg",
      "Form into meatballs",
      "Brown meatballs in oil",
      "Simmer in marinara sauce",
      "Place meatballs in sub rolls",
      "Top with cheese and broil until melted"
    ],
    tags: ["italian", "beef", "sandwich", "comfort-food"]
  },
  {
    title: "Thai Green Curry",
    description: "Creamy coconut curry with vegetables and Thai basil",
    imageUrl: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&h=600&fit=crop",
    servings: 4,
    prepTime: 20,
    cookTime: 20,
    ingredients: [
      { name: "Green curry paste", quantity: 3, unit: "tbsp" },
      { name: "Coconut milk", quantity: 1, unit: "can" },
      { name: "Chicken thighs", quantity: 1, unit: "lb" },
      { name: "Thai eggplant", quantity: 2, unit: "cups" },
      { name: "Thai basil", quantity: 0.5, unit: "cup" }
    ],
    steps: [
      "Fry curry paste in oil until fragrant",
      "Add thick coconut milk and simmer",
      "Add chicken and cook through",
      "Add vegetables and remaining coconut milk",
      "Simmer until tender",
      "Garnish with Thai basil and serve with rice"
    ],
    tags: ["thai", "curry", "coconut", "spicy"]
  },
  {
    title: "Breakfast Burrito",
    description: "Hearty breakfast wrap with eggs, bacon, and potatoes",
    imageUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=600&fit=crop",
    servings: 4,
    prepTime: 20,
    cookTime: 25,
    ingredients: [
      { name: "Large tortillas", quantity: 4, unit: "pieces" },
      { name: "Eggs", quantity: 8, unit: "large" },
      { name: "Bacon", quantity: 8, unit: "strips" },
      { name: "Hash browns", quantity: 2, unit: "cups" },
      { name: "Cheddar cheese", quantity: 1, unit: "cup" }
    ],
    steps: [
      "Cook bacon until crispy",
      "Prepare hash browns",
      "Scramble eggs with salt and pepper",
      "Warm tortillas",
      "Fill with eggs, bacon, potatoes, and cheese",
      "Roll tightly and serve immediately"
    ],
    tags: ["breakfast", "burrito", "eggs", "bacon"]
  },
  {
    title: "Lemon Bars",
    description: "Tangy lemon custard on buttery shortbread crust",
    imageUrl: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&h=600&fit=crop",
    servings: 16,
    prepTime: 20,
    cookTime: 45,
    ingredients: [
      { name: "Butter", quantity: 1, unit: "cup" },
      { name: "Flour", quantity: 2, unit: "cups" },
      { name: "Eggs", quantity: 4, unit: "large" },
      { name: "Fresh lemon juice", quantity: 0.5, unit: "cup" },
      { name: "Powdered sugar", quantity: 1.5, unit: "cups" }
    ],
    steps: [
      "Make shortbread crust with butter and flour",
      "Bake crust until lightly golden",
      "Whisk eggs, lemon juice, and sugar",
      "Pour over hot crust",
      "Bake until set",
      "Cool completely and dust with powdered sugar"
    ],
    tags: ["dessert", "lemon", "bars", "citrus"]
  }
];

async function seedDevPOC() {
  try {
    console.log('🌱 Starting development POC seeding...');

    const existingUser = await db.select().from(user).where(eq(user.id, testUser.id)).limit(1);

    if (existingUser.length === 0) {

      await db.insert(user).values(testUser);
      console.log('✅ Created test user:', testUser.email);

      await pool.query(`
        INSERT INTO user_subscriptions (id, user_id, plan_id, status, current_period_start, current_period_end, stripe_subscription_id, stripe_customer_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO NOTHING
      `, [
        testSubscription.id,
        testSubscription.userId,
        testSubscription.planId,
        testSubscription.status,
        testSubscription.currentPeriodStart,
        testSubscription.currentPeriodEnd,
        testSubscription.stripeSubscriptionId,
        testSubscription.stripeCustomerId
      ]);
      console.log('✅ Created test subscription for user');
    } else {
      console.log('ℹ️ Test user already exists, skipping user creation');
    }

    const existingRecipes = await db.select().from(recipes);
    console.log(`📊 Found ${existingRecipes.length} existing recipes`);

    console.log('🍳 Seeding development recipes...');
    for (let i = 0; i < developmentRecipes.length; i++) {
      const recipe = developmentRecipes[i];

      try {
        await db.insert(recipes).values({
          title: recipe.title,
          description: recipe.description,
          imageUrl: recipe.imageUrl,
          servings: recipe.servings,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          ingredients: recipe.ingredients as any,
          steps: recipe.steps as any,
          tags: recipe.tags as any
        });

        console.log(`✅ Seeded recipe ${i + 1}/30: ${recipe.title}`);
      } catch (error) {
        console.log(`⚠️ Recipe ${recipe.title} may already exist, skipping...`);
      }
    }

    const currentDate = new Date();

    try {
      await pool.query(`
        INSERT INTO user_usage (id, user_id, month, year, api_calls, pdf_exports, recipes_created, storage_used_mb)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        'dev-usage-001',
        testUser.id,
        currentDate.getMonth() + 1, // month number
        currentDate.getFullYear(),  // year
        150, // api calls
        3,   // pdf exports
        0,   // recipes created
        25.5 // storage used MB
      ]);
    } catch (error) {
      console.log('ℹ️ Usage data may already exist, continuing...');
    }

    console.log('✅ Created sample usage data');

    const finalRecipeCount = await db.select().from(recipes);
    console.log(`🎉 Development POC seeding completed!`);
    console.log(`📊 Total recipes in database: ${finalRecipeCount.length}`);
    console.log(`👤 Test user: ${testUser.email} (ID: ${testUser.id})`);
    console.log(`💳 Subscription: Premium Monthly (Active)`);
    console.log(`📈 Usage data: Created for current month`);

  } catch (error) {
    console.error('❌ Error seeding development POC:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seedDevPOC()
    .then(() => {
      console.log('🎯 Development POC setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Development POC setup failed:', error);
      process.exit(1);
    });
}

export { seedDevPOC };