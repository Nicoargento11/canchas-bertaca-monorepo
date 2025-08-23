import api from "../api";

interface ReviewData {
  rating: number;
  comment: string;
  email?: string; // Opcional si quieres permitir que dejen email
  complexId: string;
}

export const submitReview = async (data: ReviewData) => {
  try {
    const response = await api.post("/reviews", data);
    return response.data;
  } catch {
    throw new Error("Error al enviar la reseña");
  }
};
