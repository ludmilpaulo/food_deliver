'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { FiHeart, FiHome, FiGrid, FiClipboard, FiUser } from 'react-icons/fi';
import { useTranslation } from '@/hooks/useTranslation';
import { selectUser } from '@/redux/slices/authSlice';
import { useAppSelector } from '@/redux/store';

export default function GroceryBottomNav() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const params = useSearchParams();
  const user = useAppSelector(selectUser);
  const section = params.get('section');
  const items = [
    { href: '/groceries', id: 'home', label: t('home', 'Home'), icon: FiHome },
    { href: '/groceries?section=categories', id: 'categories', label: t('categories', 'Categories'), icon: FiGrid },
    { href: '/orders', id: 'orders', label: t('orders', 'Orders'), icon: FiClipboard },
    { href: '/groceries?section=favourites', id: 'favourites', label: t('favourites', 'Favourites'), icon: FiHeart },
    {
      href: user ? '/UserDashboard' : '/LoginScreenUser',
      id: 'account',
      label: t('account', 'Account'),
      icon: FiUser,
    },
  ];

  return (
    <nav
      className="grocery-bottom-nav"
      aria-label={t('groceryNavigation', 'Grocery navigation')}
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const active =
            item.id === 'home'
              ? pathname === '/groceries' && !section
              : item.id === 'categories'
                ? section === 'categories'
                : item.id === 'favourites'
                  ? section === 'favourites'
                  : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`flex min-h-[64px] flex-col items-center justify-center gap-1 text-[11px] font-semibold ${
                  active ? 'text-[#0B8F45]' : 'text-[#6B7280]'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
