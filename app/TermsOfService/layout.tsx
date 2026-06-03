import { buildPageMetadata } from '@/configs/seo';

export const metadata = buildPageMetadata('terms', '/TermsOfService');

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
