"use client";
import React from "react";

export const Footer = React.memo(() => {
  return (
    <footer className="relative bg-slate-950 border-t border-white/10 py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="text-center">
            {/* Logos */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <img
                src="/images/bertaca_logo.png"
                alt="Bertaca"
                className="h-16 w-auto object-contain"
              />
              <div className="h-16 w-[2px] bg-white/20"></div>
              <img
                src="/images/seven_logo.png"
                alt="Seven"
                className="h-16 w-auto object-contain"
              />
            </div>
            <h3 className="text-3xl font-black text-Primary-light mb-2">Bertaca & Seven</h3>
            <p className="text-white/60 text-sm">Canchas de fútbol profesionales</p>
          </div>

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
