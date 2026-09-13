import { mapGroceryHome, mapGroceryProduct, mapGroceryProductPage } from '@/features/groceries/types';

describe('grocery API mappers', () => {
  it('maps a grocery product without using any', () => {
    const product = mapGroceryProduct({
      id: 9,
      name: 'Banana',
      price: '18.99',
      original_price: 22,
      unit: '1kg',
      brand: 'Kudya Fresh',
      stock: 12,
      on_sale: true,
      is_featured: true,
      is_favourite: false,
      discount_percentage: 15,
      images: ['http://127.0.0.1:8000/media/banana.jpg'],
      category: { id: 1, name: 'Fresh Produce', slug: 'fresh-produce', icon: 'leaf', image: null, show_in_nav: true },
      store: 2,
      store_name: 'Supermercado Central',
    });
    expect(product).toEqual({
      id: 9,
      name: 'Banana',
      description: '',
      price: 18.99,
      original_price: 22,
      unit: '1kg',
      brand: 'Kudya Fresh',
      stock: 12,
      on_sale: true,
      is_featured: true,
      is_favourite: false,
      discount_percentage: 15,
      images: ['http://127.0.0.1:8000/media/banana.jpg'],
      category: {
        id: 1,
        name: 'Fresh Produce',
        slug: 'fresh-produce',
        icon: 'leaf',
        image: null,
        show_in_nav: true,
      },
      store: 2,
      store_name: 'Supermercado Central',
      selling_unit: '1kg',
      stock_quantity: 12,
      stock_unit: '1kg',
      price_display: '',
      is_purchasable: true,
      inventory_status: '',
    });
  });

  it('unwraps paginated grocery products', () => {
    const page = mapGroceryProductPage({
      count: 1,
      next: null,
      previous: null,
      results: [{ id: 3, name: 'Milk', price: 8, images: [] }],
    });
    expect(page.count).toBe(1);
    expect(page.results[0].name).toBe('Milk');
  });

  it('maps grocery home collections', () => {
    const home = mapGroceryHome({
      hero: [{ id: 1, kind: 'hero', title: 'Groceries at your doorstep' }],
      benefits: [],
      promotions: [],
      categories: [{ id: 1, name: 'Baby', slug: 'baby' }],
      nav_categories: [],
      popular_products: [{ id: 2, name: 'Diapers' }],
      deals: [],
      deals_end_at: '2026-09-15T10:00:00Z',
      deals_title: 'Deals of the Week',
    });
    expect(home.hero[0].title).toBe('Groceries at your doorstep');
    expect(home.categories[0].slug).toBe('baby');
    expect(home.popular_products[0].name).toBe('Diapers');
    expect(home.deals_end_at).toBe('2026-09-15T10:00:00Z');
  });
});
