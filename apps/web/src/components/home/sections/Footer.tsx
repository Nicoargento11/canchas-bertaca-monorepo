"use client";
import React from "react";
import Link from "next/link";

export const Footer = React.memo(() => {
  return (
    <footer className="relative bg-slate-950 border-t border-white/10 py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="text-center">
            <h3 className="text-3xl font-black text-Primary-light mb-2">Bertaca & Seven</h3>
            <p className="text-white/60 text-sm">Canchas de fútbol profesionales</p>
          </div>

          {/* Links */}
          <nav
            className="flex flex-wrap gap-6 justify-center text-sm"
            aria-label="Footer navigation"
          >
            <Link href="#turnos" className="text-white/60 hover:text-white transition-colors">
              Turnos
            </Link>
            <Link href="#servicios" className="text-white/60 hover:text-white transition-colors">
              Servicios
            </Link>
            <Link href="#contacto" className="text-white/60 hover:text-white transition-colors">
              Contacto
            </Link>
            <Link href="/terminos" className="text-white/60 hover:text-white transition-colors">
              Términos y Condiciones
            </Link>
          </nav>

          {/* Copyright */}
          <div className="text-white/40 text-sm text-center">
            <p>© 2025 Bertaca & Seven. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
