# M4 POS/ERP System - Resumen del Proyecto

**Fecha de creación:** 30 de enero de 2026  
**Versión actual:** 472de686  
**Estado:** Sistema funcional con autenticación tradicional operativa

---

## RESUMEN EJECUTIVO

### Descripción del Sistema
Sistema ERP/POS completo para gestión de tiendas de telefonía móvil con múltiples puntos de venta. Incluye control de inventario, compras, transferencias entre tiendas, ventas, cortes diarios y reportes.

### Características Principales
- ✅ **Autenticación tradicional** con usuario/contraseña (sin dependencia de OAuth externo)
- ✅ **Control de acceso basado en roles** (superadmin, admin, store_user)
- ✅ **Gestión multi-tienda** con control de inventario por ubicación
- ✅ **9 módulos operativos** completamente funcionales
- ✅ **Interfaz moderna** con diseño responsive en colores naranja/amarillo

### Credenciales de Acceso
- **Usuario:** admin
- **Contraseña:** admin
- **Rol:** superadmin (acceso completo a todos los módulos)

### Estado Actual
El sistema está completamente funcional y probado. El login funciona correctamente y todos los módulos están operativos. La base de datos está configurada con las tablas necesarias y el usuario superadmin está creado.

---

## RESUMEN TÉCNICO

### Stack Tecnológico
- **Frontend:** React 19 + TypeScript + Tailwind CSS 4 + Wouter (routing)
- **Backend:** Node.js + Express 4 + tRPC 11
- **Base de datos:** Supabase (PostgreSQL)
- **Autenticación:** JWT + localStorage (híbrido con cookies)
- **ORM:** Drizzle ORM
- **UI Components:** shadcn/ui + Lucide Icons

### Arquitectura de Autenticación

#### Problema Resuelto
El proxy de Manus filtraba los headers `Set-Cookie`, impidiendo que las cookies HTTP-only funcionaran correctamente.

#### Solución Implementada
Sistema de autenticación híbrido:

1. **Servidor** (`server/auth-router.ts`):
   - Genera token JWT al hacer login
   - Establece cookie HTTP-only (para compatibilidad futura)
   - **Retorna el token en la respuesta JSON**

2. **Cliente** (`client/src/pages/Login.tsx`):
   - Recibe el token en la respuesta del login
   - **Guarda el token en localStorage**
   - Redirige al dashboard

3. **Cliente tRPC** (`client/src/main.tsx`):
   - Lee el token de localStorage
   - **Envía el token en header `Authorization: Bearer <token>`**

4. **Contexto del servidor** (`server/_core/context.ts`):
   - Acepta tokens desde cookies HTTP-only
   - **También acepta tokens desde header Authorization**
   - Verifica y decodifica el JWT

### Estructura de la Base de Datos

#### Tabla: `profiles`
```sql
- id: text (PK)
- username: text (UNIQUE, NOT NULL) -- Usuario para login
- password_hash: text (NOT NULL) -- Contraseña hasheada con bcrypt
- email: text (UNIQUE, NOT NULL)
- name: text (NOT NULL)
- role: enum ('superadmin', 'admin', 'store_user')
- store_id: text (FK a stores, nullable)
- created_at: timestamp
- updated_at: timestamp
```

#### Tabla: `stores`
```sql
- id: text (PK)
- name: text (NOT NULL)
- address: text
- phone: text
- status: enum ('active', 'inactive')
- created_at: timestamp
- updated_at: timestamp
```

#### Tabla: `products`
```sql
- id: text (PK)
- name: text (NOT NULL)
- description: text
- sku: text (UNIQUE)
- category: text
- brand: text
- model: text
- price: decimal
- cost: decimal
- created_at: timestamp
- updated_at: timestamp
```

#### Tabla: `inventory`
```sql
- id: text (PK)
- product_id: text (FK a products)
- store_id: text (FK a stores)
- quantity: integer
- min_stock: integer
- max_stock: integer
- last_updated: timestamp
```

#### Otras tablas implementadas:
- `suppliers` - Proveedores
- `purchases` - Compras
- `purchase_items` - Detalles de compras
- `transfers` - Transferencias entre tiendas
- `transfer_items` - Detalles de transferencias
- `sales` - Ventas
- `sale_items` - Detalles de ventas
- `cash_registers` - Cortes de caja

### Módulos del Sistema

1. **Dashboard** (`/dashboard`)
   - Resumen de tiendas activas
   - Ventas totales
   - Inventario total
   - Rendimiento vs mes anterior
   - Ventas recientes
   - Estado de tiendas

2. **Tiendas** (`/stores`)
   - Listado de tiendas
   - Crear/editar/eliminar tiendas
   - Activar/desactivar tiendas

3. **Productos** (`/products`)
   - Catálogo de productos
   - Crear/editar/eliminar productos
   - Información de SKU, marca, modelo, precios

4. **Proveedores** (`/suppliers`)
   - Gestión de proveedores
   - Información de contacto

5. **Inventario** (`/inventory`)
   - Stock por tienda
   - Niveles mínimos/máximos
   - Alertas de stock bajo

6. **Compras** (`/purchases`)
   - Registro de compras a proveedores
   - Detalles de productos comprados
   - Actualización automática de inventario

7. **Transferencias** (`/transfers`)
   - Transferencias entre tiendas
   - Seguimiento de productos en tránsito
   - Actualización de inventario origen/destino

8. **Ventas** (`/sales`)
   - Registro de ventas por tienda
   - Detalles de productos vendidos
   - Actualización automática de inventario

9. **Cortes Diarios** (`/cash-registers`)
   - Cortes de caja por tienda
   - Registro de efectivo, tarjetas, transferencias
   - Diferencias y notas

10. **Usuarios** (`/users`) - Solo superadmin
    - Gestión de usuarios del sistema
    - Asignación de roles
    - Asignación de tiendas
    - Cambio de contraseñas

11. **Perfil** (`/profile`)
    - Cambio de contraseña del usuario actual
    - Información del perfil

### Control de Acceso por Rol

#### Superadmin
- Acceso completo a todos los módulos
- Puede gestionar usuarios
- Puede ver y gestionar todas las tiendas

#### Admin
- Acceso a todos los módulos excepto gestión de usuarios
- Puede ver y gestionar todas las tiendas
- Puede crear/editar productos, proveedores, etc.

#### Store User
- Solo puede ver y gestionar su tienda asignada
- Acceso a ventas, inventario, cortes de su tienda
- No puede crear/editar productos o proveedores

### Archivos Clave del Proyecto

#### Backend
- `server/auth-router.ts` - Router de autenticación (login, logout, gestión de usuarios)
- `server/routers.ts` - Router principal con todos los procedimientos tRPC
- `server/db.ts` - Helpers de base de datos
- `server/_core/context.ts` - Contexto de tRPC con autenticación
- `server/_core/cookies.ts` - Configuración de cookies
- `server/middleware.ts` - Middlewares de autenticación (protectedProcedure, adminProcedure)
- `drizzle/schema.ts` - Esquema de base de datos

#### Frontend
- `client/src/App.tsx` - Rutas de la aplicación
- `client/src/main.tsx` - Configuración de tRPC client con Authorization header
- `client/src/pages/Login.tsx` - Página de login con guardado en localStorage
- `client/src/pages/Dashboard.tsx` - Dashboard principal
- `client/src/pages/Users.tsx` - Gestión de usuarios
- `client/src/pages/Profile.tsx` - Cambio de contraseña
- `client/src/components/DashboardLayout.tsx` - Layout con sidebar
- `client/src/_core/hooks/useAuth.ts` - Hook de autenticación

### Comandos Útiles

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev

# Aplicar cambios de schema a la base de datos
pnpm db:push

# Ejecutar tests
pnpm test

# Build para producción
pnpm build
```

### Variables de Entorno Clave

Las siguientes variables están pre-configuradas por Manus:
- `DATABASE_URL` - URL de conexión a Supabase
- `JWT_SECRET` - Secret para firmar tokens JWT
- `VITE_APP_ID` - ID de la aplicación
- `VITE_APP_TITLE` - Título de la aplicación
- `VITE_APP_LOGO` - URL del logo

### Próximos Pasos Recomendados

1. **Seguridad:**
   - Cambiar la contraseña del superadmin por una más segura
   - Configurar políticas RLS en Supabase para mayor seguridad

2. **Datos de prueba:**
   - Crear tiendas de ejemplo
   - Agregar productos al catálogo
   - Crear usuarios de prueba con diferentes roles

3. **Funcionalidades adicionales:**
   - Reportes avanzados con gráficas
   - Exportación de datos a Excel/PDF
   - Notificaciones de stock bajo
   - Historial de cambios en inventario
   - Sistema de permisos más granular

4. **Optimizaciones:**
   - Implementar paginación en listados
   - Agregar búsqueda y filtros avanzados
   - Optimizar consultas de base de datos
   - Implementar caché para datos frecuentes

### Notas Importantes

1. **Autenticación:** El sistema usa localStorage para guardar el token JWT. Esto es seguro para este caso de uso, pero en producción considera implementar refresh tokens.

2. **Base de datos:** Todas las tablas están creadas en Supabase. El usuario admin está creado con el hash de contraseña correcto.

3. **Roles:** El sistema distingue entre 3 roles:
   - `superadmin`: Acceso total, puede gestionar usuarios
   - `admin`: Acceso a todos los módulos excepto usuarios
   - `store_user`: Solo acceso a su tienda asignada

4. **Diseño:** El sistema usa un diseño consistente con colores naranja (#ff8c00) y amarillo, con el logo de M4 SIEMPRE CONECTADO.

5. **Responsive:** La interfaz es completamente responsive y funciona en dispositivos móviles.

---

## HISTORIAL DE CAMBIOS

### Versión 472de686 (30 Ene 2026)
- ✅ Implementado sistema de autenticación tradicional con JWT
- ✅ Creado usuario superadmin por defecto (admin/admin)
- ✅ Resuelto problema de cookies con proxy de Manus
- ✅ Implementada autenticación híbrida (localStorage + Authorization header)
- ✅ Agregado botón de ojo para mostrar/ocultar contraseña
- ✅ Corregido logo en página de login
- ✅ Creado módulo de gestión de usuarios
- ✅ Creado módulo de cambio de contraseña
- ✅ Probado y validado login completo en navegador

### Versión 5a7f4d8d (30 Ene 2026)
- Primer intento de autenticación con cookies HTTP-only
- Detectado problema con proxy de Manus filtrando Set-Cookie

### Versión 7f43ba1b (23 Ene 2026)
- Inicialización del proyecto
- Creación de estructura base
- Implementación de módulos principales

---

## CONTACTO Y SOPORTE

Para cualquier duda o problema con el sistema:
1. Revisar este documento de resumen
2. Consultar el archivo `todo.md` para ver tareas pendientes
3. Revisar los logs en `.manus-logs/` para debugging

**Última actualización:** 30 de enero de 2026
