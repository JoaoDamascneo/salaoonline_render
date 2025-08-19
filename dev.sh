#!/bin/bash

# Script para desenvolvimento com preview ao vivo
echo "🚀 Iniciando desenvolvimento com preview ao vivo..."

# Verificar se DATABASE_URL está configurada
if [ -z "$DATABASE_URL" ]; then
    echo "📝 Configurando DATABASE_URL..."
    export DATABASE_URL="postgresql://neondb_owner:npg_7WzVcIJfq6OP@ep-fragrant-king-a6na8g6b.us-west-2.aws.neon.tech/neondb?sslmode=require"
fi

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Verificar se a porta 5000 está livre
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Porta 5000 já está em uso. Parando processo..."
    pkill -f "tsx server/index.ts"
    sleep 2
fi

echo "🔧 Iniciando servidor de desenvolvimento..."
echo "🌐 URL: http://localhost:5000"
echo "📱 Preview ao vivo ativo!"
echo "💡 Modifique qualquer arquivo e veja as mudanças em tempo real"
echo "🛑 Pressione Ctrl+C para parar"
echo ""

# Iniciar servidor de desenvolvimento
NODE_ENV=development tsx server/index.ts
