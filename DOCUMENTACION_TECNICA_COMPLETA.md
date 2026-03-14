# M4 POS/ERP System - Documentación Técnica Completa

**Versión Actual:** 83bf3584  
**Fecha:** 17 de Febrero de 2026  
**Estado:** En Desarrollo Activo (85% completado)  
**URL de Desarrollo:** https://3000-iwzwymsg3nul3dsrb6oij-ad025c33.us1.manus.computer

---

## RESUMEN EJECUTIVO

M4 POS/ERP es un sistema de gestión integral para tiendas de telefonía móvil que maneja inventario de equipos (smartphones) y SIMs, ventas, comisiones, compras, transferencias entre tiendas, y reportes financieros. El sistema está diseñado para operar en múltiples tiendas con control centralizado y roles de usuario diferenciados.

### Estado Actual del Proyecto

**Módulos Completados (13/15):**
- ✅ Autenticación y Usuarios (Manus OAuth)
- ✅ Gestión de Tiendas
- ✅ Productos (Equipos y SIMs) con carga masiva
- ✅ Proveedores
- ✅ Inventario con trazabilidad
- ✅ Clientes
- ✅ Ventas con múltiples métodos de pago
- ✅ Comisiones automáticas por vendedor
- ✅ Compras (Purchase Orders)
- ✅ Transferencias entre tiendas
- ✅ Reportes financieros
- ✅ Cortes de caja
- ✅ Dashboard con métricas en tiempo real

**Módulos Pendientes (2/15):**
- ⏳ Sistema de Reservas (temporal hold de productos)
- ⏳ Auditoría completa (Ledger con doble validación)

### Problema Actual Identificado

**Carga Masiva de Equipos:** El sistema detecta correctamente 152 equipos del archivo Excel pero la importación no se ejecuta. Los logs no muestran errores evidentes, lo que sugiere un problema de validación en el backend o timeout de conexión.

---

## ARQUITECTURA DEL SISTEMA

### Stack Tecnológico

**Frontend:**
- React 19 con TypeScript
- Vite 6 (build tool)
- Tailwind CSS 4 (estilos)
- shadcn/ui (componentes)
- Wouter (routing)
- tRPC 11 (comunicación tipo-segura con backend)
- Superjson (serialización de datos complejos)
- XLSX (lectura de archivos Excel)
- Sonner (notificaciones toast)

**Backend:**
- Node.js 22.13.0
- Express 4
- tRPC 11 (API tipo-segura)
- Drizzle ORM (gestión de base de datos)
- Zod (validación de esquemas)
- JWT (autenticación de sesiones)

**Base de Datos:**
- Supabase PostgreSQL
- URL: https://tskihgbxsxkwvfmoiffs.supabase.co
- Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRza2loZ2J4c3hrd3ZmbW9pZmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTIxNzU5MiwiZXhwIjoyMDg0NzkzNTkyfQ.9h_pd2esgv6onHvbIpPtORS6HQPycnCO3NNRVSayA1A

**Autenticación:**
- Manus OAuth (integración nativa)
- Roles: super_admin, admin, store_user
- Middleware de permisos granulares

**Almacenamiento:**
- S3 (para imágenes de productos y archivos)
- Helpers preconfigurados en `server/storage.ts`

---

## ESTRUCTURA DE BASE DE DATOS

### Tablas Principales

#### 1. **users**
```sql
- id (uuid, PK)
- open_id (text, unique) -- ID de Manus OAuth
- name (text)
- email (text)
- role (enum: super_admin, admin, store_user)
- store_id (uuid, FK → stores.id, nullable)
- permissions (jsonb) -- Permisos granulares
- created_at (timestamp)
```

#### 2. **stores**
```sql
- id (uuid, PK)
- name (text, unique)
- address (text, nullable)
- phone (text, nullable)
- created_at (timestamp)
```

#### 3. **products**
```sql
- id (uuid, PK)
- type (enum: handset, sim)
- store_id (uuid, FK → stores.id)

-- Campos comunes
- status (enum: available, sold, reserved, transferred)

-- Campos específicos de HANDSET
- brand (text)
- model (text) -- SUBMODELO en Excel
- imei (text, unique para handsets)
- model_nomenclature (text) -- NOM MODELO
- color (text)
- ram_capacity (integer) -- GB
- storage_capacity (integer) -- GB
- purchase_price (numeric) -- Costo
- profit_percentage (numeric, nullable) -- %Utilidad
- sale_price (numeric) -- Precio Contado
- payjoy_profit (numeric, nullable) -- Utilidad PayJoy
- is_offer (boolean) -- Oferta
- offer_discount (numeric, nullable) -- Des x Oferta
- payjoy_price_3m (numeric, nullable) -- Precio PayJoy c/3M
- bait_cost_3m (numeric, nullable) -- Costo Bait 3M
- bait_commission_3m (numeric, nullable) -- Comisión Bait 3M
- payjoy_price_6m (numeric, nullable) -- Precio PayJoy c/6M
- bait_cost_6m (numeric, nullable) -- Costo Bait 6M
- bait_commission_6m (numeric, nullable) -- Comisión Bait 6M
- commission_rate (numeric, nullable) -- % Comisión del Vendedor
- image_url (text, nullable)

-- Campos específicos de SIM
- iccid (text, unique para SIMs)
- carrier (text) -- Telefonía
- plan (text) -- Paquete

-- Auditoría
- created_at (timestamp)
- updated_at (timestamp)
```

**Índices:**
- `idx_products_imei` (imei) -- Para búsqueda rápida de equipos
- `idx_products_iccid` (iccid) -- Para búsqueda rápida de SIMs
- `idx_products_store_type` (store_id, type)
- `idx_products_status` (status)

#### 4. **suppliers**
```sql
- id (uuid, PK)
- name (text, unique)
- contact_person (text, nullable)
- phone (text, nullable)
- email (text, nullable)
- address (text, nullable)
- created_at (timestamp)
```

#### 5. **customers**
```sql
- id (uuid, PK)
- name (text)
- phone (text, nullable)
- email (text, nullable)
- address (text, nullable)
- created_at (timestamp)
```

#### 6. **sales**
```sql
- id (uuid, PK)
- store_id (uuid, FK → stores.id)
- customer_id (uuid, FK → customers.id, nullable)
- seller_id (uuid, FK → users.id)
- total_amount (numeric)
- payment_method (enum: cash, card, transfer, payjoy)
- payment_status (enum: pending, completed, cancelled)
- notes (text, nullable)
- created_at (timestamp)
```

#### 7. **sale_items**
```sql
- id (uuid, PK)
- sale_id (uuid, FK → sales.id)
- product_id (uuid, FK → products.id)
- quantity (integer) -- Siempre 1 para equipos (IMEI único)
- unit_price (numeric)
- subtotal (numeric)
- created_at (timestamp)
```

#### 8. **commissions**
```sql
- id (uuid, PK)
- sale_id (uuid, FK → sales.id)
- seller_id (uuid, FK → users.id)
- product_id (uuid, FK → products.id)
- commission_amount (numeric)
- commission_rate (numeric)
- status (enum: pending, paid)
- paid_at (timestamp, nullable)
- created_at (timestamp)
```

**Índices:**
- `idx_commissions_seller_status` (seller_id, status)
- `idx_commissions_sale` (sale_id)

#### 9. **purchase_orders**
```sql
- id (uuid, PK)
- store_id (uuid, FK → stores.id)
- supplier_id (uuid, FK → suppliers.id)
- total_amount (numeric)
- status (enum: pending, received, cancelled)
- order_date (timestamp)
- received_date (timestamp, nullable)
- notes (text, nullable)
- created_at (timestamp)
```

#### 10. **purchase_order_items**
```sql
- id (uuid, PK)
- purchase_order_id (uuid, FK → purchase_orders.id)
- product_type (enum: handset, sim)
- brand (text, nullable) -- Para handsets
- model (text, nullable) -- Para handsets
- iccid (text, nullable) -- Para SIMs
- quantity (integer)
- unit_price (numeric)
- subtotal (numeric)
- created_at (timestamp)
```

#### 11. **inventory_events**
```sql
- id (uuid, PK)
- product_id (uuid, FK → products.id)
- event_type (enum: purchase, sale, transfer_out, transfer_in, adjustment)
- from_store_id (uuid, FK → stores.id, nullable)
- to_store_id (uuid, FK → stores.id, nullable)
- quantity (integer)
- reference_id (uuid, nullable) -- ID de sale, purchase_order o transfer
- notes (text, nullable)
- created_by (uuid, FK → users.id)
- created_at (timestamp)
```

**Índices:**
- `idx_inventory_events_product` (product_id)
- `idx_inventory_events_type` (event_type)
- `idx_inventory_events_created_at` (created_at DESC)

#### 12. **transfers**
```sql
- id (uuid, PK)
- from_store_id (uuid, FK → stores.id)
- to_store_id (uuid, FK → stores.id)
- status (enum: pending, in_transit, completed, cancelled)
- requested_by (uuid, FK → users.id)
- approved_by (uuid, FK → users.id, nullable)
- completed_by (uuid, FK → users.id, nullable)
- notes (text, nullable)
- created_at (timestamp)
- completed_at (timestamp, nullable)
```

#### 13. **transfer_items**
```sql
- id (uuid, PK)
- transfer_id (uuid, FK → transfers.id)
- product_id (uuid, FK → products.id)
- quantity (integer)
- created_at (timestamp)
```

#### 14. **cash_registers**
```sql
- id (uuid, PK)
- store_id (uuid, FK → stores.id)
- user_id (uuid, FK → users.id)
- opening_amount (numeric)
- closing_amount (numeric, nullable)
- expected_amount (numeric, nullable)
- difference (numeric, nullable)
- status (enum: open, closed)
- opened_at (timestamp)
- closed_at (timestamp, nullable)
- notes (text, nullable)
```

#### 15. **product_categories**
```sql
- id (uuid, PK)
- name (text, unique)
- description (text, nullable)
- created_at (timestamp)
```

#### 16. **category_commission_rates**
```sql
- id (uuid, PK)
- category_id (uuid, FK → product_categories.id)
- user_id (uuid, FK → users.id)
- commission_rate (numeric) -- Porcentaje
- created_at (timestamp)
```

#### 17. **stock_alerts**
```sql
- id (uuid, PK)
- store_id (uuid, FK → stores.id)
- product_type (enum: handset, sim)
- brand (text, nullable)
- model (text, nullable)
- min_quantity (integer)
- current_quantity (integer)
- created_at (timestamp)
```

#### 18. **notifications**
```sql
- id (uuid, PK)
- user_id (uuid, FK → users.id)
- title (text)
- message (text)
- type (enum: info, warning, error, success)
- is_read (boolean, default: false)
- created_at (timestamp)
```

---

## FLUJOS DE TRABAJO PRINCIPALES

### 1. Carga Masiva de Equipos

**Archivo:** `client/src/components/BulkImportHandsets.tsx`

**Proceso:**
1. Usuario sube archivo Excel (.xlsx) con 20 columnas
2. Sistema lee archivo usando librería `xlsx`
3. Convierte filas a arrays (header: 1) para capturar columnas vacías
4. Filtra filas sin IMEI (columna 3)
5. Procesa cada fila mapeando índices a campos de base de datos
6. Valida IMEIs únicos en el lote
7. Envía datos a `trpc.products.bulkImportHandsets.useMutation()`
8. Backend valida permisos (`canManageProducts`)
9. Inserta en lotes de 1000 registros (límite de Supabase)
10. Retorna resultado con contadores de éxito/fallo

**Formato Excel Esperado (20 columnas):**
1. MARCA
2. SUBMODELO
3. IMEI
4. NOM MODELO
5. COLOR
6. RAM GB
7. MEMORIA GB
8. es PayJoy?
9. Costo
10. %Utilidad
11. Precio Contado
12. Utilidad PayJoy
13. Oferta (puede contener fórmula)
14. Des x Oferta
15. Precio PayJoy c/3M
16. Costo Bait (3M)
17. Comision Bait (3M)
18. Precio PayJoy c/6M
19. Costo Bait (6M)
20. Comision Bait (6M)

**Problema Actual:**
- Sistema detecta 152 equipos correctamente
- No hay errores en logs del navegador ni servidor
- Importación no se ejecuta (posible timeout o validación fallida)
- **Acción Requerida:** Revisar procedimiento `bulkImportHandsets` en `server/routers.ts` líneas 313-400

### 2. Gestión de Ventas

**Archivo:** `client/src/pages/Sales.tsx`

**Proceso:**
1. Vendedor selecciona cliente (opcional)
2. Agrega productos al carrito escaneando IMEI o buscando
3. Sistema valida disponibilidad en inventario
4. Calcula comisión automáticamente según tasa del producto
5. Selecciona método de pago (efectivo, tarjeta, transferencia, PayJoy)
6. Confirma venta
7. Backend:
   - Crea registro en `sales`
   - Crea items en `sale_items`
   - Actualiza status de productos a "sold"
   - Crea registros en `commissions`
   - Crea eventos en `inventory_events`
8. Genera recibo (opcional)

### 3. Sistema de Comisiones

**Cálculo Automático:**
- Cada producto tiene `commission_rate` (porcentaje)
- Al crear venta, se calcula: `commission_amount = sale_price * (commission_rate / 100)`
- Se crea registro en `commissions` con status "pending"
- Admin puede marcar comisiones como "paid" y establecer `paid_at`

**Reportes:**
- Por vendedor y rango de fechas
- Exportación a PDF y Excel
- Filtros por status (pending/paid)

### 4. Transferencias entre Tiendas

**Archivo:** `client/src/pages/Transfers.tsx`

**Proceso:**
1. Usuario solicita transferencia de productos
2. Selecciona tienda origen y destino
3. Agrega productos por IMEI
4. Sistema valida disponibilidad
5. Crea registro en `transfers` con status "pending"
6. Admin aprueba transferencia → status "in_transit"
7. Tienda destino confirma recepción → status "completed"
8. Backend actualiza `store_id` de productos
9. Crea eventos en `inventory_events` (transfer_out y transfer_in)

---

## SISTEMA DE PERMISOS

### Roles

**super_admin:**
- Acceso total al sistema
- Gestión de usuarios y tiendas
- Configuración global

**admin:**
- Gestión de inventario y ventas
- Reportes financieros
- Aprobación de transferencias
- Gestión de comisiones

**store_user:**
- Ventas en su tienda asignada
- Consulta de inventario de su tienda
- Registro de clientes
- Consulta de sus propias comisiones

### Permisos Granulares

```typescript
{
  canManageUsers: boolean;
  canManageStores: boolean;
  canManageProducts: boolean;
  canManageSales: boolean;
  canManageTransfers: boolean;
  canViewReports: boolean;
  canManageCommissions: boolean;
  canManageSuppliers: boolean;
  canManagePurchases: boolean;
}
```

**Middleware:**
- `isAuthenticated(ctx)` - Verifica sesión activa
- `isSuperAdmin(ctx)` - Solo super_admin
- `isAdminOrAbove(ctx)` - admin o super_admin
- `requirePermission(ctx, permission)` - Valida permiso específico
- `requireStoreAccess(ctx, storeId)` - Valida acceso a tienda

---

## ARCHIVOS CLAVE DEL SISTEMA

### Backend

**Core:**
- `server/_core/index.ts` - Entry point del servidor Express
- `server/_core/trpc.ts` - Configuración de tRPC
- `server/_core/context.ts` - Contexto de autenticación
- `server/_core/env.ts` - Variables de entorno
- `server/_core/cookies.ts` - Configuración de sesiones
- `server/_core/llm.ts` - Integración con LLM (Manus)
- `server/_core/notification.ts` - Notificaciones al owner
- `server/_core/pdfExport.ts` - Generación de PDFs
- `server/_core/excelExport.ts` - Generación de Excel
- `server/_core/map.ts` - Integración con Google Maps

**Routers:**
- `server/routers.ts` - Router principal con todos los procedimientos tRPC
- `server/auth-router.ts` - Autenticación y gestión de usuarios

**Database:**
- `server/db.ts` - Cliente de Supabase y helpers de queries
- `drizzle/schema.ts` - Esquema de base de datos (Drizzle ORM)

**Middleware:**
- `server/middleware.ts` - Funciones de validación de permisos

**Storage:**
- `server/storage.ts` - Helpers para S3 (storagePut, storageGet)

### Frontend

**Core:**
- `client/src/main.tsx` - Entry point de React
- `client/src/App.tsx` - Rutas y layout principal
- `client/src/lib/trpc.ts` - Cliente tRPC configurado

**Páginas:**
- `client/src/pages/Home.tsx` - Landing page
- `client/src/pages/Dashboard.tsx` - Dashboard con métricas
- `client/src/pages/Products.tsx` - Gestión de productos
- `client/src/pages/Sales.tsx` - Módulo de ventas
- `client/src/pages/Inventory.tsx` - Control de inventario
- `client/src/pages/Transfers.tsx` - Transferencias entre tiendas
- `client/src/pages/Suppliers.tsx` - Gestión de proveedores
- `client/src/pages/Customers.tsx` - Gestión de clientes
- `client/src/pages/Purchases.tsx` - Órdenes de compra
- `client/src/pages/Commissions.tsx` - Comisiones de vendedores
- `client/src/pages/Reports.tsx` - Reportes financieros
- `client/src/pages/CashRegister.tsx` - Cortes de caja
- `client/src/pages/Users.tsx` - Gestión de usuarios
- `client/src/pages/Stores.tsx` - Gestión de tiendas

**Componentes:**
- `client/src/components/DashboardLayout.tsx` - Layout con sidebar
- `client/src/components/BulkImportHandsets.tsx` - Carga masiva de equipos
- `client/src/components/ui/*` - Componentes de shadcn/ui

**Estilos:**
- `client/src/index.css` - Estilos globales y variables de tema

### Configuración

- `package.json` - Dependencias y scripts
- `tsconfig.json` - Configuración de TypeScript
- `vite.config.ts` - Configuración de Vite
- `tailwind.config.ts` - Configuración de Tailwind CSS
- `drizzle.config.ts` - Configuración de Drizzle ORM

---

## DECISIONES TÉCNICAS IMPORTANTES

### 1. **Por qué tRPC en lugar de REST?**
- Tipo-seguridad end-to-end sin código generado
- Autocompletado en el IDE
- Validación con Zod integrada
- Menos boilerplate que REST + OpenAPI

### 2. **Por qué Supabase PostgreSQL?**
- Escalabilidad horizontal
- Backups automáticos
- Row Level Security (RLS) disponible
- API REST auto-generada (no usada, preferimos tRPC)

### 3. **Por qué Drizzle ORM?**
- Type-safe queries
- Migraciones automáticas
- Mejor rendimiento que Prisma
- Queries SQL legibles

### 4. **Estructura de Productos: Una tabla vs. Dos tablas?**
- **Decisión:** Una tabla `products` con campos específicos por tipo
- **Razón:** Simplifica inventario y transferencias
- **Trade-off:** Algunos campos nullable para SIMs

### 5. **IMEIs como unique constraint?**
- **Decisión:** IMEI único a nivel de base de datos
- **Razón:** Previene duplicados físicamente
- **Implementación:** Índice único + validación en backend

### 6. **Cálculo de Comisiones: Tiempo real vs. Batch?**
- **Decisión:** Tiempo real al crear venta
- **Razón:** Transparencia inmediata para vendedores
- **Trade-off:** Ligeramente más lento en ventas masivas

### 7. **Autenticación: Custom vs. Manus OAuth?**
- **Decisión:** Manus OAuth
- **Razón:** Integración nativa con la plataforma
- **Beneficio:** SSO automático, menos código de auth

---

## MIGRACIONES APLICADAS

### Migración 1: Schema Inicial
- Creación de tablas base: users, stores, products, customers, suppliers

### Migración 2: Sistema de Ventas
- Tablas: sales, sale_items, commissions

### Migración 3: Compras e Inventario
- Tablas: purchase_orders, purchase_order_items, inventory_events

### Migración 4: Transferencias
- Tablas: transfers, transfer_items

### Migración 5: Campos Adicionales de Productos
- Agregados: commission_rate, commission_base, category_id, image_url

### Migración 6: Campos de Precios PayJoy
- Agregados: payjoy_price_3m, bait_cost_3m, bait_commission_3m, payjoy_price_6m, bait_cost_6m, bait_commission_6m

### Migración 7: Campos de Utilidad
- Agregados: profit_percentage, payjoy_profit, is_offer, offer_discount

### Migración 8: Índices de Rendimiento
- Índices en: products.imei, products.iccid, commissions.seller_id, inventory_events.product_id

---

## VARIABLES DE ENTORNO

**Sistema (Auto-inyectadas por Manus):**
```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
VITE_APP_ID=...
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=...
OWNER_OPEN_ID=...
OWNER_NAME=...
BUILT_IN_FORGE_API_URL=...
BUILT_IN_FORGE_API_KEY=...
VITE_FRONTEND_FORGE_API_KEY=...
VITE_FRONTEND_FORGE_API_URL=...
VITE_ANALYTICS_ENDPOINT=...
VITE_ANALYTICS_WEBSITE_ID=...
VITE_APP_LOGO=...
VITE_APP_TITLE=M4 POS/ERP System
```

**Supabase (Configuradas manualmente):**
```env
SUPABASE_URL=https://tskihgbxsxkwvfmoiffs.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## COMANDOS ÚTILES

### Desarrollo
```bash
cd /home/ubuntu/m4-pos-erp
pnpm install                    # Instalar dependencias
pnpm dev                        # Iniciar servidor de desarrollo
pnpm db:push                    # Aplicar cambios de schema a DB
pnpm test                       # Ejecutar tests unitarios
```

### Base de Datos
```bash
# Generar migración
pnpm drizzle-kit generate

# Aplicar migración
pnpm drizzle-kit migrate

# Abrir Drizzle Studio (GUI)
pnpm drizzle-kit studio
```

### Producción
```bash
pnpm build                      # Build para producción
pnpm preview                    # Preview del build
```

---

## PRÓXIMOS PASOS RECOMENDADOS

### Prioridad Alta
1. **Resolver problema de carga masiva de equipos**
   - Revisar procedimiento `bulkImportHandsets` líneas 313-400 en `server/routers.ts`
   - Agregar logs detallados en cada paso
   - Verificar timeout de Supabase (default: 30s)
   - Probar con lote pequeño (10 equipos) para aislar problema

2. **Implementar carga masiva de SIMs**
   - Crear componente `BulkImportSIMs.tsx` similar a equipos
   - Formato Excel: ICCID, Telefonía, Paquete
   - Procedimiento tRPC: `products.bulkImportSIMs`

3. **Agregar soporte para imágenes de productos**
   - Subida a S3 usando `storagePut()`
   - Asociación automática por IMEI o nombre de archivo
   - Preview en catálogo de ventas

### Prioridad Media
4. **Sistema de Reservas**
   - Tabla `reservations` con expiración automática
   - Status "reserved" en products
   - Cron job para liberar reservas expiradas

5. **Auditoría completa (Ledger)**
   - Registro de todos los cambios en inventario
   - Doble validación para ajustes manuales
   - Reportes de discrepancias

6. **Expandir tests unitarios**
   - Cobertura actual: ~20%
   - Objetivo: >80% en módulos críticos
   - Priorizar: comisiones, transferencias, importación CSV

### Prioridad Baja
7. **Optimizaciones de rendimiento**
   - Paginación en listados grandes
   - Lazy loading de imágenes
   - Cache de queries frecuentes

8. **Mejoras de UX**
   - Modo offline con sincronización
   - Atajos de teclado para ventas rápidas
   - Escaneo de código de barras con cámara

---

## CONTACTO Y SOPORTE

**Owner:** Kratoslar69's Org  
**Proyecto Manus:** m4-pos-erp  
**Versión Actual:** 83bf3584  
**URL de Desarrollo:** https://3000-iwzwymsg3nul3dsrb6oij-ad025c33.us1.manus.computer

**Credenciales de Supabase:**
- URL: https://tskihgbxsxkwvfmoiffs.supabase.co
- Service Role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRza2loZ2J4c3hrd3ZmbW9pZmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTIxNzU5MiwiZXhwIjoyMDg0NzkzNTkyfQ.9h_pd2esgv6onHvbIpPtORS6HQPycnCO3NNRVSayA1A

---

## HISTORIAL DE CAMBIOS RECIENTES

### 2026-02-17 - Versión 83bf3584
- ✅ Agregado filtro de filas vacías en carga masiva
- ✅ Lectura de Excel por índice en lugar de nombres de columna
- ✅ Soporte para 20 columnas del formato de equipos
- ✅ Validación de IMEIs únicos en lote
- ⚠️ **Problema pendiente:** Importación no se ejecuta (152 equipos detectados)

### 2026-02-17 - Versión 44c463b0
- ✅ Rediseño completo del módulo de productos
- ✅ Campos específicos para Equipos y SIMs
- ✅ Formulario manual sincronizado con Excel

### 2026-02-17 - Versión abda2093
- ✅ Agregados todos los campos del Excel al formulario
- ✅ Actualizado schema de base de datos
- ✅ Procedimientos tRPC actualizados

### 2026-02-17 - Versión d76d2edc
- ✅ Migraciones aplicadas exitosamente en Supabase
- ✅ Índices de rendimiento creados

### 2026-02-17 - Versión fb434776
- ✅ Diálogos completamente responsivos
- ✅ Scroll interno en formularios largos

---

**FIN DE DOCUMENTACIÓN TÉCNICA**
