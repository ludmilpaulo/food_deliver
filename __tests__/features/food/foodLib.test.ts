import { activeFilterCount, filtersFromParams, filtersToParams } from '@/features/food/lib/filters';
import { parseRestaurantSlug, restaurantSlug } from '@/features/food/lib/slug';
import { addonExtra, toggleAddon, validateAddonSelection } from '@/features/food/lib/addonSelection';
import { cartLineKey, foodCartItems, toQuoteLines } from '@/features/food/lib/cartLines';
import { displayUnitPrice } from '@/features/food/lib/money';
import { validateCheckoutForm, type CheckoutForm } from '@/features/food/schemas/checkout';
import type { ProductAddonGroup } from '@/features/food/types';
import type { CartItem } from '@/services/types';

describe('food filters', () => {
  it('round-trips URL params and drops malformed values', () => {
    const params = new URLSearchParams(
      'search=pizza&cuisine=italian&open_now=true&pickup=false&price_level=3,1,9&min_rating=4&max_delivery_fee=abc&ordering=bogus',
    );
    const filters = filtersFromParams(params);
    expect(filters).toEqual({
      search: 'pizza',
      cuisine: 'italian',
      open_now: true,
      pickup: false,
      price_level: [1, 3],
      min_rating: 4,
    });
    expect(filtersToParams(filters)).toEqual({
      search: 'pizza',
      cuisine: 'italian',
      open_now: 'true',
      pickup: 'false',
      price_level: '1,3',
      min_rating: '4',
    });
    expect(activeFilterCount(filters)).toBe(5);
  });

  it('only keeps distance filters when a location is known', () => {
    expect(filtersFromParams(new URLSearchParams('ordering=distance&radius_km=5'))).toEqual({});
    expect(filtersFromParams(new URLSearchParams('lat=-26.2&lng=28.04&radius_km=5&ordering=distance'))).toEqual({
      lat: -26.2,
      lng: 28.04,
      radius_km: 5,
      ordering: 'distance',
    });
  });
});

describe('restaurant slugs', () => {
  it('builds readable slugs and trusts only the numeric id', () => {
    expect(restaurantSlug({ id: 12, name: 'Café Ñandú & Grill' })).toBe('12-cafe-nandu-grill');
    expect(parseRestaurantSlug('12-cafe-nandu-grill')).toBe(12);
    expect(parseRestaurantSlug('12')).toBe(12);
    expect(parseRestaurantSlug('pizza-12')).toBeNull();
    expect(parseRestaurantSlug('0-x')).toBeNull();
  });
});

const groups: ProductAddonGroup[] = [
  {
    id: 1,
    name: 'Size',
    required: true,
    min_select: 1,
    max_select: 1,
    addons: [
      { id: 10, name: 'Regular', price: '0.00' },
      { id: 11, name: 'Large', price: '15.00' },
    ],
  },
  {
    id: 2,
    name: 'Extras',
    required: false,
    min_select: 0,
    max_select: 2,
    addons: [
      { id: 20, name: 'Cheese', price: '7.50' },
      { id: 21, name: 'Bacon', price: '12.00' },
      { id: 22, name: 'Egg', price: '5.00' },
    ],
  },
];

describe('add-on selection', () => {
  it('requires the required group and respects maximums', () => {
    expect(validateAddonSelection(groups, []).errors).toEqual({ 1: { key: 'foodChooseAtLeast', count: 1 } });
    expect(validateAddonSelection(groups, [11, 20]).valid).toBe(true);
    expect(validateAddonSelection(groups, [11, 20, 21, 22]).errors).toEqual({ 2: { key: 'foodChooseUpTo', count: 2 } });
  });

  it('treats single-choice groups like radio buttons and caps multi-choice groups', () => {
    expect(toggleAddon(groups[0], [10], 11)).toEqual([11]);
    expect(toggleAddon(groups[1], [20, 21], 22)).toEqual([20, 21]);
    expect(toggleAddon(groups[1], [20, 21], 21)).toEqual([20]);
    expect(addonExtra(groups, [11, 20])).toBe(22.5);
  });
});

describe('cart lines', () => {
  const base: CartItem = { id: 5, name: 'Burger', price: 100, size: '', color: '', quantity: 2, store: 1, vertical: 'food' };

  it('separates the same product with different extras or notes', () => {
    const plain = cartLineKey(base);
    expect(cartLineKey({ ...base, addon_ids: [21, 20] })).toBe(cartLineKey({ ...base, addon_ids: [20, 21] }));
    expect(cartLineKey({ ...base, addon_ids: [20] })).not.toBe(plain);
    expect(cartLineKey({ ...base, special_instructions: 'No onions' })).not.toBe(plain);
  });

  it('sends only ids, quantities and options to the quote API', () => {
    const lines = toQuoteLines([{ ...base, addon_ids: [20], special_instructions: 'No onions' }]);
    expect(lines).toEqual([
      { key: cartLineKey({ ...base, addon_ids: [20], special_instructions: 'No onions' }), product_id: 5, quantity: 2, addons: [20], special_instructions: 'No onions' },
    ]);
    expect(lines[0]).not.toHaveProperty('price');
    expect(foodCartItems([base, { ...base, id: 6, vertical: undefined }])).toHaveLength(1);
  });

  it('shows the sale price like the server unit price', () => {
    expect(displayUnitPrice({ price: 103, on_sale: true, discount_percentage: 10 })).toBe(92.7);
    expect(displayUnitPrice({ price: '50.00' })).toBe(50);
  });
});

describe('checkout form validation', () => {
  const valid: CheckoutForm = {
    fulfilment: 'delivery',
    address: '1 Main Road',
    useCurrentLocation: false,
    coords: null,
    paymentMethod: 'cash',
    termsAccepted: true,
    deliveryNotes: '',
  };

  it('accepts a complete delivery and a pickup without address', () => {
    expect(validateCheckoutForm(valid)).toBeNull();
    expect(validateCheckoutForm({ ...valid, fulfilment: 'pickup', address: '' })).toBeNull();
  });

  it('reports the first missing requirement', () => {
    expect(validateCheckoutForm({ ...valid, address: ' ' })).toBe('foodAddressRequired');
    expect(validateCheckoutForm({ ...valid, address: '', useCurrentLocation: true })).toBe('foodLocationUnavailable');
    expect(validateCheckoutForm({ ...valid, paymentMethod: '' })).toBe('foodPaymentMethodRequired');
    expect(validateCheckoutForm({ ...valid, termsAccepted: false })).toBe('foodAcceptTerms');
    expect(validateCheckoutForm({ ...valid, deliveryNotes: 'x'.repeat(501) })).toBe('foodNotesTooLong');
  });
});
