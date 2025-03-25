import MercadoPagoConfig from 'mercadopago';

export const mercadoPagoConfig = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});
