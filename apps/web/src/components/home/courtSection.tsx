import React from "react";

import img1 from "../../../public/images/canchas.jpg";
import img2 from "../../../public/images/canchas1.jpg";
import img3 from "../../../public/images/canchas2.jpg";
import img4 from "../../../public/images/canchas3.jpg";
import img5 from "../../../public/images/canchas4.jpg";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const images = [img1, img2, img3, img4, img5];
const settings = {
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  variableWidth: false,
  arrows: false,
  adaptiveHeight: true,
};

export const CourtSection = () => {
  return (
    <section
      className="py-16 bg-gradient-to-r from-Primary-dark to-black"
      id="Galeria"
    >
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold text-Accent-1 mb-6 drop-shadow-lg">
          Galería de fotos
        </h2>
        <div className="max-w-4xl mx-auto p-4 bg-Neutral-dark/40 backdrop-blur-lg rounded-2xl shadow-2xl border border-Primary/30">
          <Slider {...settings}>
            {images.map((src, index) => (
              <div
                key={index}
                className="rounded-lg overflow-hidden shadow-lg max-w-full h-[500px] flex justify-center items-center"
              >
                <Image
                  src={src}
                  alt={`Foto de la cancha ${index + 1}`}
                  width={800}
                  height={600}
                  className="w-full h-full object-contain rounded-xl border-2 border-Primary-dark shadow-md"
                />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};
