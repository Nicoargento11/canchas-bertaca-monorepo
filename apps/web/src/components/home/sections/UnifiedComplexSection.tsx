"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  CheckCircle2,
  DollarSign,
  Shield,
  Info,
  GraduationCap,
  Cake,
  Phone,
  Mail,
  Instagram,
  Facebook,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import TableReservesToday from "@/components/TableReservesToday";
import { Complex } from "@/services/complex/complex";
import { SportType, SportTypeKey } from "@/services/sport-types/sport-types";
import { TurnByDay } from "@/services/reserve/reserve";
import { Court } from "@/services/court/court";
import { PromotionsSection } from "./PromotionsSection";
import { EventPackage } from "@/services/event-package/event-package";

interface SportData {
  reserves: TurnByDay | undefined;
  courts: Court[];
}

interface UnifiedComplexSectionProps {
  bertacaSportsData: Record<SportTypeKey, SportData>;
  sevenSportsData: Record<SportTypeKey, SportData>;
  complex: Complex;
  sevenComplex?: Complex;
  sportTypes: Record<SportTypeKey, SportType>;
  sevenSportTypes?: Partial<Record<SportTypeKey, SportType>>;
  activeTab: "bertaca" | "seven";
  onTabChange: (tab: "bertaca" | "seven") => void;
  onReserveClick: (
    complexId: string,
    sportType: SportTypeKey,
    sportTypeId: string,
    day: Date,
    hour: string,
    field: string
  ) => void;
  eventPackages?: EventPackage[];
  sevenEventPackages?: EventPackage[];
}

const ImageSlider = React.memo(({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = React.useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = React.useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  return (
    <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl group">
      {/* Image container with CSS-only transitions */}
      <div className="relative w-full h-full">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-500 ease-in-out"
            style={{
              opacity: idx === currentIndex ? 1 : 0,
              pointerEvents: idx === currentIndex ? 'auto' : 'none',
              willChange: 'opacity',
            }}
          >
            <Image
              src={img}
              alt={`Slide ${idx}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              {...(idx === 0 ? { priority: true } : { loading: 'lazy' as const })}
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 pointer-events-none"></div>

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Previous image"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Next image"
      >
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? "bg-white w-4" : "bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
});

ImageSlider.displayName = "ImageSlider";

export const UnifiedComplexSection = React.memo(
  ({
    bertacaSportsData,
    sevenSportsData,
    complex,
    sevenComplex,
    sportTypes,
    sevenSportTypes,
    activeTab,
    onTabChange,
    onReserveClick,
    eventPackages = [],
    sevenEventPackages = [],
  }: UnifiedComplexSectionProps) => {
    const bertacaImages = [
      "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1200&h=800&fit=crop",
    ];

    const sevenImages = [
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&h=800&fit=crop",
    ];

    // Helper to merge data from all sports into a single table structure
    const mergeSportsData = (sportsData: Record<SportTypeKey, SportData>) => {
      const allCourts: Court[] = [];
      const scheduleMap = new Map<string, Court[]>();

      Object.values(sportsData).forEach((data) => {
        if (!data) return;

        // Merge courts
        data.courts.forEach((court) => {
          if (!allCourts.find((c) => c.id === court.id)) {
            allCourts.push(court);
          }
        });

        // Merge reserves
        if (data.reserves) {
          data.reserves.forEach((turn) => {
            const existing = scheduleMap.get(turn.schedule) || [];
            // Add courts from this turn that are not already in the list
            turn.court.forEach((c) => {
              if (!existing.find((ex) => ex.id === c.id)) {
                existing.push(c);
              }
            });
            scheduleMap.set(turn.schedule, existing);
          });
        }
      });

      // Convert map back to TurnByDay array and sort by time
      const mergedReserves: TurnByDay = Array.from(scheduleMap.entries())
        .map(([schedule, court]) => ({ schedule, court }))
        .sort((a, b) => a.schedule.localeCompare(b.schedule));

      // Sort courts by number or name
      allCourts.sort((a, b) => (a.courtNumber || 0) - (b.courtNumber || 0));

      return { allCourts, mergedReserves };
    };

    const bertacaMerged = mergeSportsData(bertacaSportsData);
    const sevenMerged = mergeSportsData(sevenSportsData);

    return (
      <section id="complejos" className="relative bg-slate-950 py-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Nuestros Complejos</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Explora las características únicas de cada una de nuestras sedes y revisa la
              disponibilidad de hoy.
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(val) => onTabChange(val as "bertaca" | "seven")}
            className="w-full"
          >
            {/* Original Tabs - hidden on mobile, visible on desktop */}
            <div className="hidden lg:flex justify-center mb-12">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-900/50 border border-white/10 p-1 h-auto rounded-xl">
                <TabsTrigger
                  value="bertaca"
                  className="text-lg py-3 data-[state=active]:bg-Primary data-[state=active]:text-white rounded-lg transition-all flex items-center gap-2 justify-center"
                >
                  <img src="/images/bertaca_logo.png" alt="Bertaca" className="w-6 h-6 object-contain" />
                  <span>Bertaca (F5)</span>
                </TabsTrigger>
                <TabsTrigger
                  value="seven"
                  className="text-lg py-3 data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all flex items-center gap-2 justify-center"
                >
                  <img src="/images/seven_logo.png" alt="Seven" className="w-6 h-6 object-contain" />
                  <span>Seven (F7)</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Mobile Tabs - fixed at bottom of screen */}
            <div className="fixed bottom-0 left-0 right-0 z-50 px-4 py-3 pb-[env(safe-area-inset-bottom,12px)] bg-slate-950/95 backdrop-blur-md border-t border-white/10 lg:hidden">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-slate-900/80 border border-white/10 p-1 h-auto rounded-xl shadow-2xl">
                <TabsTrigger
                  value="bertaca"
                  className="text-sm py-3 data-[state=active]:bg-Primary data-[state=active]:text-white rounded-lg transition-all flex items-center gap-2 justify-center font-semibold"
                >
                  <img src="/images/bertaca_logo.png" alt="Bertaca" className="w-5 h-5 object-contain" />
                  <span>Bertaca (F5)</span>
                </TabsTrigger>
                <TabsTrigger
                  value="seven"
                  className="text-sm py-3 data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all flex items-center gap-2 justify-center font-semibold"
                >
                  <img src="/images/seven_logo.png" alt="Seven" className="w-5 h-5 object-contain" />
                  <span>Seven (F7)</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Spacer for bottom tabs on mobile */}
            <div className="h-24 lg:hidden" />

            {/* BERTACA CONTENT */}
            <TabsContent value="bertaca" className="mt-0 focus-visible:outline-none space-y-16">
              {/* 1. Availability Table */}
              <div
                id="TurnosHoy-bertaca"
                className="scroll-mt-32"
                style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px' }}
              >
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-2 h-8 bg-Primary rounded-full"></span>
                  Turnos Disponibles Hoy
                </h3>
                <div className="bg-gray-800/40 rounded-xl p-1 border border-white/5 shadow-lg backdrop-blur-sm">
                  {bertacaMerged.allCourts.length > 0 ? (
                    <TableReservesToday
                      dayReserves={bertacaMerged.mergedReserves}
                      courts={bertacaMerged.allCourts}
                      complex={complex}
                      sportTypes={sportTypes}
                      onReserveClick={onReserveClick}
                    />
                  ) : (
                    <div className="text-white text-center py-8">
                      No hay datos disponibles para Bertaca
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Complex Details & Slider */}
              <div
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
                style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}
              >
                <div className="space-y-8">
                  <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
                    <h3 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                      Sede Bertaca
                    </h3>
                    <p className="text-blue-300 font-medium mb-6 uppercase tracking-wider text-sm">
                      Fútbol 5 • Sintético
                    </p>
                    <p className="text-white/80 leading-relaxed mb-8">
                      Nuestro complejo principal diseñado para el juego rápido y dinámico. Canchas
                      de calidad con piso sintético profesional.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FeatureItem
                        icon={CheckCircle2}
                        text="Piso Sintético Pro"
                        color="text-blue-400"
                      />
                      <FeatureItem icon={Info} text="3 Canchas Disponibles" color="text-blue-400" />
                      <FeatureItem
                        icon={DollarSign}
                        text="Precios Accesibles"
                        color="text-blue-400"
                      />
                      <FeatureItem
                        icon={Shield}
                        text="Seguridad y Comodidad"
                        color="text-blue-400"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <ImageSlider images={bertacaImages} />
                </div>
              </div>

              {/* 3. Services & Prices (Bertaca) */}
              <div id="Precios-bertaca" className="scroll-mt-32">
                <ServicesSection
                  title="Servicios Bertaca"
                  color="blue"
                  rates={complex.rates}
                  schedules={complex.schedules}
                  schoolPhone="+54 9 362 420-0639"
                />
              </div>

              {/* Promociones y Eventos (Bertaca) */}
              <PromotionsSection
                promotions={complex.promotions || []}
                eventPackages={eventPackages}
                whatsappNumber={complex.phone?.replace(/\D/g, '') || undefined}
                color="blue"
              />

              {/* 4. Location & Contact (Bertaca) */}
              <div id="Contacto-bertaca" className="scroll-mt-32">
                <LocationSection
                  address={complex.address}
                  whatsapp={complex.phone || undefined}
                  instagram={complex.instagram || undefined}
                  latitude={complex.latitude}
                  longitude={complex.longitude}
                  color="blue"
                />
              </div>
            </TabsContent>

            {/* SEVEN CONTENT */}
            <TabsContent value="seven" className="mt-0 focus-visible:outline-none space-y-16">
              {/* 1. Availability Table */}
              <div
                id="TurnosHoy-seven"
                className="scroll-mt-32"
                style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px' }}
              >
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-2 h-8 bg-green-600 rounded-full"></span>
                  Turnos Disponibles Hoy
                </h3>
                <div className="bg-gray-800/40 rounded-xl p-1 border border-white/5 shadow-lg backdrop-blur-sm">
                  {sevenComplex && sevenMerged.allCourts.length > 0 ? (
                    <TableReservesToday
                      dayReserves={sevenMerged.mergedReserves}
                      courts={sevenMerged.allCourts}
                      complex={sevenComplex}
                      sportTypes={sevenSportTypes as Record<string, SportType>}
                      onReserveClick={onReserveClick}
                    />
                  ) : (
                    <div className="text-white text-center py-8">
                      No hay datos disponibles para Seven
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Complex Details & Slider */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-8">
                  <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
                    <h3 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                      Sede Seven
                    </h3>
                    <p className="text-green-400 font-medium mb-6 uppercase tracking-wider text-sm">
                      Fútbol 7 • Aire Libre • Espacioso
                    </p>
                    <p className="text-white/80 leading-relaxed mb-8">
                      Disfruta del fútbol al aire libre en nuestras canchas más amplias. Perfecto
                      para equipos más grandes y partidos con más recorrido.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FeatureItem icon={Shield} text="Aire Libre" color="text-green-400" />
                      <FeatureItem
                        icon={CheckCircle2}
                        text="Césped Premium"
                        color="text-green-400"
                      />
                      <FeatureItem icon={Info} text="Mayor Tamaño" color="text-green-400" />
                      <FeatureItem
                        icon={DollarSign}
                        text="Torneos Fines de Semana"
                        color="text-green-400"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <ImageSlider images={sevenImages} />
                </div>
              </div>

              {/* 3. Services & Prices (Seven) */}
              <div id="Precios-seven" className="scroll-mt-32">
                <ServicesSection
                  title="Servicios Seven"
                  color="green"
                  rates={sevenComplex?.rates || []}
                  schedules={sevenComplex?.schedules || []}
                  schoolPhone="+54 9 362 410-2501"
                />
              </div>

              {/* Promociones y Eventos (Seven) */}
              <PromotionsSection
                promotions={sevenComplex?.promotions || []}
                eventPackages={sevenEventPackages}
                whatsappNumber={sevenComplex?.phone?.replace(/\D/g, '') || undefined}
                color="green"
              />

              {/* 4. Location & Contact (Seven) */}
              <div id="Contacto-seven" className="scroll-mt-32">
                <LocationSection
                  address={sevenComplex?.address || "Ruta 16 KM 13.6, Resistencia, Chaco 3500"}
                  whatsapp={sevenComplex?.phone || undefined}
                  instagram={sevenComplex?.instagram || undefined}
                  latitude={sevenComplex?.latitude}
                  longitude={sevenComplex?.longitude}
                  color="green"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    );
  }
);

const FeatureItem = ({ icon: Icon, text, color }: { icon: any; text: string; color: string }) => (
  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
    <Icon className={color} size={20} />
    <span className="text-white/90 font-medium text-sm">{text}</span>
  </div>
);

const ServicesSection = ({
  title,
  color,
  rates,
  schedules,
  schoolPhone,
}: {
  title: string;
  color: "blue" | "green";
  rates: { id: string; name: string; price: number; reservationAmount: number }[];
  schedules: {
    id: string;
    startTime: string;
    endTime: string;
    scheduleDay?: { dayOfWeek: number; name?: string } | null;
    rates?: { id: string; name: string; price: number }[];
  }[];
  schoolPhone?: string;
}) => {
  const colorClass = color === "blue" ? "text-blue-400" : "text-green-400";
  const borderClass = color === "blue" ? "border-blue-500/30" : "border-green-500/30";
  const bgClass = color === "blue" ? "bg-blue-500" : "bg-green-500";

  // Format price for display
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-AR')}`;
  };

  // Group schedules by rate and aggregate days/times
  const groupedByRate = React.useMemo(() => {
    const grouped: Map<string, {
      rate: { id: string; name: string; price: number };
      days: Set<number>;
      timeRanges: Set<string>;
    }> = new Map();

    schedules.forEach(schedule => {
      schedule.rates?.forEach(rate => {
        if (!grouped.has(rate.id)) {
          grouped.set(rate.id, {
            rate,
            days: new Set(),
            timeRanges: new Set(),
          });
        }
        const group = grouped.get(rate.id)!;
        if (schedule.scheduleDay?.dayOfWeek !== undefined) {
          group.days.add(schedule.scheduleDay.dayOfWeek);
        }
        group.timeRanges.add(`${schedule.startTime} - ${schedule.endTime}`);
      });
    });

    return Array.from(grouped.values());
  }, [schedules]);

  // Helper to format days
  const formatDays = (days: Set<number>) => {
    const dayArray = Array.from(days).sort((a, b) => a - b);
    const isWeekday = dayArray.every(d => d >= 1 && d <= 5);
    const isWeekend = dayArray.every(d => d === 0 || d === 6);

    if (isWeekday && dayArray.length === 5) return "Lun-Vie";
    if (isWeekend && dayArray.length === 2) return "Sáb-Dom";
    if (dayArray.length === 7) return "Todos los días";

    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    return dayArray.map(d => dayNames[d]).join(", ");
  };

  // If we have grouped data, use it; otherwise fallback to simple rates
  const displayData = groupedByRate.length > 0 ? groupedByRate : rates.map(r => ({
    rate: r,
    days: new Set<number>(),
    timeRanges: new Set<string>(),
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Escuelita */}
      <div className="lg:col-span-2 rounded-3xl p-8 relative overflow-hidden group hover:scale-[1.01] transition-all duration-500 bg-slate-900/50 border border-white/10 backdrop-blur-sm">
        <div className="relative z-10">
          <GraduationCap className={`${colorClass} mb-4`} size={48} />
          <h3 className="text-3xl font-black text-white mb-4">Escuelita de Fútbol</h3>
          <p className="text-white/70 text-lg mb-6">
            Clases profesionales de fútbol. Desarrollo técnico, táctico y trabajo en equipo.
          </p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-2 text-white/80">
              <CheckCircle2 className={colorClass} size={20} />
              <span>Lunes, Miércoles y Viernes 17:00 - 20:00</span>
            </li>
            <li className="flex items-center gap-2 text-white/80">
              <CheckCircle2 className={colorClass} size={20} />
              <span>Entrenadores certificados</span>
            </li>
          </ul>
          <div className="mt-4">
            {schoolPhone && (
              <a
                href={`https://wa.me/${schoolPhone.replace(/\D/g, '')}?text=${encodeURIComponent('¡Hola! Me interesa información sobre la escuelita de fútbol.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-6 py-3 ${bgClass} hover:opacity-90 rounded-xl text-white font-bold transition-all shadow-lg`}
              >
                <Phone size={20} />
                Consultar e Inscribirse
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Precios */}
      <div
        className={`rounded-3xl p-8 relative overflow-hidden bg-slate-900/50 border ${borderClass} backdrop-blur-sm`}
      >
        <DollarSign className="text-yellow-400 mb-4" size={40} />
        <h3 className="text-2xl font-black text-white mb-6">Lista de Precios</h3>
        <div className="space-y-4 text-white/80">
          {displayData.length > 0 ? (
            displayData.map((item) => (
              <div
                key={item.rate.id}
                className="border-b border-white/10 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{item.rate.name}</span>
                  <span className="font-bold text-white">{formatPrice(item.rate.price)}</span>
                </div>
                {item.days.size > 0 && (
                  <p className="text-xs text-white/50 mt-1">
                    {formatDays(item.days)} • {Array.from(item.timeRanges).join(", ")}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-white/50">No hay tarifas configuradas</p>
          )}
        </div>
      </div>
    </div>
  );
};

const LocationSection = ({
  address,
  whatsapp,
  instagram,
  latitude,
  longitude,
  color,
}: {
  address: string;
  whatsapp?: string;
  instagram?: string;
  latitude?: number | null;
  longitude?: number | null;
  color: "blue" | "green";
}) => {
  const colorClass = color === "blue" ? "text-blue-500" : "text-green-500";
  const bgClass = color === "blue" ? "bg-blue-500" : "bg-green-500";
  const borderClass = color === "blue" ? "border-blue-500/30" : "border-green-500/30";

  const whatsappUrl = whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}` : '#';
  // URL para abrir Google Maps con la ubicación marcada
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  // Generate map embed URL from coordinates or fallback to address-based search
  const mapSrc = latitude && longitude
    ? `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3540!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${latitude},${longitude}!5e0!3m2!1ses!2sar`
    : `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3540!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s${encodeURIComponent(address)}!5e0!3m2!1ses!2sar`;

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px' }}
    >
      <div className="rounded-3xl p-8 bg-slate-900/50 border border-white/10 backdrop-blur-sm">
        <h3 className="text-2xl font-bold text-white mb-8">Contactanos</h3>
        <div className="space-y-6">
          {whatsapp && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-4 p-4 rounded-xl ${color === "blue" ? "bg-blue-500/10" : "bg-green-500/10"} border ${borderClass} hover:bg-white/5 transition-all`}
            >
              <div className={`w-12 h-12 rounded-full ${bgClass} flex items-center justify-center`}>
                <Phone className="text-white" size={24} />
              </div>
              <div>
                <p className="text-white font-semibold">WhatsApp</p>
                <p className="text-white/60">{whatsapp}</p>
              </div>
            </a>
          )}
          <div className="pt-6 border-t border-white/10">
            <p className="text-white font-semibold mb-4">Seguinos en redes</p>
            <div className="flex gap-4">
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <Instagram className="text-white" size={24} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-3xl overflow-hidden border border-white/10 h-80 lg:h-auto relative group">
        {/* Mapa siempre visible */}
        <iframe
          src={mapSrc}
          width="100%"
          height="100%"
          style={{ border: 0, minHeight: '400px' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Mapa de ${address}`}
          className="grayscale hover:grayscale-0 transition-all duration-500"
        ></iframe>

        {/* Overlay con dirección y botón */}
        <div className="absolute bottom-4 left-4 right-4 space-y-3">
          <div className="bg-slate-900/90 p-4 rounded-xl border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <MapPin className={colorClass} size={20} />
              {address}
            </div>
          </div>

          {/* Botón para abrir en Google Maps */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 w-full ${bgClass} hover:opacity-90 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg`}
          >
            <MapPin size={20} />
            <span>Abrir en Google Maps</span>
          </a>
        </div>
      </div>
    </div>
  );
};

UnifiedComplexSection.displayName = "UnifiedComplexSection";
