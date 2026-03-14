/**
 * Testes da API REST /v1/*
 * Executa contra a Edge Function deployada (requer VITE_SUPABASE_URL ou SUPABASE_URL configurado)
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';

describe('API REST /v1/*', () => {
  const baseUrl = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/api` : '';

  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  const apiFetch = async (path: string, options: RequestInit = {}) => {
    const url = baseUrl + (path.startsWith('?') ? path : `?path=${encodeURIComponent(path)}`);
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-path': path,
        ...(anonKey ? { Authorization: `Bearer ${anonKey}` } : {}),
        ...options.headers,
      },
    });
  };

  beforeAll(() => {
    if (!baseUrl) {
      console.warn('VITE_SUPABASE_URL não configurado - testes de integração podem falhar');
    }
  });

  it('deve rejeitar login sem email/password', async () => {
    if (!baseUrl) return;
    const res = await apiFetch('/v1/user/token', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/obrigatórios/i);
  });

  it('deve retornar 404 para rota inexistente', async () => {
    if (!baseUrl) return;
    const res = await apiFetch('/v1/inexistente', { method: 'GET' });
    expect(res.status).toBe(404);
  });

  it('deve listar categorias (GET /v1/category/search)', async () => {
    if (!baseUrl) return;
    const res = await apiFetch('/v1/category/search', { method: 'GET' });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('deve listar produtos (GET /v1/product)', async () => {
    if (!baseUrl) return;
    const res = await apiFetch('/v1/product', { method: 'GET' });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});
