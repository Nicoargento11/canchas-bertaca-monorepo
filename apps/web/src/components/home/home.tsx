"use client"; // Añadir esto si usas hooks o efectos de React

import { MainSection } from "./mainSection";
// import PriceSection from "./priceSection";
import ScrollToTopButton from "../ScrollToTop";

import SectionSeparator from "./sectionSeparator";
import { CourtSection } from "./courtSection";
import { ContactSection } from "./contactSection";
import { EventSection } from "./eventSection";
import { ReservesTodaySection } from "./reservesTodaySection";
import PriceSection from "./priceSection";
import { SportData } from "@/app/page";
import { SportType, SportTypeKey } from "@/services/sport-types/sport-types";
import { Complex } from "@/services/complex/complex";

interface HomeProps {
  sportsData: Record<SportTypeKey, SportData>;
  complex: Complex;
  sportTypes: Record<SportTypeKey, SportType>;
}

export const Home = ({ complex, sportTypes, sportsData }: HomeProps) => {
  return (
    <main className="min-h-screen w-full bg-black">
      {/* Botón para scroll al top */}
      <ScrollToTopButton />

      {/* Hero Section */}
      <MainSection complex={complex} sportTypes={sportTypes} />

      {/* Sección de Precios */}
      <SectionSeparator />

      {<PriceSection rates={complex.rates} />}

      <CourtSection />
      <EventSection />
      <div id="TurnosHoy" className="scroll-mt-16">
        {sportsData.FUTBOL_5 && (
          <ReservesTodaySection
            reservesDay={sportsData.FUTBOL_5}
            complex={complex}
            sportType={sportTypes.FUTBOL_5}
            sectionTitle="Turnos de Fútbol 5 para hoy"
          />
        )}
      </div>
      <ContactSection />
    </main>
  );
};
