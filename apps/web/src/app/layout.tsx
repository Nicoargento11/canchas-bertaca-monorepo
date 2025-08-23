import type { Metadata } from "next";
import { PT_Sans_Caption } from "next/font/google";
import "./globals.css";
import { ModalProvider } from "@/contexts/modalContext";
import { ReserveProvider } from "@/contexts/newReserveContext";
import { Toaster } from "sonner";

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

const sansCaption = PT_Sans_Caption({ weight: "400", subsets: ["latin"] });
export const metadata = {
  title: "Canchas Bertaca",
  description: "Sitio web oficial del Club Bertaca",
  icons: {
    icon: "/images/bertaca_logo.png", // Ruta desde la carpeta /public
    // sizes: "32x32", // <- Sugiere un tamaño de 32x32
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      {/* <head>
        <link rel="icon" type="image/png" href="/public/images/bertaca_logo.png" />
      </head> */}
      <ModalProvider>
        <ReserveProvider>
          <body className={`${sansCaption.className} `}>
            <Toaster expand={true} richColors position="bottom-right" />

            {children}
          </body>
        </ReserveProvider>
      </ModalProvider>
    </html>
  );
}
