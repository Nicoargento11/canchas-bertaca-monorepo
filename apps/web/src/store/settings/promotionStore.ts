// stores/promotion-store.ts
import { Promotion } from "@/services/promotion/promotion";
import { create } from "zustand";

interface PromotionState {
    promotions: Promotion[];
    initialized: boolean;

    initializePromotions: (promotions: Promotion[]) => void;
    setPromotions: (promotions: Promotion[]) => void;
    addPromotion: (promotion: Promotion) => void;
    updatePromotion: (id: string, updatedPromotion: Partial<Promotion>) => void;
    deletePromotion: (id: string) => void;
    togglePromotionStatus: (id: string) => void;
}

export const usePromotionStore = create<PromotionState>((set) => ({
    promotions: [],
    initialized: false,

    initializePromotions: (promotions) =>
        set((state) => ({
            promotions: state.initialized ? state.promotions : promotions,
            initialized: true,
        })),

    setPromotions: (promotions) => set({ promotions }),

    addPromotion: (promotion) =>
        set((state) => ({
            promotions: [promotion, ...state.promotions],
        })),

    updatePromotion: (id, updatedPromotion) =>
        set((state) => ({
            promotions: state.promotions.map((promotion) =>
                promotion.id === id ? { ...promotion, ...updatedPromotion } : promotion
            ),
        })),

    deletePromotion: (id) =>
        set((state) => ({
            promotions: state.promotions.filter((promotion) => promotion.id !== id),
        })),

    togglePromotionStatus: (id) =>
        set((state) => ({
            promotions: state.promotions.map((promotion) =>
                promotion.id === id ? { ...promotion, isActive: !promotion.isActive } : promotion
            ),
        })),
}));
