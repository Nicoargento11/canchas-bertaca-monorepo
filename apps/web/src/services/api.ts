// frontend/services/api.ts
import { BACKEND_URL } from "@/config/constants";

import axios from "axios";

const api = axios.create({
  baseURL: `${BACKEND_URL}`, // URL de tu API de NestJS
});

export default api;
