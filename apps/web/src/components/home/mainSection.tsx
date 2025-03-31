"use client";
import Link from "next/link";
import { useModal } from "@/contexts/modalContext";
import { ChevronsDown, CalendarCheck, ArrowRightCircle } from "lucide-react";
import { motion } from "framer-motion";

export const MainSection = () => {
  const { onOpenReserve } = useModal();

  return (
    <div className="relative h-screen w-full">
      {/* Fondo con video */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          src="/videos/cancha-futbol1.mp4"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex items-center sm:justify-start justify-center h-full w-full px-4 sm:px-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center sm:text-left p-4 w-full max-w-[90vw] sm:max-w-lg md:max-w-xl flex flex-col items-center sm:items-start"
        >
          {/* Título principal */}
          <h1 className="relative z-30 bg-gradient-to-br from-Primary-light from-30% via-Primary-dark via-80% to-Primary bg-clip-text font-title text-5xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-transparent mb-6 sm:mb-8">
            Reserva tu Cancha
          </h1>

          {/* Descripción */}
          <p className="text-xl sm:text-xl md:text-2xl text-white mb-8 sm:mb-10 text-center sm:text-left px-2 sm:px-0 leading-relaxed">
            Juega con tus amigos en una cancha de primer nivel.
            <br className="hidden sm:block" />
            Reserva fácil, rápido y asegura tu partido.
          </p>

          {/* Contenedor de botones */}
          <div className="flex flex-col w-full max-w-[320px] sm:max-w-sm space-y-5 sm:space-y-4">
            {/* Botón principal */}
            <button
              onClick={onOpenReserve}
              className="w-full px-6 py-4 sm:px-6 sm:py-4 rounded-xl border-2 border-Primary-light text-Primary-light font-bold text-2xl sm:text-2xl relative overflow-hidden group transition-all ease-in-out duration-300 hover:text-Primary hover:border-Primary hover:bg-Primary/10"
            >
              <span className="flex items-center justify-center gap-3">
                <ArrowRightCircle
                  size={32}
                  className="group-hover:text-Primary"
                />
                Reservar ahora
              </span>
              <span className="absolute inset-0 border-2 border-Primary opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 ease-in-out"></span>
            </button>

            {/* Botón secundario */}
            <Link
              href="#TurnosHoy"
              className="w-full px-6 py-4 sm:px-6 sm:py-4 rounded-xl text-Complementary font-bold text-2xl sm:text-2xl hover:text-Accent-1 transition-all duration-300 flex items-center justify-center gap-3 border-[2px] border-transparent hover:border-Accent-1 hover:border-opacity-60 shadow-[0_4px_18px_rgba(0,0,0,0.35)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.45)]"
            >
              <CalendarCheck size={30} />
              <span>Ver horarios</span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Botón de desplazamiento */}
      <div className="absolute bottom-10 sm:bottom-12 w-full flex justify-center z-20">
        <Link href="#Precios">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex items-center justify-center w-14 h-14 sm:w-12 sm:h-12 bg-gradient-to-br from-Primary-light to-Primary-dark rounded-full shadow-2xl hover:scale-110 transition hover:shadow-3xl"
          >
            <ChevronsDown color="yellow" size={36} className="sm:size-[40px]" />
          </motion.div>
        </Link>
      </div>
    </div>
  );
};
