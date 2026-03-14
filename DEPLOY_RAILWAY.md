# 🚀 M4 POS/ERP - Guía de Deploy Limpio

## 📦 CÓDIGO LISTO

Tu código está preparado en: `/home/claude/m4-pos-clean`

### ✅ Todo Limpio:
- ❌ Sin Manus OAuth
- ❌ Sin vite-plugin-manus-runtime  
- ❌ Sin dependencias innecesarias
- ✅ Solo JWT para autenticación
- ✅ Vite configurado correctamente
- ✅ 232 archivos listos para producción

---

## 🔄 OPCIÓN 1: Subir con Git (RECOMENDADO)

### Desde tu máquina local:

1. **Descargar el código:**
   ```bash
   # Si estás en SSH con el servidor
   scp root@tu-servidor:/home/claude/m4-pos-clean.tar.gz .
   tar -xzf m4-pos-clean.tar.gz
   cd m4-pos-clean
   ```

2. **Subir a GitHub:**
   ```bash
   git remote add origin https://github.com/Kratoslar69/m4-pos-erp-clean.git
   git push -u origin main
   ```

---

## 🌐 OPCIÓN 2: Subir desde GitHub Web

1. **Ir a:** https://github.com/Kratoslar69/m4-pos-erp-clean

2. **Upload files:**
   - Click "uploading an existing file"
   - Arrastra todos los archivos de `/home/claude/m4-pos-clean`
   - Commit

---

## ⚡ DEPLOY EN RAILWAY

Una vez que el código esté en GitHub:

### 1. Crear Proyecto
- Ve a https://railway.app
- Click **"New Project"**
- **"Deploy from GitHub"**
- Selecciona `Kratoslar69/m4-pos-erp-clean`

### 2. Variables de Entorno

En Railway → Variables → **Agregar una por una:**

```
NODE_ENV=production
```

```
SUPABASE_URL=https://tskihgbxsxkwvfmoiffs.supabase.co
```

```
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRza2loZ2J4c3hrd3ZmbW9pZmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTIxNzU5MiwiZXhwIjoyMDg0NzkzNTkyfQ.9h_pd2esgv6onHvbIpPtORS6HQPycnCO3NNRVSayA1A
```

```
JWT_SECRET=m4-pos-erp-railway-secret-2025
```

### 3. Deploy Automático

Railway ejecutará:
```bash
pnpm install  # Instala dependencias (2-3 min)
pnpm build    # Compila frontend + backend (2-3 min)
pnpm start    # Inicia servidor en producción
```

**Tiempo total: 5-7 minutos**

### 4. Verificar Logs

Deberías ver:
```
[Static Files] Directory exists: true
Server running on http://localhost:8080/
```

### 5. Acceder

URL: `https://tu-proyecto.up.railway.app`

**Login:**
- Usuario: `admin`
- Password: `admin`

---

## 🎯 CHECKLIST FINAL

- [ ] Código subido a GitHub
- [ ] Proyecto creado en Railway
- [ ] 4 variables configuradas
- [ ] Deploy completado (5-7 min)
- [ ] URL carga correctamente
- [ ] Login funciona
- [ ] Dashboard se ve bien
- [ ] Carga masiva funciona (152/152)

---

## 🐛 TROUBLESHOOTING

### "Application failed to respond"
→ Verifica las 4 variables en Railway

### "supabaseKey is required"
→ Asegúrate que `SUPABASE_SERVICE_KEY` esté completa

### "Not Found" o pantalla en blanco
→ Espera 1-2 minutos más, el build puede tardar

### Assets no cargan
→ Refresca (Ctrl+F5), Railway cachea archivos

---

## 📊 COMPARACIÓN

### ❌ Versión Anterior (con Manus):
- Error: "Invalid URL" en assets
- Error: "OAUTH_SERVER_URL not configured"  
- Error: "supabaseKey required"
- Build fallaba constantemente

### ✅ Versión Limpia (sin Manus):
- Build exitoso
- Sin errores de OAuth
- Assets cargan correctamente
- Listo para producción

---

## 📝 ARCHIVOS CLAVE MODIFICADOS

1. **vite.config.ts** → Simple, sin plugins Manus
2. **package.json** → Sin vite-plugin-manus-runtime
3. **server/_core/sdk.ts** → JWT puro, sin OAuth
4. **server/_core/index.ts** → Sin registerOAuthRoutes
5. **server/_core/env.ts** → Variables opcionales

---

**Version:** 2.0.0-clean  
**Estado:** ✅ Listo para Railway  
**Archivos:** 232  
**Commit:** 6f43f8a
