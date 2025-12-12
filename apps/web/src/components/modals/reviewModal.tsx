"use client";
import { useModal } from "@/contexts/modalContext";
import { Star, X } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { Textarea } from "../ui/textarea";
import { submitReview } from "@/services/reviews/review";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const ReviewModal = () => {
  const { closeModal, isModalOpen, modalData } = useModal();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isModalOpen) {
      setRating(0);
      setComment("");
      setHover(0);
    }
  }, [isModalOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Por favor selecciona una calificación");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitReview({
        rating,
        comment,
        complexId: modalData?.complexId || "bertaca", // Fallback safe
      });

      toast.success("Tu reseña ha sido enviada correctamente");
      closeModal();
    } catch {
      toast.error("Hubo un problema al enviar tu reseña");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Since ModalManager controls the mounting of this component based on currentModal === 'REVIEW',
  // we can assume it should be open when mounted.
  // The exit animation won't play because ModalManager unmounts it, but at least it will open.
  const isOpen = true;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-slate-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
              <h2 className="text-xl font-bold text-white">Dejanos tu opinión</h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Stars */}
                <div className="flex flex-col items-center space-y-4">
                  <p className="text-white/80 font-medium">¿Cómo calificarías tu experiencia?</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        disabled={isSubmitting}
                      >
                        <Star
                          size={36}
                          className={`transition-colors duration-200 ${
                            star <= (hover || rating)
                              ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                              : "fill-transparent text-white/20"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="h-6 text-sm font-medium text-yellow-400/90">
                    {hover > 0 || rating > 0 ? (
                      <span>
                        {(hover || rating) === 1 && "Mala"}
                        {(hover || rating) === 2 && "Regular"}
                        {(hover || rating) === 3 && "Buena"}
                        {(hover || rating) === 4 && "Muy buena"}
                        {(hover || rating) === 5 && "Excelente"}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Cuéntanos más sobre tu experiencia (opcional)..."
                    className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-Primary focus:ring-1 focus:ring-Primary resize-none rounded-xl"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-white/40 text-center">
                    Tu reseña nos ayuda a mejorar y será publicada de forma anónima.
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-Primary hover:bg-Primary-dark text-white font-bold py-6 text-lg rounded-xl shadow-lg shadow-Primary/20 transition-all hover:shadow-Primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || rating === 0}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Enviando...</span>
                    </div>
                  ) : (
                    "Enviar Reseña"
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
