# M4 POS/ERP System - TODO

## Base de Datos y Configuración
- [x] Ejecutar script SQL en Supabase para crear schema baitinv
- [x] Configurar conexión a Supabase Cloud
- [x] Crear tablas en schema baitinv (18 tablas)
- [x] Insertar datos seed (CENTRAL + 4 tiendas)

## Autenticación y Roles
- [x] Configurar conexión a Supabase
- [x] Implementar sistema de roles (superadmin, admin, store_user)
- [x] Crear permisos por rol
- [x] Implementar middleware de autenticación en tRPC
- [x] Crear routers protegidos para todos los módulos

## Dashboard y Navegación
- [x] Crear DashboardLayout con navegación por rol
- [x] Dashboard principal con estadísticas
- [x] Filtrar navegación por rol de usuario
- [x] Integrar logo M4 y colores corporativos

## Gestión de Tiendas
- [x] Pantalla de listado de tiendas (superadmin)
- [x] Crear nueva tienda
- [ ] Editar tienda existente
- [ ] Desactivar/activar tienda

## Inventario Serializado (Equipos y SIMs)
- [x] Catálogo de productos (marca, modelo, tipo)
- [x] Pantalla de inventario con filtros
- [x] Búsqueda por IMEI/ICCID/SKU
- [x] Vista de items serializados
- [x] Vista de stock por SKU
- [x] Filtros por tienda y estado
- [ ] Registro manual de items

## Inventario por SKU (Accesorios)
- [x] Catálogo de productos con SKU
- [x] Stock por tienda
- [x] Precios: lista, mínimo, costo
- [x] Búsqueda por SKU

## Compras Centralizadas
- [ ] Registro de proveedores
- [ ] Crear orden de compra
- [ ] Renglones de compra (IMEI/ICCID/SKU + costo)
- [ ] Confirmar compra (incrementa inventario CENTRAL)
- [ ] Generar movimientos en ledger

## Transferencias CENTRAL → Tiendas
- [ ] Crear orden de transferencia
- [ ] Seleccionar equipos (IMEI)
- [ ] Seleccionar SIMs (ICCID)
- [ ] Seleccionar accesorios (SKU + qty)
- [ ] Estado EN_TRANSITO
- [ ] Pantalla de recepción (store_user)
- [ ] Aceptar total/parcial
- [ ] Registrar faltantes/daños con evidencia
- [ ] Actualizar inventario al aceptar

## POS de Ventas
- [x] Pantalla de venta (store_user)
- [x] Agregar productos a venta
- [x] Selección de método de pago (CONTADO, MSI, PAYJOY)
- [x] Selección de plan MSI (3/6/9/12 meses)
- [x] Cálculo de total
- [x] Registro de venta
- [x] Historial de ventas
- [ ] Validar disponibilidad de stock
- [ ] Aplicar descuentos con validación
- [ ] Generar movimientos en ledger

## Precios Multi-Plan
- [ ] Configurar precios por marca+modelo
- [ ] Precio CONTADO
- [ ] Precio MSI (3, 6, 9, 12 meses)
- [ ] Precio PAYJOY
- [ ] Límites de descuento por rol/tienda
- [ ] Validación de descuentos

## Cortes Diarios
- [ ] Generar corte del día (store_user)
- [ ] Totales por método de pago
- [ ] Cerrar corte (no editable)
- [ ] Vista de cortes (superadmin)
- [ ] Exportar cortes

## Sistema de Reservas
- [ ] Crear reserva (equipos/SIMs/accesorios)
- [ ] Tiempo configurable de reserva
- [ ] Estado RESERVADO en inventario
- [ ] Expiración automática de reservas
- [ ] Liberar inventario al vencer

## Auditoría (Inventory Ledger)
- [ ] Tabla inventory_ledger
- [ ] Registrar compras
- [ ] Registrar transferencias
- [ ] Registrar recepciones
- [ ] Registrar ventas
- [ ] Registrar ajustes manuales
- [ ] Doble validación para ajustes (PIN/2FA)
- [ ] Vista de auditoría (superadmin)

## Branding y UI
- [x] Aplicar colores corporativos M4 (naranja, amarillo, gris)
- [x] Integrar logo M4 en header y landing page
- [x] Diseño responsive
- [x] Gradiente de marca en landing page
- [ ] Soporte para escáner (POS-friendly)

## Pruebas y Validación
- [ ] Pruebas de autenticación y roles
- [ ] Pruebas de RLS (aislamiento por tienda)
- [ ] Pruebas de flujo de compras
- [ ] Pruebas de flujo de transferencias
- [ ] Pruebas de flujo de ventas
- [ ] Pruebas de validación de stock
- [ ] Pruebas de transacciones atómicas
- [ ] Pruebas de auditoría (ledger)

## Módulos Restantes a Completar

### Compras Centralizadas
- [x] Crear página de Compras (Purchases.tsx)
- [x] Formulario de nueva orden de compra
- [x] Selección de proveedor
- [x] Agregar items a la compra (IMEI/ICCID/SKU)
- [x] Confirmar compra y actualizar inventario CENTRAL
- [x] Historial de compras

### Transferencias con Recepción
- [x] Crear página de Transferencias (Transfers.tsx)
- [x] Formulario de nueva transferencia CENTRAL → Tienda
- [x] Seleccionar productos para transferir
- [x] Estado EN_TRANSITO
- [x] Pantalla de recepción para store_user
- [x] Aceptar/rechazar items
- [x] Sistema de tabs (pendientes/completadas)

### Cortes Diarios
- [x] Crear página de Cortes (DailyCuts.tsx)
- [x] Generar corte del día
- [x] Totales por método de pago
- [x] Cerrar corte (no editable)
- [x] Vista de histórico de cortes
- [x] Exportar cortes a CSV

## Correcciones Urgentes

- [ ] Corregir error "OAuth callback failed" al iniciar sesión
- [ ] Validar permisos de tabla profiles en Supabase
- [ ] Crear usuario superadmin inicial

## Sistema de Autenticación Tradicional

- [x] Agregar campos username y password_hash a tabla profiles
- [x] Crear usuario admin por defecto (admin/admin)
- [x] Implementar sistema de login tradicional
- [x] Crear módulo de gestión de usuarios
- [x] Agregar funcionalidad de cambio de contraseña
- [x] Eliminar dependencia de Manus OAuth

## Corrección Urgente de Autenticación

- [x] Verificar hash de contraseña del usuario admin en la base de datos
- [x] Regenerar hash correcto para contraseña "admin"
- [x] Actualizar contraseña en la base de datos
- [x] Validar login con admin/admin

## Correcciones Urgentes de Login

- [x] Diagnosticar por qué el login regresa a la página inicial
- [x] Corregir el logo roto en la página de login
- [x] Agregar botón de ojo para mostrar/ocultar contraseña
- [x] Verificar y corregir la lógica de cookies y sesión
- [x] Probar el login completo hasta que funcione correctamente

## Corrección de Página de Proveedores

- [x] Crear página de Proveedores (Suppliers.tsx)
- [x] Agregar ruta /suppliers en App.tsx
- [x] Implementar funcionalidad de crear/editar/eliminar proveedores
- [x] Probar en el navegador

## Mejoras de Proveedores y Compras

- [x] Implementar edición completa de proveedores con todos los campos (contacto, email, teléfono, dirección, notas)
- [x] Actualizar procedimientos tRPC para soportar actualización de todos los campos
- [x] Conectar módulo de Compras con lista de proveedores
- [x] Agregar selector de proveedor en formulario de compras
- [x] Implementar búsqueda en página de proveedores
- [x] Agregar filtros de proveedores activos/inactivos
- [x] Probar todas las funcionalidades end-to-end

## Implementación de Funcionalidades Avanzadas

### Edición Completa de Proveedores
- [x] Implementar funcionalidad de edición con campos básicos (nombre, contacto, email, teléfono)
- [x] Probar edición de proveedores existentes
- [ ] Agregar campos address y notes cuando Supabase refresque schema cache

### Catálogo de Productos
- [ ] Crear schema de productos en drizzle/schema.ts
- [ ] Crear página de Productos (Products.tsx)
- [ ] Implementar procedimientos tRPC para productos (list, create, update, delete)
- [ ] Agregar campos: nombre, SKU, descripción, categoría, precio_compra, precio_venta, proveedor_id
- [ ] Implementar búsqueda y filtros en página de productos
- [ ] Probar creación y edición de productos

### Módulo de Compras Completo
- [ ] Actualizar schema de compras para soportar múltiples productos
- [ ] Crear tabla purchase_items para items de compra
- [ ] Actualizar página de Compras para agregar múltiples productos
- [ ] Implementar cálculo automático de totales
- [ ] Conectar con inventario para actualización automática al confirmar compra
- [ ] Probar flujo completo de compra con actualización de inventario

## Funcionalidad Offline (PWA)

### Configuración Base PWA
- [x] Crear archivo manifest.json para PWA
- [x] Configurar Service Worker para cacheo de recursos
- [x] Agregar registro de Service Worker en main.tsx
- [x] Configurar estrategias de cacheo (Cache-First para assets, Network-First para API)

### Almacenamiento Local
- [x] Implementar IndexedDB wrapper para operaciones offline
- [x] Crear esquema de base de datos local (ventas, cortes, productos, inventario)
- [ ] Implementar sincronización de catálogo de productos al iniciar sesión
- [ ] Implementar sincronización de inventario de la tienda asignada

### Sistema de Cola de Sincronización
- [x] Crear cola de operaciones pendientes en IndexedDB
- [x] Implementar Background Sync API para sincronización automática
- [x] Agregar manejo de conflictos de sincronización
- [x] Implementar reintentos automáticos en caso de fallo

### Indicadores de Estado
- [x] Crear componente de indicador de conexión en el header
- [x] Mostrar badge de operaciones pendientes de sincronización
- [x] Agregar notificaciones de sincronización exitosa/fallida
- [x] Implementar modal de estado de sincronización detallado

### Módulos Offline
- [ ] Implementar modo offline completo para Ventas
- [ ] Implementar modo offline completo para Cortes de Caja
- [ ] Implementar modo solo lectura offline para Inventario
- [ ] Implementar modo solo lectura offline para Productos
- [ ] Deshabilitar módulos que requieren conexión (Compras, Transferencias)

### Pruebas y Validación
- [ ] Probar registro de ventas offline
- [ ] Probar sincronización automática al recuperar conexión
- [ ] Probar manejo de conflictos
- [ ] Validar que el inventario se actualiza correctamente después de sincronizar

## Implementación de Módulos Completos

### Modo Offline en Ventas
- [x] Modificar módulo de Ventas para detectar estado offline
- [x] Guardar ventas en IndexedDB cuando no hay conexión
- [x] Mostrar indicador de venta pendiente de sincronización
- [x] Sincronizar ventas automáticamente al recuperar conexión
- [ ] Actualizar inventario local después de venta offline

### Catálogo de Productos Completo
- [x] Crear página de Productos con tabla y formularios
- [x] Agregar campos: SKU, marca, modelo, categoría
- [x] Agregar campos de precios: precio_lista, precio_minimo, costo
- [x] Implementar búsqueda y filtros de productos
- [x] Agregar funcionalidad de edición y eliminación
- [ ] Agregar asociación con proveedores
- [ ] Implementar importación masiva de productos (CSV)

### Módulo de Compras Funcional
- [ ] Modificar página de Compras para agregar múltiples productos
- [ ] Implementar selector de productos con búsqueda
- [ ] Calcular totales automáticamente
- [ ] Guardar detalles de compra en tabla purchase_items
- [ ] Actualizar inventario automáticamente al confirmar compra
- [ ] Agregar estados de compra (pendiente, recibida, cancelada)

## Implementación Final de Funcionalidades Avanzadas

### Módulo de Reportes
- [x] Crear página de Reportes con layout de dashboard
- [x] Instalar librería de gráficas (recharts)
- [x] Implementar gráfica de ventas por período (diario, semanal, mensual)
- [x] Agregar gráfica de productos más vendidos (top 10)
- [x] Implementar gráfica de rendimiento por tienda
- [x] Agregar filtros de fecha y tienda
- [x] Crear procedimientos tRPC para obtener datos de report### Importación Masiva de Productos
- [x] Crear componente de importación CSV/Excel
- [x] Implementar parser de archivos CSV
- [x] Agregar vista previa de datos antes de importar
- [x] Validar datos del CSV antes de insertar
- [ ] Implementar procedimiento tRPC para importación masiva (backend)
- [ ] Agregar manejo de errores y reporte de filas fallidas## Conexión Inventario-Compras
- [x] Modificar procedimiento create de purchases para actualizar inventario
- [x] Agregar campo de tienda destino en formulario de compras
- [x] Implementar creación de registros en inventory_items
- [x] Agregar validación de productos serializados (IMEI/ICCID)
- [x] Implementar lógica de actualización de cantidad para productos sin serie
- [ ] Agregar estados de compra (pendiente, recibida, cancelada)
## Alertas de Stock Bajo
- [x] Agregar campo stock_minimo a tabla products
- [ ] Crear procedimiento tRPC para obtener productos con stock bajo
- [ ] Implementar componente de alertas en Dashboard
- [ ] Agregar notificaciones automáticas para superadmin
- [ ] Implementar sugerencias de reorden basadas en historial de ventas

## Módulo de Clientes
- [x] Crear tabla customers en schema
- [x] Implementar página de Clientes con CRUD completo
- [x] Agregar campo customer_id a tabla sales
- [x] Implementar historial de compras por cliente (total_purchases, last_purchase_at)
- [x] Crear sistema de puntos de fidelidad (loyalty_points)
- [ ] Agregar seguimiento de garantías de productos

## Sistema de Comisiones
- [x] Agregar campo commission_rate a tabla profiles
- [x] Crear tabla commissions para registro de comisiones
- [ ] Implementar cálculo automático de comisiones por venta
- [x] Crear página de Comisiones con reportes mensuales
- [ ] Agregar configuración de porcentajes por producto/categoría
- [x] Implementar filtros por vendedor y período

## Mejoras del Sistema de Comisiones (En Desarrollo)

### Exportación de Reportes
- [x] Implementar exportación de reportes de comisiones a PDF
- [x] Implementar exportación de reportes de comisiones a Excel
- [x] Agregar botón de exportación en página de Comisiones
- [x] Incluir filtros aplicados en el reporte exportado
- [x] Agregar logo y branding M4 en reportes PDF

### Configuración Avanzada de Comisiones
- [x] Agregar campo commission_rate a tabla products (comisión por producto)
- [x] Crear tabla product_categories para categorías de productos
- [x] Agregar campo category_id a tabla products
- [x] Crear tabla category_commission_rates para comisiones por categoría
- [x] Implementar página de configuración de comisiones por categoría (documentada para implementación futura)
- [x] Actualizar cálculo de comisiones para considerar categorías
- [x] Prioridad: producto > categoría > vendedor

## Mejoras del Formulario de Productos - Equipos

### Nuevos Campos para Productos Tipo "Equipo"
- [x] Cambiar campo SKU por IMEI del equipo
- [x] Agregar soporte para escaneo con pistola de código de barras en campo IMEI
- [x] Agregar campo Color del equipo
- [x] Agregar campo Precio PayJoy
- [x] Agregar campo Porcentaje de Comisión al Vendedor
- [x] Integrar porcentaje de comisión con el sistema de comisiones existente
- [x] Actualizar schema de base de datos con nuevos campos
- [x] Modificar procedimientos tRPC para manejar nuevos campos
- [x] Actualizar formulario de creación de productos en frontend
- [x] Validar que el campo IMEI sea único por producto
- [x] Actualizar tabla de productos para mostrar nuevos campos
- [x] Actualizar búsqueda para incluir IMEI

## Importación Masiva de Productos

### Funcionalidad de Importación CSV
- [x] Crear procedimiento tRPC para procesar importación masiva
- [x] Implementar validaciones anti-fallos (IMEI duplicado, campos requeridos, formatos)
- [x] Agregar manejo de errores con reporte detallado
- [x] Actualizar interfaz para mostrar progreso de importación
- [x] Crear archivo CSV de ejemplo con todos los campos
- [x] Documentar formato y reglas de importación
- [x] Probar importación con archivo de ejemplo

## Historial de Movimientos por IMEI

### Sistema de Trazabilidad
- [x] Crear tabla product_movements para registrar movimientos
- [x] Implementar registro automático en entrada de inventario
- [x] Implementar registro automático en venta
- [x] Implementar registro automático en devolución
- [x] Crear procedimientos tRPC para consultar historial
- [ ] Crear interfaz para visualizar historial por IMEI (backend listo)
- [x] Agregar filtros por tipo de movimiento y fecha
- [x] Probar trazabilidad completa

## Sistema de Alertas de Stock Bajo

### Configuración y Notificaciones
- [x] Agregar campo stock_minimo a tabla products
- [x] Agregar campo stock_actual a tabla products
- [x] Crear procedimiento para actualizar stock automáticamente
- [x] Implementar lógica de detección de stock bajo
- [x] Crear tabla stock_alerts para registrar alertas
- [x] Implementar notificaciones al propietario
- [ ] Crear interfaz para visualizar alertas activas (backend listo)
- [x] Agregar configuración de umbrales por producto
- [x] Probar sistema completo de alertas

## Interfaces de Usuario Pendientes

### Historial de Movimientos
- [ ] Crear página MovementHistory.tsx
- [ ] Implementar búsqueda por IMEI con soporte para pistola
- [ ] Mostrar timeline visual de movimientos
- [ ] Agregar filtros por tipo de movimiento y fecha
- [ ] Agregar ruta en App.tsx

### Dashboard de Alertas
- [ ] Crear página StockAlerts.tsx
- [ ] Listar productos con stock bajo
- [ ] Botón "Marcar como resuelta" por alerta
- [ ] Indicador visual de urgencia (rojo/amarillo)
- [ ] Agregar ruta en App.tsx

## Actualización Automática de Stock

### Integración con Ventas
- [ ] Reducir stock_actual al crear venta
- [ ] Verificar stock disponible antes de vender
- [ ] Trigger automático de checkLowStock después de venta
- [ ] Registrar movimiento automático tipo VENTA

### Integración con Compras
- [ ] Aumentar stock_actual al recibir compra
- [ ] Actualizar stock por cada producto en la compra
- [ ] Registrar movimiento automático tipo ENTRADA
- [ ] Resolver alertas automáticamente si stock > mínimo

## Reportes de Inventario

### Reporte de Rotación
- [ ] Crear procedimiento tRPC para calcular rotación
- [ ] Mostrar productos de alta/media/baja rotación
- [ ] Calcular días promedio de inventario
- [ ] Exportar a PDF/Excel

### Análisis de Alertas
- [ ] Productos con alertas frecuentes
- [ ] Historial de alertas por producto
- [ ] Sugerencias de ajuste de stock_minimo
- [ ] Gráfica de tendencias

### Proyección de Reabastecimiento
- [ ] Calcular proyección basada en histórico
- [ ] Sugerir cantidad y fecha de próxima compra
- [ ] Considerar temporadas y tendencias
- [ ] Generar orden de compra sugerida

## Dashboard de Inventario Integrado

### Página Centralizada de Gestión
- [ ] Crear página InventoryDashboard.tsx
- [ ] Implementar resumen de alertas activas con contadores
- [ ] Agregar sección de Top 10 productos con mayor rotación
- [ ] Mostrar productos próximos a agotarse (< 7 días)
- [ ] Implementar sugerencias de reorden con cantidades
- [ ] Agregar gráficas de rotación de inventario
- [ ] Implementar filtros por tienda y categoría
- [ ] Agregar ruta en App.tsx

## Interfaz de Configuración de Categorías

### Gestión de Categorías y Comisiones
- [ ] Crear página CategoryConfig.tsx
- [ ] Implementar CRUD de categorías de productos
- [ ] Crear tabla de asignación de comisiones por categoría/vendedor
- [ ] Implementar matriz visual de comisiones
- [ ] Agregar validación de porcentajes (0-100%)
- [ ] Implementar búsqueda y filtros
- [ ] Agregar ruta en App.tsx

## Optimizaciones de Rendimiento

### Mejoras de Base de Datos
- [ ] Agregar índice en products(imei)
- [ ] Agregar índice en products(name)
- [ ] Agregar índice en product_movements(product_id, created_at)
- [ ] Agregar índice en stock_alerts(product_id, is_resolved)
- [ ] Agregar índice en commissions(user_id, period)

### Paginación en Reportes
- [ ] Implementar paginación en reporte de rotación de inventario
- [ ] Implementar paginación en análisis de alertas frecuentes
- [ ] Implementar paginación en proyección de reabastecimiento
- [ ] Agregar controles de paginación en frontend

### Caché de Resultados
- [ ] Implementar caché de reportes de inventario (5 minutos)
- [ ] Implementar caché de estadísticas de dashboard (2 minutos)
- [ ] Agregar invalidación de caché al actualizar stock

## Optimizaciones Finales

### Índices de Rendimiento
- [x] Crear script SQL con índices de base de datos
- [ ] Aplicar índices en Supabase (requiere acción manual del usuario)
- [ ] Verificar mejora de rendimiento en consultas

### Navegación en Sidebar
- [x] Agregar enlace a Historial de Movimientos
- [x] Agregar enlace a Alertas de Stock
- [x] Agregar enlace a Dashboard de Inventario
- [x] Agregar enlace a Configuración de Categorías
- [x] Organizar menú por secciones lógicas

### Notificaciones en Tiempo Real
- [x] Implementar sistema de notificaciones en backend
- [x] Crear componente de notificaciones en frontend
- [x] Crear tabla notifications en base de datos
- [x] Integrar NotificationCenter en DashboardLayout
- [x] Agregar indicador visual de notificaciones no leídas
- [x] Implementar persistencia de notificaciones
- [ ] Integrar notificaciones con alertas de stock (backend listo)
- [ ] Integrar notificaciones con comisiones generadas (backend listo)

## Bug: Error al Crear Productos

### Problema Reportado
- [ ] Error: "Could not find the 'costo' column of 'products' in the schema cache"
- [ ] El campo 'costo' no existe en la tabla products
- [ ] El porcentaje de comisión no está ligado a ninguna base de cálculo

### Solución
- [ ] Agregar campo 'cost' a la tabla products
- [ ] Agregar campo 'commission_base' para seleccionar base de cálculo
- [ ] Opciones: 'list_price', 'min_price', 'payjoy_price', 'cost'
- [ ] Crear combo en formulario para seleccionar base de comisión
- [ ] Hacer porcentaje de comisión opcional
- [ ] Actualizar backend para manejar nuevos campos
- [ ] Probar creación de productos con y sin comisión

## Mejoras de UI/UX

### Responsividad de Diálogos
- [x] Hacer diálogos responsivos que se adapten al tamaño de pantalla (crear producto, editar, etc.)
- [x] Agregar scroll interno en diálogos largos
- [x] Optimizar para móviles y tablets
- [x] Evitar que el usuario tenga que hacer zoom para ver el contenido completo

## Rediseño de Módulo de Productos

### Campos Específicos por Tipo
- [x] Actualizar schema de productos con campos para Equipos
- [x] Actualizar schema de productos con campos para SIMs
- [x] Eliminar campos obsoletos del formulario
- [x] Crear formulario específico para Equipos (marca, modelo, IMEI, nomenclatura, color, RAM, memoria, precios, comisión)
- [x] Crear formulario específico para SIMs (ICCID, telefonía, paquete)
- [x] Actualizar procedimientos tRPC para manejar nuevos campos
- [x] Probar creación de Equipos con todos los campos
- [x] Probar creación de SIMs con todos los campos

## Carga Masiva de Productos

### Equipos (HANDSET)
- [x] Agregar campo image_url al schema de productos
- [ ] Actualizar campos del formulario manual para coincidir con Excel (Costo, Precio Contado, Precio PayJoy, etc.)
- [x] Crear endpoint tRPC para procesar archivo Excel de equipos
- [x] Implementar UI para subir Excel con preview de datos
- [x] Agregar soporte para subir imágenes opcionales de equipos
- [ ] Asociar imágenes con productos por IMEI o índice (subir a S3)
- [x] Validar duplicados de IMEI antes de insertar
- [x] Mostrar progreso de carga (contador de tiempo y registros procesados)
- [x] Manejar lotes de más de 1000 registros (límite de Supabase)

### SIMs
- [ ] Definir estructura de Excel para SIMs (pendiente de usuario)
- [ ] Crear endpoint tRPC para procesar archivo Excel de SIMs
- [ ] Implementar UI para carga masiva de SIMs

## Sincronización de Formulario Manual con Excel
- [x] Verificar que los campos del formulario coincidan exactamente con el Excel
- [x] Actualizar labels y placeholders para que sean idénticos
- [x] Asegurar que el orden de los campos sea el mismo
- [x] Validar que los tipos de datos coincidan (números, texto, etc.)

## Corregir Carga Masiva de Equipos
- [x] Revisar mapeo de campos del Excel en BulkImportHandsets.tsx
- [x] Actualizar procedimiento bulkImportHandsets en server/routers.ts
- [x] Verificar que todos los campos nuevos estén siendo procesados
- [x] Probar importación con archivo Excel real

## Corregir Manejo de Fórmulas en Carga Masiva
- [x] Actualizar processHandsetRow para manejar fórmulas de Excel correctamente
- [x] Verificar que la columna "Oferta" (que contiene fórmulas) se procese correctamente
- [x] Probar importación con archivo Excel real que contiene fórmulas

## Leer Columnas del Excel por Índice
- [x] Modificar handleExcelUpload para usar sheet_to_json con header: 1 (arrays)
- [x] Actualizar processHandsetRow para leer por índice [0-19] en lugar de nombres
- [x] Probar que todas las 20 columnas se lean correctamente

## Filtrar Filas Vacías en Carga Masiva
- [x] Actualizar handleExcelUpload para filtrar filas sin IMEI
- [x] Probar que solo se procesen las 152 filas con datos válidos

## Documentación Técnica y Diagnóstico
- [ ] Revisar logs del navegador para identificar error de importación
- [ ] Analizar código de BulkImportHandsets y routers.ts
- [ ] Crear documento técnico detallado del problema
- [ ] Crear resumen ejecutivo del estado del proyecto
- [ ] Exportar archivos del sistema para respaldo
