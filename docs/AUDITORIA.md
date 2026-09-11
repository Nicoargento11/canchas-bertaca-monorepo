# Auditoría General del Sistema — canchas-bertaca-monorepo

Fecha: 2026-09-10
Alcance: backend (`apps/api`) + frontend (`apps/web`) completos.
Método: 8 investigaciones read-only (sin escritura de código) sobre el código real, con evidencia file:line en cada hallazgo. No es una opinión — cada punto se puede verificar abriendo el archivo citado.

Esta es la primera auditoría de conjunto que se le hace al proyecto. El objetivo no es "todo está mal" ni "todo está bien" — es tener, por primera vez, una lista concreta y priorizada de qué corregir y en qué orden.

## Cómo leer esto

- **CRÍTICO**: riesgo activo en producción ahora mismo (seguridad explotable, pérdida de datos, plata mal contada). Se arregla primero, independiente de cualquier otra prioridad.
- **ALTO**: no es una emergencia hoy, pero es una fuente probable del próximo incidente.
- **MEDIO**: deuda técnica real, no urgente.
- **BAJO**: cosmético / limpieza.

Cada hallazgo cita archivo y línea. Los que ya se arreglaron en la sesión de hoy están marcados como tal, no repetidos como pendientes.

---

## 1. Seguridad — CRÍTICO

### 1.1 No hay guard global: la protección es "opt-in", no "opt-out"
`apps/api/src/app.module.ts` nunca registra un guard vía `APP_GUARD`. Esto significa que `@Public()` no bypassea nada — es cosmético — en cualquier controller que no tenga ya `@UseGuards(...)` puesto explícitamente. Es la causa raíz de casi todo lo que sigue: cualquier controller nuevo queda público por defecto salvo que alguien se acuerde de guardarlo.

### 1.2 Controllers enteros sin ningún guard (más allá de los 3 ya conocidos)
Sin `@UseGuards` en la clase ni en ningún método:
- `apps/api/src/payments/payments.controller.ts` — CRUD completo de pagos + búsqueda, abierto.
- `apps/api/src/cash-register/cash-register.controller.ts`, `apps/api/src/cash-session/cash-session.controller.ts` — abrir/cerrar caja, abierto.
- `apps/api/src/courts/courts.controller.ts`, `products.controller.ts`, `rates.controller.ts`, `product-sales.controller.ts`, `sales.controller.ts`, `inventory-movements.controller.ts` — precios, stock, ventas, abierto.
- `apps/api/src/schedules/schedules.controller.ts` (`bulk-update-time` incluido), `fixed-reserves.controller.ts`, `sport-types.controller.ts`, `schedule-days.controller.ts`, `unavailable-days.controller.ts`.
- `apps/api/src/reserves/reserves.controller.ts` — la clase entera sin guard. El `@Public()` en GET/PATCH/DELETE `:id` es decorativo: el POST de creación y otros métodos están igual de abiertos porque no hay guard de base que bypassear.

Para dar contexto real: ~la mitad de los 28 controllers sí están bien protegidos (`event-packages`, `purchase-orders`, `organizations`, `admin-stats`, `admin-monitoring`, `automatic-reserves`, la mayoría de `promotions`/`complexs`). El agujero está concentrado pero es severo: son justo los módulos que tocan plata y operación diaria.

### 1.3 `POST /complexs/:id/mercadopago` sin autenticación — sobreescribe credenciales de MP en vivo
`apps/api/src/complexs/complexs.controller.ts:148-151` — el guard está comentado con un `// TODO: Descomentar cuando funcione el OAuth`. Cualquiera puede pisar el `accessToken`/`refreshToken`/`clientSecret` de MercadoPago de un complejo y secuestrar todos los pagos futuros de ese complejo. Es exactamente lo que arregló el commit `4882877` y revirtió `9096936`.

### 1.4 Por qué se revirtió el fix anterior (evidencia concreta, no especulación)
El código comentado (no borrado) en `4882877` explica el revert:
- `apps/api/src/auth/auth.controller.ts:185` — `@UseGuards(JwtAuthGuard)` puesto sobre `POST /auth/refresh`. Ese guard valida el access token, pero `/refresh` se llama justo cuando el access token ya expiró — se rompía el refresh de sesión para todo el mundo casi al instante.
- `apps/api/src/reserves/reserves.controller.ts:35` — mismo guard sobre `POST /reserves` (crear). Hay un commit previo (`83f6e5fb`) que prueba que el sistema soporta reservas de invitado sin cuenta a propósito — guardar el create rompía esa reserva sin registro.

**Conclusión**: el enfoque de "proteger todo" no estaba mal conceptualmente, estaba mal en el alcance. Cualquier fix futuro necesita excluir explícitamente `/auth/refresh`, la creación de reserva de invitado, y el webhook de MP — el resto sí debe ir guardado.

### 1.5 CORS bypasseable
`apps/api/src/main.ts:56-60` usa `origin.startsWith(allowedOrigin)`. Un dominio como `https://reservasfutbol.com.ar.atacante.com` pasa ese chequeo y, con `credentials: true`, obtiene acceso cross-origin con cookies. Fix: comparación exacta o chequeo de sufijo de hostname real.

### 1.6 Sin rate limiting en ningún lado
No hay `@nestjs/throttler` ni nada equivalente. Login, registro, refresh, y todos los endpoints abiertos de arriba no tienen ninguna protección contra fuerza bruta.

### 1.7 Refresh token no rota, dura 365 días
`apps/api/src/auth/auth.service.ts:108-133` — el comentario dice literalmente "el refresh token no rota". TTL por defecto de 365 días. Un refresh token filtrado es válido hasta un año sin detección de reuso. (`changePassword` sí lo revoca correctamente — eso está bien.)

### 1.8 Secret de JWT con fallback hardcodeado
`apps/api/src/auth/config/jwt.config.ts:19-20` — si falta la variable de entorno, cae a `'secretKey'`/`'refreshSecretKey'` en vez de fallar el arranque.

### 1.9 Webhook de MercadoPago sin validación de firma
`apps/api/src/payments/payments.controller.ts:182-333`, intencionalmente `@Public()` (correcto, un webhook no puede pedir JWT). Sí revalida el pago contra la API de MP antes de confiar en el body (buena mitigación), pero no chequea el header `x-signature` — permite probing/replay contra el endpoint.

### 1.10 `/super-admin` sin chequeo de rol en el frontend
`apps/web/src/middleware.ts:23-31` solo chequea que haya sesión, nunca el rol. Ningún archivo bajo `super-admin/*` verifica `role === "SUPER_ADMIN"` antes de renderizar. Es defensa en profundidad faltante — el límite real tiene que estar en el backend (ver 1.1-1.2), pero hoy tampoco está del lado del cliente.

### Menores
- `argon2` es una dependencia sin usar — todo el hasheo real usa `bcryptjs` consistentemente. No es una inconsistencia real, es peso muerto en `package.json`.
- No hay `.env.example` en el repo.
- `complexs.controller.ts:139` usa un tipo TS inline en vez de un DTO validado para el intercambio de código OAuth.

---

## 2. Concurrencia e integridad de datos — CRÍTICO

### 2.1 Sin protección a nivel de base de datos contra dobles reservas
El invariante más importante de un sistema de reservas de canchas. `Reserve` (`apps/api/prisma/schema.prisma:494-538`) no tiene ninguna restricción única/exclusión por cancha+fecha+horario. `validateReservationConflict` (`apps/api/src/reserves/reserves.service.ts:239-293`) hace un `findMany` y, en un paso separado sin `$transaction`, corre el `create` (línea 328). Es una carrera clásica (TOCTOU): dos reservas simultáneas para el mismo turno pueden pasar la validación las dos e insertarse las dos.

Fix real: constraint `EXCLUDE USING gist` en Postgres sobre (courtId, date, rango horario) vía migración SQL manual (requiere extensión `btree_gist`), o como mínimo envolver validación+create en una transacción `Serializable`.

Mismo problema, mismo riesgo, en `FixedReserve` (solo índice compuesto no-único en `[scheduleDayId, courtId]`).

### 2.2 Sin idempotencia real en los pagos
`Payment` (`schema.prisma:615-643`) no tiene columna de ID externo de MercadoPago, y nada la marca única. La protección contra duplicados es un `findFirst` antes del `create` — la misma carrera que en 2.1. **Esto ya pasó en producción**: es literalmente por qué existe `apps/api/scripts/cleanup-duplicate-payments.ts`.

### 2.3 Ningún código de backend pone `Reserve.status = COMPLETADO`
Grepeando todo `apps/api/src`, COMPLETADO solo se lee/filtra, nunca se escribe del lado del servidor. La transición ocurre enteramente en el frontend (`apps/web/.../completeReserveForm.tsx:134-165`) como **3 llamadas HTTP secuenciales y no atómicas**: crear pagos en paralelo → llamada separada a `PATCH /reserves/:id/status` → llamada opcional de stock de regalo. Si algo se corta entre medio, quedan `Payment` con `cashSessionId` seteado pero la reserva atascada en APROBADO para siempre — exactamente lo que parchea a mano `fix-reserve-statuses.ts`. Ese endpoint de status (`reserves.controller.ts:86-90`) tampoco tiene guard y acepta un string sin validar casteado al enum.

### 2.4 Bug de orden de operaciones en el webhook (pérdida de datos silenciosa)
`payments.controller.ts:291-311` — el status de la reserva se pone en APROBADO **antes** de crear el `Payment`, sin transacción. Si el `Payment.create()` falla, la reserva queda "pagada" con cero registros de pago — y el guard de idempotencia más arriba en el mismo handler hace que cualquier reintento futuro devuelva "already_approved" sin nunca crear el pago faltante. Es pérdida de datos permanente y silenciosa.

### 2.5 Delete/deactivate de FixedReserve no atómico
`apps/api/src/fixed-reserves/fixed-reserves.service.ts` `remove()` y `toggleStatus()` corren 3+ llamadas Prisma secuenciales sin `$transaction`, mientras que `purchase-orders.service.ts`/`sales.service.ts`/`product-sales.service.ts` sí usan `$transaction` en este mismo proyecto — el patrón correcto ya existe, acá no se aplicó.

### Medios
- Historial de migraciones con parches reactivos: 4 migraciones cambiando el tipo de `paymentId` en ~2 horas; un gap de 4.5 meses sin migraciones; una migración llamada `reset` que en realidad solo cambia una columna a nullable.
- Faltan índices para patrones de query reales: `paginateReserves` filtra por `complexId+status+reserveType+date` pero solo existe `[complexId, date]`.
- `Payment.amount` es `Float` mientras `Reserve.price`/`reservationAmount` son `Int` — el frontend compensa con comparación por epsilon (`Math.abs(diff) > 0.01`), síntoma clásico de plata en float.
- `CreatePaymentDto.amount` no tiene `@Min(0)` — combinado con 1.2, cualquiera podría postear pagos negativos.

### Verificado — no es un problema
- `Reserve.complexId` SÍ es `NOT NULL` en la base de datos. El `complex?: Complex` opcional en el tipo de frontend es solo un gap de tipado del cliente, no un problema real de integridad.
- Los enums `Status`/`ReserveType` coinciden exactamente (mayúsculas incluidas) entre Prisma y el frontend.

---

## 3. Diseño y arquitectura de código

*(Esto fue lo primero que auditamos hoy, con más detalle — ver `sdd/design-code-audit/explore` en engram para el reporte completo.)*

- Dos sistemas de color paralelos y desconectados en `apps/web/tailwind.config.ts` (tokens semánticos de shadcn vs. paleta hex hardcodeada) — ambos usados activamente (258 usos en 65 archivos vs. 51 archivos).
- 3 implementaciones de modal distintas (`components/ui/dialog.tsx` de shadcn, `components/modals/modal.tsx` custom, `bookingModal.tsx` sin wrapper) — más un `modal.backup.tsx` muerto.
- `apps/api/src/modules/booking/reserve/` — 17 archivos de un rewrite hexagonal/DDD abandonado, 100% comentado, ni registrado en `app.module.ts`.
- **Veredicto**: el patrón mayoritario en cada capa está bien. No hace falta un rewrite — hace falta una pasada de consolidación (elegir un ganador por cada empate y borrar el resto).

---

## 4. Frontend admin/staff (fuera del flujo de reserva del cliente)

- **`MercadoPagoConfig.tsx:37-47`** usa `fetch()` crudo con `credentials: "include"`, sin pasar por `services/auth/authFetch.ts` — el único wrapper centralizado que agrega el header de auth y reintenta en 401. Es la única pantalla de settings que no se benefició del fix de auto-refresh de MP.
- Lógica de "resolver la caja activa" copiada literal 3 veces (`reserveForm.tsx:104-134`, `completeReserveForm.tsx:113-133`, `biTableDay.tsx:~620-641`) — ya desalineadas entre sí (solo 2 de 3 muestran el toast de advertencia).
- Parser de montos en texto duplicado literal entre `OpenCashRegister.tsx` y `CloseCashRegister.tsx`, con un caso ambiguo admitido en los propios comentarios (punto decimal vs. separador de miles).
- Comparación de plata por float con tolerancia epsilon repetida de forma independiente en 4 archivos distintos — mismo patrón que ya se ve en el flujo de reserva y en pagos.
- `reserveForm.tsx` / `editReserveForm.tsx` / `completeReserveForm.tsx` son 3 implementaciones independientes hechas a mano, con formas de `PAYMENT_METHODS` distintas entre sí.
- `UserManagenent.tsx` (con el typo en el nombre) tiene 0 bytes y cero referencias — borrar directamente.
- Lo que SÍ está bien: las pantallas de settings (horarios, tarifas, canchas, tipos de deporte, promociones, paquetes de evento) son consistentes entre sí, y no hay `fetch` crudo dando vueltas fuera de `MercadoPagoConfig`.

---

## 5. Ya resuelto en esta sesión (no son pendientes)

- Bug de "Reserva General" que no dejaba elegir complejo (inferencia de localStorage entre complejos abandonados hijackeaba el flujo general).
- Bug de `initReservation` que podía pegar la cancha de un deporte sobre la reserva de otro deporte.
- `reserveContext.tsx` muerto (177 líneas, 100% comentado) — borrado.
- Caída de FPS en el flujo de reserva: video/animación de fondo pausados mientras el modal está abierto, y `ReserveContext` memoizado para no re-renderizar toda la home en cada cambio.
- Falta de identidad visual de sede en 3 puntos del flujo de reserva (selección de cancha, header del modal, "Mis Reservas") — ahora con logo + color por complejo vía `apps/web/src/utils/complexBrand.ts`.

---

## Plan de acción recomendado

1. **Hotfix de seguridad inmediato** (1.2, 1.3, 1.4): guard global (`APP_GUARD`) + `@Public()` explícito solo en los endpoints que deben quedar abiertos de verdad (refresh, webhook de MP, creación de reserva de invitado). Esto es lo que se intentó una vez y se revirtió mal — hacerlo bien esta vez con el alcance correcto.
2. **Transacciones en pagos** (2.2, 2.4): envolver el webhook (check + create + update de status) en un solo `$transaction`, respaldado por una constraint única real en un nuevo `Payment.externalPaymentId`.
3. **Constraint de no-doble-reserva** (2.1): migración SQL con `EXCLUDE USING gist`, o como paso intermedio, transacción serializable en el create.
4. **Backend-orquestar la transición a COMPLETADO** (2.3): colapsar las 3 llamadas del frontend en un único endpoint transaccional del backend.
5. **CORS + rate limiting + rotación de refresh token** (1.5-1.7): más chico, pero cierra vectores reales.
6. Recién después: consolidación de diseño (sección 3) y limpieza del frontend admin (sección 4) — son deuda real pero no riesgo activo.

## Fuentes (engram, proyecto `canchas-bertaca-monorepo`)

- `sdd/design-code-audit/explore`
- `sdd/booking-flow-clarity/explore`
- `sdd/complex-localstorage-state/explore`
- `sdd/booking-flow-performance/explore`
- `sdd/general-audit/security`
- `sdd/general-audit/payments`
- `sdd/general-audit/data-model`
- `sdd/general-audit/frontend-admin`
