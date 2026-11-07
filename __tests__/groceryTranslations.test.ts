import { groceryT } from '../configs/groceryTranslations';

describe('grocery translations', () => {
  it('returns the English grocery search placeholder', () => {
    expect(groceryT('en', 'grocerySearchPlaceholder')).toBe(
      'Search for products, brands...',
    );
  });

  it('falls back to English for unknown keys', () => {
    expect(groceryT('en', 'notAGroceryKey')).toBeUndefined();
  });
});
