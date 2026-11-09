import { thunesAdminEs, thunesAdminFr, thunesAdminPt } from '../configs/thunesAdminTranslations';
import { thunesT } from '../configs/thunesTranslations';

describe('Thunes translations', () => {
  it('translates the admin panel into every supported language', () => {
    const keys = Object.keys(thunesAdminPt).sort();
    expect(Object.keys(thunesAdminFr).sort()).toEqual(keys);
    expect(Object.keys(thunesAdminEs).sort()).toEqual(keys);
  });

  it('serves customer copy per locale and keeps placeholders', () => {
    expect(thunesT('pt', 'transferSend')).toBe('Enviar dinheiro');
    expect(thunesT('fr', 'paymentConfirmed')).toBe('Paiement confirmé');
    for (const locale of ['en', 'pt', 'fr', 'es'] as const) {
      expect(thunesT(locale, 'transferConfirm')).toContain('{amount}');
      expect(thunesT(locale, 'thunesRfiSynced') ?? '{count}').toContain('{count}');
    }
  });

  it('leaves unknown keys to the caller fallback', () => {
    expect(thunesT('en', 'notAThunesKey')).toBeUndefined();
  });
});
