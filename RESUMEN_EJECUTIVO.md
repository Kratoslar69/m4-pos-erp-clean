# M4 POS/ERP System - Resumen Ejecutivo y Técnico

**Fecha:** 29 de Enero de 2026  
**Estado:** En Desarrollo - Fase 2 Completada  
**Versión:** 7f43ba1b

---

## 📋 Estado Actual del Proyecto

### ✅ Completado (Fases 1-2)

1. **Base de Datos en Supabase Cloud**
   - Proyecto creado: `m4-pos-erp` (ID: tskihgbxsxkwvfmoiffs)
   - Región: us-east-1 (cercana a México)
   - Plan: Pro
   - 18 tablas creadas en schema `public`
   - 6 ENUMs personalizados
   - Datos seed: 5 tiendas (CENTRAL + 4 sucursales)

2. **Configuración del Proyecto Next.js**
   - Cliente Supabase configurado
   - Service key configurada correctamente
   - Tests de conexión pasando (4/4)
   - Servidor funcionando sin errores

### ⏸️ Pendiente (Fases 3-11)

- Autenticación y sistema de roles
- Dashboard principal con navegación por rol
- Módulos de gestión (tiendas, productos, proveedores)
- Sistema de compras centralizadas
- Transferencias con recepción
- POS de ventas multi-plan
- Cortes diarios y reservas
- Branding M4 (colores y logo)
- Pruebas exhaustivas

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **Supabase Cloud** (PostgreSQL 17.6.1)
- **Node.js** 22.13.0
- **Express** 4.x
- **tRPC** 11.x para API type-safe
- **@supabase/supabase-js** 2.93.3

### Frontend
- **React** 19.2.1
- **Next.js** (via Vite)
- **Tailwind CSS** 4.x
- **shadcn/ui** components
- **Wouter** para routing

### Testing
- **Vitest** 2.x
- Tests de integración con Supabase

---

## 📊 Estructura de Base de Datos

### Tablas Principales (18 total)

1. **stores** - Tiendas y almacén central
2. **profiles** - Perfiles de usuario con roles
3. **suppliers** - Proveedores
4. **products** - Catálogo de productos (equipos, SIMs, accesorios)
5. **inventory_items** - Inventario serializado (IMEI, ICCID)
6. **inventory_stock** - Stock por SKU y tienda
7. **purchase_orders** - Órdenes de compra
8. **purchase_items** - Items de compra
9. **transfer_orders** - Transferencias entre tiendas
10. **transfer_items** - Items de transferencia
11. **sales** - Ventas
12. **sale_items** - Items de venta
13. **pricing_plans** - Precios por plan de pago
14. **daily_cashouts** - Cortes diarios
15. **reservations** - Reservas de inventario
16. **inventory_ledger** - Auditoría de movimientos

### ENUMs

- **user_role**: superadmin, admin, store_user
- **inventory_status**: EN_ALMACEN, EN_TRANSITO, EN_TIENDA, RESERVADO, VENDIDO, DEVUELTO, MERMA
- **product_type**: HANDSET, SIM, ACCESSORY
- **payment_plan**: CONTADO, MSI, PAYJOY
- **transfer_status**: PENDIENTE, EN_TRANSITO, PARCIAL, COMPLETADA
- **event_type**: COMPRA, TRANSFERENCIA, RECEPCION, VENTA, DEVOLUCION, MERMA, AJUSTE

### Datos Seed

```
CENTRAL (almacén)
BAIT M4 PENSIONES
BAIT M4 PROGRESO
BAIT M4 PLAZA DORADA
BAIT M4 TICUL
```

---

## 🔑 Credenciales y Configuración

### Supabase

- **URL:** https://tskihgbxsxkwvfmoiffs.supabase.co
- **Project ID:** tskihgbxsxkwvfmoiffs
- **Anon Key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRza2loZ2J4c3hrd3ZmbW9pZmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMTc1OTIsImV4cCI6MjA4NDc5MzU5Mn0.m00U2l-A1ZcbxqiWTdQAW1Wkf3wtDiWF5fL9lE9436w
- **Service Key:** (configurada en SUPABASE_SERVICE_KEY)

### Variables de Entorno

```bash
SUPABASE_SERVICE_KEY=<configurada>
# Otras variables del template Manus ya configuradas
```

---

## 📁 Archivos Clave del Proyecto

### Configuración
- `/home/ubuntu/m4-pos-erp/package.json` - Dependencias
- `/home/ubuntu/m4-pos-erp/todo.md` - Lista de tareas
- `/home/ubuntu/m4-pos-erp/RESUMEN_EJECUTIVO.md` - Este archivo

### Backend
- `/home/ubuntu/m4-pos-erp/server/db.ts` - Helpers de Supabase
- `/home/ubuntu/m4-pos-erp/server/routers.ts` - tRPC routers
- `/home/ubuntu/m4-pos-erp/server/supabase.test.ts` - Tests de conexión

### Frontend
- `/home/ubuntu/m4-pos-erp/client/src/lib/supabase.ts` - Cliente Supabase
- `/home/ubuntu/m4-pos-erp/client/src/lib/trpc.ts` - Cliente tRPC
- `/home/ubuntu/m4-pos-erp/client/src/App.tsx` - Routing principal
- `/home/ubuntu/m4-pos-erp/client/src/pages/Home.tsx` - Página inicial

### Documentación
- `/home/ubuntu/architecture.md` - Arquitectura del sistema
- `/home/ubuntu/baitinv.sql` - Script SQL completo
- `/home/ubuntu/database_diagram.png` - Diagrama de BD

### Assets
- `/home/ubuntu/LOGODONJOSE(2).pdf.png` - Logo M4 SIEMPRE CONECTADO

---

## 🔧 Decisiones Técnicas Clave

### 1. Schema de Base de Datos

**Problema:** Supabase Cloud solo expone los schemas `public` y `graphql_public` por defecto.

**Solución:** Movimos todas las tablas del schema `baitinv` al schema `public` para acceso inmediato via API REST.

**Alternativa descartada:** Configurar manualmente el PostgREST para exponer schemas personalizados (requiere acceso a configuración del servidor).

### 2. Autenticación

**Decisión:** Usar Manus OAuth (ya integrado en el template) en lugar de Supabase Auth.

**Razón:** El template ya tiene OAuth funcionando, y podemos mapear usuarios a la tabla `profiles` con roles.

### 3. Conexión a Base de Datos

**Evolución:**
1. ❌ Intentamos Supabase self-hosted (problemas de conectividad)
2. ❌ Intentamos MySQL local (no cumple requisitos)
3. ✅ **Supabase Cloud Pro** (solución final, control total via MCP)

---

## 🎨 Branding M4

### Colores Corporativos

- **Naranja:** #FFA500 (primario)
- **Amarillo:** #FFD700 (acento)
- **Gris:** #D3D3D3 (secundario)

### Logo

Archivo: `/home/ubuntu/LOGODONJOSE(2).pdf.png`

Características:
- Esfera naranja/amarilla con líneas dinámicas
- Tipografía "M4" bold con líneas horizontales
- Texto "SIEMPRE CONECTADO" en estilo retro

---

## 🚀 Cómo Continuar el Desarrollo

### Paso 1: Verificar Estado del Servidor

```bash
cd /home/ubuntu/m4-pos-erp
pnpm dev
```

URL: https://3000-ix9f2dmgzdjdw6hgcb22l-f16c143c.us2.manus.computer

### Paso 2: Ejecutar Tests

```bash
pnpm test supabase.test.ts
```

Debe mostrar: `4 passed (4)`

### Paso 3: Revisar TODO

Ver archivo `todo.md` para lista completa de funcionalidades pendientes.

### Paso 4: Implementar Siguiente Fase

**Fase 3: Autenticación y Sistema de Roles**

Tareas:
1. Crear middleware de autenticación en tRPC
2. Implementar `protectedProcedure` con validación de roles
3. Crear helpers para verificar permisos por tienda
4. Configurar RLS policies en Supabase (opcional, podemos hacerlo a nivel de aplicación)

---

## 📝 Notas Importantes

### Limitaciones de Supabase

- **1000 registros por consulta** - Implementar paginación para listados grandes
- **Schema público** - Todas las tablas están en `public`, no en `baitinv`

### Seguridad

- **Service key** solo se usa en el servidor (nunca en frontend)
- **Anon key** se usa en el cliente con RLS (a implementar)
- **Roles** se validan a nivel de aplicación (tRPC procedures)

### Performance

- **Índices creados** en campos clave (serial_number, sku_code, store_id, etc.)
- **Queries optimizadas** con `.select()` específicos (no usar `*` en producción)

---

## 🎯 Próximos Pasos Recomendados

### Corto Plazo (Fase 3-4)

1. Implementar sistema de roles en tRPC
2. Crear DashboardLayout con navegación por rol
3. Pantalla de login/logout
4. Dashboard básico por rol (superadmin, admin, store_user)

### Mediano Plazo (Fase 5-7)

5. Módulo de gestión de tiendas
6. Módulo de productos y proveedores
7. Sistema de compras centralizadas
8. Sistema de transferencias

### Largo Plazo (Fase 8-11)

9. POS de ventas multi-plan
10. Cortes diarios
11. Sistema de reservas
12. Branding M4 completo
13. Pruebas exhaustivas
14. Documentación de usuario

---

## 📞 Contacto y Soporte

**Proyecto:** M4 POS/ERP System  
**Cliente:** Kratoslar69's Org  
**Supabase Dashboard:** https://supabase.com/dashboard/project/tskihgbxsxkwvfmoiffs

---

## 🔄 Historial de Versiones

### v0.1.0 (29 Ene 2026) - Checkpoint Inicial

- Base de datos creada en Supabase Cloud
- Proyecto Next.js configurado
- Tests de conexión pasando
- Documentación inicial completa

---

**Última actualización:** 29 de Enero de 2026, 18:30 CST
