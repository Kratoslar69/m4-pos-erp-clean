# 🚀 Guía Rápida - Actualizar GitHub y Deploy en Railway

## ✅ LO QUE TIENES QUE HACER:

### **PASO 1: Descargar y Extraer** (2 minutos)

1. **Descarga** el archivo de arriba: `m4-pos-erp-ready-for-github.tar.gz`

2. **Extrae** el archivo:
   ```bash
   # En Windows (usar 7-Zip o WinRAR)
   # Click derecho → Extraer aquí
   
   # En Mac/Linux
   tar -xzf m4-pos-erp-ready-for-github.tar.gz
   cd m4-pos-erp
   ```

---

### **PASO 2: Actualizar GitHub** (3 minutos)

Tienes **2 opciones**:

#### **OPCIÓN A: Script Automático** ⭐ (Más fácil)

```bash
# Desde la carpeta m4-pos-erp
./update-github-repo.sh
```

El script te preguntará:
- URL de tu repositorio GitHub
- Qué rama usar (main/master)
- Confirmación antes de push

¡Y listo! Sigue las instrucciones en pantalla.

#### **OPCIÓN B: Manual** (Más control)

```bash
# 1. Verifica que estás en la carpeta correcta
ls package.json  # Debe existir

# 2. Agrega todos los archivos
git add .

# 3. Commit
git commit -m "Fix: Carga masiva + Railway config v1.0.1"

# 4. Push (asumiendo que tu repo ya está conectado)
git push origin main
# o si usas master:
git push origin master
```

---

### **PASO 3: Deploy en Railway** (5 minutos)

#### **3.1 Crear Proyecto**

1. Ve a **https://railway.app**
2. Login (con GitHub)
3. Click **"New Project"**
4. **"Deploy from GitHub repo"**
5. Selecciona tu repositorio `m4-pos-erp`

#### **3.2 Configurar Variables**

En Railway Dashboard → Variables → **Raw Editor**, pega esto:

```env
NODE_ENV=production
SUPABASE_URL=https://tskihgbxsxkwvfmoiffs.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRza2loZ2J4c3hrd3ZmbW9pZmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTIxNzU5MiwiZXhwIjoyMDg0NzkzNTkyfQ.9h_pd2esgv6onHvbIpPtORS6HQPycnCO3NNRVSayA1A
```

Click **"Save"**

#### **3.3 Deploy Automático**

Railway detectará `railway.json` y:
- ✅ Instalará dependencias (`pnpm install`)
- ✅ Compilará el proyecto (`pnpm build`)
- ✅ Iniciará el servidor (`pnpm start`)

**Tiempo:** 3-5 minutos

#### **3.4 Obtener URL**

Railway te dará una URL como:
```
https://m4-pos-erp-production.up.railway.app
```

---

## ✅ VERIFICACIÓN FINAL

1. **Abre la URL de Railway**
2. **Login** con usuario `admin` / contraseña `admin`
3. **Ve a Productos** → Carga Masiva
4. **Sube el Excel** con 152 equipos
5. **Verifica los logs** en Railway (ver abajo)
6. **Confirma** que los 152 equipos se insertaron

### Ver Logs en Railway:

```
Railway Dashboard → Deployments → View Logs
```

Deberías ver:
```
[BULK IMPORT] Iniciando importación de 152 equipos
[BULK IMPORT] Validación de IMEIs únicos en lote: OK
[BULK IMPORT] Validación de IMEIs existentes en BD: OK
[BULK IMPORT] Procesando lote 1: 152 equipos (1 - 152)
[BULK IMPORT] ✅ Lote insertado correctamente: 152 registros
[BULK IMPORT] RESUMEN FINAL: { total: 152, success: 152, failed: 0 }
```

---

## 🆘 PROBLEMAS COMUNES

### "Permission denied" al ejecutar script
```bash
chmod +x update-github-repo.sh
./update-github-repo.sh
```

### "Git not found"
Instala Git: https://git-scm.com/downloads

### "Push rejected" en GitHub
```bash
# Si estás seguro de sobrescribir
git push origin main --force
```

### "Build failed" en Railway
- Verifica que las variables de entorno estén configuradas
- Revisa los logs de build

### "Cannot connect to Supabase"
- Verifica que copiaste la Service Key completa
- No debe tener espacios al inicio/final

---

## 📊 RESUMEN RÁPIDO

```
1. Descargar archivo ✓
2. Extraer           ✓
3. ./update-github-repo.sh (o git push manual)
4. Railway → New Project → GitHub
5. Configurar variables
6. Esperar deploy (3-5 min)
7. Probar carga masiva
8. ¡LISTO! 🎉
```

---

## 🎯 TIEMPO TOTAL ESTIMADO

- Descarga y extracción: **2 min**
- Actualizar GitHub: **3 min**
- Deploy en Railway: **5 min**
- Verificación: **2 min**

**TOTAL: ~12 minutos** ⏱️

---

**¿Dudas?** Ejecuta los comandos paso a paso y cualquier error me lo compartes. 🚀
