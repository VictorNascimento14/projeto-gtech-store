# Digital Store E-Commerce

<div align="center">

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

<br />

**Uma plataforma de e-commerce moderna, responsiva e interativa.**

</div>

## 📋 Sobre o Projeto

Este projeto é uma loja virtual completa desenvolvida com foco em performance e experiência do usuário. Ele utiliza as tecnologias mais recentes do ecossistema React para oferecer uma navegação fluida, animações envolventes e funcionalidades robustas de comércio eletrônico.

## ✨ Funcionalidades Principais

- **🛒 Carrinho & Checkout**: Fluxo completo de compra, cálculo de totais e gerenciamento de estado global.
- **👮 Painel Administrativo Pro**: 
  - **Gestão de Pedidos**: Alteração de status (Recebido, Preparando, Transporte) com menu dinâmico e modal de segurança para cancelamentos.
  - **Gestão de Produtos**: CRUD completo de itens da loja.
- **🚚 Rastreamento de Pedidos**: Timeline visual animada que mostra o progresso da entrega em tempo real para o cliente.
- **📦 Meus Pedidos & Detalhes**: Histórico completo de compras e página dedicada de detalhes do pedido (estilo "Nota Fiscal" premiun).
- **🔐 Autenticação**: Sistema robusto de Login/Cadastro integrado ao Supabase.
- **📱 UX/UI Premium**: 
  - Layout totalmente responsivo (Mobile-First).
  - Animações fluidas (Framer Motion).
  - Tema Escuro/Claro (Dark Mode).

## 📂 Estrutura do Projeto (Arquitetura Atômica)

A estrutura de arquivos foi reorganizada para garantir escalabilidade e modularidade:

```
/src
├── components/          # Componentes globais (Layout, Header, ProductCard)
├── contexts/            # Gerenciamento de estado (Auth, Cart, Product)
├── lib/                 # Utilitários (Supabase client, formatters)
├── pages/               # Módulos de página isolados
│   ├── AdminPanel/      # Dashboard Administrativo (Orders, Customers, Inventory)
│   ├── Cart/            # Página do Carrinho
│   ├── Home/            # Landing Page
│   ├── Login/SignUp/    # Autenticação
│   ├── MyOrders/        # Histórico de Pedidos do Usuário
│   ├── OrderDetails/    # Detalhes profundos de um pedido específico
│   ├── OrderTracking/   # Timeline de Rastreio pública/privada
│   ├── ProductDetail/   # Página de Venda do Produto
│   └── ProductListing/  # Catálogo e Busca
└── ...
```

## 👥 Contribuidores

| Desenvolvedor | GitHub |
| **Bruno Gomes** | [@sudobrunogomes](https://github.com/sudobrunogomes) |
| **Marcos Sousa** | [@marcosA-sousa](https://github.com/marcosA-sousa) |
| **Victor Nascimento** | [@VictorNascimento14](https://github.com/VictorNascimento14) |


---


