import MercadoPagoConfig from 'mercadopago';

export const mercadoPagoConfig = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { integratorId: process.env.MP_INTEGRATOR_ID },
});
