"use client";

import { useTranslation } from "@/hooks/useTranslation";
import doctorTranslations, {
  doctorT,
  type DoctorTranslationKey,
} from "@/configs/doctorTranslations";

export function useDoctorTranslation() {
  const { languageCode } = useTranslation();

  const dt = (key: DoctorTranslationKey, fallback?: string) =>
    doctorT(key, languageCode) || fallback || key;

  return { dt, languageCode, doctorTranslations: doctorTranslations[languageCode] };
}
