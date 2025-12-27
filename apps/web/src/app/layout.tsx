import type { Metadata } from "next";
import { PT_Sans_Caption } from "next/font/google";
import "./globals.css";
import { ModalProvider } from "@/contexts/modalContext";
import { ReserveProvider } from "@/contexts/newReserveContext";
import { Toaster } from "sonner";
import { FramerMotionProvider } from "@/components/FramerMotionProvider";
import { ReactScanProvider } from "../components/ReactScanProvider";

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });


const sansCaption = PT_Sans_Caption({ weight: "400", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Canchas Bertaca & Seven | Alquiler de Canchas de Fútbol en Resistencia, Chaco",
    template: "%s | Canchas Bertaca & Seven"
  },
  description: "Alquilá canchas de fútbol 5 y 7 en Resistencia, Chaco. Canchas Bertaca (F5 techado) y Seven (F7 aire libre). Reservá online, escuelitas de fútbol, torneos y más.",
  keywords: [
    "canchas futbol resistencia",
    "alquiler canchas chaco",
    "futbol 5 resistencia",
    "futbol 7 resistencia",
    "canchas bertaca",
    "canchas seven",
    "reservar cancha online",
    "escuela de futbol resistencia",
    "torneos futbol chaco",
    "canchas futbol techadas",
    "canchas sintético resistencia"
  ],
  authors: [{ name: "Canchas Bertaca & Seven" }],
  creator: "Canchas Bertaca & Seven",
  publisher: "Canchas Bertaca & Seven",

  // Open Graph (Facebook, WhatsApp, etc.)
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://canchasbertaca.com",
    title: "Canchas Bertaca & Seven | Alquiler de Canchas de Fútbol en Resistencia",
    description: "Alquilá canchas de fútbol 5 y 7 en Resistencia, Chaco. Reservá online ahora. ⚽",
    siteName: "Canchas Bertaca & Seven",
    images: [
      {
        url: "/images/bertaca_og.jpg",
        width: 1200,
        height: 630,
        alt: "Canchas Bertaca & Seven - Resistencia, Chaco"
      }
    ]
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Canchas Bertaca & Seven | Fútbol en Resistencia",
    description: "Alquilá canchas de fútbol 5 y 7 en Resistencia, Chaco ⚽",
    images: ["/images/bertaca_og.jpg"]
  },

  // Robots y indexación
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Geo localización (importante para búsquedas locales)
  other: {
    'geo.region': 'AR-H',
    'geo.placename': 'Resistencia, Chaco',
    'geo.position': '-27.4581;-58.9867',
  },

  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },

  // Canonical URL
  metadataBase: new URL('https://www.reservasfutbol.com.ar'),
};

// Viewport configuration (separated from metadata in Next.js 14+)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <ModalProvider>
        <ReserveProvider>
          <FramerMotionProvider>
            <body className={`${sansCaption.className} `}>
              {process.env.NODE_ENV === "development" && <ReactScanProvider />}
              <Toaster expand={true} richColors position="bottom-right" />
              {children}
            </body>
          </FramerMotionProvider>
        </ReserveProvider>
      </ModalProvider>
    </html>
  );
}
