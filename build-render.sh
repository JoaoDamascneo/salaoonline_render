#!/bin/bash

# Script de build para Render
echo "🚀 Iniciando build para Render..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Build do frontend com Vite
echo "🔨 Buildando frontend..."
npx vite build

# Build do backend com esbuild
echo "🔨 Buildando backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "✅ Build concluído com sucesso!"
