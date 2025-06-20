import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// Product type is not directly stored in cart item anymore, but its details are spread.
// We might still need ProductWithVariants if we want to fetch full product details from cart.

// New CartItem definition
export interface CartItem {
  id: string; // Composite key: `productId-variantId`
  productId: number;
  name: string; // Product name
  variant: {
    id: number;
    size: string;
    price: number; // Store as number
    image_url: string;
  };
  quantity: number;
  price: number; // Price of this specific variant at the time of adding to cart
}

interface CartStore {
  items: CartItem[];
  addItem: (itemDetails: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (cartItemId: string) => void; // Use composite ID
  updateQuantity: (cartItemId: string, quantity: number) => void; // Use composite ID
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (itemDetails: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === itemDetails.id);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === itemDetails.id
                  ? { ...item, quantity: item.quantity + (itemDetails.quantity || 1) }
                  : item
              ),
            };
          } else {
            return {
              items: [...state.items, { ...itemDetails, quantity: itemDetails.quantity || 1 }],
            };
          }
        });
      },

      removeItem: (cartItemId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== cartItemId),
        }));
      },

      updateQuantity: (cartItemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) => (item.id === cartItemId ? { ...item, quantity } : item)),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          return total + item.price * item.quantity; // item.price is already a number
        }, 0);
      },
    }),
    {
      name: 'gsr-cart-storage',
    }
  )
);

export function isValidCartItem(item: any): item is CartItem {
  return (
    typeof item === "object" &&
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    typeof item.quantity === "number" &&
    item.variant && typeof item.variant.image_url === "string"
  );
}
