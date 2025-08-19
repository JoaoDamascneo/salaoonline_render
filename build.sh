#!/bin/bash

# Script de build para produção no Render
echo "🚀 Iniciando build para produção..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci --only=production

# Build do frontend
echo "🔨 Buildando frontend..."
npm run build

# Build do backend
echo "🔨 Buildando backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "✅ Build concluído com sucesso!"
