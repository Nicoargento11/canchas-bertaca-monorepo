"use client"; // Añadir esto si usas hooks o efectos de React

import { MainSection } from "./mainSection";
import PriceSection from "./priceSection";
import ScrollToTopButton from "../ScrollToTop";
import { Court } from "@/services/courts/courts";
import { TurnByDay } from "@/services/reserves/reserves";
import SectionSeparator from "./sectionSeparator";
import { CourtSection } from "./courtSection";
import { ContactSection } from "./contactSection";
import { EventSection } from "./eventSection";
import { ReservesTodaySection } from "./reservesTodaySection";

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

      <CourtSection />
      <EventSection />
      <ReservesTodaySection reservesDay={reservesDay} />
      <ContactSection />
    </main>
  );
};
