'use client';

import { useTranslation } from '@/hooks/useTranslation';
import healthcareTranslations, {
  healthcareT,
  type HealthcareTranslationKey,
} from '@/configs/healthcareTranslations';

export function useHealthcareTranslation() {
  const { languageCode } = useTranslation();

  const ht = (key: HealthcareTranslationKey, fallback?: string) =>
    healthcareT(key, languageCode) || fallback || key;

  return { ht, languageCode, healthcareTranslations: healthcareTranslations[languageCode] };
}
