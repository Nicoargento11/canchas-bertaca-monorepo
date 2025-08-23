# 📁 Tests HTTP - Organización

Esta carpeta contiene todos los archivos de testing HTTP organizados por funcionalidad.

## 📋 Archivos disponibles:

### 🔐 `auth.http`
- Tests de autenticación (login, logout, refresh)
- Verificación de tokens
- **Úsalo para**: Probar el sistema de auth

### 📊 `reports.http` 
- **ARCHIVO PRINCIPAL** para testing de reportes
- Incluye endpoints con y sin autenticación
- Tests de Excel y PDF
- **Úsalo para**: Testing completo de reportes

### 🌐 `browser-quick.http`
- URLs directas para copy-paste en navegador
- Endpoints sin autenticación para testing rápido
- **Úsalo para**: Descargar archivos Excel/PDF rápidamente

### 🐛 `debug.http`
- Tests básicos de troubleshooting
- Verificación de servidor, DB, endpoints
- **Úsalo para**: Cuando algo no funciona

### 🏗️ `setup-data.http`
- Crear datos de prueba
- Verificar datos existentes
- **Úsalo para**: Preparar datos antes de testing

## 🚀 Inicio rápido:

### Para testing de reportes:
1. **USA**: `reports.http` 
2. **Ejecuta**: Login primero, luego cualquier endpoint
3. **Para archivos**: Copia URLs de `browser-quick.http` al navegador

### Para testing rápido sin auth:
1. **USA**: `browser-quick.http`
2. **Copia**: URLs al navegador Chrome/Firefox
3. **Resultado**: Descarga automática de archivos

### Si algo falla:
1. **USA**: `debug.http`
2. **Ejecuta**: Tests básicos para encontrar el problema


## 📝 Notas importantes:
- **Servidor debe estar corriendo**: `npm run start:dev`
- **Para archivos Excel/PDF**: Usar navegador es más fácil que REST Client
- **Endpoints `/test/*`**: Solo para desarrollo, no requieren auth
- **Variables**: Configuradas en cada archivo para fácil modificación
