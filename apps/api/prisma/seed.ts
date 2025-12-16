import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DAYS_OF_WEEK = [
  { dayOfWeek: 0, name: 'Domingo' },
  { dayOfWeek: 1, name: 'Lunes' },
  { dayOfWeek: 2, name: 'Martes' },
  { dayOfWeek: 3, name: 'Miércoles' },
  { dayOfWeek: 4, name: 'Jueves' },
  { dayOfWeek: 5, name: 'Viernes' },
  { dayOfWeek: 6, name: 'Sábado' },
];

async function seedScheduleDays(complexId: string) {
  console.log('🌱 Sembrando días de la semana...');

  for (const day of DAYS_OF_WEEK) {
    await prisma.scheduleDay.upsert({
      where: {
        dayOfWeek_complexId: {
          dayOfWeek: day.dayOfWeek,
          complexId: complexId,
        },
      },
      update: {},
      create: {
        dayOfWeek: day.dayOfWeek,
        isActive: false,
        complexId: complexId, // Asociar al complejo si es necesario
      },
    });
  }

  console.log('✅ Días de la semana creados');
}

async function main() {
  console.log('🌱 Iniciando seed...');

  // Crear o actualizar complejo Bertaca con información real
  const bertaca = await prisma.complex.upsert({
    where: { slug: 'bertaca' },
    update: {
      name: 'Canchas Bertaca',
      address: 'Fray Bertaca 1642, Resistencia, Chaco H3506',
      phone: '+5493624895303',
      instagram: 'https://www.instagram.com/canchasbertaca',
      googleMapsUrl: 'https://maps.google.com/?q=Fray+Bertaca+1642,+Resistencia,+Chaco',
      latitude: -27.4581, // Coordenadas aproximadas de Resistencia
      longitude: -58.9867,
      description: '⚽Jugá, Entrená y Disfrutá\n⛳️3 Canchas de fut5\n🧢Escuelita @elsemillerofutbol1\n🍖Quincho+Parrilla🔥',
      logo: '/images/bertaca_logo.png',
      isActive: true,
    },
    create: {
      name: 'Canchas Bertaca',
      slug: 'bertaca',
      address: 'Fray Bertaca 1642, Resistencia, Chaco H3506',
      phone: '+5493624895303',
      instagram: 'https://www.instagram.com/canchasbertaca',
      googleMapsUrl: 'https://maps.google.com/?q=Fray+Bertaca+1642,+Resistencia,+Chaco',
      latitude: -27.4581,
      longitude: -58.9867,
      description: '⚽Jugá, Entrená y Disfrutá\n⛳️3 Canchas de fut5\n🧢Escuelita @elsemillerofutbol1\n🍖Quincho+Parrilla🔥',
      logo: '/images/bertaca_logo.png',
      isActive: true,
    },
  });

  console.log('✅ Complejo Bertaca creado/actualizado');

  // Crear días de la semana para Bertaca
  await seedScheduleDays(bertaca.id);

  // Crear o actualizar complejo Seven con información real
  const seven = await prisma.complex.upsert({
    where: { slug: 'seven' },
    update: {
      name: 'Seven Fútbol',
      address: 'Ruta 16 KM 13.6, Resistencia, Chaco 3500',
      phone: '+5493624160843',
      instagram: 'https://www.instagram.com/canchaseven7',
      googleMapsUrl: 'https://maps.google.com/?q=Ruta+16+KM+13.6,+Resistencia,+Chaco',
      latitude: -27.4500, // Coordenadas aproximadas
      longitude: -58.9900,
      description: '⚽️ Alquiler de canchas F5 y F7\n🔥Parrillas\n🥅 Escuela de Fútbol mixto (4 a 15 años) @profmarcepaiva_',
      logo: '/images/seven_logo.png',
      isActive: true,
    },
    create: {
      name: 'Seven Fútbol',
      slug: 'seven',
      address: 'Ruta 16 KM 13.6, Resistencia, Chaco 3500',
      phone: '+5493624160843',
      instagram: 'https://www.instagram.com/canchaseven7',
      googleMapsUrl: 'https://maps.google.com/?q=Ruta+16+KM+13.6,+Resistencia,+Chaco',
      latitude: -27.4500,
      longitude: -58.9900,
      description: '⚽️ Alquiler de canchas F5 y F7\n🔥Parrillas\n🥅 Escuela de Fútbol mixto (4 a 15 años) @profmarcepaiva_',
      logo: '/images/seven_logo.png',
      isActive: true,
    },
  });

  console.log('✅ Complejo Seven creado/actualizado');

  // Crear días de la semana para Seven
  await seedScheduleDays(seven.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
