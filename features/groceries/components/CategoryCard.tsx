'use client';

import Link from 'next/link';
import GroceryImage from './GroceryImage';
import type { GroceryCategory } from '../types';

export default function CategoryCard({ category }: { category: GroceryCategory }) {
  return (
    <Link
      href={`/groceries/category/${category.slug}`}
      className="group flex w-28 shrink-0 flex-col items-center sm:w-32"
    >
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_8px_20px_rgba(17,24,39,0.06)] ring-1 ring-[#E5E7EB] transition group-hover:shadow-lg group-hover:ring-[#0B8F45] sm:h-28 sm:w-28">
        <GroceryImage src={category.image} alt={category.name} className="h-full w-full object-cover" />
      </div>
      <span className="mt-2 line-clamp-2 text-center text-sm font-medium text-[#111827]">{category.name}</span>
    </Link>
  );
}
