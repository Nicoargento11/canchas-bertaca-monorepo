import { Product } from "@/services/product/product";
import { create } from "zustand";

type CartItem = {
  product: Product;
  quantity: number;
  price: number;
  discount: number;
  isGift: boolean;
};

type CartStore = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  updateCartItem: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  applyDiscount: (productId: string, discount: number) => void;
  toggleGift: (productId: string) => void;
};

export const useCartStore = create<CartStore>((set) => ({
  cart: [],
  addToCart: (item) =>
    set((state) => {
      const existing = state.cart.find((i) => i.product.id === item.product.id);
      if (existing) {
        return {
          cart: state.cart.map((i) =>
            i.product.id === item.product.id
              ? { ...i, quantity: i.quantity + (item.quantity || 1) }
              : i
          ),
        };
      }
      return {
        cart: [
          ...state.cart,
          {
            ...item,
            quantity: item.quantity || 1,
            discount: item.discount || 0,
            isGift: item.isGift || false,
          },
        ],
      };
    }),
  updateCartItem: (productId, quantity) =>
    set((state) => ({
      cart: state.cart
        .map((item) => (item.product.id === productId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    })),
  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.product.id !== productId),
    })),
  clearCart: () => set({ cart: [] }),
  applyDiscount: (productId, discount) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.product.id === productId ? { ...item, discount } : item
      ),
    })),
  toggleGift: (productId) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.product.id === productId ? { ...item, isGift: !item.isGift } : item
      ),
    })),
}));
