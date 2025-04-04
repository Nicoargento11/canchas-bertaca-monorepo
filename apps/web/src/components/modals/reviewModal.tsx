"use client";
import { Modal } from "@/components/modals/modal";
import { useModal } from "@/contexts/modalContext";
import { Star } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { Textarea } from "../ui/textarea";

export const ReviewModal = () => {
  const { onCloseReview, isOpenReview } = useModal();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Aquí iría la lógica para enviar la reseña
    console.log({ rating, comment });

    // Simulamos el envío
    setTimeout(() => {
      setIsSubmitting(false);
      onCloseReview();
      // Aquí podrías mostrar un toast de éxito
    }, 1000);
  };

  const bodyContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sistema de puntuación con estrellas */}
      <div className="flex flex-col items-center">
        <p className="text-sm text-gray-600 mb-3">
          ¿Cómo calificarías tu experiencia?
        </p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="text-3xl focus:outline-none"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            >
              <Star
                size={28}
                className={
                  star <= (hover || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-300 text-gray-300"
                }
              />
            </button>
          ))}
        </div>
      </div>

      {/* Área de texto para el comentario */}
      <div>
        <Textarea
          placeholder="Escribe tu reseña anónima aquí..."
          className="min-h-[120px]"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Tu reseña será publicada de forma anónima
        </p>
      </div>

      {/* Botón de enviar */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || rating === 0}
      >
        {isSubmitting ? "Enviando..." : "Enviar Reseña"}
      </Button>
    </form>
  );

  return (
    <Modal
      title="Deja tu reseña"
      isOpen={isOpenReview}
      onClose={onCloseReview}
      body={bodyContent}
    />
  );
};

export default ReviewModal;
