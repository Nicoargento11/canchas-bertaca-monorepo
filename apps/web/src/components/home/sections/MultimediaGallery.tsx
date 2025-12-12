"use client";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";

const slides = [
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200&h=600&fit=crop",
    title: "Cancha Bertaca",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&h=600&fit=crop",
    title: "Cancha Seven",
  },
  {
    type: "video",
    url: "https://res.cloudinary.com/dhignxely/video/upload/q_auto,f_auto,w_1280/v1745288680/cancha-futbol1_ub6mf9.mp4",
    title: "Tour Virtual",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200&h=600&fit=crop",
    title: "Instalaciones",
  },
];

export const MultimediaGallery = React.memo(() => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative bg-slate-900 py-20 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-black text-white text-center mb-12">
          Nuestras Instalaciones
        </h2>

        {/* Carousel with fixed aspect ratio to prevent CLS */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{ paddingBottom: "41.67%", position: "relative" }}
        >
          <div style={{ position: "absolute", inset: 0 }}>
            {slides.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                {slide.type === "image" ? (
                  <img
                    src={slide.url}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <video
                    src={slide.url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-8 left-8">
                  <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                    {slide.type === "video" && <PlayCircle size={32} />}
                    {slide.title}
                  </h3>
                </div>
              </div>
            ))}

            {/* Navigation */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
              aria-label="Previous slide"
            >
              <ChevronLeft className="text-white" size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
              aria-label="Next slide"
            >
              <ChevronRight className="text-white" size={24} />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentSlide ? "w-8 bg-Primary" : "bg-white/50"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

MultimediaGallery.displayName = "MultimediaGallery";
