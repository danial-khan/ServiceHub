import { renderHook, act } from '@testing-library/react-native';
import { useFoodStore } from '../modules/food/src/store';
import { MenuItem } from '../modules/food/src/data';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

const mockMenuItem: MenuItem = {
  id: 'item1',
  restaurantId: 'rest1',
  name: 'Test Burger',
  description: 'A delicious test burger',
  price: 9.99,
  category: 'Burgers',
};

describe('Food Cart Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('should start with empty cart', () => {
    const { result } = renderHook(() => useFoodStore());

    expect(result.current.cart).toHaveLength(0);
    expect(result.current.getCartTotal()).toBe(0);
    expect(result.current.getCartItemCount()).toBe(0);
  });

  it('should add item to cart', async () => {
    const { result } = renderHook(() => useFoodStore());

    await act(async () => {
      await result.current.addToCart({
        menuItem: mockMenuItem,
        quantity: 1,
      });
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].menuItem.id).toBe('item1');
    expect(result.current.cart[0].quantity).toBe(1);
    expect(result.current.getCartItemCount()).toBe(1);
  });

  it('should increase quantity when adding same item', async () => {
    const { result } = renderHook(() => useFoodStore());

    await act(async () => {
      await result.current.addToCart({
        menuItem: mockMenuItem,
        quantity: 1,
      });
    });

    await act(async () => {
      await result.current.addToCart({
        menuItem: mockMenuItem,
        quantity: 2,
      });
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].quantity).toBe(3);
    expect(result.current.getCartItemCount()).toBe(3);
  });

  it('should calculate cart total correctly', async () => {
    const { result } = renderHook(() => useFoodStore());

    await act(async () => {
      await result.current.addToCart({
        menuItem: mockMenuItem,
        quantity: 2,
      });
    });

    expect(result.current.getCartTotal()).toBe(19.98);
  });

  it('should update item quantity', async () => {
    const { result } = renderHook(() => useFoodStore());

    await act(async () => {
      await result.current.addToCart({
        menuItem: mockMenuItem,
        quantity: 1,
      });
    });

    await act(async () => {
      await result.current.updateQuantity('item1', 3);
    });

    expect(result.current.cart[0].quantity).toBe(3);
    expect(result.current.getCartTotal()).toBe(29.97);
  });

  it('should remove item when quantity set to 0', async () => {
    const { result } = renderHook(() => useFoodStore());

    await act(async () => {
      await result.current.addToCart({
        menuItem: mockMenuItem,
        quantity: 1,
      });
    });

    expect(result.current.cart).toHaveLength(1);

    await act(async () => {
      await result.current.updateQuantity('item1', 0);
    });

    expect(result.current.cart).toHaveLength(0);
  });

  it('should remove item from cart', async () => {
    const { result } = renderHook(() => useFoodStore());

    await act(async () => {
      await result.current.addToCart({
        menuItem: mockMenuItem,
        quantity: 1,
      });
    });

    await act(async () => {
      await result.current.removeFromCart('item1');
    });

    expect(result.current.cart).toHaveLength(0);
  });

  it('should clear cart', async () => {
    const { result } = renderHook(() => useFoodStore());

    await act(async () => {
      await result.current.addToCart({
        menuItem: mockMenuItem,
        quantity: 2,
      });
    });

    expect(result.current.cart).toHaveLength(1);

    await act(async () => {
      await result.current.clearCart();
    });

    expect(result.current.cart).toHaveLength(0);
    expect(result.current.currentRestaurantId).toBeNull();
  });

  it('should place order and clear cart', async () => {
    const { result } = renderHook(() => useFoodStore());

    await act(async () => {
      await result.current.addToCart({
        menuItem: mockMenuItem,
        quantity: 2,
      });
    });

    await act(async () => {
      await result.current.placeOrder({
        restaurantName: 'Test Restaurant',
        items: result.current.cart,
        subtotal: 19.98,
        deliveryFee: 2.99,
        total: 22.97,
        deliveryAddress: '123 Test St',
      });
    });

    expect(result.current.cart).toHaveLength(0);
    expect(result.current.orders).toHaveLength(1);
    expect(result.current.orders[0].status).toBe('preparing');
    expect(result.current.orders[0].total).toBe(22.97);
  });

  it('should persist cart to AsyncStorage', async () => {
    const { result } = renderHook(() => useFoodStore());

    await act(async () => {
      await result.current.addToCart({
        menuItem: mockMenuItem,
        quantity: 1,
      });
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@servicehub:food_cart',
      expect.any(String)
    );
  });
});
