import MercadoPagoConfig from 'mercadopago';

// Configuración global de respaldo (fallback)
export const mercadoPagoConfig = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { integratorId: process.env.MP_INTEGRATOR_ID },
});
