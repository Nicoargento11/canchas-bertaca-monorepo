"use client"; // Añadir esto si usas hooks o efectos de React

import { MainSection } from "./mainSection";
import PriceSection from "./priceSection";
import TableReservesToday from "../TableReservesToday";
import ScrollToTopButton from "../ScrollToTop";
import { Court } from "@/services/courts/courts";
import { TurnByDay } from "@/services/reserves/reserves";
import SectionSeparator from "./sectionSeparator";
import { CourtSection } from "./courtSection";
import { ContactSection } from "./contactSection";

export type PricingKeys =
  | "NoLights"
  | "WithLights"
  | "HolidayLights"
  | "HolidayNoLights"
  | "MidNight";

type Pricing = {
  [key in PricingKeys]: number;
};

interface HomeProps {
  reservesDay: TurnByDay | null;
  courtData: Court;
}

export const Home = ({ reservesDay, courtData }: HomeProps) => {
  const prices = courtData?.pricing.reduce((acc, price) => {
    acc[price.type] = price.amount;
    return acc;
  }, {} as Pricing);

  return (
    <main className="min-h-screen w-full bg-black">
      {/* Botón para scroll al top */}
      <ScrollToTopButton />

      {/* Hero Section */}
      <MainSection />

      {/* Sección de Precios */}
      <SectionSeparator />

      {prices && <PriceSection prices={prices} />}

      {/* Sección de Turnos para hoy */}
      <section
        className="py-16 bg-gradient-to-r from-Primary to-black border-t-2 border-Neutral-dark/20 backdrop-blur-sm"
        id="TurnosHoy"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-semibold bg-gradient-to-br from-Accent-1 via-Complementary to-Primary bg-clip-text text-transparent pb-8">
            Turnos para hoy
          </h2>
          <div className="w-full flex justify-center">
            <div className="bg-Primary-dark/40 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-Primary/30 w-11/12">
              <TableReservesToday dayReserves={reservesDay} />
            </div>
          </div>
        </div>
      </section>
      {/* Galería de fotos */}
      <CourtSection />

      {/* Sección de Contacto */}
      {/* <section
        className="py-16 bg-gradient-to-r from-Primary-dark to-black shadow-2xl "
        id="Contacto"
      >
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-Accent-1 mb-6 drop-shadow-lg">
            ¿Necesitas ayuda?
          </h2>
          <p className="text-lg text-Neutral-light mb-8">
            Contáctanos para reservar tu turno o resolver tus dudas.
          </p>
          <WhatsappButton />
        </div>
      </section> */}

      {/* Footer */}
      {/* <FooterHome /> */}
      <ContactSection />
    </main>
  );
};
