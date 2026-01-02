# 🚀 Deployment no Vercel - NerdyPrint

Guia completo para fazer deploy do NerdyPrint no Vercel.

---

## 📋 Pré-requisitos

- ✅ Conta no [Vercel](https://vercel.com)
- ✅ Git instalado e repositório criado
- ✅ Node.js 18+ e pnpm instalados localmente

---

## 🔧 Passo 1: Preparar o Repositório

### 1.1 Inicializar Git (se ainda não fez)
```bash
cd nerdy-print-shop
git init
git add .
git commit -m "Initial commit: NerdyPrint marketplace"
```

### 1.2 Criar repositório no GitHub
1. Acesse [github.com/new](https://github.com/new)
2. Crie um repositório chamado `nerdy-print-shop`
3. Copie o comando para fazer push:

```bash
git remote add origin https://github.com/SEU_USUARIO/nerdy-print-shop.git
git branch -M main
git push -u origin main
```

---

## 🌐 Passo 2: Conectar ao Vercel

### 2.1 Fazer Login no Vercel
```bash
npm i -g vercel
vercel login
```

### 2.2 Deploy Automático
```bash
vercel --prod
```

Ou:

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique em "Add New..." → "Project"
3. Selecione o repositório `nerdy-print-shop`
4. Configure as variáveis de ambiente (veja abaixo)
5. Clique em "Deploy"

---

## 🔐 Passo 3: Configurar Variáveis de Ambiente

No dashboard do Vercel, vá para **Settings** → **Environment Variables** e adicione:

### Variáveis Obrigatórias

```
JWT_SECRET=sua_chave_secreta_aqui_minimo_32_caracteres
```

Gere uma chave segura:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Variáveis Opcionais

```
DATABASE_URL=file:./nerdy.db
MANUS_API_KEY=sk-xgf_Doi_U_DXMVLWQXW4z7zoHMjfzQpsJlcAQT6GihBf9Cwxv65flznwcEeuA8y1ZSnY6wu-ORCNSg8vVFPIG0rt71UK
VITE_OAUTH_PORTAL_URL=https://oauth.manus.computer
```

---

## 📦 Passo 4: Estrutura do Projeto

O Vercel detectará automaticamente:

```
nerdy-print-shop/
├── client/              # Frontend React
├── server/              # Backend Express
├── shared/              # Código compartilhado
├── drizzle/             # Schema do banco
├── package.json         # Dependências
├── vite.config.ts       # Config Vite
├── vercel.json          # Config Vercel ✅
└── .vercelignore        # Arquivos ignorados ✅
```

---

## ⚙️ Passo 5: Configuração do Vercel.json

O arquivo `vercel.json` já está configurado com:

- ✅ Build command: `pnpm build`
- ✅ Dev command: `pnpm dev`
- ✅ Framework: Vite
- ✅ Variáveis de ambiente
- ✅ Rewrites para API

---

## 🗄️ Passo 6: Banco de Dados

### Opção 1: SQLite (Recomendado para Teste)
```
DATABASE_URL=file:./nerdy.db
```

### Opção 2: MySQL/TiDB (Produção)
```
DATABASE_URL=mysql://user:password@host:port/database
```

Para usar MySQL:
1. Crie um banco em [PlanetScale](https://planetscale.com) ou similar
2. Copie a connection string
3. Adicione em Environment Variables do Vercel

---

## 🚀 Passo 7: Deploy

### Deploy Automático (Recomendado)
Cada push para `main` fará deploy automático:

```bash
git add .
git commit -m "Update features"
git push origin main
```

### Deploy Manual
```bash
vercel --prod
```

---

## ✅ Verificar Deploy

1. Acesse o link fornecido pelo Vercel
2. Teste as funcionalidades:
   - ✅ Página inicial carrega
   - ✅ Cadastro funciona
   - ✅ Login funciona
   - ✅ Catálogo de produtos
   - ✅ Carrinho de compras

---

## 🔍 Troubleshooting

### Erro: "Build failed"
```bash
# Verifique localmente
pnpm build

# Limpe cache
vercel env pull
rm -rf .vercel
vercel --prod
```

### Erro: "DATABASE_URL not found"
- Adicione em Environment Variables do Vercel
- Redeploy após adicionar

### Erro: "JWT_SECRET not found"
- Gere uma chave: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Adicione em Environment Variables

### Erro: "Port already in use"
- Vercel usa porta 3000 automaticamente
- Não precisa configurar manualmente

---

## 📊 Monitorar Performance

No dashboard do Vercel:
- **Deployments**: Histórico de deploys
- **Analytics**: Performance e uso
- **Logs**: Erros e eventos
- **Settings**: Configurações gerais

---

## 🔄 Atualizações Futuras

Para atualizar o site:

```bash
# Fazer alterações localmente
git add .
git commit -m "Descrição das mudanças"
git push origin main

# Vercel fará deploy automaticamente
```

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs: `vercel logs`
2. Confira as Environment Variables
3. Teste localmente: `pnpm dev`
4. Consulte a [documentação do Vercel](https://vercel.com/docs)

---

## 🎉 Parabéns!

Seu NerdyPrint está no ar! 🚀

**URL**: `https://seu-projeto.vercel.app`

Compartilhe com seus usuários e comece a vender! 💰
