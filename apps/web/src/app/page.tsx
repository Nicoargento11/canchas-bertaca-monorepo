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
import { MainSectionImproved } from "@/components/home/mainSectionImproved";
import { generateLocalBusinessSchema, generateOrganizationSchema } from "@/lib/seo";

import { ClientLayout } from "@/components/home/ClientLayout";

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

  // Generate structured data for SEO
  const bertacaSchema = generateLocalBusinessSchema(complejo);
  const organizationSchema = generateOrganizationSchema();
  const sevenSchema = sevenComplex ? generateLocalBusinessSchema(sevenComplex) : null;

  return (
    <ClientLayout>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bertacaSchema) }}
      />
      {sevenSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sevenSchema) }}
        />
      )}

      <div className="">
        <NavBar currentUser={session} complex={complejo} />
        {/* <Home sportsData={sportsData} complex={complejo} sportTypes={sportTypes} /> */}
        <MainSectionImproved
          complex={complejo}
          sportTypes={sportTypes}
          sevenComplex={sevenComplex}
          sevenSportTypes={sevenSportTypes}
          currentUser={session}
          bertacaSportsData={sportsData}
          sevenSportsData={sevenSportsData}
        />
        <ModalManager session={session} complex={complejo} sportTypes={sportTypes} />
      </div>
    </ClientLayout>
  );
}
