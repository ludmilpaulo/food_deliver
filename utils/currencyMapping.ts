// utils/currencyMapping.ts

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'AOA' | 'BRL' | 'ZAR' | 'NGN' | 'KES' | 'GHS' | 'EGP' | 'MZN';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

// Country to Currency mapping
export const countryCurrencyMap: Record<string, CurrencyInfo> = {
  // Angola
  'AO': { code: 'AOA', symbol: 'Kz', name: 'Angolan Kwanza', locale: 'pt-AO' },
  'Angola': { code: 'AOA', symbol: 'Kz', name: 'Angolan Kwanza', locale: 'pt-AO' },
  
  // Mozambique
  'MZ': { code: 'MZN', symbol: 'MT', name: 'Mozambican Metical', locale: 'pt-MZ' },
  'Mozambique': { code: 'MZN', symbol: 'MT', name: 'Mozambican Metical', locale: 'pt-MZ' },
  
  // Portugal
  'PT': { code: 'EUR', symbol: '€', name: 'Euro', locale: 'pt-PT' },
  'Portugal': { code: 'EUR', symbol: '€', name: 'Euro', locale: 'pt-PT' },
  
  // Brazil
  'BR': { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
  'Brazil': { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
  
  // South Africa
  'ZA': { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
  'South Africa': { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
  
  // Nigeria
  'NG': { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', locale: 'en-NG' },
  'Nigeria': { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', locale: 'en-NG' },
  
  // Kenya
  'KE': { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', locale: 'en-KE' },
  'Kenya': { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', locale: 'en-KE' },
  
  // Ghana
  'GH': { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', locale: 'en-GH' },
  'Ghana': { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', locale: 'en-GH' },
  
  // Egypt
  'EG': { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', locale: 'ar-EG' },
  'Egypt': { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', locale: 'ar-EG' },
  
  // USA
  'US': { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  'United States': { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  
  // UK
  'GB': { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  'United Kingdom': { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
};

// Default currency (Angola)
export const defaultCurrency: CurrencyInfo = {
  code: 'AOA',
  symbol: 'Kz',
  name: 'Angolan Kwanza',
  locale: 'pt-AO'
};

/**
 * Get currency information based on country code or name
 */
export function getCurrencyByCountry(country: string): CurrencyInfo {
  if (!country) return defaultCurrency;
  
  // Try exact match first
  const currency = countryCurrencyMap[country];
  if (currency) return currency;
  
  // Try case-insensitive search
  const lowerCountry = country.toLowerCase();
  const matchingKey = Object.keys(countryCurrencyMap).find(
    key => key.toLowerCase() === lowerCountry
  );
  
  if (matchingKey) {
    return countryCurrencyMap[matchingKey];
  }
  
  return defaultCurrency;
}

/**
 * Format price with currency based on country
 */
export function formatCurrencyByCountry(
  amount: number,
  country: string,
  language: string = 'en'
): string {
  const currencyInfo = getCurrencyByCountry(country);
  
  try {
    // Use Intl.NumberFormat for proper currency formatting
    const formatter = new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currencyInfo.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return formatter.format(amount);
  } catch (error) {
    // Fallback to manual formatting if Intl fails
    return `${currencyInfo.symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Get currency symbol for a country
 */
export function getCurrencySymbol(country: string): string {
  return getCurrencyByCountry(country).symbol;
}

/**
 * Detect user's country from browser
 */
export async function detectUserCountry(): Promise<string> {
  try {
    // Try to get from navigator.language
    const browserLocale = navigator.language || 'en-US';
    const countryCode = browserLocale.split('-')[1];
    
    if (countryCode && countryCurrencyMap[countryCode]) {
      return countryCode;
    }
    
    // Try geolocation API
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return data.country_code || 'AO'; // Default to Angola
  } catch (error) {
    console.error('Error detecting country:', error);
    return 'AO'; // Default to Angola
  }
}

