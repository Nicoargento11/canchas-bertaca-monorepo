// stores/product-store.ts
import { create } from "zustand";
import { Product } from "@/services/product/product";
import {
  createInventoryMovement,
  InventoryMovement,
} from "@/services/inventory-movement.ts/inventory-movement";
import { ProductSale } from "@/services/product-sale.ts/product-sale";

type ProductStore = {
  products: Product[];
  movements: InventoryMovement[];
  addProduct: (product: Product) => void;
  initialized: boolean;
  initializeProducts: (products: Product[]) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  setProducts: (products: Product[]) => void;

  addMovement: (
    movement: Omit<InventoryMovement, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  processSaleMovement: (
    sale: Omit<InventoryMovement, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
};

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  movements: [],
  initialized: false,

  addProduct: (product) =>
    set((state) => ({
      products: [
        ...state.products,
        {
          ...product,
        },
      ],
    })),

  initializeProducts: (products) =>
    set((state) => {
      // Solo inicializa si no está ya inicializado
      if (!state.initialized) {
        return { products, initialized: true };
      }
      return state;
    }),
  updateProduct: (id, updates) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ),
    })),
  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),
  setProducts: (products) => set({ products }),

  addMovement: async (movement) => {
    try {
      const { success, data, error } = await createInventoryMovement(movement);
      if (!success || !data) {
        throw new Error(error || "Error desconocido");
      }

      set((state) => ({
        movements: [...state.movements, data],
        products: state.products.map((p) =>
          p.id === movement.productId
            ? {
                ...p,
                stock:
                  p.stock + (movement.type === "COMPRA" ? movement.quantity : -movement.quantity),
              }
            : p
        ),
      }));
    } catch (error) {
      console.error("Error al registrar movimiento:", error);
      throw error;
    }
  },

  // Procesar movimiento por venta
  processSaleMovement: async (sale) => {
    await useProductStore.getState().addMovement(sale);
  },
}));
