"use client";
import React from "react";
import Link from "next/link";
import { m } from "framer-motion";
import {
  Calendar,
  Clock,
  Star,
  TrendingUp,
  Shield,
  CheckCircle2,
  Building2,
  ChevronsDown,
} from "lucide-react";

import { useModal } from "@/contexts/modalContext";

interface HeroSectionProps {
  onOpenModal: (complexType?: "bertaca" | "seven") => void;
  trustData: {
    rating: number;
    reviews: number;
    monthlyGames: number;
  };
}

export const HeroSection = React.memo(({ onOpenModal, trustData }: HeroSectionProps) => {
  const { openModal } = useModal();

  const handleScrollToSchedule = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById("complejos");
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Fondo con video */}
      <div className="absolute inset-0">
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src="https://res.cloudinary.com/dhignxely/video/upload/q_auto,f_auto,w_1280/v1745288680/cancha-futbol1_ub6mf9.mp4"
          poster="https://res.cloudinary.com/dhignxely/video/upload/q_auto,f_auto,w_1280/v1745288680/cancha-futbol1_ub6mf9.jpg"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pt-20 sm:pt-24">
        {/* Título Principal */}
        <m.h1
          // Optimization: Remove initial opacity=0 to improve LCP
          // initial={{ opacity: 0, y: -20 }}
          // animate={{ opacity: 1, y: 0 }}
          // transition={{ duration: 0.6 }}
          className="text-Primary-light font-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 text-center drop-shadow-2xl"
        >
          Reserva tu Cancha
        </m.h1>

        {/* TIER 1 - HERO CTA PRINCIPAL */}
        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-2xl mb-6 sm:mb-8"
        >
          <button
            onClick={() => onOpenModal()}
            className="group relative w-full px-6 sm:px-8 py-5 sm:py-6 rounded-2xl sm:rounded-3xl font-bold text-xl sm:text-2xl md:text-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] cursor-pointer"
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(20px)",
              border: "2px solid rgba(255, 255, 255, 0.2)",
              boxShadow:
                "0 8px 32px rgba(9, 111, 177, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}
          >
            <span className="flex items-center justify-center gap-2 sm:gap-3 relative z-10">
              <Calendar
                size={28}
                className="text-Primary-light group-hover:rotate-12 transition-transform duration-300 sm:w-8 sm:h-8"
              />
              <span className="text-white tracking-wide">Reserva General</span>
            </span>

            {/* Hover glow border */}
            <div
              className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                boxShadow: "0 0 40px rgba(9, 111, 177, 0.6), inset 0 0 40px rgba(9, 111, 177, 0.1)",
              }}
            />

            {/* Subtle click indicator */}
            <div
              className="absolute bottom-3 left-1/2 w-2.5 h-2.5 bg-Primary-light rounded-full animate-pulse"
              style={{
                boxShadow: "0 0 8px rgba(9, 111, 177, 0.8)",
              }}
            />
          </button>
          <p className="text-center text-white/60 text-sm sm:text-base mt-3 font-light tracking-wide">
            Elige tu complejo, fecha y horario paso a paso
          </p>
        </m.div>

        {/* TIER 2 - PREMIUM SHORTCUT CARDS */}
        <PremiumShortcutCards onOpenModal={onOpenModal} />

        {/* TIER 3 - UTILITY BUTTONS */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap gap-3 sm:gap-4 justify-center mb-6 sm:mb-8"
        >
          <button
            onClick={handleScrollToSchedule}
            className="group flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl border-2 border-white/20 bg-transparent hover:border-white/40 hover:bg-white/5 transition-all duration-300 backdrop-blur-sm cursor-pointer"
          >
            <Clock
              size={18}
              className="text-white/70 group-hover:text-white group-hover:rotate-12 transition-all duration-300"
            />
            <span className="text-white/70 group-hover:text-white font-medium text-sm transition-colors duration-300">
              Ver Tabla de Horarios
            </span>
          </button>
          <button
            onClick={() => openModal("REVIEW")} // User will select complex inside modal
            className="group flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl border-2 border-white/20 bg-transparent hover:border-white/40 hover:bg-white/5 transition-all duration-300 backdrop-blur-sm cursor-pointer"
          >
            <Star
              size={18}
              className="text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-300"
            />
            <span className="text-white/70 group-hover:text-white font-medium text-sm transition-colors duration-300">
              Opiniones
            </span>
          </button>
        </m.div>

        {/* Premium Trust Indicators */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-4 sm:mt-6 flex flex-wrap gap-3 sm:gap-4 justify-center px-4"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
            <Star className="text-yellow-400 fill-yellow-400" size={16} />
            <span className="font-semibold text-white/90 text-xs sm:text-sm">
              {trustData.rating}/5 <span className="text-white/50">({trustData.reviews})</span>
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
            <TrendingUp className="text-Primary-light" size={16} />
            <span className="font-semibold text-white/90 text-xs sm:text-sm">
              <span className="hidden sm:inline">
                {trustData.monthlyGames.toLocaleString("es-AR")} partidos/mes
              </span>
              <span className="sm:hidden">
                {trustData.monthlyGames.toLocaleString("es-AR")} partidos
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
            <img src="/images/Insignia.png" alt="Checkout Pro" className="h-4 sm:h-5 w-auto" />
            <span className="font-semibold text-white/90 text-xs sm:text-sm">Pago seguro</span>
          </div>
        </m.div>
      </div>
    </div>
  );
});

HeroSection.displayName = "HeroSection";

// ============================================
// PREMIUM SHORTCUT CARDS (Memoized)
// ============================================
const PremiumShortcutCards = React.memo(
  ({ onOpenModal }: { onOpenModal: (complexType: "bertaca" | "seven") => void }) => {
    return (
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="w-full max-w-4xl mb-6 sm:mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Premium Card Bertaca (F5) */}
          <button
            onClick={() => onOpenModal("bertaca")}
            className="group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.05] hover:-translate-y-2 active:scale-[0.98] cursor-pointer"
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(20px)",
              border: "2px solid rgba(59, 130, 246, 0.3)",
              boxShadow:
                "0 8px 32px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.15), transparent 70%)",
              }}
            />

            <div className="relative p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center p-2 relative overflow-hidden group-hover:scale-110 transition-transform duration-500"
                    style={{
                      background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                      boxShadow: "0 8px 24px rgba(59, 130, 246, 0.4)",
                    }}
                  >
                    <img src="/images/bertaca_logo.png" alt="Bertaca" className="w-full h-full object-contain relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                  </div>

                  <div className="text-left">
                    <h3 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-tight">
                      Fútbol 5
                    </h3>
                    <p className="text-blue-300 font-semibold text-xs sm:text-sm tracking-wide uppercase">
                      Bertaca
                    </p>
                    <p className="text-yellow-300 text-xs font-medium mt-1 hidden sm:block">
                      Rápido y techado
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-white/90 text-xs sm:text-sm">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="text-blue-400 flex-shrink-0" size={16} />
                  <span className="font-medium">Piso sintético profesional</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="text-blue-400 flex-shrink-0" size={16} />
                  <span className="font-medium">Cancha techada</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="text-blue-400 flex-shrink-0" size={16} />
                  <span className="font-medium">3 canchas disponibles</span>
                </p>
              </div>
            </div>
            <div
              className="absolute bottom-4 right-4 w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse"
              style={{
                boxShadow: "0 0 8px rgba(59, 130, 246, 0.8)",
              }}
            />
          </button>

          {/* Premium Card Seven (F7) */}
          <button
            onClick={() => onOpenModal("seven")}
            className="group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.05] hover:-translate-y-2 active:scale-[0.98] cursor-pointer"
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(20px)",
              border: "2px solid rgba(34, 197, 94, 0.3)",
              boxShadow:
                "0 8px 32px rgba(34, 197, 94, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "radial-gradient(circle at 50% 0%, rgba(34, 197, 94, 0.15), transparent 70%)",
              }}
            />

            <div className="relative p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center p-2 relative overflow-hidden group-hover:scale-110 transition-transform duration-500"
                    style={{
                      background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
                      boxShadow: "0 8px 24px rgba(34, 197, 94, 0.4)",
                    }}
                  >
                    <img src="/images/seven_logo.png" alt="Seven" className="w-full h-full object-contain relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                  </div>

                  <div className="text-left">
                    <h3 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-tight">
                      Fútbol 7
                    </h3>
                    <p className="text-green-300 font-semibold text-xs sm:text-sm tracking-wide uppercase">
                      Seven
                    </p>
                    <p className="text-emerald-300 text-xs font-medium mt-1 hidden sm:block">
                      Cancha más grande
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-white/90 text-xs sm:text-sm">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="text-green-400 flex-shrink-0" size={16} />
                  <span className="font-medium">Cancha al aire libre</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="text-green-400 flex-shrink-0" size={16} />
                  <span className="font-medium">Espacio más amplio</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="text-green-400 flex-shrink-0" size={16} />
                  <span className="font-medium">3 canchas disponibles</span>
                </p>
              </div>
            </div>
            <div
              className="absolute bottom-4 right-4 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"
              style={{
                boxShadow: "0 0 8px rgba(34, 197, 94, 0.8)",
              }}
            />
          </button>
        </div>
      </m.div>
    );
  }
);

PremiumShortcutCards.displayName = "PremiumShortcutCards";
