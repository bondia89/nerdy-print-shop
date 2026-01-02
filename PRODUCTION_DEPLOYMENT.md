# 🚀 Guia de Deployment em Produção - NerdyPrint

## Visão Geral

Este guia descreve como fazer o deployment permanente do NerdyPrint em um servidor de produção.

---

## 📋 Pré-requisitos

- Node.js 22+ instalado
- pnpm 10.4.1+ instalado
- Acesso root/sudo no servidor
- Domínio próprio (opcional, mas recomendado)
- Certificado SSL/TLS (para HTTPS)

---

## 🔧 Opção 1: Deployment com Systemd (Recomendado)

### Passo 1: Preparar o Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js (se não estiver instalado)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar pnpm
npm install -g pnpm@10.4.1

# Criar usuário para a aplicação (opcional)
sudo useradd -m -s /bin/bash nerdy-print-shop || true
```

### Passo 2: Clonar/Copiar Projeto

```bash
# Copiar projeto para /opt ou /home
sudo mkdir -p /opt/nerdy-print-shop
sudo cp -r . /opt/nerdy-print-shop
sudo chown -R nerdy-print-shop:nerdy-print-shop /opt/nerdy-print-shop
```

### Passo 3: Configurar Variáveis de Ambiente

```bash
# Editar arquivo .env.production
sudo nano /opt/nerdy-print-shop/.env.production

# Atualizar valores críticos:
JWT_SECRET=seu-valor-seguro-aqui
BUILT_IN_FORGE_API_KEY=sua-chave-api-manus
WHATSAPP_PHONE_NUMBER=seu-numero-whatsapp
```

### Passo 4: Instalar Dependências e Compilar

```bash
cd /opt/nerdy-print-shop
pnpm install --frozen-lockfile
pnpm build
```

### Passo 5: Configurar Systemd

```bash
# Copiar arquivo de serviço
sudo cp nerdy-print-shop.service /etc/systemd/system/

# Recarregar configuração do systemd
sudo systemctl daemon-reload

# Iniciar serviço
sudo systemctl start nerdy-print-shop

# Habilitar auto-start
sudo systemctl enable nerdy-print-shop

# Verificar status
sudo systemctl status nerdy-print-shop
```

### Passo 6: Visualizar Logs

```bash
# Ver logs em tempo real
sudo journalctl -u nerdy-print-shop -f

# Ver últimas 100 linhas
sudo journalctl -u nerdy-print-shop -n 100
```

---

## 🐳 Opção 2: Deployment com Docker

### Passo 1: Instalar Docker

```bash
sudo apt update
sudo apt install -y docker.io docker-compose

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

### Passo 2: Preparar Docker Compose

```bash
# Criar arquivo .env para Docker
cat > .env.docker << EOF
VITE_APP_ID=nerdy-print-shop
VITE_OAUTH_PORTAL_URL=https://oauth.manus.computer
NODE_ENV=production
PORT=3000
DATABASE_URL=file:/app/data/nerdy_print_shop.db
JWT_SECRET=seu-valor-seguro-aqui
OAUTH_SERVER_URL=https://oauth.manus.computer
OWNER_OPEN_ID=mateinorolamento89@gmail.com
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=sua-chave-api-manus
WHATSAPP_PHONE_NUMBER=seu-numero-whatsapp
EOF
```

### Passo 3: Iniciar com Docker Compose

```bash
# Compilar imagem
docker-compose build

# Iniciar serviço
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviço
docker-compose down
```

---

## 🌐 Opção 3: Deployment com Nginx Reverse Proxy

### Passo 1: Instalar Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Passo 2: Configurar Nginx

```bash
# Copiar configuração
sudo cp nginx.conf /etc/nginx/sites-available/nerdy-print-shop

# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/nerdy-print-shop /etc/nginx/sites-enabled/

# Remover configuração padrão (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Passo 3: Configurar SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com

# Auto-renovação (já configurada automaticamente)
sudo systemctl enable certbot.timer
```

---

## 📊 Monitoramento e Manutenção

### Verificar Status

```bash
# Systemd
sudo systemctl status nerdy-print-shop

# Docker
docker-compose ps

# Verificar porta
sudo lsof -i :3000
```

### Reiniciar Serviço

```bash
# Systemd
sudo systemctl restart nerdy-print-shop

# Docker
docker-compose restart
```

### Atualizar Aplicação

```bash
# Parar serviço
sudo systemctl stop nerdy-print-shop

# Atualizar código
git pull origin main  # ou copiar novos arquivos

# Compilar
pnpm build

# Iniciar
sudo systemctl start nerdy-print-shop
```

### Backup do Banco de Dados

```bash
# Backup SQLite
cp /opt/nerdy-print-shop/nerdy_print_shop.db /backup/nerdy_print_shop.db.$(date +%Y%m%d)

# Backup MySQL (se usar)
mysqldump -u user -p nerdy_print_shop > /backup/nerdy_print_shop.sql.$(date +%Y%m%d)
```

---

## 🔐 Segurança

### Recomendações Importantes

1. **Alterar JWT_SECRET**
   ```bash
   # Gerar valor seguro
   openssl rand -base64 32
   ```

2. **Usar HTTPS**
   - Configurar SSL com Let's Encrypt
   - Redirecionar HTTP para HTTPS

3. **Firewall**
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

4. **Monitorar Logs**
   ```bash
   sudo journalctl -u nerdy-print-shop -f
   ```

5. **Backup Regular**
   - Fazer backup do banco de dados diariamente
   - Armazenar em local seguro

---

## 🐛 Troubleshooting

### Erro: "Port already in use"

```bash
# Encontrar processo usando porta
sudo lsof -i :3000

# Matar processo
sudo kill -9 <PID>
```

### Erro: "Database connection failed"

```bash
# Verificar arquivo de banco de dados
ls -la /opt/nerdy-print-shop/nerdy_print_shop.db

# Verificar permissões
sudo chown nerdy-print-shop:nerdy-print-shop /opt/nerdy-print-shop/nerdy_print_shop.db
```

### Erro: "OAuth connection failed"

```bash
# Verificar conectividade
curl -I https://oauth.manus.computer

# Verificar variáveis de ambiente
sudo systemctl cat nerdy-print-shop | grep OAUTH
```

### Erro: "API key not configured"

```bash
# Verificar chave Manus
sudo systemctl cat nerdy-print-shop | grep BUILT_IN_FORGE_API_KEY

# Atualizar se necessário
sudo systemctl edit nerdy-print-shop
# Adicionar/atualizar: Environment="BUILT_IN_FORGE_API_KEY=sua-chave"
sudo systemctl daemon-reload
sudo systemctl restart nerdy-print-shop
```

---

## 📈 Performance

### Otimizações Recomendadas

1. **Habilitar Gzip no Nginx**
   - Já configurado em nginx.conf

2. **Cache de Assets**
   - Já configurado em nginx.conf

3. **Aumentar Limites do Node.js**
   ```bash
   # Adicionar ao serviço systemd
   Environment="NODE_OPTIONS=--max-old-space-size=2048"
   ```

4. **Usar PM2 para Gerenciamento**
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name nerdy-print-shop
   pm2 save
   pm2 startup
   ```

---

## 📞 Suporte

Para problemas ou dúvidas:
- Verificar logs: `sudo journalctl -u nerdy-print-shop -f`
- Consultar documentação: `DEPLOYMENT_INFO.md`
- Verificar status da API Manus: https://status.manus.im

---

## ✅ Checklist de Deployment

- [ ] Node.js 22+ instalado
- [ ] pnpm instalado
- [ ] Dependências instaladas (`pnpm install`)
- [ ] Projeto compilado (`pnpm build`)
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados inicializado
- [ ] Serviço systemd configurado
- [ ] Nginx configurado (opcional)
- [ ] SSL/TLS configurado (recomendado)
- [ ] Firewall configurado
- [ ] Backup do banco de dados
- [ ] Logs sendo monitorados
- [ ] Testes de funcionalidade realizados

---

**Última atualização**: 2025-01-02
**Versão**: 1.0.0
