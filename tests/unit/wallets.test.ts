import { describe, it, expect } from 'bun:test';
import { validateWalletCompatibility, Category } from '@/types/finance';

describe('Regras de Bolsões (Wallets) & Não-Contaminação com Blocklist', () => {
  it('deve BLOQUEAR uso de Benefício VR/VA para pagar Moradia e Contas', () => {
    const resMoradia = validateWalletCompatibility('moradia', 'BENEFICIO_VR_VA');
    expect(resMoradia.valid).toBe(false);
    expect(resMoradia.reason).toContain('Regra de Não-Contaminação');

    const resContas = validateWalletCompatibility('contas', 'BENEFICIO_VR_VA');
    expect(resContas.valid).toBe(false);
    expect(resContas.reason).toContain('Regra de Não-Contaminação');
  });

  it('deve BLOQUEAR uso de Reserva de Emergência para despesas cotidianas de fábrica', () => {
    expect(validateWalletCompatibility('moradia', 'RESERVA_EMERGENCIA').valid).toBe(false);
    expect(validateWalletCompatibility('contas', 'RESERVA_EMERGENCIA').valid).toBe(false);
    expect(validateWalletCompatibility('alimentacao', 'RESERVA_EMERGENCIA').valid).toBe(false);
  });

  it('deve PERMITIR Benefício VR/VA para Alimentação', () => {
    expect(validateWalletCompatibility('alimentacao', 'BENEFICIO_VR_VA').valid).toBe(true);
  });

  it('deve PERMITIR Saldo Livre para todas as categorias de fábrica', () => {
    expect(validateWalletCompatibility('moradia', 'LIVRE').valid).toBe(true);
    expect(validateWalletCompatibility('contas', 'LIVRE').valid).toBe(true);
    expect(validateWalletCompatibility('alimentacao', 'LIVRE').valid).toBe(true);
  });

  it('deve suportar Categoria Customizada com Blocklist dinâmica', () => {
    const customCat: Category = {
      id: 'cat_combustivel',
      name: 'Combustível & Mobilidade',
      color: '#3b82f6',
      blockedWallets: ['BENEFICIO_VR_VA', 'RESERVA_EMERGENCIA'],
    };

    // Bloqueados
    expect(validateWalletCompatibility(customCat, 'BENEFICIO_VR_VA').valid).toBe(false);
    expect(validateWalletCompatibility(customCat, 'RESERVA_EMERGENCIA').valid).toBe(false);

    // Permitidos (LIVRE e novo bolsão customizado como Vale Combustível)
    expect(validateWalletCompatibility(customCat, 'LIVRE').valid).toBe(true);
    expect(validateWalletCompatibility(customCat, 'wallet_vale_combustivel').valid).toBe(true);
  });
});
