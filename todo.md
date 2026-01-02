# NerdyPrint - TODO

## Estrutura Base
- [x] Configurar tema escuro e estilos globais
- [x] Integrar logo NerdyPrint
- [x] Criar layout principal com navegação

## Banco de Dados
- [x] Tabela de produtos (products)
- [x] Tabela de itens do carrinho (cart_items)
- [x] Tabela de pedidos (orders)
- [x] Tabela de itens do pedido (order_items)
- [x] Seed de produtos iniciais

## Autenticação
- [x] Sistema de login/registro via Manus OAuth
- [x] Perfil de usuário
- [ ] Redefinição de senha por email (pendente - requer configuração de email)

## Catálogo de Produtos
- [x] Página de listagem de produtos
- [x] Cards de produtos com imagem, nome, preço
- [x] Filtros e busca
- [x] Página de detalhes do produto

## Carrinho de Compras
- [x] Adicionar/remover itens
- [x] Atualizar quantidade
- [x] Carrinho persistente por usuário
- [x] Resumo do pedido

## Checkout
- [x] Integração WhatsApp (+5511953739362)
- [x] Pagamento via PIX
- [x] Geração de pedido

## Ferramentas Maker
- [x] QR Code 3D - Gerador funcional
- [x] Imagem para 3D - Conversão com Gemini Vision API
- [x] Visualização 3D dos modelos gerados

## Histórico de Pedidos
- [x] Lista de pedidos do usuário
- [x] Detalhes do pedido
- [x] Status do pedido

## Painel Admin
- [x] Gerenciamento de produtos (CRUD)
- [x] Visualização de pedidos
- [x] Dashboard com estatísticas

## Página de Apresentação
- [ ] Criar página web estática para apresentação dos resultados

## Bugs Reportados
- [x] Erro ao processar imagem na ferramenta Imagem para 3D (API Gemini) - Corrigido para usar LLM helper interno com melhor tratamento de erros

## Reformulação do Catálogo
- [x] Excluir todos os produtos existentes
- [x] Adicionar campo de categoria aos produtos
- [x] Criar apenas 2 produtos: Pop do IT e Suporte para Lata
- [x] Redesenhar página de catálogo com filtros por categoria
- [x] Adicionar botão de favoritos nos cards
- [x] Adicionar alternância de visualização (grade/lista)
- [x] Adicionar ordenação por popularidade
- [x] Botão "Voltar para Início"

## Reorganização do Catálogo (Nova Solicitação)
- [x] Upload da imagem real do Pop IT
- [x] Excluir todos os produtos
- [x] Adicionar Pop IT na categoria Colecionáveis
- [x] Adicionar Suporte para Lata na categoria Itens para Casa
- [x] Usar imagem real do Pop IT no produto

## Ajustes Finais do Catálogo
- [x] Adicionar Pop IT em Colecionáveis
- [x] Adicionar imagem real do Suporte para Lata
- [x] Excluir produtos de teste

## Melhorias no Painel Admin
- [x] Adicionar seleção de categoria ao criar produto
- [x] Criar interface para gerenciar categorias
- [x] Melhorar formulário de edição de produtos
- [x] Exibir categoria na tabela de produtos
- [x] Remover Test Product da lista

## Melhorias Adicionais Solicitadas
- [x] Adicionar coluna isDeleted na tabela de pedidos
- [x] Botão de excluir pedidos no painel admin
- [x] Botão de comprar/gerar link de pagamento
- [x] Aba de pedidos excluídos com opção de restaurar

## Novas Funcionalidades Solicitadas
- [x] Galeria de fotos por produto (múltiplas imagens)
- [x] Sistema de avaliações/reviews por produto
- [x] Likes em reviews
- [ ] Notificações WhatsApp automáticas de status
- [ ] Calculadora de frete (Correios/Melhor Envio)
- [x] Wishlist/Lista de desejos persistente
- [x] Sistema de cupons de desconto completo
  - [x] Criar cupom com código e % desconto
  - [x] Definir duração/validade
  - [x] Limitar quantidade de usos
  - [x] Rastrear usos do cupom
  - [ ] Mostrar cupom no checkout WhatsApp

- [x] Botão "Voltar para Catálogo" no painel admin

- [x] Remover opção de pagamento PIX (manter apenas WhatsApp)

## Sistema de Permissões Admin
- [x] Criar tabela de permissões no banco de dados
- [x] Apenas mateinorolamento89@gmail.com pode gerenciar permissões
- [x] Controle granular: criar produtos, ver pedidos, gerenciar cupons, etc.
- [x] Painel de gerenciamento de permissões (/admin/permissoes)

## Bugs Reportados pelo Usuário
- [x] Falta botão "Voltar para Catálogo" no painel admin de produtos
- [x] Falta navegação para área de Cupons no painel admin
- [x] Falta navegação para área de Permissões no painel admin
- [x] Suporte para Lata mostrando categoria "Desconhecida" em vez de "Itens para Casa"
