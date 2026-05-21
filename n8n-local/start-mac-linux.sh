#!/bin/bash
echo "========================================"
echo "  SafeGuard - Iniciando n8n local"
echo "========================================"
echo ""

echo "Node.js detectado: $(node -v)"
echo ""

if [ ! -d "node_modules" ]; then
  echo "Instalando n8n... (pode demorar uns minutos na primeira vez)"
  npm install || { echo "ERRO: Falha ao instalar. Use Node.js v20 ou v22 LTS."; exit 1; }
fi

echo ""
echo "========================================"
echo " Abrindo n8n em: http://localhost:5678"
echo " Para parar: Ctrl+C"
echo "========================================"
echo ""

npx n8n start
