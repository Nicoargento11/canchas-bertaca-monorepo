"use client";
import React from "react";
import Link from "next/link";
import { Phone, Mail, Instagram, Facebook, MapPin } from "lucide-react";

export const LocationContact = React.memo(() => {
  return (
    <section id="contacto" className="relative bg-slate-900 py-20 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-black text-white text-center mb-12">
          Ubicación y Contacto
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div
            className="rounded-3xl p-8"
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(20px)",
              border: "2px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <h3 className="text-2xl font-bold text-white mb-8">Contactanos</h3>

            <div className="space-y-6">
              <a
                href="https://wa.me/5491234567890"
                className="flex items-center gap-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <Phone className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-white font-semibold">WhatsApp</p>
                  <p className="text-white/60">+54 9 11 2345-6789</p>
                </div>
              </a>

              <a
                href="mailto:info@bertaca.com"
                className="flex items-center gap-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <Mail className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-white font-semibold">Email</p>
                  <p className="text-white/60">info@bertaca.com</p>
                </div>
              </a>

              <div className="pt-6 border-t border-white/10">
                <p className="text-white font-semibold mb-4">Seguinos en redes</p>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
                    aria-label="Instagram"
                  >
                    <Instagram className="text-white" size={24} />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
                    aria-label="Facebook"
                  >
                    <Facebook className="text-white" size={24} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Map Placeholder - Fixed aspect ratio to prevent CLS */}
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(20px)",
              border: "2px solid rgba(255, 255, 255, 0.1)",
              aspectRatio: "1 / 1",
            }}
          >
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-center">
                <MapPin className="text-Primary-light mx-auto mb-4" size={48} />
                <p className="text-white font-semibold text-lg mb-2">Av. Principal 1234</p>
                <p className="text-white/60">Buenos Aires, Argentina</p>
                <button className="mt-4 px-6 py-3 bg-Primary rounded-xl text-white font-semibold hover:bg-Primary/80 transition-all">
                  Ver en Google Maps
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

LocationContact.displayName = "LocationContact";
