deploy vercel

# 🖨️ NerdyPrint - Marketplace de Impressão 3D

Uma plataforma completa de e-commerce para venda de produtos de impressão 3D, com ferramentas avançadas de conversão de imagens para modelos 3D usando IA.

## ✨ Características Principais

### 🛍️ E-commerce Completo
- **Catálogo de Produtos**: Listagem com filtros, busca e categorias
- **Carrinho de Compras**: Adicionar/remover itens, atualizar quantidades
- **Checkout**: Integração com WhatsApp, sistema de cupons
- **Histórico de Pedidos**: Rastreamento e detalhes de compras

### 🤖 Ferramentas 3D Avançadas
- **QR Code 3D Generator**: Crie QR codes em formato 3D
- **Imagem para 3D**: Converta imagens em modelos 3D usando IA (Manus LLM API)
  - Análise automática de imagens
  - Sugestões de dimensões e estrutura
  - Recomendações de material e impressão

### ⭐ Recursos Sociais
- **Sistema de Avaliações**: Reviews com ratings e likes
- **Wishlist**: Lista de desejos persistente
- **Galeria de Produtos**: Múltiplas imagens por produto

### 💳 Pagamento e Cupons
- **Integração WhatsApp**: Checkout via WhatsApp
- **Sistema de Cupons**: Desconto com validação e limite de usos
- **Rastreamento**: Histórico completo de cupons utilizados

### 👨‍💼 Painel Administrativo
- **Gerenciamento de Produtos**: CRUD completo
- **Gerenciamento de Categorias**: Organização de produtos
- **Visualização de Pedidos**: Dashboard com estatísticas
- **Sistema de Permissões**: Controle granular de acesso
- **Gerenciamento de Cupons**: Criar e monitorar descontos

---

## 🚀 Quick Start

### Desenvolvimento

```bash
# Instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento
pnpm dev

# Abrir navegador
# http://localhost:3000
```

### Produção

```bash
# Compilar
pnpm build

# Iniciar
pnpm start

# Ou usar o script de deployment
./deploy.sh
```

---

## 📦 Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 19 + Vite + TypeScript + TailwindCSS |
| **Backend** | Express + tRPC + TypeScript |
| **Banco de Dados** | SQLite (dev) / MySQL (prod) |
| **Autenticação** | Manus OAuth |
| **IA/LLM** | Manus Forge API |
| **UI Components** | Radix UI |
| **Gerenciamento de Estado** | React Query + Zustand |

---

## 🗂️ Estrutura do Projeto

```
nerdy-print-shop/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── hooks/            # Custom hooks
│   │   ├── _core/            # Configurações
│   │   └── const.ts          # Constantes
│   └── public/               # Assets estáticos
├── server/                    # Backend Express
│   ├── _core/               # Configurações e utilitários
│   ├── routers.ts           # Rotas tRPC
│   ├── db.ts                # Funções de banco de dados
│   └── imageTo3d.ts         # API de conversão
├── drizzle/                  # ORM e migrations
├── shared/                   # Código compartilhado
├── dist/                     # Build de produção
├── Dockerfile               # Container Docker
├── docker-compose.yml       # Orquestração Docker
├── nginx.conf              # Configuração Nginx
└── deploy.sh               # Script de deployment
```

---

## 🔧 Configuração

### Variáveis de Ambiente

Criar arquivo `.env`:

```env
# Application
VITE_APP_ID=nerdy-print-shop
VITE_OAUTH_PORTAL_URL=https://oauth.manus.computer
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=file:./nerdy_print_shop.db

# Authentication
JWT_SECRET=seu-valor-seguro-aqui
OAUTH_SERVER_URL=https://oauth.manus.computer
OWNER_OPEN_ID=seu-email@exemplo.com

# Manus LLM API
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=sua-chave-api

# WhatsApp
WHATSAPP_PHONE_NUMBER=+55-seu-numero
```

---

## 📚 API Endpoints

### Produtos
- `GET /api/trpc/products.list` - Listar produtos
- `GET /api/trpc/products.getById` - Detalhes do produto
- `GET /api/trpc/products.getBySlug` - Produto por slug

### Carrinho
- `GET /api/trpc/cart.list` - Listar itens
- `POST /api/trpc/cart.add` - Adicionar item
- `POST /api/trpc/cart.remove` - Remover item
- `POST /api/trpc/cart.updateQuantity` - Atualizar quantidade

### Pedidos
- `GET /api/trpc/orders.list` - Listar pedidos
- `POST /api/trpc/orders.create` - Criar pedido
- `GET /api/trpc/orders.getById` - Detalhes do pedido

### Ferramentas 3D
- `POST /api/image-to-3d` - Converter imagem para 3D

### Avaliações
- `GET /api/trpc/reviews.list` - Listar avaliações
- `POST /api/trpc/reviews.create` - Criar avaliação
- `POST /api/trpc/reviews.toggleLike` - Like em avaliação

### Wishlist
- `GET /api/trpc/wishlist.list` - Listar desejos
- `POST /api/trpc/wishlist.add` - Adicionar item
- `POST /api/trpc/wishlist.remove` - Remover item

### Cupons
- `GET /api/trpc/coupons.list` - Listar cupons (admin)
- `POST /api/trpc/coupons.validate` - Validar cupom
- `POST /api/trpc/coupons.create` - Criar cupom (admin)

---

## 🔐 Autenticação

O projeto usa **Manus OAuth** para autenticação segura:

1. Usuário clica em "Login com Manus"
2. Redirecionado para `oauth.manus.computer`
3. Após autenticação, retorna com token JWT
4. Token armazenado em cookie seguro
5. Requisições incluem token automaticamente

---

## 🚀 Deployment

### Opção 1: Systemd (Recomendado)
```bash
./deploy.sh
```

### Opção 2: Docker
```bash
docker-compose up -d
```

### Opção 3: Manual
```bash
pnpm build
pnpm start
```

Veja `PRODUCTION_DEPLOYMENT.md` para instruções detalhadas.

---

## 📊 Banco de Dados

### Tabelas Principais
- **users**: Usuários da plataforma
- **products**: Catálogo de produtos
- **categories**: Categorias
- **cart_items**: Itens do carrinho
- **orders**: Pedidos
- **reviews**: Avaliações
- **wishlist_items**: Lista de desejos
- **coupons**: Cupons de desconto
- **admin_permissions**: Permissões de admins

---

## 🧪 Testes

```bash
# Executar testes
pnpm test

# Verificar tipos TypeScript
pnpm check

# Formatar código
pnpm format
```

---

## 📈 Performance

- ✅ Gzip compression habilitado
- ✅ Cache de assets estáticos
- ✅ Code splitting automático
- ✅ Lazy loading de componentes
- ✅ Otimização de imagens

---

## 🐛 Troubleshooting

### Erro: "OAuth connection failed"
- Verificar conectividade com `oauth.manus.computer`
- Verificar variável `OAUTH_SERVER_URL`

### Erro: "Database not available"
- Verificar `DATABASE_URL`
- Para SQLite: `file:./nerdy_print_shop.db`

### Erro: "API key not configured"
- Verificar `BUILT_IN_FORGE_API_KEY`
- Necessário para funcionalidade de Imagem para 3D

---

## 📝 Scripts Disponíveis

```bash
pnpm dev          # Desenvolvimento com hot reload
pnpm build        # Compilar para produção
pnpm start        # Iniciar servidor de produção
pnpm check        # Verificar tipos TypeScript
pnpm format       # Formatar código
pnpm test         # Executar testes
pnpm db:push      # Sincronizar banco de dados
```

---

## 📄 Licença

MIT

---

## 👥 Contribuições

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📞 Suporte

Para suporte, abra uma issue ou entre em contato através do painel de admin.

---

**Versão**: 1.0.0  
**Última atualização**: 2025-01-02  
**Status**: ✅ Pronto para Produção
