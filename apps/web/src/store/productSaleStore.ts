// stores/sales-store.ts
import { ProductSale } from "@/services/product-sale.ts/product-sale";
import { create } from "zustand";

interface SalesState {
  sales: ProductSale[];
  initialized: boolean;

  initializeProductSales: (productSales: ProductSale[]) => void;

  setSales: (sales: ProductSale[]) => void;
  addSale: (sale: ProductSale) => void;
  updateSale: (id: string, updatedSale: Partial<ProductSale>) => void;
  deleteSale: (id: string) => void;
}

export const useSalesStore = create<SalesState>((set) => ({
  sales: [],
  initialized: false,

  setSales: (sales) => set({ sales }),
  addSale: (sale) => set((state) => ({ sales: [...state.sales, sale] })),
  updateSale: (id, updatedSale) =>
    set((state) => ({
      sales: state.sales.map((sale) => (sale.id === id ? { ...sale, ...updatedSale } : sale)),
    })),
  deleteSale: (id) => set((state) => ({ sales: state.sales.filter((sale) => sale.id !== id) })),
  initializeProductSales: (productSales) =>
    set((state) => {
      // Solo inicializa si no está ya inicializado
      if (!state.initialized) {
        return { sales: productSales, initialized: true };
      }
      return state;
    }),
}));
