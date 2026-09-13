'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiHeart, FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi';

import {
  useAddGroceryFavouriteMutation,
  useRemoveGroceryFavouriteMutation,
} from '@/redux/slices/groceriesApi';
import { addItem, removeItem, selectCartItems } from '@/redux/slices/basketSlice';
import { selectUser } from '@/redux/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { formatCurrency, getCurrencyForCountry } from '@/utils/currency';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserRegion } from '@/hooks/useUserRegion';
import GroceryImage from './GroceryImage';
import type { GroceryProduct } from '../types';
import { groceryProductImage } from '../types';

export default function GroceryProductCard({
  product,
  compact = false,
}: {
  product: GroceryProduct;
  compact?: boolean;
}) {
  const { t, languageCode } = useTranslation();
  const { region } = useUserRegion();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const cartItems = useAppSelector(selectCartItems);
  const [addFavourite] = useAddGroceryFavouriteMutation();
  const [removeFavourite] = useRemoveGroceryFavouriteMutation();

  const cartItem = cartItems.find((item) => item.id === product.id);
  const quantity = cartItem?.quantity ?? 0;
  const currency = getCurrencyForCountry(region);
  const unit = product.selling_unit || product.unit || 'item';
  const step = unit === 'kg' || unit === 'litre' ? 0.5 : 1;
  const outOfStock = product.is_purchasable === false || product.stock_quantity <= 0 || product.stock <= 0;
  const showOriginal = product.on_sale && product.discount_percentage > 0 && product.original_price > product.price;

  async function toggleFavourite(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!user) {
      router.push('/LoginScreenUser');
      return;
    }
    if (product.is_favourite) {
      await removeFavourite(product.id);
      return;
    }
    await addFavourite(product.id);
  }

  function addToCart(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (outOfStock) return;
    dispatch(
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: groceryProductImage(product),
        store: product.store,
        size: '',
        color: '',
        quantity: step,
        selling_unit: unit,
      }),
    );
  }

  function decrease(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    dispatch(removeItem({ id: product.id }));
  }

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-[0_8px_24px_rgba(17,24,39,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(17,24,39,0.08)]">
      <Link href={`/products/${product.id}`} className="flex flex-1 flex-col" aria-label={product.name}>
        <div className="relative mb-3 aspect-square overflow-hidden rounded-2xl bg-[#F8FAF9]">
          <GroceryImage
            src={groceryProductImage(product)}
            alt={product.name}
            className="h-full w-full p-3 object-contain"
          />
          {product.discount_percentage > 0 && product.on_sale ? (
            <span className="absolute left-2 top-2 rounded-full bg-[#0B8F45] px-2 py-1 text-[11px] font-bold text-white">
              -{product.discount_percentage}%
            </span>
          ) : null}
          <button
            type="button"
            onClick={toggleFavourite}
            aria-pressed={product.is_favourite}
            aria-label={
              product.is_favourite
                ? t('removeFromWishlist', 'Remove from favourites')
                : t('addToWishlist', 'Add to favourites')
            }
            className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[#6B7280] shadow-sm hover:text-[#0B8F45]"
          >
            <FiHeart className={product.is_favourite ? 'fill-[#0B8F45] text-[#0B8F45]' : ''} size={18} />
          </button>
        </div>
        <h3 className="line-clamp-1 text-sm font-semibold text-[#111827] md:text-base">{product.name}</h3>
        {product.unit || product.selling_unit ? (
          <p className="mt-0.5 text-xs text-[#6B7280]">{product.unit || product.selling_unit}</p>
        ) : null}
        <div className="mt-2 flex items-baseline gap-2">
          {showOriginal ? (
            <span className="text-xs text-[#6B7280] line-through">
              {formatCurrency(product.original_price, currency, languageCode)}
            </span>
          ) : null}
          <span className="text-base font-bold text-[#111827]">
            {formatCurrency(product.price, currency, languageCode)}
          </span>
        </div>
      </Link>
      <div className="mt-3">
        {quantity > 0 ? (
          <div className="flex min-h-11 items-center justify-between rounded-xl bg-[#EAF7EE] px-2">
            <button
              type="button"
              onClick={decrease}
              aria-label={t('decreaseQuantity', 'Decrease quantity')}
              className="flex h-11 w-11 items-center justify-center text-[#0B8F45]"
            >
              <FiMinus />
            </button>
            <span className="min-w-[1.5rem] text-center font-bold text-[#056B34]">{quantity}</span>
            <button
              type="button"
              onClick={addToCart}
              aria-label={t('increaseQuantity', 'Increase quantity')}
              className="flex h-11 w-11 items-center justify-center text-[#0B8F45]"
            >
              <FiPlus />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={addToCart}
            disabled={outOfStock}
            className="grocery-add-btn disabled:cursor-not-allowed disabled:bg-[#9CA3AF]"
          >
            <FiShoppingCart />
            {outOfStock ? t('outOfStock', 'Out of stock') : compact ? t('add', 'Add') : t('add', 'Add')}
          </button>
        )}
      </div>
    </article>
  );
}
