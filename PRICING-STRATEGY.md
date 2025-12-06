# Pricing Strategy Implementation 🚀

## Overview

Successfully implemented **"Early Bird" Launch Pricing** strategy with the ability to easily scale prices later.

## Current Setup

### Launch Special Pricing (Active)

- **Current Price:** £10 (Early Bird Special)
- **Regular Price:** £25 (Future)
- **Savings:** £15 (60% off!)
- **Status:** `isLaunchSpecial: true`

## What Was Implemented

### 1. Centralized Pricing Configuration

**File:** `src/config/pricing.ts`

All pricing is now managed in one place:

```typescript
export const PRICING = {
  recipeAccess: {
    current: {
      amount: 1000, // £10 in pence
      display: '£10',
      label: 'Early Bird Special',
      badge: '🎉 Limited Time',
    },
    regular: {
      amount: 2500, // £25 in pence
      display: '£25',
      label: 'Regular Price',
    },
    isLaunchSpecial: true, // Toggle this!
  },
  // ... more pricing tiers
};
```

### 2. Dynamic Checkout

**File:** `app/api/stripe/checkout/recipe-access/route.ts`

- Uses `getRecipeAccessPrice()` to get current pricing
- Automatically updates Stripe checkout amount
- Tracks pricing tier in metadata

### 3. Enhanced Button Component

**File:** `src/components/payment/recipe-access-button.tsx`

**Features:**

- ✨ Shows "Limited Time" badge
- 💰 Displays savings amount
- 🎯 Shows strikethrough regular price
- 🔥 Scale hover effect for urgency

**Visual:**

```
┌──────────────────────────────────┐
│  ✨ 🎉 Limited Time • Save £15   │
├──────────────────────────────────┤
│  🔒 GET FULL ACCESS - £10        │
│     Regular: £25                 │
└──────────────────────────────────┘
```

### 4. Paywall Modal Updates

**File:** `app/(root)/recipes/category/[slug]/page.tsx`

- Dynamic pricing in description
- Yellow alert banner showing savings
- "Early Bird Special" messaging

## How to Use

### To Keep Current Pricing (£10)

**Do nothing!** It's already set up.

### To Switch to Regular Pricing (£25)

**Step 1:** Edit `src/config/pricing.ts`

```typescript
isLaunchSpecial: false,  // Change true → false
```

**Step 2:** Redeploy

```bash
git add .
git commit -m "Switch to regular pricing"
git push
vercel --prod
```

**That's it!** All buttons, paywalls, and checkout flows automatically update to £25.

### To Change Prices Later

Edit `src/config/pricing.ts`:

```typescript
recipeAccess: {
  current: {
    amount: 2900,        // £29 (new special)
    display: '£29',
    label: 'Spring Sale',
    badge: '🌸 Spring Offer',
  },
  regular: {
    amount: 4900,        // £49 (new regular)
    display: '£49',
  },
  isLaunchSpecial: true,  // Show special pricing
},
```

## Marketing Copy

### For Social Media

```
🎉 Early Bird Special: Lifetime Recipe Access for just £10!

✅ Unlimited recipes
✅ Lifetime access
✅ All future recipes included

Regular price: £25
You save: £15 (60% off!)

Limited time only! 🔥

[Get Access → ]
```

### For Email

```
Subject: Last Chance: £10 Lifetime Access (Save 60%)

Hi [Name],

This is your final reminder - our Early Bird pricing
ends soon!

Get lifetime access to ALL recipes for just £10.

That's £15 off the regular price of £25.

Click here to claim your spot →

Questions? Reply to this email.

Cheers,
Idris
```

## Pricing Tiers Reference

### Option A: Current (Launch)

```
Launch: £10 (Early Bird)
Later:  £25 (Regular)
```

### Option B: Premium

```
Launch: £10 (Early Bird)
Phase 2: £25 (Early Access)
Phase 3: £49 (Regular)
```

### Option C: Subscription Model

```
Free:    3 recipes/month
Monthly: £5/month
Yearly:  £40/year (save £20)
Lifetime: £99 one-time
```

## Analytics to Track

Monitor these metrics to decide when to raise prices:

1. **Conversion Rate** - What % of visitors buy?
2. **Revenue per User** - Currently £10/user
3. **User Growth** - How fast is user base growing?
4. **Refund Rate** - Are people happy with £10?
5. **Social Proof** - Testimonials/reviews

### When to Raise Prices

**Raise to £25 when:**

- ✅ 100+ paying customers
- ✅ Strong testimonials/reviews
- ✅ Active community/engagement
- ✅ New premium features added
- ✅ Brand recognition established

**Raise to £49 when:**

- ✅ 500+ customers
- ✅ Industry recognition
- ✅ Exclusive content/recipes
- ✅ Community features
- ✅ Advanced meal planning

## Files Modified

1. `src/config/pricing.ts` - ✅ Created (central config)
2. `app/api/stripe/checkout/recipe-access/route.ts` - ✅ Updated
3. `src/components/payment/recipe-access-button.tsx` - ✅ Enhanced
4. `app/(root)/recipes/category/[slug]/page.tsx` - ✅ Updated

## Testing Checklist

Before switching prices:

- [ ] Test checkout flow with new price
- [ ] Verify Stripe receives correct amount
- [ ] Check all UI shows correct pricing
- [ ] Test on mobile and desktop
- [ ] Verify webhook grants access correctly
- [ ] Check email/social copy is updated

## Quick Commands

```bash
# Current pricing status
grep "isLaunchSpecial" src/config/pricing.ts

# Switch to regular pricing
sed -i '' 's/isLaunchSpecial: true/isLaunchSpecial: false/' src/config/pricing.ts

# Deploy price change
git add src/config/pricing.ts
git commit -m "Update pricing to £25"
git push && vercel --prod
```

## Support

Questions about pricing strategy?

1. Check this document
2. Test in Stripe test mode first
3. Review analytics before changes
4. Consider A/B testing

---

**Remember:** You can always change prices, but it's harder to lower them than raise them. Start with Early Bird pricing to build momentum! 🚀
