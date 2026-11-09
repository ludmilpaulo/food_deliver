import reducer, { addItem, removeItem, removeLine, setItemQuantity } from '@/redux/slices/basketSlice';
import type { CartItem } from '@/services/types';

const burger: CartItem = { id: 5, name: 'Burger', price: 100, size: '', color: '', quantity: 1, store: 1, vertical: 'food' };

function stateWith(items: CartItem[]) {
  return { items, hydrated: true };
}

describe('basket lines with food options', () => {
  it('keeps differently customised items as separate lines and merges identical ones', () => {
    let state = reducer(stateWith([]), addItem(burger));
    state = reducer(state, addItem({ ...burger, addon_ids: [20], price: 107.5 }));
    state = reducer(state, addItem({ ...burger, addon_ids: [20], price: 107.5, quantity: 2 }));
    expect(state.items).toHaveLength(2);
    expect(state.items[1].quantity).toBe(3);
  });

  it('updates and removes only the targeted line', () => {
    const cheese = { ...burger, addon_ids: [20] };
    let state = stateWith([{ ...burger, quantity: 2 }, { ...cheese, quantity: 2 }]);
    state = reducer(state, setItemQuantity({ ...cheese, quantity: 5 }));
    expect(state.items.map((item) => item.quantity)).toEqual([2, 5]);
    state = reducer(state, removeItem(burger));
    expect(state.items.map((item) => item.quantity)).toEqual([1, 5]);
    state = reducer(state, removeLine(cheese));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].addon_ids).toBeUndefined();
  });

  it('still matches legacy lines by id, size and colour', () => {
    const shirt: CartItem = { id: 9, name: 'Shirt', price: 50, size: 'M', color: 'red', quantity: 1, store: 2 };
    let state = reducer(stateWith([shirt]), addItem({ ...shirt, quantity: 1 }));
    expect(state.items[0].quantity).toBe(2);
    state = reducer(state, removeLine({ id: 9, size: 'M', color: 'red' }));
    expect(state.items).toHaveLength(0);
  });
});
