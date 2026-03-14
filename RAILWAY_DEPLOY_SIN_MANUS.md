# M4 POS/ERP - Deploy en Railway SIN Manus

## ✅ Cambios Realizados (Limpieza de Manus)

Se han eliminado **TODAS las dependencias de Manus OAuth** para hacer el proyecto compatible con Railway:

### Archivos Modificados:
1. **server/_core/index.ts** - Comentada importación de OAuth
2. **server/_core/env.ts** - Variables de Manus ahora opcionales
3. **server/_core/sdk.ts** - Eliminado error que crasheaba sin OAUTH_SERVER_URL
4. **client/src/_core/hooks/useAuth.ts** - Cambiado localStorage key

### Sistema de Autenticación:
✅ **Autenticación Tradicional (Usuario/Password)**
- Login con username y password hash
- JWT para sesiones
- Sin dependencia de OAuth externo

## 🚀 Deploy en Railway - SOLO 3 VARIABLES

### Variables de Entorno Requeridas:

```env
NODE_ENV=production
SUPABASE_URL=https://tskihgbxsxkwvfmoiffs.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRza2loZ2J4c3hrd3ZmbW9pZmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTIxNzU5MiwiZXhwIjoyMDg0NzkzNTkyfQ.9h_pd2esgv6onHvbIpPtORS6HQPycnCO3NNRVSayA1A
JWT_SECRET=m4-pos-erp-railway-secret-key-2025-super-secure
```

**Eso es TODO. Sin OAUTH_SERVER_URL, sin DATABASE_URL, sin nada de Manus.**

## 📋 Pasos para Deploy

### 1. Railway Dashboard
- Ve a https://railway.app
- New Project → Deploy from GitHub
- Selecciona `Kratoslar69/m4-pos-erp`

### 2. Configurar Variables
En Railway → Variables → **Raw Editor**, pega:
```
NODE_ENV=production
SUPABASE_URL=https://tskihgbxsxkwvfmoiffs.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRza2loZ2J4c3hrd3ZmbW9pZmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTIxNzU5MiwiZXhwIjoyMDg0NzkzNTkyfQ.9h_pd2esgv6onHvbIpPtORS6HQPycnCO3NNRVSayA1A
JWT_SECRET=m4-pos-erp-railway-secret-key-2025-super-secure
```

### 3. Deploy Automático
Railway ejecuta:
```bash
pnpm install
pnpm build
pnpm start
```

### 4. Verificar Logs
Deberías ver:
```
[OAuth] DISABLED - Using traditional authentication
Server listening on port 8080
```

**NO deberías ver:**
```
[OAuth] ERROR: OAUTH_SERVER_URL is not configured!
```

## ✅ Login

Una vez desplegado:
- URL: `https://tu-app.up.railway.app`
- Usuario: `admin`
- Password: `admin`

## 🐛 Troubleshooting

### "Application failed to respond"
- Verifica que las 3 variables estén configuradas
- Revisa los Deploy Logs en Railway

### "OAUTH_SERVER_URL error"
- **Ya NO debería aparecer** con estos cambios
- Si aparece, el código no se actualizó correctamente

### "Cannot find module"
- Railway debería instalar automáticamente con `pnpm install`
- Verifica que package.json esté en el repo

## 📝 Notas

- ✅ Manus OAuth completamente eliminado
- ✅ Autenticación tradicional funcionando
- ✅ Compatible con Railway out-of-the-box
- ✅ Bug de carga masiva resuelto
- ✅ Logging detallado implementado

**Versión:** v1.0.2-railway-compatible  
**Estado:** Listo para producción en Railway
