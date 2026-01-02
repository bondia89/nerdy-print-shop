#!/bin/bash

# NerdyPrint Deployment Script
# Este script automatiza o deployment do site em produção

set -e

echo "🚀 Iniciando deployment do NerdyPrint..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretório do projeto
PROJECT_DIR="/home/ubuntu/nerdy-print-shop"
cd "$PROJECT_DIR"

echo -e "${YELLOW}📦 Etapa 1: Instalando dependências...${NC}"
pnpm install --frozen-lockfile

echo -e "${YELLOW}🔨 Etapa 2: Compilando projeto...${NC}"
pnpm build

echo -e "${YELLOW}🔒 Etapa 3: Configurando permissões...${NC}"
chmod +x dist/index.js

echo -e "${YELLOW}📋 Etapa 4: Configurando systemd...${NC}"
sudo cp nerdy-print-shop.service /etc/systemd/system/
sudo systemctl daemon-reload

echo -e "${YELLOW}🛑 Etapa 5: Parando serviço anterior (se existir)...${NC}"
sudo systemctl stop nerdy-print-shop || true

echo -e "${YELLOW}▶️  Etapa 6: Iniciando serviço...${NC}"
sudo systemctl start nerdy-print-shop

echo -e "${YELLOW}✅ Etapa 7: Habilitando auto-start...${NC}"
sudo systemctl enable nerdy-print-shop

echo -e "${YELLOW}📊 Etapa 8: Verificando status...${NC}"
sleep 2
sudo systemctl status nerdy-print-shop

echo ""
echo -e "${GREEN}✨ Deployment concluído com sucesso!${NC}"
echo ""
echo "📍 Informações úteis:"
echo "  - URL: http://localhost:3000"
echo "  - Logs: sudo journalctl -u nerdy-print-shop -f"
echo "  - Status: sudo systemctl status nerdy-print-shop"
echo "  - Restart: sudo systemctl restart nerdy-print-shop"
echo "  - Stop: sudo systemctl stop nerdy-print-shop"
echo ""
echo "🔧 Para configurar com Nginx:"
echo "  1. Copie nginx.conf para /etc/nginx/sites-available/"
echo "  2. Crie link simbólico em /etc/nginx/sites-enabled/"
echo "  3. Teste: sudo nginx -t"
echo "  4. Reinicie: sudo systemctl restart nginx"
