# Configuración Inicial del Sistema M4 POS/ERP

## 🚀 Guía de Inicio Rápido (15 minutos)

Esta guía te llevará desde cero hasta tener el sistema completamente funcional con datos de prueba.

---

## Paso 1: Aplicar Migraciones SQL (5 minutos)

### ¿Qué son las migraciones?
Son cambios en la estructura de la base de datos necesarios para que el sistema funcione correctamente.

### ¿Por qué son necesarias?
Sin las migraciones, verás errores al intentar crear productos o usar ciertas funcionalidades.

### Cómo aplicarlas:

1. **Abrir Supabase Dashboard**
   - Ve a tu panel de Supabase
   - URL: https://app-supabase.intelligenc-ia.tech
   - Inicia sesión

2. **Ir al SQL Editor**
   - En el menú lateral izquierdo, busca "SQL Editor"
   - Haz clic en "New query"

3. **Copiar el SQL**
   - Abre el archivo: `/migrations/APLICAR_TODAS_LAS_MIGRACIONES.sql`
   - Copia TODO el contenido (Ctrl+A, Ctrl+C)

4. **Pegar y ejecutar**
   - Pega en el SQL Editor de Supabase (Ctrl+V)
   - Haz clic en "Run" o presiona Ctrl+Enter
   - Espera a que aparezca "Success"

5. **Verificar**
   - Al final del resultado deberías ver:
     - 2 filas en "Verificación de campos"
     - Un número mayor a 30 en "Total de índices creados"

✅ **¡Migraciones aplicadas!** Ahora el sistema puede guardar productos correctamente.

---

## Paso 2: Cargar Inventario Inicial (5 minutos)

### Opción A: Importación Masiva (Recomendado)

1. **Abrir el sistema**
   - Ve a la página de Productos
   - Haz clic en "Importar CSV"

2. **Seleccionar archivo**
   - Usa el archivo: `ejemplo_importacion_productos_completo.csv`
   - Este archivo contiene 15 productos de ejemplo con:
     - IMEI únicos
     - Colores variados
     - Precios realistas
     - Stock inicial configurado
     - Comisiones definidas

3. **Importar**
   - Haz clic en "Importar"
   - Espera a que termine el proceso
   - Verás un resumen de productos importados

✅ **¡15 productos cargados!** Ahora tienes inventario para trabajar.

### Opción B: Crear Productos Manualmente

Si prefieres crear productos uno por uno:

1. **Ir a Productos → Nuevo Producto**

2. **Llenar el formulario:**
   - **Tipo**: Equipo
   - **Marca**: Samsung
   - **Modelo**: Galaxy A54
   - **IMEI**: 351234567890123 (puedes escanear con pistola)
   - **Color**: Negro
   - **Categoría**: Smartphones
   - **Nombre**: Samsung Galaxy A54
   - **Descripción**: Smartphone 5G con cámara de 50MP
   - **Precio Lista**: 3499
   - **Precio Mínimo**: 3199
   - **Precio PayJoy**: 3699
   - **Costo**: 2800
   - **% Comisión**: 12
   - **Base Comisión**: Precio Lista
   - **Stock Actual**: 15
   - **Stock Mínimo**: 5

3. **Crear Producto**
   - Haz clic en "Crear Producto"
   - Verifica que se creó sin errores

4. **Repetir** para más productos

---

## Paso 3: Configurar Usuarios y Comisiones (3 minutos)

### Configurar Porcentajes de Comisión por Vendedor

1. **Ir a Usuarios**
   - En el menú lateral, haz clic en "Usuarios"

2. **Editar usuario**
   - Haz clic en el botón de editar del vendedor
   - Configura el **% de Comisión** (ejemplo: 10%)
   - Guarda los cambios

3. **Repetir** para cada vendedor

### Configurar Stock Mínimo por Producto

1. **Ir a Productos**
   - Busca un producto
   - Haz clic en editar

2. **Configurar stock mínimo**
   - **Stock Actual**: Cantidad disponible (ejemplo: 15)
   - **Stock Mínimo**: Umbral de alerta (ejemplo: 5)
   - Guarda los cambios

3. **Repetir** para productos críticos

✅ **¡Configuración completa!** El sistema ahora:
- Calcula comisiones automáticamente
- Genera alertas cuando el stock es bajo
- Registra movimientos de inventario

---

## Paso 4: Probar Funcionalidades (2 minutos)

### Crear una Venta de Prueba

1. **Ir a Ventas → Nueva Venta**

2. **Llenar datos:**
   - **Cliente**: Selecciona o crea uno
   - **Producto**: Busca por IMEI o nombre
   - **Cantidad**: 1
   - **Precio**: Se llena automáticamente
   - **Método de Pago**: Efectivo

3. **Crear Venta**
   - Haz clic en "Crear Venta"
   - El sistema automáticamente:
     - ✅ Reduce el stock del producto
     - ✅ Calcula y registra la comisión del vendedor
     - ✅ Registra el movimiento en el historial
     - ✅ Verifica si debe crear una alerta de stock bajo

### Verificar Comisiones

1. **Ir a Comisiones**
   - Verás la comisión generada por la venta
   - Filtrar por vendedor o período
   - Exportar a PDF o Excel si lo necesitas

### Verificar Alertas de Stock

1. **Ir a Alertas Stock**
   - Si el stock de algún producto bajó del mínimo, verás una alerta
   - Clasificadas por urgencia (Crítica, Urgente, Normal)
   - Puedes marcarlas como resueltas

### Ver Historial de Movimientos

1. **Ir a Historial IMEI**
   - Busca por IMEI del producto vendido
   - Verás el timeline completo:
     - Entrada inicial
     - Venta reciente
     - Fecha y usuario de cada movimiento

---

## 🎯 Funcionalidades Principales

### Dashboard de Inventario
- Resumen de alertas de stock
- Top 10 productos con mayor rotación
- Productos que requieren reabastecimiento urgente

### Reportes
- **Rotación de Inventario**: Productos más y menos vendidos
- **Alertas Frecuentes**: Productos con problemas recurrentes de stock
- **Proyección de Reabastecimiento**: Cuándo se agotarán los productos

### Exportación
- Comisiones a PDF y Excel
- Reportes con filtros aplicados
- Logo y branding M4 incluido

---

## 📋 Checklist de Configuración

Marca cada item cuando lo completes:

- [ ] Migraciones SQL aplicadas en Supabase
- [ ] Inventario inicial cargado (CSV o manual)
- [ ] Porcentajes de comisión configurados por vendedor
- [ ] Stock mínimo configurado en productos críticos
- [ ] Venta de prueba creada exitosamente
- [ ] Comisión verificada en módulo de Comisiones
- [ ] Alerta de stock verificada (si aplica)
- [ ] Historial de movimientos verificado

---

## ❓ Preguntas Frecuentes

### ¿Qué hago si veo el error "Could not find the 'cost' column"?
Significa que no aplicaste las migraciones SQL. Ve al Paso 1 de esta guía.

### ¿Puedo modificar los productos del CSV de ejemplo?
Sí, abre `ejemplo_importacion_productos_completo.csv` con Excel o Google Sheets y modifica lo que necesites. Respeta el formato de las columnas.

### ¿Cómo escaneo códigos de barras?
En el campo IMEI, simplemente escanea con la pistola. El código se ingresará automáticamente. También puedes escribirlo manualmente.

### ¿Las comisiones se calculan automáticamente?
Sí, al crear una venta, el sistema calcula la comisión basándose en:
1. Comisión del producto (si está configurada)
2. Comisión de la categoría (si está configurada)
3. Comisión del vendedor (por defecto)

### ¿Cuándo se generan las alertas de stock?
Automáticamente después de cada venta. Si el stock_actual es menor o igual al stock_minimo, se crea una alerta y se notifica al propietario.

### ¿Puedo deshacer una venta?
Actualmente no hay función de "deshacer", pero puedes crear una devolución que aumentará el stock nuevamente.

---

## 🔧 Solución de Problemas

### Error al importar CSV
- Verifica que el archivo tenga el formato correcto
- Asegúrate de que los IMEI sean únicos
- Revisa que los números no tengan caracteres especiales

### Comisiones no se calculan
- Verifica que el vendedor tenga configurado un % de comisión
- Asegúrate de que el producto tenga precio configurado
- Revisa que el campo "Base Comisión" esté seleccionado

### Alertas no se generan
- Verifica que el producto tenga configurado stock_minimo
- Asegúrate de que stock_actual sea menor o igual a stock_minimo
- Revisa en "Alertas Stock" si ya existe una alerta activa

---

## 📞 Soporte

Si necesitas ayuda adicional:

1. **Documentación completa**: `/docs/RESUMEN_COMPLETO_IMPLEMENTACIONES.md`
2. **Guía de migraciones**: `GUIA_RAPIDA_MIGRACIONES.md`
3. **Instrucciones detalladas**: `INSTRUCCIONES_MIGRACIONES.md`

---

## 🎉 ¡Listo para Producción!

Una vez completados todos los pasos, tu sistema M4 POS/ERP está listo para usar en producción.

**Características activas:**
- ✅ Gestión completa de inventario
- ✅ Cálculo automático de comisiones
- ✅ Alertas de stock bajo
- ✅ Historial de movimientos por IMEI
- ✅ Reportes de rotación y proyecciones
- ✅ Exportación a PDF y Excel
- ✅ Importación masiva desde CSV
- ✅ Actualización automática de stock en ventas/compras

---

**Tiempo total estimado**: 15 minutos
**Última actualización**: 2026-02-03
