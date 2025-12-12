"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, CheckCircle2, DollarSign, Shield, Info } from "lucide-react";
import { motion } from "framer-motion";

export const ComplexDetailsSection = React.memo(() => {
  return (
    <section id="complejos" className="relative bg-slate-950 py-20 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Nuestros Complejos</h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Explora las características únicas de cada una de nuestras sedes.
          </p>
        </div>

        <Tabs defaultValue="bertaca" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-900/50 border border-white/10 p-1 h-auto rounded-xl">
              <TabsTrigger
                value="bertaca"
                className="text-lg py-3 data-[state=active]:bg-Primary data-[state=active]:text-white rounded-lg transition-all"
              >
                Bertaca (F5)
              </TabsTrigger>
              <TabsTrigger
                value="seven"
                className="text-lg py-3 data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all"
              >
                Seven (F7)
              </TabsTrigger>
            </TabsList>
          </div>

          {/* BERTACA CONTENT */}
          <TabsContent value="bertaca" className="mt-0 focus-visible:outline-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
            >
              {/* Left Column: Info & Features */}
              <div className="space-y-8">
                <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
                  <h3 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <span className="w-3 h-8 bg-Primary rounded-full"></span>
                    Sede Bertaca
                  </h3>
                  <p className="text-blue-300 font-medium mb-6 uppercase tracking-wider text-sm">
                    Fútbol 5 • Techado • Sintético
                  </p>

                  <div className="space-y-4 mb-8">
                    <p className="text-white/80 leading-relaxed">
                      Nuestro complejo principal diseñado para el juego rápido y dinámico. Ideal
                      para partidos intensos sin importar el clima gracias a su techo completo.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FeatureItem icon={Shield} text="Techado completo" color="text-blue-400" />
                    <FeatureItem
                      icon={CheckCircle2}
                      text="Piso Sintético Pro"
                      color="text-blue-400"
                    />
                    <FeatureItem icon={Info} text="3 Canchas Disponibles" color="text-blue-400" />
                    <FeatureItem
                      icon={DollarSign}
                      text="Precios Accesibles"
                      color="text-blue-400"
                    />
                  </div>
                </div>

                {/* Location Card */}
                <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <MapPin className="text-Primary" /> Ubicación
                  </h4>
                  <p className="text-white/70 mb-4">Av. Bertaca 1234, Resistencia, Chaco</p>
                  <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-800 relative">
                    {/* Placeholder for Map */}
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3540.367636837866!2d-59.0234567!3d-27.4583456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDI3JzMwLjAiUyA1OcKwMDEnMjQuNCJX!5e0!3m2!1ses!2sar!4v1635789012345!5m2!1ses!2sar"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      className="opacity-80 hover:opacity-100 transition-opacity"
                    ></iframe>
                  </div>
                </div>
              </div>

              {/* Right Column: Images/Gallery */}
              <div className="space-y-6">
                <div className="aspect-video rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl relative group">
                  <img
                    src="https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200&h=800&fit=crop"
                    alt="Cancha Bertaca"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
                  <div className="absolute bottom-6 left-6">
                    <span className="bg-Primary text-white px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">
                      DESTACADO
                    </span>
                    <p className="text-white font-bold text-xl">Experiencia Profesional</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 relative group">
                    <img
                      src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop"
                      alt="Detalle 1"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 relative group">
                    <img
                      src="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&h=400&fit=crop"
                      alt="Detalle 2"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* SEVEN CONTENT */}
          <TabsContent value="seven" className="mt-0 focus-visible:outline-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
            >
              {/* Left Column: Info & Features */}
              <div className="space-y-8">
                <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
                  <h3 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <span className="w-3 h-8 bg-green-600 rounded-full"></span>
                    Sede Seven
                  </h3>
                  <p className="text-green-400 font-medium mb-6 uppercase tracking-wider text-sm">
                    Fútbol 7 • Aire Libre • Espacioso
                  </p>

                  <div className="space-y-4 mb-8">
                    <p className="text-white/80 leading-relaxed">
                      Disfruta del fútbol al aire libre en nuestras canchas más amplias. Perfecto
                      para equipos más grandes y partidos con más recorrido.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FeatureItem icon={Shield} text="Aire Libre" color="text-green-400" />
                    <FeatureItem icon={CheckCircle2} text="Césped Premium" color="text-green-400" />
                    <FeatureItem icon={Info} text="Mayor Tamaño" color="text-green-400" />
                    <FeatureItem
                      icon={DollarSign}
                      text="Torneos Fines de Semana"
                      color="text-green-400"
                    />
                  </div>
                </div>

                {/* Location Card */}
                <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <MapPin className="text-green-500" /> Ubicación
                  </h4>
                  <p className="text-white/70 mb-4">Calle Seven 567, Resistencia, Chaco</p>
                  <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-800 relative">
                    {/* Placeholder for Map */}
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3540.367636837866!2d-59.0234567!3d-27.4583456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDI3JzMwLjAiUyA1OcKwMDEnMjQuNCJX!5e0!3m2!1ses!2sar!4v1635789012345!5m2!1ses!2sar"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      className="opacity-80 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                    ></iframe>
                  </div>
                </div>
              </div>

              {/* Right Column: Images/Gallery */}
              <div className="space-y-6">
                <div className="aspect-video rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl relative group">
                  <img
                    src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&h=800&fit=crop"
                    alt="Cancha Seven"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
                  <div className="absolute bottom-6 left-6">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">
                      POPULAR
                    </span>
                    <p className="text-white font-bold text-xl">Fútbol bajo las estrellas</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 relative group">
                    <img
                      src="https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&h=400&fit=crop"
                      alt="Detalle Seven 1"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 relative group">
                    <img
                      src="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&h=400&fit=crop"
                      alt="Detalle Seven 2"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
});

const FeatureItem = ({ icon: Icon, text, color }: { icon: any; text: string; color: string }) => (
  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
    <Icon className={color} size={20} />
    <span className="text-white/90 font-medium text-sm">{text}</span>
  </div>
);

ComplexDetailsSection.displayName = "ComplexDetailsSection";
