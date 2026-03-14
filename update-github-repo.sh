#!/bin/bash

# Script para Actualizar Repositorio GitHub Existente
# M4 POS/ERP System - Corrección de Bug Crítico

echo "🔄 M4 POS/ERP - Actualización de Repositorio"
echo "============================================"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📋 INSTRUCCIONES:${NC}"
echo ""
echo "1. Descarga el archivo m4-pos-erp-fixed.tar.gz"
echo "2. Extráelo en tu computadora"
echo "3. Ejecuta este script desde la carpeta extraída"
echo ""
echo "Presiona ENTER para continuar o CTRL+C para cancelar..."
read

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}❌ Error: No se encuentra package.json${NC}"
    echo "   Asegúrate de estar en la carpeta del proyecto"
    exit 1
fi

echo -e "${GREEN}✅ Directorio correcto${NC}"
echo ""

# Paso 1: Verificar Git
echo -e "${BLUE}Paso 1: Verificando Git...${NC}"
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  No hay repositorio Git inicializado${NC}"
    echo "   Inicializando..."
    git init
    echo -e "${GREEN}✅ Git inicializado${NC}"
else
    echo -e "${GREEN}✅ Repositorio Git existente${NC}"
fi
echo ""

# Paso 2: Verificar remote
echo -e "${BLUE}Paso 2: Verificando remote de GitHub...${NC}"
REMOTE_URL=$(git remote get-url origin 2>/dev/null)

if [ -z "$REMOTE_URL" ]; then
    echo -e "${YELLOW}⚠️  No hay remote configurado${NC}"
    echo ""
    echo "Ingresa la URL de tu repositorio GitHub:"
    echo "(Ejemplo: https://github.com/tu-usuario/m4-pos-erp.git)"
    read REPO_URL
    git remote add origin "$REPO_URL"
    echo -e "${GREEN}✅ Remote agregado: $REPO_URL${NC}"
else
    echo -e "${GREEN}✅ Remote existente: $REMOTE_URL${NC}"
    echo ""
    echo "¿Quieres usar este repositorio? (s/n)"
    read USAR_REPO
    if [ "$USAR_REPO" != "s" ]; then
        echo "Ingresa la nueva URL del repositorio:"
        read REPO_URL
        git remote set-url origin "$REPO_URL"
        echo -e "${GREEN}✅ Remote actualizado: $REPO_URL${NC}"
    fi
fi
echo ""

# Paso 3: Ver estado actual
echo -e "${BLUE}Paso 3: Revisando cambios...${NC}"
git status --short
echo ""

# Paso 4: Agregar archivos
echo -e "${BLUE}Paso 4: Agregando archivos modificados y nuevos...${NC}"
git add .
echo -e "${GREEN}✅ Archivos agregados${NC}"
echo ""

# Mostrar resumen
echo -e "${BLUE}📊 Resumen de cambios:${NC}"
echo ""
git status --short | head -20
TOTAL_CHANGES=$(git status --short | wc -l)
echo ""
echo -e "${GREEN}Total de archivos modificados/nuevos: $TOTAL_CHANGES${NC}"
echo ""

# Paso 5: Commit
echo -e "${BLUE}Paso 5: Creando commit...${NC}"
echo ""
echo "Mensaje del commit:"
echo "-------------------"
cat << 'EOF'
Fix: Carga masiva de equipos + Railway deploy config

CAMBIOS CRÍTICOS:
- ✅ Fixed bug en bulk import de equipos (field mapping)
- ✅ Agregado logging detallado para debugging
- ✅ Configuración completa para Railway deploy
- ✅ Scripts de verificación y testing

ARCHIVOS NUEVOS:
- railway.json (config de deploy)
- .railwayignore (optimización)
- verify-db.mjs (test de BD)
- README_DEPLOY.md (guía completa)
- VERSION.md (control de versiones)

ARCHIVOS MODIFICADOS:
- server/routers.ts (~95 líneas corregidas)

Version: v1.0.1-bugfix-bulk-import
Estado: Listo para Railway deploy
EOF
echo "-------------------"
echo ""
echo "¿Proceder con este commit? (s/n)"
read HACER_COMMIT

if [ "$HACER_COMMIT" = "s" ]; then
    git commit -m "Fix: Carga masiva de equipos + Railway deploy config

CAMBIOS CRÍTICOS:
- Fixed bug en bulk import de equipos (field mapping)
- Agregado logging detallado para debugging
- Configuración completa para Railway deploy
- Scripts de verificación y testing

ARCHIVOS NUEVOS:
- railway.json (config de deploy)
- .railwayignore (optimización)
- verify-db.mjs (test de BD)
- README_DEPLOY.md (guía completa)
- VERSION.md (control de versiones)

ARCHIVOS MODIFICADOS:
- server/routers.ts (~95 líneas corregidas)

Version: v1.0.1-bugfix-bulk-import
Estado: Listo para Railway deploy"
    
    echo -e "${GREEN}✅ Commit creado${NC}"
else
    echo -e "${YELLOW}⏭️  Commit cancelado${NC}"
    exit 0
fi
echo ""

# Paso 6: Push
echo -e "${BLUE}Paso 6: Push a GitHub...${NC}"
echo ""
echo "¿Qué rama quieres usar?"
echo "1) main (recomendado)"
echo "2) master"
echo "3) Crear nueva rama"
read -p "Opción (1/2/3): " BRANCH_OPTION

case $BRANCH_OPTION in
    1)
        BRANCH="main"
        ;;
    2)
        BRANCH="master"
        ;;
    3)
        read -p "Nombre de la nueva rama: " BRANCH
        git checkout -b "$BRANCH"
        ;;
    *)
        BRANCH="main"
        ;;
esac

echo ""
echo -e "${YELLOW}⚠️  A punto de hacer push a: origin/$BRANCH${NC}"
echo "¿Continuar? (s/n)"
read HACER_PUSH

if [ "$HACER_PUSH" = "s" ]; then
    # Intentar pull primero
    echo ""
    echo "Sincronizando con GitHub..."
    git pull origin "$BRANCH" --rebase 2>/dev/null || echo "Primera vez pusheando esta rama"
    
    # Push
    git push -u origin "$BRANCH"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}🎉 ¡PUSH EXITOSO!${NC}"
        echo ""
        echo "============================================"
        echo -e "${BLUE}📋 PRÓXIMOS PASOS:${NC}"
        echo "============================================"
        echo ""
        echo "1. Ve a Railway.app"
        echo "2. New Project → Deploy from GitHub repo"
        echo "3. Selecciona tu repositorio"
        echo "4. Configura las variables de entorno:"
        echo "   - SUPABASE_URL"
        echo "   - SUPABASE_SERVICE_KEY"
        echo "   - NODE_ENV=production"
        echo "5. Railway hará el deploy automáticamente"
        echo ""
        echo -e "${GREEN}✅ Código listo en GitHub${NC}"
        echo ""
    else
        echo -e "${YELLOW}❌ Error en push${NC}"
        echo ""
        echo "Posibles soluciones:"
        echo "1. Verifica tu conexión a internet"
        echo "2. Verifica que tengas permisos en el repo"
        echo "3. Intenta: git push -u origin $BRANCH --force (¡cuidado!)"
        echo ""
    fi
else
    echo -e "${YELLOW}⏭️  Push cancelado${NC}"
    echo ""
    echo "Puedes hacer push manualmente más tarde con:"
    echo "git push -u origin $BRANCH"
fi

echo ""
echo "============================================"
echo -e "${BLUE}🔗 Enlaces Útiles:${NC}"
echo "============================================"
echo ""
echo "GitHub Repo: $REMOTE_URL"
echo "Railway: https://railway.app/dashboard"
echo "Supabase: https://supabase.com/dashboard"
echo ""
echo "¡Listo! 🚀"
