import React from "react";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Importa tus imágenes
import img1 from "../../../public/images/canchas.jpg";
import img2 from "../../../public/images/canchas1.jpg";
import img3 from "../../../public/images/canchas2.jpg";
import img4 from "../../../public/images/canchas3.jpg";
import img5 from "../../../public/images/canchas4.jpg";

const images = [img1, img2, img3, img4, img5];

const settings = {
  dots: true,
  infinite: true,
  speed: 800,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 4000,
  arrows: false,
  swipe: true,
  swipeToSlide: true,
  touchThreshold: 10,
  draggable: true,
  pauseOnHover: false,
  cssEase: "ease-out",
  adaptiveHeight: false,
  appendDots: (dots: React.ReactNode) => (
    <div className="absolute bottom-4 left-0 right-0">
      <ul className="flex justify-center space-x-2">{dots}</ul>
    </div>
  ),
  customPaging: () => (
    <div className="w-2 h-2 rounded-full bg-Primary-light/50 hover:bg-Primary-light transition-all duration-300" />
  ),
};

export const CourtSection = () => {
  return (
    <section
      className="py-16 bg-gradient-to-br from-Primary-dark to-black/90"
      id="Galeria"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-Accent-1 to-Complementary bg-clip-text text-transparent mb-6">
          Nuestras Instalaciones
        </h2>

        <div className="max-w-5xl mx-auto relative">
          <Slider {...settings}>
            {images.map((src, index) => (
              <div key={index} className="px-2">
                {" "}
                {/* Padding para el efecto de borde */}
                <div className="rounded-xl overflow-hidden shadow-2xl border-2 border-Primary/50">
                  <Image
                    src={src}
                    alt={`Cancha de fútbol ${index + 1}`}
                    width={1200}
                    height={800}
                    className="w-full h-[400px] sm:h-[550px] object-cover"
                    priority={index === 0}
                  />
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};
