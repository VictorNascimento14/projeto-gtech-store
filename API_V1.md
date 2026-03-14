# API REST /v1/*

API REST implementada via Supabase Edge Functions, com JWT próprio e estrutura de tabelas conforme especificação.

## Base URL

```
https://<PROJECT_REF>.supabase.co/functions/v1/api
```

As rotas são passadas via header `x-api-path` ou query `?path=/v1/...`.

## JWT próprio

### Login (obter token)

```
POST /v1/user/token
Header: x-api-path: /v1/user/token
Body: { "email": "user@example.com", "password": "senha123" }
```

Resposta 200:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "firstname": "João", "surname": "Silva", "email": "user@example.com" }
}
```

### Usar o token

Adicione ao header em rotas protegidas:
```
Authorization: Bearer <token>
```

## Rotas

### Usuários (api_users)

| Método | Rota | Descrição | Auth |
|--------|------|------------|------|
| POST | /v1/user/token | Login, retorna JWT | Não |
| POST | /v1/user | Criar usuário | Não |
| GET | /v1/user/:id | Buscar usuário | JWT (próprio) |
| PUT | /v1/user/:id | Atualizar usuário | JWT (próprio) |
| DELETE | /v1/user/:id | Remover usuário | JWT (próprio) |

### Categorias

| Método | Rota | Descrição | Auth |
|--------|------|------------|------|
| GET | /v1/category/search | Listar categorias (?q=termo) | Não |
| GET | /v1/category/:id | Buscar categoria | Não |
| POST | /v1/category | Criar categoria | JWT |

### Produtos

| Método | Rota | Descrição | Auth |
|--------|------|------------|------|
| GET | /v1/product | Listar produtos (?q=termo) | Não |
| GET | /v1/product/:id | Buscar produto (com images e options) | Não |

## Tabelas no Supabase

- **api_users**: id, firstname, surname, email, password (bcrypt), created_at, updated_at
- **categories**: id, name, slug, use_in_menu, created_at, updated_at
- **products**: id, enabled, name, slug, use_in_menu, stock, description, price, price_with_discount, ...
- **product_images**: id, product_id, enabled, path
- **product_options**: id, product_id, title, shape, radius, type, values (JSONB)
- **products_categories**: product_id, category_id (PK composta)

## Configuração

1. **JWT_API_SECRET**: Defina no Supabase (Edge Function Secrets) um segredo para assinar os JWTs:
   ```bash
   supabase secrets set JWT_API_SECRET=sua-chave-secreta-forte
   ```

2. **Anon Key**: Use a anon key do Supabase no header `Authorization` para invocar a Edge Function (ou apikey no header).

## Testes (Jest)

```bash
npm test
```

Para testes de integração contra a API deployada:
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co npm test
```
