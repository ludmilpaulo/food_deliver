import { buildPageMetadata } from '@/configs/seo';

export const metadata = buildPageMetadata('faq', '/FAQ');

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children;
}
