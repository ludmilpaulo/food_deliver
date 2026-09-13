'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { FiSearch, FiShoppingCart, FiUser, FiBell, FiMapPin, FiMenu, FiX } from 'react-icons/fi';
import logo from '@/assets/azul.png';
import { selectUser } from '@/redux/slices/authSlice';
import { selectCartItems } from '@/redux/slices/basketSlice';
import { useAppSelector } from '@/redux/store';
import { useTranslation } from '@/hooks/useTranslation';
import type { GroceryCategory } from '../types';
import GrocerySearch from './GrocerySearch';

export default function GroceryHeader({
  categories,
  search,
  onSearchChange,
  locationLabel,
}: {
  categories: GroceryCategory[];
  search: string;
  onSearchChange: (value: string) => void;
  locationLabel: string;
}) {
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);
  const cartItems = useAppSelector(selectCartItems);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const navItems = useMemo(
    () => [
      { href: '/groceries', label: t('groceries', 'Groceries') },
      ...categories.filter((category) => category.show_in_nav).map((category) => ({
        href: `/groceries/category/${category.slug}`,
        label: category.name,
      })),
      { href: '/groceries?section=deals', label: t('deals', 'Deals') },
    ],
    [categories, t],
  );

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white">
      <div className="mx-auto hidden max-w-7xl items-center gap-6 px-4 py-3 md:flex lg:px-6">
        <Link href="/groceries" className="flex shrink-0 items-center gap-2">
          <Image src={logo} alt={t('kudyaLogoAlt', 'Kudya')} width={40} height={40} className="rounded-xl" />
          <span className="grocery-brand text-xl">Kudya</span>
        </Link>
        <nav className="flex flex-1 items-center justify-center gap-1" aria-label={t('groceryNavigation', 'Grocery categories')}>
          {navItems.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-[#111827] hover:bg-[#EAF7EE] hover:text-[#056B34]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          {desktopSearchOpen ? (
            <div className="w-64">
              <GrocerySearch value={search} onChange={onSearchChange} compact />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setDesktopSearchOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-[#111827] hover:bg-[#EAF7EE]"
              aria-label={t('search', 'Search')}
            >
              <FiSearch size={20} />
            </button>
          )}
          <Link
            href="/CartPage"
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-[#111827] hover:bg-[#EAF7EE]"
            aria-label={`${t('Cart', 'Cart')} ${cartCount}`}
          >
            <FiShoppingCart size={20} />
            {cartCount > 0 ? (
              <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0B8F45] px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
          <Link
            href={user ? '/UserDashboard' : '/LoginScreenUser'}
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#111827] hover:bg-[#EAF7EE]"
            aria-label={user ? t('Profile', 'Account') : t('login', 'Sign in')}
          >
            <FiUser size={20} />
          </Link>
        </div>
      </div>

      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-[#EAF7EE]"
              aria-label={mobileMenuOpen ? t('closeMenu', 'Close menu') : t('openMenu', 'Open menu')}
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
            <Link href="/groceries" className="flex items-center gap-2">
              <Image src={logo} alt={t('kudyaLogoAlt', 'Kudya')} width={36} height={36} className="rounded-xl" />
              <span className="grocery-brand text-lg">Kudya</span>
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/notifications"
              className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-[#EAF7EE]"
              aria-label={t('notifications', 'Notifications')}
            >
              <FiBell size={20} />
            </Link>
            <Link
              href="/CartPage"
              className="relative flex h-11 w-11 items-center justify-center rounded-full hover:bg-[#EAF7EE]"
              aria-label={`${t('Cart', 'Cart')} ${cartCount}`}
            >
              <FiShoppingCart size={20} />
              {cartCount > 0 ? (
                <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0B8F45] px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 pb-2 text-sm text-[#6B7280]">
          <FiMapPin className="text-[#0B8F45]" />
          <span className="truncate">{locationLabel}</span>
        </div>
        <div className="px-4 pb-3">
          <GrocerySearch value={search} onChange={onSearchChange} />
        </div>
        {mobileMenuOpen ? (
          <nav className="space-y-1 border-t border-[#E5E7EB] px-4 py-3" aria-label={t('groceryNavigation', 'Grocery categories')}>
            {navItems.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl px-3 py-3 text-sm font-medium text-[#111827] hover:bg-[#EAF7EE]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
