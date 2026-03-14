#!/bin/bash

# Script de Testing Pre-Deploy
# M4 POS/ERP System

echo "🚀 M4 POS/ERP - Testing Pre-Deploy"
echo "=================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar resultados
check_result() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
        return 0
    else
        echo -e "${RED}❌ $1${NC}"
        return 1
    fi
}

# 1. Verificar Node.js
echo "📦 Verificando Node.js..."
node --version > /dev/null 2>&1
check_result "Node.js instalado"

# 2. Verificar pnpm
echo "📦 Verificando pnpm..."
pnpm --version > /dev/null 2>&1
check_result "pnpm instalado"

# 3. Verificar variables de entorno
echo ""
echo "🔐 Verificando variables de entorno..."
if [ -z "$SUPABASE_URL" ]; then
    echo -e "${YELLOW}⚠️  SUPABASE_URL no está configurada${NC}"
    echo "   Configurar: export SUPABASE_URL='https://tskihgbxsxkwvfmoiffs.supabase.co'"
    HAS_ENV_ERROR=1
else
    echo -e "${GREEN}✅ SUPABASE_URL configurada${NC}"
fi

if [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo -e "${YELLOW}⚠️  SUPABASE_SERVICE_KEY no está configurada${NC}"
    echo "   Configurar: export SUPABASE_SERVICE_KEY='tu-service-key-aqui'"
    HAS_ENV_ERROR=1
else
    echo -e "${GREEN}✅ SUPABASE_SERVICE_KEY configurada${NC}"
fi

# 4. Instalar dependencias
echo ""
echo "📥 Instalando dependencias..."
pnpm install --silent
check_result "Dependencias instaladas"

# 5. Verificar TypeScript
echo ""
echo "🔍 Verificando TypeScript..."
pnpm check
check_result "TypeScript check OK"

# 6. Build del proyecto
echo ""
echo "🏗️  Building proyecto..."
pnpm build
check_result "Build completado"

# 7. Verificar conexión a Supabase
echo ""
echo "🗄️  Verificando conexión a Supabase..."
if [ -z "$HAS_ENV_ERROR" ]; then
    node verify-db.mjs
    check_result "Conexión a Supabase OK"
else
    echo -e "${YELLOW}⚠️  Saltando verificación de Supabase (faltan variables de entorno)${NC}"
fi

# Resumen final
echo ""
echo "=================================="
echo "📊 Resumen de Testing"
echo "=================================="

if [ -z "$HAS_ENV_ERROR" ]; then
    echo -e "${GREEN}✅ Sistema listo para deploy${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "1. git add ."
    echo "2. git commit -m 'Ready for Railway deploy'"
    echo "3. git push origin main"
    echo "4. Crear proyecto en Railway y conectar repo"
    echo ""
    exit 0
else
    echo -e "${YELLOW}⚠️  Configura las variables de entorno antes de deploy${NC}"
    echo ""
    echo "Variables requeridas:"
    echo "- SUPABASE_URL"
    echo "- SUPABASE_SERVICE_KEY"
    echo ""
    exit 1
fi
