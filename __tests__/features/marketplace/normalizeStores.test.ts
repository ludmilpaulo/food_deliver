import { normalizeV1Stores, verticalApiPath } from '@/features/marketplace/lib/normalizeStores';

describe('grocery store normalization', () => {
  it('maps grocery logos onto images for the store cards', () => {
    const stores = normalizeV1Stores([
      {
        id: 2,
        name: 'Supermercado Central',
        phone: '1',
        address: 'Luanda',
        logo: 'http://127.0.0.1:8000/media/grocery.png',
        store_type: { id: 2, name: 'Grocery' },
        category: { id: 2, name: 'Supermercados' },
        barnner: false,
        is_approved: true,
        opening_hours: [],
      },
    ]);
    expect(stores).toHaveLength(1);
    expect(stores[0].name).toBe('Supermercado Central');
    expect(stores[0].logo).toBe('http://127.0.0.1:8000/media/grocery.png');
    expect(stores[0].images).toBe('http://127.0.0.1:8000/media/grocery.png');
    expect(stores[0].store_type).toBe(2);
    expect(stores[0].category?.name).toBe('Supermercados');
  });

  it('points groceries at the v1 grocery catalog', () => {
    expect(verticalApiPath('groceries')).toBe('/api/v1/groceries/stores/');
  });
});
