import { buildPageMetadata } from '@/configs/seo';

export const metadata = buildPageMetadata('privacy', '/PrivacyPolicy');

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
