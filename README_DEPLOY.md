# M4 POS/ERP System - Guía de Despliegue en Railway

## 📋 Pre-requisitos

- Cuenta en [Railway](https://railway.app)
- Credenciales de Supabase Cloud
- Repositorio GitHub (opcional, o deploy directo desde CLI)

## 🚀 Deploy Rápido en Railway

### Opción 1: Desde GitHub (Recomendado)

1. **Push del código a GitHub:**
```bash
git add .
git commit -m "Fix: Carga masiva de equipos + logging detallado"
git push origin main
```

2. **Conectar Railway con GitHub:**
   - Ve a [Railway Dashboard](https://railway.app/dashboard)
   - Click en "New Project"
   - Click en "Deploy from GitHub repo"
   - Selecciona el repositorio `m4-pos-erp`

3. **Configurar Variables de Entorno:**
   En Railway Dashboard → Settings → Variables:
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://... (Railway auto-genera)
   SUPABASE_URL=https://tskihgbxsxkwvfmoiffs.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRza2loZ2J4c3hrd3ZmbW9pZmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTIxNzU5MiwiZXhwIjoyMDg0NzkzNTkyfQ.9h_pd2esgv6onHvbIpPtORS6HQPycnCO3NNRVSayA1A
   ```

4. **Deploy automático:**
   Railway detectará el `package.json` y ejecutará:
   - `pnpm install`
   - `pnpm build`
   - `pnpm start`

### Opción 2: Deploy Local con Railway CLI

1. **Instalar Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login:**
```bash
railway login
```

3. **Inicializar proyecto:**
```bash
railway init
```

4. **Deploy:**
```bash
railway up
```

## 🔧 Configuración Post-Deploy

### 1. Verificar Variables de Entorno
Asegúrate de que todas las variables estén configuradas en Railway:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `NODE_ENV=production`

### 2. Verificar Build
Railway ejecutará automáticamente:
```bash
pnpm build  # Compila frontend (Vite) + backend (esbuild)
```

### 3. Verificar Start Command
El comando de inicio es:
```bash
NODE_ENV=production node dist/index.js
```

## 📊 Monitoreo

### Ver Logs en Railway
```bash
railway logs
```

O en el Dashboard: Deployments → View Logs

### Verificar Salud del Sistema
1. Accede a la URL de Railway (ej: `https://m4-pos-erp-production.up.railway.app`)
2. Inicia sesión con usuario admin
3. Ve al Dashboard y verifica métricas
4. Prueba la carga masiva de equipos

## 🐛 Troubleshooting

### Error: "Module not found"
- Verifica que todas las dependencias estén en `package.json`
- Railway ejecuta `pnpm install` automáticamente

### Error: "Cannot connect to Supabase"
- Verifica las variables de entorno en Railway
- Confirma que `SUPABASE_URL` y `SUPABASE_SERVICE_KEY` sean correctas

### Error: "Port already in use"
- Railway asigna el puerto automáticamente vía `process.env.PORT`
- Nuestro código ya maneja esto en `server/_core/index.ts`

## 🔄 Actualizaciones Futuras

Para actualizar el sistema:
1. Haz cambios en el código
2. Commit y push a GitHub
3. Railway detecta el push y re-deploya automáticamente

## 📝 Notas Importantes

- **Base de Datos:** El sistema usa Supabase Cloud (no Railway PostgreSQL)
- **Build Time:** ~2-3 minutos
- **Cold Start:** ~5-10 segundos (Railway puede dormir apps en plan free)
- **Dominio Custom:** Configurable en Railway Settings → Domains

## ✅ Checklist de Deploy

- [ ] Código pusheado a GitHub
- [ ] Proyecto creado en Railway
- [ ] Variables de entorno configuradas
- [ ] Build exitoso
- [ ] App accesible en URL de Railway
- [ ] Login funcional
- [ ] Dashboard carga correctamente
- [ ] Carga masiva de equipos funciona
- [ ] Logs del servidor muestran actividad

---

**Última actualización:** Diciembre 2025
**Versión:** 1.0.0 (Bug Fix - Carga Masiva)
