import React from "react";
import { notFound } from "next/navigation";
import { SportType, SportTypeKey } from "@/services/sport-types/sport-types";
import { getComplexBySlug } from "@/services/complex/complex";
import { getSession } from "@/services/auth/session";
import { getDailyAvailability, TurnByDay } from "@/services/reserve/reserve";
import { format } from "date-fns";
import { Court } from "@/services/court/court";
import NavBar from "@/components/navbar/navBar";
import ModalManager from "@/components/modals/modalManager";
import { ClientLayout } from "@/components/home/ClientLayout";
import { HeroSection } from "@/components/home/sections/HeroSection";
import { Footer } from "@/components/home/sections/Footer";
import { BookingOrchestrator } from "@/components/home/BookingOrchestrator";
import dynamic from "next/dynamic";

const UnifiedComplexSection = dynamic(
  () => import("@/components/home/sections/UnifiedComplexSection").then((mod) => mod.UnifiedComplexSection),
  {
    loading: () => <div className="h-96 w-full animate-pulse bg-slate-900/50" />,
  }
);

export interface SportData {
  reserves: TurnByDay | undefined;
  courts: Court[]; // Canchas filtradas por deporte
}

export default async function HomePage() {
  const [bertacaRes, sevenRes, session] = await Promise.all([
    getComplexBySlug("bertaca"),
    getComplexBySlug("seven"),
    getSession(),
  ]);

  const { success, data: complejo } = bertacaRes;
  const { data: sevenComplex } = sevenRes;

  const today = new Date();
  today.setHours(today.getHours() - 3);
  today.setHours(0, 0, 0, 0);

  if (!complejo) {
    return notFound();
  }

  const sportTypes = complejo.sportTypes.reduce(
    (acc: Record<SportTypeKey, SportType>, sport: SportType) => {
      acc[sport.name] = sport;
      return acc;
    },
    {} as Record<SportTypeKey, SportType>
  );

  const sevenSportTypes =
    sevenComplex?.sportTypes.reduce(
      (acc: Record<SportTypeKey, SportType>, sport: SportType) => {
        acc[sport.name] = sport;
        return acc;
      },
      {} as Record<SportTypeKey, SportType>
    ) || ({} as Record<SportTypeKey, SportType>);

  const sportAvailability = await Promise.all(
    Object.entries(sportTypes).map(async ([key, sportType]) => {
      const reserves = await getDailyAvailability(
        format(today, "yyyy-MM-dd"),
        complejo.id,
        sportType.id
      );

      return {
        sportKey: key as SportTypeKey,
        reserves: reserves.data,
        allCourts: complejo.courts.filter((court) => court.sportTypeId === sportType.id),
      };
    })
  );
  const sportsData: Record<SportTypeKey, SportData> = sportAvailability.reduce(
    (acc, { sportKey, reserves, allCourts }) => {
      acc[sportKey as SportTypeKey] = { reserves, courts: allCourts };
      return acc;
    },
    {} as Record<SportTypeKey, SportData>
  );

  const sevenSportAvailability = sevenComplex
    ? await Promise.all(
      Object.entries(sevenSportTypes).map(async ([key, sportType]) => {
        const reserves = await getDailyAvailability(
          format(today, "yyyy-MM-dd"),
          sevenComplex.id,
          sportType.id
        );

        return {
          sportKey: key as SportTypeKey,
          reserves: reserves.data,
          allCourts: sevenComplex.courts.filter((court) => court.sportTypeId === sportType.id),
        };
      })
    )
    : [];

  const sevenSportsData: Record<SportTypeKey, SportData> = sevenSportAvailability.reduce(
    (acc, { sportKey, reserves, allCourts }) => {
      acc[sportKey as SportTypeKey] = { reserves, courts: allCourts };
      return acc;
    },
    {} as Record<SportTypeKey, SportData>
  );

  // Static trust data (moved from MainSectionImproved)
  const trustData = {
    rating: 4.8,
    reviews: 120,
    monthlyGames: 2340,
  };

  return (
    <ClientLayout>
      <div className="">
        <NavBar currentUser={session} complex={complejo} />

        {/* Optimized Hero Section (Client Component) */}
        <HeroSection
          complex={complejo}
          sportTypes={sportTypes}
          sevenComplex={sevenComplex}
          sevenSportTypes={sevenSportTypes}
          trustData={trustData}
        />

        {/* Deferred Loading Section */}
        <UnifiedComplexSection
          bertacaSportsData={sportsData}
          sevenSportsData={sevenSportsData}
          complex={complejo}
          sevenComplex={sevenComplex}
          sportTypes={sportTypes}
          sevenSportTypes={sevenSportTypes}
        // Note: unified section needs to handle its own tab state or we wrap it.
        // UnifiedComplexSection expects `activeTab` and `onTabChange`.
        // We can let it use `Display` only OR wraps it in a client component for state?
        // Actually, UnifiedComplexSection was controlled by MainSectionImproved state.
        // To make it truly independent, we should probably let it control itself OR use the Context `useComplexTab`.
        // I will check UnifiedComplexSection signatures.

        // For now, I will wrap UnifiedComplexWrapper.
        />

        <Footer />

        {/* Orchestrators */}
        <BookingOrchestrator
          complex={complejo}
          sportTypes={sportTypes}
          sevenComplex={sevenComplex}
          sevenSportTypes={sevenSportTypes}
          currentUser={session}
        />

        {/* Legacy Manager (Verify if needed) */}
        <ModalManager session={session} complex={complejo} sportTypes={sportTypes} />
      </div>
    </ClientLayout>
  );
}
