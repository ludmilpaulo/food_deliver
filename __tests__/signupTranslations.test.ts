import { signupT } from '../configs/signupTranslations';

describe('signup translations', () => {
  it('returns Portuguese hero title', () => {
    expect(signupT('pt', 'signupHeroTitle')).toBe('Crie a sua conta Kudya');
  });

  it('returns Portuguese login hero title', () => {
    expect(signupT('pt', 'loginHeroTitle')).toBe('Bem-vindo de volta');
  });

  it('returns French password hint', () => {
    expect(signupT('fr', 'passwordHint')).toBe('Utilisez au moins 8 caractères.');
  });

  it('falls back to English for unknown keys', () => {
    expect(signupT('en', 'notASignupKey')).toBeUndefined();
  });
});
