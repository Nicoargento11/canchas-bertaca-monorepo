"use client";
import Link from "next/link";
import { useModal } from "@/contexts/modalContext";
import { ChevronsDown, CalendarCheck, ArrowRightCircle } from "lucide-react";
import { motion } from "framer-motion";

export const MainSection = () => {
  const { onOpenReserve } = useModal();

  return (
    <div className="relative h-screen w-full ">
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

      <div className="relative z-10 flex items-center justify-between h-full w-full px-12">
        {/* Título a la izquierda */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-left p-6 max-w-lg flex flex-col items-start"
        >
          <h1 className="relative z-30 max-w-[616px] bg-gradient-to-br from-Primary-light from-30% via-Primary-dark via-80% to-Primary bg-clip-text font-title text-6xl font-semibold leading-[0.9] tracking-tight text-transparent lg:max-w-[527px] lg:text-5xl md:max-w-[441px] md:text-4xl sm:max-w-64 sm:text-2xl flex items-center gap-3 mb-6">
            Reserva tu Cancha
          </h1>

          <p className="text-xl text-white mb-8">
            Juega con tus amigos en una cancha de primer nivel. Reserva fácil,
            rápido y asegura tu partido.
          </p>

          {/* Botón principal: Reservar ahora */}
          <button
            onClick={onOpenReserve}
            className="px-6 py-4 rounded-lg border-2 border-Primary-light text-Primary-light font-semibold text-2xl relative overflow-hidden group transition-all ease-in-out duration-300 hover:text-Primary hover:border-Primary hover:bg-Primary/10 mb-4"
          >
            {/* Texto principal con ícono animado */}
            <span className="flex items-center gap-3">
              <ArrowRightCircle
                size={35}
                className="group-hover:text-Primary"
              />
              Reservar ahora
            </span>

            {/* Borde que se expande */}
            <span className="absolute inset-0 border-2 border-Primary opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 ease-in-out"></span>
          </button>

          {/* Botón secundario: Ver horarios disponibles */}
          <Link
            href="#TurnosHoy"
            className="px-6 py-4 rounded-lg text-Complementary font-semibold text-2xl hover:text-Accent-1 transition-all duration-300 flex items-center gap-3 border-[2px] border-transparent hover:border-Accent-1 hover:border-opacity-60 shadow-[0_4px_18px_rgba(0,0,0,0.35)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.45)]"
          >
            <CalendarCheck size={30} /> Ver horarios disponibles
          </Link>
        </motion.div>

        {/* Call to action a la derecha */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-right p-6 max-w-lg"
        ></motion.div>
      </div>

      {/* Botón de desplazamiento hacia abajo */}
      <div className="absolute bottom-12 w-full flex justify-center z-20">
        <Link href="#Precios">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-Primary-light to-Primary-dark rounded-full shadow-2xl hover:scale-110 transition hover:shadow-3xl"
          >
            <ChevronsDown color="yellow" size={40} />
          </motion.div>
        </Link>
      </div>
    </div>
  );
};
