import { Complex } from "@/services/complex/complex";

/**
 * Generates LocalBusiness structured data (JSON-LD) for SEO
 * This helps Google understand your business and show it in local searches
 */
export function generateLocalBusinessSchema(complex: Complex) {
    return {
        "@context": "https://schema.org",
        "@type": "SportsActivityLocation",
        "name": complex.name === "bertaca" ? "Canchas Bertaca" : "Canchas Seven",
        "description": complex.name === "bertaca"
            ? "Complejo deportivo de fútbol 5 techado en Resistencia, Chaco. Canchas de césped sintético, reservas online, escuelitas y torneos."
            : "Complejo deportivo de fútbol 7 al aire libre en Resistencia, Chaco. Canchas de césped sintético, reservas online.",
        "image": complex.coverImage || "/images/default-complex.jpg",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": complex.address || "",
            "addressLocality": "Resistencia",
            "addressRegion": "Chaco",
            "addressCountry": "AR"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": complex.latitude?.toString() || (complex.name === "bertaca" ? "-27.4581" : "-27.4591"),
            "longitude": complex.longitude?.toString() || (complex.name === "bertaca" ? "-58.9867" : "-58.9877")
        },
        "telephone": complex.phone || "",
        "priceRange": "$$",
        "openingHoursSpecification": [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                "opens": "08:00",
                "closes": "23:00"
            }
        ],
        "amenityFeature": [
            {
                "@type": "LocationFeatureSpecification",
                "name": "Césped Sintético",
                "value": true
            },
            {
                "@type": "LocationFeatureSpecification",
                "name": "Reservas Online",
                "value": true
            },
            {
                "@type": "LocationFeatureSpecification",
                "name": "Estacionamiento",
                "value": true
            }
        ],
        "sport": "Soccer",
        "url": `https://www.reservasfutbol.com.ar/${complex.slug}`,
        "sameAs": [
            complex.instagram || "",
            complex.facebook || "",
        ].filter(Boolean)
    };
}

/**
 * Generates Organization structured data for the main page
 */
export function generateOrganizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Canchas Bertaca & Seven",
        "alternateName": [
            "Bertaca",
            "Seven",
            "Canchas Bertaca",
            "Canchas Seven",
            "Reservas Bertaca",
            "Reservas Seven"
        ],
        "url": "https://www.reservasfutbol.com.ar",
        "logo": "https://www.reservasfutbol.com.ar/logo.png",
        "description": "Complejos deportivos de fútbol en Resistencia, Chaco. Bertaca (F5 techado) y Seven (F7 aire libre). Reservas online, escuelitas y torneos.",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Resistencia",
            "addressRegion": "Chaco",
            "addressCountry": "AR"
        },
        "areaServed": {
            "@type": "City",
            "name": "Resistencia, Chaco"
        },
        "keywords": "canchas futbol resistencia, bertaca, seven, futbol 5, futbol 7, reservas online, canchas chaco"
    };
}
