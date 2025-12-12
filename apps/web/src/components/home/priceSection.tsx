"use client";
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import canchaImagen from "../../../public/canchasF5.jpg"; // Cambia esto por la ruta de tu imagen
import { Rate } from "@/services/rate/rate";

interface PriceSectionProps {
  rates: Rate[];
}

interface PriceCardProps {
  title: string;
  description: string;
  priceDay: number;
  priceNight: number;
}

const PriceSection: React.FC<PriceSectionProps> = React.memo(({ rates }) => {
  const getRatePrice = (rateName: string): number => {
    const rate = rates.find((r) => r.name === rateName);
    return rate?.price || 0;
  };
  return (
    <div className="py-16 text-center bg-black/80 relative" id="Precios">
      {/* Overlay para dar profundidad */}
      <div className="absolute inset-0 bg-Primary-darker"></div>

      {/* Contenido de la sección */}
      <div className="relative z-10">
        <h2 className="text-4xl font-semibold text-Accent-1 mb-8">Nuestros Precios</h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          <>
            <PriceCard
              title="Dias de semana"
              description="Reserva una cancha de lunes a viernes y disfruta de nuestro precio."
              priceDay={getRatePrice("Semana Diurna")}
              priceNight={getRatePrice("Semana Nocturna")}
            />
            <PriceCard
              title="Fin de Semana"
              description="Reserva una cancha los sábados y domingos y obtén un descuento."
              priceDay={getRatePrice("Fin de Semana Diurna")}
              priceNight={getRatePrice("Fin de Semana Nocturna")}
            />
          </>
        </div>
      </div>
    </div>
  );
});

const PriceCard: React.FC<PriceCardProps> = React.memo(
  ({ title, description, priceDay, priceNight }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <Card className="relative flex flex-col bg-Primary-darker rounded-xl border border-Primary-dark/40 shadow-xl hover:shadow-2xl transition-all duration-300 mt-4 sm:mt-10 w-full md:w-96">
          {/* Imagen de fondo con overlay */}
          <CardHeader className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-Primary-dark/60 text-white shadow-lg -mt-6 relative h-44 md:h-56">
            <div className="absolute inset-0">
              <div className="opacity-80 absolute inset-0 bg-Primary-dark/40">
                <Image src={canchaImagen} alt="Imagen de fondo" fill className="object-cover" />
              </div>
            </div>
          </CardHeader>

          {/* Contenido de la tarjeta */}
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-Complementary mb-4">{title}</h3>
            <p className="text-lg text-white/80">{description}</p>
          </CardContent>

          {/* Precios e iconos */}
          <CardFooter className="flex flex-col pt-0 justify-center">
            <div className="flex flex-col items-center w-full gap-4 px-8 py-6 rounded-2xl bg-sky-950 shadow-inner border border-Primary-dark/30 hover:scale-[1.02] transition-transform duration-300">
              <p className="flex gap-2 items-center text-2xl font-bold text-Primary-light">
                ${priceDay} <Sun size={25} className="text-Complementary" />
              </p>
              <p className="flex gap-2 items-center text-2xl font-bold text-Primary-light">
                ${priceNight} <Moon size={20} className="text-Complementary" />
              </p>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }
);

export default PriceSection;
