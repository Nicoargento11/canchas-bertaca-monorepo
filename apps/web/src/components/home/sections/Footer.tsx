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

          {/* Certifications */}
          <div className="flex items-center gap-4">
            <img
              src="/images/Insignia.png"
              alt="Checkout Pro Certified"
              className="h-10 w-auto opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>

          {/* Copyright */}
          <div className="text-white/40 text-sm text-center space-y-1">
            <p>© 2025 Bertaca & Seven. Todos los derechos reservados.</p>
            <p className="text-white/25 text-xs">
              Desarrollado por{" "}
              <a
                href="https://www.linkedin.com/in/nicoeduvaldes/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-Primary-light transition-colors"
              >
                NV Development
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
