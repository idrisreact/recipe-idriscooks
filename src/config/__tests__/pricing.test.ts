import { getRecipeAccessPrice, getSavingsDisplay, getSavingsAmount, PRICING } from '../pricing';

describe('Pricing Configuration', () => {
  describe('getRecipeAccessPrice', () => {
    it('should return current pricing when launch special is active', () => {
      const price = getRecipeAccessPrice();

      expect(price).toEqual(PRICING.recipeAccess.current);
      expect(price.amount).toBe(1000); // £10
      expect(price.display).toBe('£10');
    });
  });

  describe('getSavingsDisplay', () => {
    it('should return formatted savings amount', () => {
      const savings = getSavingsDisplay();

      expect(savings).toMatch(/£\d+/); // Should include £ symbol
    });

    it('should calculate savings correctly', () => {
      const currentAmount = PRICING.recipeAccess.current.amount;
      const regularAmount = PRICING.recipeAccess.regular.amount;
      const expectedSavings = (regularAmount - currentAmount) / 100;

      const savings = getSavingsDisplay();

      expect(savings).toBe(`£${expectedSavings}`);
    });
  });

  describe('getSavingsAmount', () => {
    it('should return numeric savings amount', () => {
      const amount = getSavingsAmount();

      expect(typeof amount).toBe('number');
      expect(amount).toBeGreaterThan(0);
    });

    it('should match difference between regular and current price', () => {
      const currentAmount = PRICING.recipeAccess.current.amount;
      const regularAmount = PRICING.recipeAccess.regular.amount;
      const expectedSavings = regularAmount - currentAmount;

      const amount = getSavingsAmount();

      expect(amount).toBe(expectedSavings);
    });
  });

  describe('PRICING constants', () => {
    it('should have valid recipe access pricing', () => {
      expect(PRICING.recipeAccess).toBeDefined();
      expect(PRICING.recipeAccess.current.amount).toBeGreaterThan(0);
      expect(PRICING.recipeAccess.regular.amount).toBeGreaterThan(0);
    });

    it('should have launch special flag', () => {
      expect(typeof PRICING.recipeAccess.isLaunchSpecial).toBe('boolean');
    });

    it('should have current price less than regular price', () => {
      const { current, regular } = PRICING.recipeAccess;

      expect(current.amount).toBeLessThan(regular.amount);
    });

    it('should have properly formatted display prices', () => {
      const { current, regular } = PRICING.recipeAccess;

      expect(current.display).toMatch(/£\d+/);
      expect(regular.display).toMatch(/£\d+/);
    });
  });
});
