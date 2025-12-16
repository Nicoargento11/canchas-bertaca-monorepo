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
export const metadata = {
  title: "Canchas Bertaca",
  description: "Sitio web oficial del Club Bertaca",
  icons: {
    icon: "/favicon.png", // Nuevo favicon de pelota de fútbol
  },
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
