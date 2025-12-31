"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Gift,
    Percent,
    Tag,
    Sparkles,
    Clock,
    CalendarDays,
    PartyPopper,
    ChevronRight,
    Users,
    Cake,
    Timer,
    Check
} from "lucide-react";
import { Promotion, formatPromotionValue, getDayNames } from "@/services/promotion/promotion";
import { EventPackage } from "@/services/event-package/event-package";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PromotionsSectionProps {
    promotions: Promotion[];
    eventPackages?: EventPackage[];
    whatsappNumber?: string;
    color?: "blue" | "green";
}

const getPromotionIcon = (type: string) => {
    switch (type) {
        case "PERCENTAGE_DISCOUNT":
            return <Percent className="w-5 h-5" />;
        case "GIFT_PRODUCT":
            return <Gift className="w-5 h-5" />;
        case "FIXED_PRICE":
        case "FIXED_AMOUNT_DISCOUNT":
            return <Tag className="w-5 h-5" />;
        default:
            return <Sparkles className="w-5 h-5" />;
    }
};

const getPromotionGradient = (type: string, index: number) => {
    const gradients = [
        "from-violet-600 via-purple-600 to-fuchsia-600",
        "from-emerald-600 via-teal-600 to-cyan-600",
        "from-orange-500 via-amber-500 to-yellow-500",
        "from-rose-600 via-pink-600 to-fuchsia-600",
        "from-blue-600 via-indigo-600 to-violet-600",
    ];
    return gradients[index % gradients.length];
};

export const PromotionsSection = ({ promotions, eventPackages = [], whatsappNumber = "5493624505555", color = "blue" }: PromotionsSectionProps) => {
    // Filter only active promotions for reserves (not product promotions)
    const activePromotions = promotions.filter(
        (p) => p.isActive && !p.type.startsWith("PRODUCT_")
    );

    // Filter only active event packages
    const activeEventPackages = eventPackages.filter((ep) => ep.isActive);

    // If nothing to show, return null
    if (activePromotions.length === 0 && activeEventPackages.length === 0) return null;

    const colorClass = color === "blue" ? "text-blue-400" : "text-green-400";
    const bgClass = color === "blue" ? "bg-blue-500" : "bg-green-500";
    const borderClass = color === "blue" ? "border-blue-500/30" : "border-green-500/30";
    const gradientClass = color === "blue"
        ? "from-blue-500 via-blue-600 to-indigo-600"
        : "from-green-500 via-green-600 to-emerald-600";

    return (
        <div className="space-y-8">
            {/* Event Packages Section */}
            {activeEventPackages.length > 0 && (
                <div>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className={`w-2 h-8 ${bgClass} rounded-full`}></span>
                        Cumpleaños y Eventos
                    </h3>

                    {/* Responsive Container: Carousel on mobile -> Grid on desktop */}
                    <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 sm:pb-0 sm:overflow-visible sm:mx-0 sm:px-0 snap-x snap-mandatory hide-scrollbar">
                        {activeEventPackages.map((pkg, index) => (
                            <div
                                key={pkg.id}
                                className={`flex-shrink-0 w-[85vw] sm:w-auto snap-center mr-4 sm:mr-0 rounded-3xl p-6 relative overflow-hidden bg-slate-900/50 border ${borderClass} backdrop-blur-sm hover:scale-[1.01] transition-all duration-300 flex flex-col h-full`}
                            >
                                {/* Decorative background */}
                                <div className="absolute top-4 right-4 opacity-5">
                                    <PartyPopper className="w-32 h-32 text-white" />
                                </div>

                                <div className="relative z-10 flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-xl ${bgClass} flex items-center justify-center`}>
                                            <PartyPopper className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-2xl font-black ${colorClass}`}>
                                                ${pkg.basePrice.toLocaleString()}
                                            </p>
                                            {pkg.lightPrice > pkg.basePrice && (
                                                <p className="text-xs text-white/50">
                                                    ${pkg.lightPrice.toLocaleString()} con luz
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <h4 className="text-xl font-bold text-white mb-2">
                                        {pkg.name}
                                    </h4>

                                    {pkg.description && (
                                        <p className="text-white/70 text-sm mb-4">
                                            {pkg.description}
                                        </p>
                                    )}

                                    {/* Details */}
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        <div className={`flex items-center gap-1.5 ${colorClass} text-sm`}>
                                            <Timer className="w-4 h-4" />
                                            <span>{pkg.durationHours}h</span>
                                        </div>
                                        {pkg.courtCount && (
                                            <div className={`flex items-center gap-1.5 ${colorClass} text-sm`}>
                                                <Users className="w-4 h-4" />
                                                <span>{pkg.courtCount} cancha{pkg.courtCount > 1 ? 's' : ''}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Includes displayed in columns */}
                                    {pkg.includes && pkg.includes.length > 0 && (
                                        <div className="grid grid-cols-2 gap-x-2 gap-y-2 mb-6">
                                            {pkg.includes.slice(0, 6).map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-white/80 text-sm">
                                                    <Check className={`w-3.5 h-3.5 ${colorClass} flex-shrink-0`} />
                                                    <span className="line-clamp-1 text-xs sm:text-sm">{item}</span>
                                                </div>
                                            ))}
                                            {pkg.includes.length > 6 && (
                                                <p className="text-white/50 text-xs pl-6 col-span-2">
                                                    +{pkg.includes.length - 6} más...
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* CTA always at bottom */}
                                <a
                                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`¡Hola! Me interesa el paquete "${pkg.name}" para un evento. ¿Podrían darme más información?`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full mt-auto relative z-10"
                                >
                                    <button
                                        className={`w-full ${bgClass} hover:opacity-90 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2`}
                                    >
                                        Consultar
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Promotions Section */}
            {activePromotions.length > 0 && (
                <div>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className={`w-2 h-8 ${bgClass} rounded-full`}></span>
                        Promociones Activas
                    </h3>

                    {/* Responsive Container: Carousel on mobile -> Grid on desktop */}
                    <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 sm:pb-0 sm:overflow-visible sm:mx-0 sm:px-0 snap-x snap-mandatory hide-scrollbar">
                        {activePromotions.map((promo, index) => (
                            <div
                                key={promo.id}
                                className="flex-shrink-0 w-[85vw] sm:w-auto snap-center mr-4 sm:mr-0 rounded-3xl p-6 relative overflow-hidden bg-slate-900/50 border border-white/10 backdrop-blur-sm hover:scale-[1.01] transition-all duration-300 flex flex-col h-full"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPromotionGradient(promo.type, index)} flex items-center justify-center text-white`}>
                                        {getPromotionIcon(promo.type)}
                                    </div>

                                    {promo.type === "PERCENTAGE_DISCOUNT" && promo.value && (
                                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-lg font-bold px-3 py-1">
                                            {promo.value}% OFF
                                        </Badge>
                                    )}
                                    {promo.type === "FIXED_AMOUNT_DISCOUNT" && promo.value && (
                                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-lg font-bold px-3 py-1">
                                            -${promo.value.toLocaleString()}
                                        </Badge>
                                    )}
                                    {promo.type === "FIXED_PRICE" && promo.value && (
                                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-lg font-bold px-3 py-1">
                                            ${promo.value.toLocaleString()}
                                        </Badge>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <h4 className="text-xl font-bold text-white mb-2">
                                        {promo.name}
                                    </h4>

                                    {promo.description && (
                                        <p className="text-white/70 text-sm mb-4 line-clamp-2">
                                            {promo.description}
                                        </p>
                                    )}

                                    {/* Benefits for gift products */}
                                    {promo.type === "GIFT_PRODUCT" && promo.giftProducts && promo.giftProducts.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-purple-400 text-sm font-medium mb-2">🎁 Incluye:</p>
                                            <ul className="space-y-1">
                                                {promo.giftProducts.map((gp) => (
                                                    <li key={gp.id} className="text-white/70 text-sm flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                                        {gp.quantity}x {gp.product.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* Footer - Conditions always at bottom */}
                                <div className="pt-4 border-t border-white/10 space-y-2 mt-auto">
                                    {promo.daysOfWeek && promo.daysOfWeek.length > 0 && promo.daysOfWeek.length < 7 && (
                                        <div className="flex items-center gap-2 text-white/60 text-xs">
                                            <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span>{getDayNames(promo.daysOfWeek)}</span>
                                        </div>
                                    )}

                                    {promo.startTime && promo.endTime && (
                                        <div className="flex items-center gap-2 text-white/60 text-xs">
                                            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span>{promo.startTime.slice(0, 5)} - {promo.endTime.slice(0, 5)}</span>
                                        </div>
                                    )}

                                    {promo.court && (
                                        <div className="flex items-center gap-2 text-white/60 text-xs">
                                            <Tag className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span>Solo {promo.court.name || `Cancha ${promo.court.courtNumber}`}</span>
                                        </div>
                                    )}

                                    {/* Coupon code if exists */}
                                    {promo.code && (
                                        <div className="mt-3 p-2 bg-white/5 rounded-lg border border-dashed border-white/20">
                                            <p className="text-xs text-white/50 mb-1">Código:</p>
                                            <p className="font-mono font-bold text-white tracking-wider">{promo.code}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
