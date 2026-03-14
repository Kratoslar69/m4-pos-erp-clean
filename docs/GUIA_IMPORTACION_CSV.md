# Guía de Importación Masiva de Productos desde CSV

## Descripción General

El sistema M4 POS/ERP permite importar múltiples productos simultáneamente mediante archivos CSV. Esta funcionalidad incluye validaciones anti-fallos para garantizar la integridad de los datos.

## Formato del Archivo CSV

### Columnas Requeridas

El archivo CSV debe contener las siguientes columnas en el orden especificado:

| Columna | Tipo | Requerido | Descripción | Ejemplo |
|---------|------|-----------|-------------|---------|
| `tipo` | Texto | ✅ Sí | Tipo de producto | `equipo`, `sim`, `accesorio` |
| `marca` | Texto | ❌ No | Marca del producto | `Apple`, `Samsung` |
| `modelo` | Texto | ❌ No | Modelo del producto | `iPhone 15 Pro` |
| `imei` | Texto | ❌ No | IMEI del equipo (solo para tipo "equipo") | `123456789012345` |
| `sku` | Texto | ❌ No | Código SKU (para SIM y accesorios) | `SKU-12345` |
| `color` | Texto | ❌ No | Color del equipo | `Titanio Natural` |
| `categoria` | Texto | ❌ No | Categoría del producto | `Smartphones` |
| `nombre` | Texto | ✅ Sí | Nombre del producto | `iPhone 15 Pro 256GB` |
| `descripcion` | Texto | ❌ No | Descripción detallada | `Smartphone Apple...` |
| `precio_lista` | Número | ❌ No | Precio de lista | `25999` |
| `precio_minimo` | Número | ❌ No | Precio mínimo de venta | `23999` |
| `precio_payjoy` | Número | ❌ No | Precio para plan PayJoy | `27999` |
| `costo` | Número | ❌ No | Costo del producto | `20000` |
| `comision` | Número | ❌ No | Porcentaje de comisión (0-100) | `8.5` |

### Valores Válidos para "tipo"

El sistema acepta los siguientes valores (no distingue mayúsculas/minúsculas):

- **Equipos**: `equipo`, `handset`
- **SIM**: `sim`
- **Accesorios**: `accesorio`, `accessory`

## Validaciones Anti-Fallos

### 1. Validación de Campos Requeridos

- ✅ **nombre**: Debe estar presente y no vacío
- ✅ **tipo**: Debe ser uno de los valores válidos

### 2. Validación de IMEI Único

- ✅ No puede haber IMEIs duplicados dentro del mismo archivo
- ✅ Los IMEIs no deben existir previamente en la base de datos
- ⚠️ Si se detectan IMEIs duplicados, la importación se detiene y muestra un error detallado

### 3. Validación de Formatos Numéricos

- ✅ Los campos de precio y costo deben ser números válidos
- ✅ El porcentaje de comisión debe estar entre 0 y 100
- ⚠️ Si un valor no es numérico, se ignora (queda como `undefined`)

### 4. Procesamiento por Lotes

- ✅ Los productos se procesan en lotes de 100 para optimizar rendimiento
- ✅ El límite de Supabase (1000 registros por consulta) se respeta automáticamente
- ✅ Si un lote falla, se registra el error pero continúa con los siguientes

## Ejemplo de Archivo CSV

Se incluye un archivo de ejemplo en: `ejemplo_importacion_productos.csv`

```csv
tipo,marca,modelo,imei,sku,color,categoria,nombre,descripcion,precio_lista,precio_minimo,precio_payjoy,costo,comision
equipo,Apple,iPhone 15 Pro,123456789012345,,Titanio Natural,Smartphones,iPhone 15 Pro 256GB,Smartphone Apple iPhone 15 Pro con 256GB de almacenamiento,25999,23999,27999,20000,8.5
sim,,,,,,,SIM Card Prepago,Tarjeta SIM prepago con $100 de saldo incluido,100,80,,50,3
accesorio,Anker,PowerCore 20000,,,Negro,Accesorios,Batería Externa Anker 20000mAh,Batería portátil Anker PowerCore de 20000mAh,899,799,,600,5
```

## Proceso de Importación

### Paso 1: Preparar el Archivo

1. Crear archivo CSV con las columnas especificadas
2. Asegurarse de que la primera fila contenga los nombres de las columnas
3. Completar los datos de los productos
4. Guardar el archivo con codificación UTF-8

### Paso 2: Importar en el Sistema

1. Navegar a **Productos** en el menú principal
2. Hacer clic en **Importar CSV**
3. Seleccionar el archivo CSV preparado
4. Revisar la vista previa (primeros 10 productos)
5. Hacer clic en **Importar X Productos**

### Paso 3: Monitorear el Progreso

- El sistema muestra un contador de progreso: `Importando... X/Y`
- El proceso puede tardar varios segundos dependiendo del número de productos
- No cerrar la ventana hasta que se complete la importación

### Paso 4: Verificar Resultados

Al finalizar, el sistema mostrará:

- ✅ **Éxito total**: "X productos importados exitosamente"
- ⚠️ **Éxito parcial**: "Importación completada: X exitosos, Y fallidos"
- ❌ **Error crítico**: Mensaje de error detallado

## Manejo de Errores

### Errores Críticos (Detienen la Importación)

1. **IMEIs duplicados en el archivo**
   ```
   Error: IMEIs duplicados en el archivo: 123456789012345, 123456789012346
   ```
   **Solución**: Revisar el archivo y eliminar duplicados

2. **IMEIs existentes en la base de datos**
   ```
   Error: Los siguientes IMEIs ya existen en la base de datos: 123456789012345
   ```
   **Solución**: Remover productos con IMEIs existentes o actualizar manualmente

### Errores No Críticos (Continúa la Importación)

1. **Fallo en un lote específico**
   - El sistema registra el error en la consola del navegador
   - Los productos del lote fallido no se importan
   - Los demás lotes se procesan normalmente

2. **Valores numéricos inválidos**
   - El campo se guarda como `undefined`
   - El producto se importa sin ese valor
   - No se muestra error explícito

## Recomendaciones

### Para Importaciones Grandes (>500 productos)

1. ✅ Dividir en archivos más pequeños (200-300 productos)
2. ✅ Importar en horarios de baja actividad
3. ✅ Verificar la importación de cada archivo antes de continuar
4. ✅ Mantener respaldos del archivo original

### Para Equipos con IMEI

1. ✅ Verificar que los IMEIs sean únicos y válidos
2. ✅ Usar un formato consistente (15 dígitos)
3. ✅ No incluir guiones ni espacios en el IMEI
4. ✅ Validar IMEIs con el proveedor antes de importar

### Para Productos con Comisión

1. ✅ Definir porcentajes de comisión específicos por producto
2. ✅ Usar decimales para precisión (ej: 8.5 en lugar de 8)
3. ✅ Verificar que los porcentajes estén entre 0 y 100
4. ✅ Dejar vacío si se usa comisión por categoría o vendedor

## Casos de Uso Comunes

### Caso 1: Carga Inicial de Inventario

**Escenario**: Nueva tienda con 500 productos del proveedor

**Proceso**:
1. Obtener lista de productos del proveedor
2. Convertir a formato CSV del sistema
3. Dividir en 3 archivos de ~170 productos
4. Importar uno por uno verificando resultados
5. Revisar productos importados en el sistema

### Caso 2: Actualización Mensual de Catálogo

**Escenario**: Nuevos modelos y accesorios cada mes

**Proceso**:
1. Crear CSV solo con productos nuevos
2. Verificar que no haya IMEIs duplicados
3. Importar archivo de productos nuevos
4. Actualizar precios de productos existentes manualmente

### Caso 3: Migración desde Otro Sistema

**Escenario**: Migrar 2000 productos de sistema anterior

**Proceso**:
1. Exportar datos del sistema anterior
2. Mapear columnas al formato M4 POS/ERP
3. Limpiar datos (IMEIs, precios, etc.)
4. Dividir en archivos de 200 productos
5. Importar secuencialmente con validación

## Solución de Problemas

### Problema: "Error al leer el archivo CSV"

**Causas posibles**:
- Archivo no es CSV válido
- Codificación incorrecta
- Archivo corrupto

**Solución**:
1. Abrir el archivo en Excel o Google Sheets
2. Guardar como CSV UTF-8
3. Intentar importar nuevamente

### Problema: "No hay productos válidos encontrados"

**Causas posibles**:
- Columna "nombre" vacía en todos los registros
- Formato de columnas incorrecto
- Archivo vacío

**Solución**:
1. Verificar que la primera fila contenga los nombres de columnas
2. Asegurarse de que al menos un producto tenga nombre
3. Revisar el formato del ejemplo

### Problema: Importación muy lenta

**Causas posibles**:
- Archivo muy grande (>1000 productos)
- Conexión lenta a internet
- Servidor con alta carga

**Solución**:
1. Dividir el archivo en partes más pequeñas
2. Importar en horarios de menor tráfico
3. Verificar conexión a internet

## Limitaciones Técnicas

- **Tamaño máximo recomendado**: 1000 productos por archivo
- **Tamaño de lote**: 100 productos procesados simultáneamente
- **Tiempo estimado**: ~1-2 segundos por cada 100 productos
- **Formato de archivo**: Solo CSV (no Excel .xlsx)
- **Codificación**: UTF-8 (para caracteres especiales)

## Soporte

Para problemas con la importación masiva:
1. Revisar la consola del navegador (F12) para errores detallados
2. Verificar el formato del archivo contra el ejemplo
3. Probar con un archivo pequeño (5-10 productos) primero
4. Contactar soporte técnico con el archivo y mensaje de error

## Archivo de Ejemplo

El archivo `ejemplo_importacion_productos.csv` incluye:
- 10 equipos con IMEI único
- 2 tarjetas SIM
- 8 accesorios variados
- Todos los campos completados correctamente
- Formato listo para importar

**Ubicación**: `/ejemplo_importacion_productos.csv` en la raíz del proyecto
