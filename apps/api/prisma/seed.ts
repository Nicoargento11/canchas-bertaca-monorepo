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
  // Obtener el primer complejo o crear uno de prueba
  let complex = await prisma.complex.findFirst();

  if (!complex) {
    console.log('⚠️ No hay complejos. Creando uno de prueba...');
    complex = await prisma.complex.create({
      data: {
        name: 'Complejo Demo',
        slug: 'demo',
        address: 'Dirección demo',
        isActive: true,
      },
    });
  }

  await seedScheduleDays(complex.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
