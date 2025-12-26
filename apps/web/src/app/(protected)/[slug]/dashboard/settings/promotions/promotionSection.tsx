"use client";

import { Complex } from "@/services/complex/complex";
import CreatePromotion from "./createPromotion";
import EditPromotions from "./editPromotions";
import { Promotion } from "@/services/promotion/promotion";

interface PromotionSectionProps {
    complex: Complex & { promotions?: Promotion[] };
}

export const PromotionSection = ({ complex }: PromotionSectionProps) => {
    return (
        <div className="space-y-6">
            {/* Formulario para crear */}
            <CreatePromotion complex={complex} />

            {/* Lista de promociones existentes */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                    Promociones Creadas
                </h2>
                <EditPromotions initialData={complex.promotions || []} />
            </div>
        </div>
    );
};
