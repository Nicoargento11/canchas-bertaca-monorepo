"use client";
import Link from "next/link";
import { useModal } from "@/contexts/modalContext";
import {
  ChevronsDown,
  CalendarCheck,
  ArrowRightCircle,
  Edit3,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";

export const MainSection = () => {
  const { onOpenReserve, onOpenReview } = useModal();

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
            <div className="w-full flex gap-2">
              <Link
                href="#TurnosHoy"
                className="w-[80%] px-6 py-4 sm:px-6 sm:py-4 rounded-xl text-Complementary font-bold text-2xl sm:text-2xl hover:text-Accent-1 transition-all duration-300 flex items-center justify-center gap-3 border-2 border-Accent-1 hover:border-opacity-60 shadow-[0_4px_18px_rgba(0,0,0,0.35)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.45)]"
              >
                <CalendarCheck size={30} />
                <span>Ver horarios</span>
              </Link>
              <button
                onClick={onOpenReview}
                className="w-[20%] aspect-square p-2 rounded-xl backdrop-blur-lg bg-green-900/40 text-green-100 font-bold hover:bg-green-800/50 transition-all duration-300 flex flex-col items-center justify-center border-2 border-green-700/50 hover:border-green-500/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_25px_rgba(74,222,128,0.25)] relative group overflow-hidden"
                title="Dejar tu reseña"
              >
                {/* Fondo con gradiente oscuro */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-green-800/30 to-green-950/20 rounded-xl" />

                {/* Iconos */}
                <div className="relative z-10">
                  <Edit3
                    size={20}
                    className="text-green-500 absolute -top-1 -right-1 z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                  />
                  <Star
                    size={24}
                    className="fill-green-500 text-green-500/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                  />
                </div>

                {/* Texto */}
                <span className="text-xs font-semibold mt-1 text-green-50 z-10">
                  Opinar
                </span>

                {/* Tooltip funcional - Cambio clave aquí */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-green-950/90 text-green-50 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap backdrop-blur-sm border border-green-700/40 shadow-xl z-20 pointer-events-none">
                  Comparte tu experiencia
                  {/* Triángulo del tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-green-950/90" />
                </div>

                {/* Efecto hover */}
                <div className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/10 transition-all duration-500 rounded-xl" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Botón de desplazamiento */}
      <div className="absolute bottom-10 sm:bottom-12 w-full flex justify-center z-20">
        <Link href="#Precios">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex items-center justify-center w-12 h-12 sm:w-12 sm:h-12 bg-gradient-to-br from-Primary-light to-Primary-dark rounded-full shadow-2xl hover:scale-110 transition hover:shadow-3xl"
          >
            <ChevronsDown color="yellow" size={36} className="sm:size-[40px]" />
          </motion.div>
        </Link>
      </div>
    </div>
  );
};
