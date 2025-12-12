"use client";
import React from "react";
import { GraduationCap, Cake, DollarSign, CheckCircle2 } from "lucide-react";

export const ServicesGrid = React.memo(() => {
  return (
    <section id="servicios" className="relative bg-slate-950 py-20 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-black text-white text-center mb-12">
          Servicios y Precios
        </h2>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Large Card - Escuelita */}
          <div
            className="lg:col-span-2 lg:row-span-2 rounded-3xl p-8 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500"
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(20px)",
              border: "2px solid rgba(59, 130, 246, 0.3)",
            }}
          >
            <div className="relative z-10">
              <GraduationCap className="text-blue-400 mb-4" size={48} />
              <h3 className="text-3xl font-black text-white mb-4">Escuelita de Fútbol</h3>
              <p className="text-white/70 text-lg mb-6">
                Clases profesionales para niños de 5 a 14 años. Desarrollo técnico, táctico y
                trabajo en equipo.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-white/80">
                  <CheckCircle2 className="text-blue-400" size={20} />
                  <span>Lunes y Miércoles 17:00 - 18:30</span>
                </li>
                <li className="flex items-center gap-2 text-white/80">
                  <CheckCircle2 className="text-blue-400" size={20} />
                  <span>Entrenadores certificados</span>
                </li>
                <li className="flex items-center gap-2 text-white/80">
                  <CheckCircle2 className="text-blue-400" size={20} />
                  <span>Equipamiento incluido</span>
                </li>
              </ul>
              <div className="inline-block px-6 py-3 bg-blue-500 rounded-xl text-white font-bold">
                $15.000/mes
              </div>
            </div>
          </div>

          {/* Medium Card - Cumpleaños */}
          <div
            className="lg:row-span-1 rounded-3xl p-8 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500"
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(20px)",
              border: "2px solid rgba(34, 197, 94, 0.3)",
            }}
          >
            <Cake className="text-green-400 mb-4" size={40} />
            <h3 className="text-2xl font-black text-white mb-3">Cumpleaños y Eventos</h3>
            <p className="text-white/70 mb-4">Celebrá tu cumple con un partido inolvidable</p>
            <div className="space-y-2 text-sm text-white/60">
              <p>• Cancha exclusiva 2hs</p>
              <p>• Decoración temática</p>
              <p>• Asador disponible</p>
            </div>
            <div className="mt-4 text-green-400 font-bold text-lg">Desde $30.000</div>
          </div>

          {/* Tall Card - Precios */}
          <div
            className="lg:row-span-2 rounded-3xl p-8 relative overflow-hidden"
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(20px)",
              border: "2px solid rgba(251, 191, 36, 0.3)",
            }}
          >
            <DollarSign className="text-yellow-400 mb-4" size={40} />
            <h3 className="text-2xl font-black text-white mb-6">Lista de Precios</h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-blue-300 font-bold mb-3">Fútbol 5 - Bertaca</h4>
                <div className="space-y-2 text-white/80 text-sm">
                  <div className="flex justify-between">
                    <span>Lun-Vie (08:00-18:00)</span>
                    <span className="font-bold">$12.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lun-Vie (18:00-24:00)</span>
                    <span className="font-bold">$15.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sáb-Dom</span>
                    <span className="font-bold">$18.000</span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-white/10" />

              <div>
                <h4 className="text-green-300 font-bold mb-3">Fútbol 7 - Seven</h4>
                <div className="space-y-2 text-white/80 text-sm">
                  <div className="flex justify-between">
                    <span>Lun-Vie (08:00-18:00)</span>
                    <span className="font-bold">$18.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lun-Vie (18:00-24:00)</span>
                    <span className="font-bold">$22.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sáb-Dom</span>
                    <span className="font-bold">$25.000</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <p className="text-yellow-300 text-xs font-semibold">* Precios por hora de juego</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

ServicesGrid.displayName = "ServicesGrid";
