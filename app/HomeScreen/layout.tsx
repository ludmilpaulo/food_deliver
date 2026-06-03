import { buildRootMetadata } from '@/configs/seo';

export const metadata = buildRootMetadata('en');

export default function HomeScreenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
