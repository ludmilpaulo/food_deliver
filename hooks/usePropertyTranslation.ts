import { useTranslation } from "@/hooks/useTranslation";
import propertyTranslations, {
  amenityLabel,
  approvalStatusLabel,
  defaultEnquiryMessage,
  enquiryStatusLabel,
  enquiryTypeLabel,
  listingTypeLabel,
  propertyT,
  propertyTypeLabel,
  purposeLabel,
  type PropertyTranslationKey,
} from "@/configs/propertyTranslations";

export function usePropertyTranslation() {
  const { languageCode } = useTranslation();

  const pt = (key: PropertyTranslationKey, fallback?: string) =>
    propertyT(key, languageCode) || fallback || key;

  return {
    pt,
    languageCode,
    propertyTranslations: propertyTranslations[languageCode],
    listingTypeLabel: (type: string) => listingTypeLabel(type, languageCode),
    propertyTypeLabel: (type: string) => propertyTypeLabel(type, languageCode),
    amenityLabel: (key: string) => amenityLabel(key, languageCode),
    purposeLabel: (purpose: string) => purposeLabel(purpose, languageCode),
    approvalStatusLabel: (status: string) => approvalStatusLabel(status, languageCode),
    enquiryStatusLabel: (status: string) => enquiryStatusLabel(status, languageCode),
    enquiryTypeLabel: (type: string) => enquiryTypeLabel(type, languageCode),
    defaultEnquiryMessage: (listingType: string, title: string) =>
      defaultEnquiryMessage(listingType, title, languageCode),
  };
}
