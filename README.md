# Catálogo Online de Produtos

Este é um site de catálogo de produtos com carrinho de compras e solicitação de orçamento via WhatsApp.
Desenvolvido com React + Vite.

## Pré-requisitos
- Node.js instalado (versão 16 ou superior recomendada)

## Como executar localmente

1. Abra o terminal na pasta do projeto.
2. Instale as dependências (se ainda não tiver feito):
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Abra o navegador no link exibido (geralmente `http://localhost:5173`).

## Funcionalidades
- **Catálogo**: Visualização de produtos em grade com filtros.
- **Carrinho**: Adicionar, remover e ajustar quantidade de itens. Persistente (salvo no navegador).
- **Detalhes**: Clique na imagem ou em "Ver detalhes" para ver mais informações.
- **WhatsApp**: Ao finalizar, uma mensagem formatada é gerada para enviar via WhatsApp.

## Personalização
- **Produtos**: Edite o arquivo `src/data.js`.
- **Configurações Gerais**: Edite as constantes `STORE_NAME` e `WHATSAPP_NUMBER` no topo de `src/App.jsx`.
