# M4 POS/ERP System - Control de Versiones

## Versión Actual: 1.0.1

**Fecha de Release:** 21 de Diciembre, 2025  
**Código de Versión:** v1.0.1-bugfix-bulk-import  
**Estado:** Estable - Listo para Deploy en Railway

---

## Historial de Versiones

### v1.0.1 (21 Diciembre 2025) - Bug Fix Critical
**Cambios:**
- 🐛 **FIX CRÍTICO:** Corregido bug en carga masiva de equipos
  - Problema: Mapeo incorrecto de campos snake_case vs camelCase
  - Impacto: Carga masiva no funcionaba (0/152 equipos insertados)
  - Solución: Mapeo explícito de todos los campos
  - Resultado: 152/152 equipos insertados correctamente

- 📊 **Logging Mejorado:**
  - Logs detallados en todo el proceso de importación
  - Tracking por lote y por registro individual
  - Resumen ejecutivo al finalizar
  - Mensajes de error descriptivos

- 🚀 **Deploy en Railway:**
  - Archivo `railway.json` para configuración óptima
  - `.railwayignore` para optimizar bundle
  - Script `verify-db.mjs` para validación de BD
  - Documentación completa en `README_DEPLOY.md`

**Archivos Modificados:**
- `server/routers.ts` (95 líneas)
- `railway.json` (nuevo)
- `.railwayignore` (nuevo)
- `verify-db.mjs` (nuevo)
- `README_DEPLOY.md` (nuevo)
- `CAMBIOS_REALIZADOS.md` (nuevo)

**Testing:**
- ✅ Carga masiva de 152 equipos funcional
- ✅ Validación de IMEIs duplicados
- ✅ Validación de IMEIs existentes
- ✅ Logging completo y descriptivo
- ✅ Manejo de errores por lote e individual

---

### v1.0.0 (17 Febrero 2026) - Release Inicial
**Módulos Completados:**
- ✅ Autenticación y Usuarios
- ✅ Gestión de Tiendas
- ✅ Productos (Equipos y SIMs)
- ✅ Proveedores
- ✅ Inventario con trazabilidad
- ✅ Clientes
- ✅ Ventas con múltiples métodos de pago
- ✅ Comisiones automáticas
- ✅ Compras (Purchase Orders)
- ✅ Transferencias entre tiendas
- ✅ Reportes financieros
- ✅ Cortes de caja
- ✅ Dashboard con métricas

**Módulos Pendientes:**
- ⏳ Sistema de Reservas
- ⏳ Auditoría completa (Ledger)

**Progreso:** 85% completado

---

## Roadmap Futuro

### v1.1.0 (Planificado para 26 Diciembre 2025)
- [ ] Sistema de Reservas con expiración automática
- [ ] Auditoría completa con doble validación
- [ ] Carga masiva de SIMs
- [ ] Validación de stock antes de venta
- [ ] Sistema de descuentos con validación
- [ ] Exportar cortes a PDF/CSV

### v1.2.0 (Planificado para Enero 2026)
- [ ] Modo offline con sincronización
- [ ] Atajos de teclado para ventas rápidas
- [ ] Escaneo de código de barras
- [ ] Notificaciones push
- [ ] Optimizaciones de rendimiento

### v2.0.0 (Futuro)
- [ ] App móvil nativa
- [ ] Integración con pasarelas de pago
- [ ] Analytics avanzado
- [ ] Reportes personalizables
- [ ] Multi-currency support

---

## Compatibilidad

**Node.js:** 22.13.0 o superior  
**npm/pnpm:** pnpm 10.4.1 recomendado  
**Base de Datos:** Supabase PostgreSQL  
**Navegadores:** Chrome 120+, Firefox 120+, Safari 17+, Edge 120+

---

## Instalación de Versión Específica

```bash
# Clonar repositorio
git clone https://github.com/tu-org/m4-pos-erp.git

# Checkout de versión específica
git checkout v1.0.1

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar en desarrollo
pnpm dev

# Build para producción
pnpm build

# Iniciar en producción
pnpm start
```

---

## Notas de Migración

### De v1.0.0 a v1.0.1
**No se requieren cambios en la base de datos.**

Simplemente actualiza el código:
```bash
git pull origin main
pnpm install
pnpm build
pnpm start
```

**Cambios de comportamiento:**
- La carga masiva ahora funciona correctamente
- Se muestran logs detallados en la consola del servidor
- Mejor manejo de errores en importación masiva

---

**Mantenido por:** Equipo M4 POS/ERP  
**Última actualización:** 21 Diciembre 2025
