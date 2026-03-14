#!/bin/bash
# Script para subir M4 POS Clean a GitHub
# Ejecutar desde la carpeta m4-pos-clean

echo "📦 Subiendo código limpio a GitHub..."
echo ""
echo "Repositorio: https://github.com/Kratoslar69/m4-pos-erp-clean"
echo ""

# Verificar que estamos en la carpeta correcta
if [ ! -f "package.json" ]; then
    echo "❌ Error: Este script debe ejecutarse desde la carpeta m4-pos-clean"
    exit 1
fi

# Configurar remote
git remote remove origin 2>/dev/null
git remote add origin https://github.com/Kratoslar69/m4-pos-erp-clean.git

# Subir código
echo "🚀 Haciendo push..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ¡Código subido exitosamente!"
    echo ""
    echo "📋 Siguiente paso:"
    echo "   1. Ve a https://railway.app"
    echo "   2. New Project → Deploy from GitHub"
    echo "   3. Selecciona 'Kratoslar69/m4-pos-erp-clean'"
    echo "   4. Agrega las 4 variables de entorno"
    echo ""
else
    echo ""
    echo "❌ Error al subir código"
    echo "   Necesitarás autenticarte con GitHub"
fi
