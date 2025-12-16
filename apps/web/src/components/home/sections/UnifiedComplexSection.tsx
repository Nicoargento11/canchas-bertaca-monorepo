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
import { m, AnimatePresence } from "framer-motion";
import TableReservesToday from "@/components/TableReservesToday";
import { Complex } from "@/services/complex/complex";
import { SportType, SportTypeKey } from "@/services/sport-types/sport-types";
import { TurnByDay } from "@/services/reserve/reserve";
import { Court } from "@/services/court/court";

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
}

const ImageSlider = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl group">
      <AnimatePresence mode="wait">
        <m.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-full"
        >
          <Image
            src={images[currentIndex]}
            alt={`Slide ${currentIndex}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </m.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 pointer-events-none"></div>

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
};

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
            <div className="flex justify-center mb-12">
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

            {/* BERTACA CONTENT */}
            <TabsContent value="bertaca" className="mt-0 focus-visible:outline-none space-y-16">
              {/* 1. Availability Table */}
              <m.div
                id="TurnosHoy-bertaca"
                className="scroll-mt-32"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
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
              </m.div>

              {/* 2. Complex Details & Slider */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-8">
                  <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
                    <h3 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                      Sede Bertaca
                    </h3>
                    <p className="text-blue-300 font-medium mb-6 uppercase tracking-wider text-sm">
                      Fútbol 5 • Techado • Sintético
                    </p>
                    <p className="text-white/80 leading-relaxed mb-8">
                      Nuestro complejo principal diseñado para el juego rápido y dinámico. Ideal
                      para partidos intensos sin importar el clima gracias a su techo completo.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FeatureItem icon={Shield} text="Techado completo" color="text-blue-400" />
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
                  prices={[
                    { label: "Lun-Vie (08:00-18:00)", price: "$12.000" },
                    { label: "Lun-Vie (18:00-24:00)", price: "$15.000" },
                    { label: "Sáb-Dom", price: "$18.000" },
                  ]}
                />
              </div>

              {/* 4. Location & Contact (Bertaca) */}
              <div id="Contacto-bertaca" className="scroll-mt-32">
                <LocationSection
                  address="Fray Bertaca 1642, Resistencia, Chaco"
                  whatsapp="+54 9 3624 895303"
                  instagram="https://www.instagram.com/canchasbertaca"
                  mapSrc="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3540.367636837866!2d-59.0234567!3d-27.4583456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDI3JzMwLjAiUyA1OcKwMDEnMjQuNCJX!5e0!3m2!1ses!2sar!4v1635789012345!5m2!1ses!2sar"
                  color="blue"
                />
              </div>
            </TabsContent>

            {/* SEVEN CONTENT */}
            <TabsContent value="seven" className="mt-0 focus-visible:outline-none space-y-16">
              {/* 1. Availability Table */}
              <m.div
                id="TurnosHoy-seven"
                className="scroll-mt-32"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
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
              </m.div>

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
                  prices={[
                    { label: "Lun-Vie (08:00-18:00)", price: "$14.000" },
                    { label: "Lun-Vie (18:00-24:00)", price: "$18.000" },
                    { label: "Sáb-Dom", price: "$22.000" },
                  ]}
                />
              </div>

              {/* 4. Location & Contact (Seven) */}
              <div id="Contacto-seven" className="scroll-mt-32">
                <LocationSection
                  address="Ruta 16 KM 13.6, Resistencia, Chaco 3500"
                  whatsapp="+54 9 3624 160843"
                  instagram="https://www.instagram.com/canchaseven7"
                  mapSrc="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3540.367636837866!2d-59.0234567!3d-27.4583456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDI3JzMwLjAiUyA1OcKwMDEnMjQuNCJX!5e0!3m2!1ses!2sar!4v1635789012345!5m2!1ses!2sar"
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
  prices,
}: {
  title: string;
  color: "blue" | "green";
  prices: { label: string; price: string }[];
}) => {
  const colorClass = color === "blue" ? "text-blue-400" : "text-green-400";
  const borderClass = color === "blue" ? "border-blue-500/30" : "border-green-500/30";
  const bgClass = color === "blue" ? "bg-blue-500" : "bg-green-500";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Escuelita */}
      <div className="lg:col-span-2 rounded-3xl p-8 relative overflow-hidden group hover:scale-[1.01] transition-all duration-500 bg-slate-900/50 border border-white/10 backdrop-blur-sm">
        <div className="relative z-10">
          <GraduationCap className={`${colorClass} mb-4`} size={48} />
          <h3 className="text-3xl font-black text-white mb-4">Escuelita de Fútbol</h3>
          <p className="text-white/70 text-lg mb-6">
            Clases profesionales para niños de 5 a 14 años. Desarrollo técnico, táctico y trabajo en
            equipo.
          </p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-2 text-white/80">
              <CheckCircle2 className={colorClass} size={20} />
              <span>Lunes y Miércoles 17:00 - 18:30</span>
            </li>
            <li className="flex items-center gap-2 text-white/80">
              <CheckCircle2 className={colorClass} size={20} />
              <span>Entrenadores certificados</span>
            </li>
          </ul>
          <div className={`inline-block px-6 py-3 ${bgClass} rounded-xl text-white font-bold`}>
            $15.000/mes
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
          {prices.map((p, i) => (
            <div
              key={i}
              className="flex justify-between items-center border-b border-white/10 pb-2 last:border-0"
            >
              <span>{p.label}</span>
              <span className="font-bold text-white">{p.price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LocationSection = ({
  address,
  whatsapp,
  instagram,
  mapSrc,
  color,
}: {
  address: string;
  whatsapp?: string;
  instagram?: string;
  mapSrc: string;
  color: "blue" | "green";
}) => {
  const colorClass = color === "blue" ? "text-blue-500" : "text-green-500";
  const bgClass = color === "blue" ? "bg-blue-500" : "bg-green-500";
  const borderClass = color === "blue" ? "border-blue-500/30" : "border-green-500/30";

  const whatsappUrl = whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}` : '#';
  // URL para abrir Google Maps con la ubicación marcada
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
