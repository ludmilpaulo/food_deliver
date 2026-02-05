import {
  getCurrencyForCountry,
  formatCurrency,
  getUserRegion,
  setUserRegion,
  CurrencyCode,
  RegionCode,
} from '@/utils/currency';

describe('Currency Utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getCurrencyForCountry', () => {
    it('should return correct currency for Angola', () => {
      expect(getCurrencyForCountry('AO')).toBe('AOA');
    });

    it('should return correct currency for South Africa', () => {
      expect(getCurrencyForCountry('ZA')).toBe('ZAR');
    });

    it('should return USD as default for unknown region', () => {
      expect(getCurrencyForCountry('XX')).toBe('USD');
    });

    it('should return USD as default when region is undefined', () => {
      expect(getCurrencyForCountry(undefined)).toBe('USD');
    });
  });

  describe('formatCurrency', () => {
    it('should format USD currency correctly', () => {
      const formatted = formatCurrency(100, 'USD', 'en');
      expect(formatted).toContain('100');
    });

    it('should format EUR currency correctly', () => {
      const formatted = formatCurrency(50, 'EUR', 'en');
      expect(formatted).toContain('50');
    });

    it('should return empty string for invalid amount', () => {
      expect(formatCurrency(undefined, 'USD')).toBe('');
      expect(formatCurrency(null, 'USD')).toBe('');
      expect(formatCurrency(NaN, 'USD')).toBe('');
    });

    it('should handle zero amount', () => {
      const formatted = formatCurrency(0, 'USD', 'en');
      expect(formatted).toBeDefined();
    });
  });

  describe('getUserRegion and setUserRegion', () => {
    it('should return default region when none is set', () => {
      expect(getUserRegion()).toBe('AO');
    });

    it('should set and get user region', () => {
      setUserRegion('ZA');
      expect(getUserRegion()).toBe('ZA');
    });

    it('should persist region in localStorage', () => {
      setUserRegion('MZ');
      const stored = localStorage.getItem('userRegion');
      expect(stored).toBe('MZ');
    });
  });
});
