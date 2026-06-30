/**
 * Renueva el access token de MercadoPago para uno o varios complejos
 * usando el refresh token guardado en DB.
 *
 * Uso:
 *   npx ts-node scripts/refresh-mp-tokens.ts                          → muestra estado de todos
 *   npx ts-node scripts/refresh-mp-tokens.ts --fix                    → renueva todos
 *   npx ts-node scripts/refresh-mp-tokens.ts --fix --id <complexId>   → renueva uno específico
 */

import { PrismaClient } from '@prisma/client';
import MercadoPagoConfig, { OAuth } from 'mercadopago';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const shouldFix = process.argv.includes('--fix');
const targetId = process.argv.includes('--id')
  ? process.argv[process.argv.indexOf('--id') + 1]
  : null;

async function refreshToken(complexId: string, refreshToken: string): Promise<void> {
  const platformClient = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  });

  const oauth = new OAuth(platformClient);
  const credentials = await oauth.refresh({
    body: {
      client_secret: process.env.MP_CLIENT_SECRET,
      client_id: process.env.MP_CLIENT_ID,
      refresh_token: refreshToken,
    },
  });

  await prisma.paymentConfig.update({
    where: { complexId },
    data: {
      accessToken: credentials.access_token!,
      ...(credentials.refresh_token && { refreshToken: credentials.refresh_token }),
      ...(credentials.public_key && { publicKey: credentials.public_key }),
    },
  });
}

async function main() {
  const where = targetId ? { complexId: targetId } : {};
  const configs = await prisma.paymentConfig.findMany({
    where,
    include: { complex: { select: { id: true, name: true } } },
  });

  if (configs.length === 0) {
    console.log('No se encontraron configuraciones de MercadoPago.');
    return;
  }

  for (const config of configs) {
    const daysSinceUpdate = Math.floor(
      (Date.now() - config.updatedAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    console.log(`\n📦 ${config.complex.name} (${config.complex.id})`);
    console.log(`   Último update: ${config.updatedAt.toISOString()} (${daysSinceUpdate} días)`);
    console.log(`   Refresh token: ${config.refreshToken ? '✅ presente' : '❌ ausente'}`);

    if (!shouldFix) continue;

    if (!config.refreshToken) {
      console.log('   ⚠️  Sin refresh token — no se puede renovar automáticamente, requiere nuevo OAuth');
      continue;
    }

    try {
      await refreshToken(config.complex.id, config.refreshToken);
      console.log('   ✅ Token renovado exitosamente');
    } catch (err: any) {
      console.error(`   ❌ Error al renovar: ${err.message}`);
    }
  }

  if (!shouldFix) {
    console.log('\n👉 Corré con --fix para renovar los tokens');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
