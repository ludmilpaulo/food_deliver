import { groceryPartnerT, groceryPartnerTranslationKeys } from '../configs/groceryPartnerTranslations';
import {
  groceryCategoryTranslationKey,
  groceryDiscountTypeTranslationKey,
  groceryPaymentStatusTranslationKey,
  grocerySubcategoryTranslationKey,
} from '../utils/groceryUnits';

describe('grocery partner translations', () => {
  it('translates dashboard chrome in Portuguese', () => {
    expect(groceryPartnerT('pt', 'gpDashboard')).toBe('Painel');
    expect(groceryPartnerT('pt', 'gpBrandTitle')).toBe('Kudya Mercearia');
    expect(groceryPartnerT('pt', 'gpOpenMenu')).toBe('Abrir menu');
  });

  it('translates category and subcategory labels', () => {
    expect(groceryCategoryTranslationKey('fresh-produce')).toBe('gpCatFreshProduce');
    expect(groceryPartnerT('pt', 'gpCatFreshProduce')).toBe('Frescos');
    expect(grocerySubcategoryTranslationKey('Rice & Grains')).toBe('gpSubRiceGrains');
    expect(groceryPartnerT('fr', 'gpSubRiceGrains')).toBe('Riz et céréales');
  });

  it('translates payment and discount types', () => {
    expect(groceryPaymentStatusTranslationKey('unpaid')).toBe('gpPaymentUnpaid');
    expect(groceryPartnerT('es', 'gpPaymentUnpaid')).toBe('Pendiente de pago');
    expect(groceryDiscountTypeTranslationKey('bogo')).toBe('gpDiscountBogo');
    expect(groceryPartnerT('pt', 'gpDiscountBogo')).toBe('Leve 2 pague 1');
  });

  it('covers every partner key in all locales without English leftovers for chrome', () => {
    const chrome = [
      'gpDashboard',
      'gpOrders',
      'gpProducts',
      'gpInventory',
      'gpAddProduct',
      'gpChooseImage',
      'gpNext',
      'gpBack',
      'gpPublish',
      'gpLogout',
      'gpHelp',
    ] as const;
    for (const key of groceryPartnerTranslationKeys) {
      expect(groceryPartnerT('en', key)).toBeTruthy();
      expect(groceryPartnerT('pt', key)).toBeTruthy();
      expect(groceryPartnerT('fr', key)).toBeTruthy();
      expect(groceryPartnerT('es', key)).toBeTruthy();
    }
    for (const key of chrome) {
      const en = groceryPartnerT('en', key)!;
      expect(groceryPartnerT('pt', key)).not.toBe(en);
      expect(groceryPartnerT('fr', key)).not.toBe(en);
      expect(groceryPartnerT('es', key)).not.toBe(en);
    }
  });

  it('falls back to English for unknown partner keys', () => {
    expect(groceryPartnerT('en', 'notAGroceryPartnerKey')).toBeUndefined();
  });
});
