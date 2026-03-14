# M4 POS/ERP System - Clean Version

Sistema de punto de venta y gestión de inventario para tiendas de celulares.

## 🚀 Deploy en Railway

### Variables de Entorno (Solo 4)

```env
NODE_ENV=production
SUPABASE_URL=https://tskihgbxsxkwvfmoiffs.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRza2loZ2J4c3hrd3ZmbW9pZmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTIxNzU5MiwiZXhwIjoyMDg0NzkzNTkyfQ.9h_pd2esgv6onHvbIpPtORS6HQPycnCO3NNRVSayA1A
JWT_SECRET=m4-pos-erp-railway-secret-key-2025
```

### Pasos de Deploy

1. **Crear proyecto en Railway**
   - New Project → Deploy from GitHub
   - Seleccionar este repositorio

2. **Configurar Variables**
   - Railway Dashboard → Variables
   - Agregar las 4 variables de arriba

3. **Deploy Automático**
   - Railway ejecuta: `pnpm install && pnpm build && pnpm start`
   - Tiempo estimado: 3-5 minutos

4. **Acceder al Sistema**
   - URL: `https://tu-proyecto.up.railway.app`
   - Usuario: `admin`
   - Password: `admin`

## ✨ Características

- ✅ Gestión de inventario (equipos/SIMs)
- ✅ Control de distribuidores
- ✅ Carga masiva desde Excel
- ✅ Sistema de envíos
- ✅ Reportes y estadísticas
- ✅ Autenticación JWT
- ✅ Base de datos Supabase

## 🛠 Stack Tecnológico

- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** Node.js + Express + tRPC
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **Auth:** JWT (sin OAuth)

## 📝 Desarrollo Local

```bash
# Instalar dependencias
pnpm install

# Modo desarrollo
pnpm dev

# Build para producción
pnpm build

# Iniciar en producción
pnpm start
```

## 🔒 Seguridad

- Sin dependencias de Manus
- Sin OAuth externo
- Autenticación tradicional con JWT
- Variables de entorno seguras

---

**Versión:** 2.0.0 (Clean)  
**Estado:** Listo para producción en Railway
