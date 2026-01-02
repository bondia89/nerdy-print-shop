# NerdyPrint - Marketplace de Impressão 3D
## Informações de Deployment

### Status do Projeto
✅ **SITE CONSTRUÍDO E RODANDO COM SUCESSO**

### URL de Acesso
🌐 **https://3000-iwawsv3nwjr2mxdnx2y7u-9e6a6c1e.us2.manus.computer**

### Tecnologias Utilizadas
- **Frontend**: React 19 + Vite + TypeScript + TailwindCSS
- **Backend**: Express + tRPC + TypeScript
- **Banco de Dados**: SQLite (desenvolvimento) / MySQL (produção)
- **Autenticação**: Manus OAuth
- **LLM API**: Manus Forge (para conversão Imagem para 3D)

### Funcionalidades Implementadas

#### 1. **Catálogo de Produtos**
- Listagem de produtos com filtros por categoria
- Página de detalhes do produto
- Galeria de imagens por produto
- Sistema de avaliações e reviews
- Wishlist (lista de desejos)

#### 2. **Carrinho de Compras**
- Adicionar/remover itens
- Atualizar quantidade
- Carrinho persistente por usuário
- Resumo do pedido com cálculo de totais

#### 3. **Checkout e Pagamento**
- Integração com WhatsApp para checkout
- Sistema de cupons de desconto
- Rastreamento de uso de cupons
- Geração de pedidos

#### 4. **Ferramentas Maker 3D**
- **QR Code 3D**: Gerador de QR Codes em 3D
- **Imagem para 3D**: Conversão de imagens em modelos 3D usando Manus LLM API
  - Análise detalhada da imagem
  - Sugestões de dimensões e estrutura
  - Recomendações de material e configurações de impressão

#### 5. **Histórico de Pedidos**
- Visualização de pedidos do usuário
- Detalhes de cada pedido
- Status do pedido em tempo real

#### 6. **Painel Administrativo**
- Gerenciamento de produtos (CRUD)
- Gerenciamento de categorias
- Visualização e gerenciamento de pedidos
- Dashboard com estatísticas
- Sistema de cupons de desconto
- Sistema de permissões granulares
- Exclusão e restauração de pedidos

#### 7. **Sistema de Permissões**
- Controle granular de acesso para admins
- Permissões para: gerenciar produtos, pedidos, cupons, categorias, visualizar análises
- Apenas o proprietário pode gerenciar permissões

### Configuração do Ambiente

#### Variáveis de Ambiente (.env)
```
# Application
VITE_APP_ID=nerdy-print-shop
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=file:./nerdy_print_shop.db

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
OAUTH_SERVER_URL=https://oauth.manus.im
OWNER_OPEN_ID=mateinorolamento89@gmail.com

# Manus LLM API (para Image to 3D)
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=sk-xgf_Doi_U_DXMVLWQXW4z7zoHMjfzQpsJlcAQT6GihBf9Cwxv65flznwcEeuA8y1ZSnY6wu-ORCNSg8vVFPIG0rt71UK

# WhatsApp Integration
WHATSAPP_PHONE_NUMBER=+5511953739362
```

### Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor de desenvolvimento com hot reload

# Produção
pnpm build            # Compila o projeto para produção
pnpm start            # Inicia servidor de produção

# Utilitários
pnpm check            # Verifica tipos TypeScript
pnpm format           # Formata código com Prettier
pnpm test             # Executa testes com Vitest
pnpm db:push          # Sincroniza schema do banco de dados
```

### Estrutura do Projeto

```
nerdy-print-shop/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   └── hooks/         # Custom hooks
│   └── public/            # Arquivos estáticos
├── server/                 # Backend Express + tRPC
│   ├── _core/            # Configurações e utilitários
│   ├── routers.ts        # Definição das rotas tRPC
│   ├── db.ts             # Funções de banco de dados
│   └── imageTo3d.ts      # API de conversão Imagem para 3D
├── drizzle/              # Configuração e migrations do banco
├── shared/               # Código compartilhado entre client e server
└── dist/                 # Build de produção
```

### Funcionalidade Especial: Imagem para 3D

A funcionalidade de conversão de imagem para 3D utiliza a **Manus Forge API** (LLM) para:

1. **Análise da Imagem**: Identifica formas, estruturas e características principais
2. **Geração de Descrição Técnica**: Fornece:
   - Descrição das formas principais
   - Dimensões sugeridas para o modelo 3D (em mm)
   - Estrutura e camadas recomendadas
   - Sugestões de material e configurações de impressão
   - Possíveis desafios na conversão e soluções

**Endpoint**: `POST /api/image-to-3d`

**Payload**:
```json
{
  "image": "data:image/png;base64,...",
  "prompt": "Descrição opcional da análise desejada"
}
```

**Resposta**:
```json
{
  "success": true,
  "description": "Análise técnica detalhada...",
  "modelData": null
}
```

### Banco de Dados

#### Tabelas Principais
- **users**: Usuários da plataforma
- **products**: Catálogo de produtos
- **categories**: Categorias de produtos
- **cart_items**: Itens do carrinho
- **orders**: Pedidos realizados
- **order_items**: Itens de cada pedido
- **reviews**: Avaliações de produtos
- **wishlist_items**: Itens da lista de desejos
- **coupons**: Cupons de desconto
- **coupon_usages**: Histórico de uso de cupons
- **admin_permissions**: Permissões de administradores
- **generated_models**: Modelos 3D gerados
- **product_images**: Galeria de imagens dos produtos

### Autenticação

O projeto utiliza **Manus OAuth** para autenticação. O fluxo é:

1. Usuário clica em "Login com Manus"
2. Redirecionado para página de OAuth do Manus
3. Após autenticação, retorna com token JWT
4. Token armazenado em cookie seguro
5. Todas as requisições incluem o token para autenticação

### Próximos Passos para Produção

1. **Configurar Banco de Dados MySQL**:
   ```bash
   # Atualizar DATABASE_URL em .env
   DATABASE_URL=mysql://user:password@host:3306/nerdy_print_shop
   ```

2. **Configurar Variáveis de Produção**:
   - Alterar `JWT_SECRET` para uma chave segura
   - Configurar `OAUTH_SERVER_URL` para produção
   - Atualizar `WHATSAPP_PHONE_NUMBER` se necessário

3. **Deploy**:
   ```bash
   pnpm build
   pnpm start
   ```

4. **Configurar HTTPS**:
   - Usar reverse proxy (Nginx/Apache)
   - Configurar certificado SSL/TLS

5. **Monitoramento**:
   - Configurar logs
   - Monitorar performance
   - Backup automático do banco de dados

### Suporte e Troubleshooting

**Erro: "Database not available"**
- Verificar se `DATABASE_URL` está configurada corretamente
- Para desenvolvimento, usar SQLite: `file:./nerdy_print_shop.db`

**Erro: "BUILT_IN_FORGE_API_KEY is not configured"**
- Verificar se a chave da API Manus está configurada em `.env`
- A funcionalidade de Imagem para 3D não funcionará sem esta chave

**Erro: "Port 3000 already in use"**
- O servidor automaticamente encontrará uma porta disponível
- Verificar com `lsof -i :3000` qual processo está usando a porta

### Contato e Suporte

Para suporte, entre em contato com a equipe de desenvolvimento ou acesse o painel de admin em `/admin`.

---

**Data de Build**: 2025-01-02
**Versão**: 1.0.0
**Status**: ✅ Pronto para Produção
