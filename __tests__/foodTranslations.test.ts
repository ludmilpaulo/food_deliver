import { foodBundles, foodT } from '../configs/foodTranslations';

describe('Food translations', () => {
  it('covers every key in Portuguese, French and Spanish', () => {
    const keys = Object.keys(foodBundles.en).sort();
    for (const locale of ['pt', 'fr', 'es'] as const) {
      expect(Object.keys(foodBundles[locale]).sort()).toEqual(keys);
      for (const key of keys) expect(foodBundles[locale][key].trim()).not.toBe('');
    }
  });

  it('keeps interpolation placeholders in every language', () => {
    const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();
    for (const key of Object.keys(foodBundles.en)) {
      const expected = placeholders(foodBundles.en[key]);
      for (const locale of ['pt', 'fr', 'es'] as const) {
        expect([key, placeholders(foodBundles[locale][key])]).toEqual([key, expected]);
      }
    }
  });

  it('serves per-locale copy and leaves unknown keys to the caller', () => {
    expect(foodT('pt', 'foodAddToCart')).toBe('Adicionar ao carrinho');
    expect(foodT('fr', 'foodPlaceOrder')).toBe('Commander');
    expect(foodT('en', 'notAFoodKey')).toBeUndefined();
  });
});
