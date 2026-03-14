/**
 * Testes unitários de exemplo
 */

describe('Utils / helpers', () => {
  it('deve passar teste básico', () => {
    expect(1 + 1).toBe(2);
  });

  it('deve validar estrutura de objeto', () => {
    const user = { id: 1, email: 'test@example.com' };
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
  });
});
