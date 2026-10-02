import { describe, it, expect } from 'bun:test';
import { validateWalletCompatibility } from '@/types/finance';

describe('Regras de Bolsões (Wallets) & Não-Contaminação', () => {
  it('deve BLOQUEAR uso de Benefício VR/VA para pagar contas de consumo e moradia', () => {
    const result = validateWalletCompatibility('moradia_contas', 'BENEFICIO_VR_VA');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Regra de Não-Contaminação');
  });

  it('deve BLOQUEAR uso de Benefício VR/VA para transporte, saúde, lazer e investimentos', () => {
    expect(validateWalletCompatibility('transporte', 'BENEFICIO_VR_VA').valid).toBe(false);
    expect(validateWalletCompatibility('saude', 'BENEFICIO_VR_VA').valid).toBe(false);
    expect(validateWalletCompatibility('lazer', 'BENEFICIO_VR_VA').valid).toBe(false);
    expect(validateWalletCompatibility('investimentos', 'BENEFICIO_VR_VA').valid).toBe(false);
  });

  it('deve PERMITIR Benefício VR/VA para alimentação e restaurantes', () => {
    expect(validateWalletCompatibility('alimentacao_mercado', 'BENEFICIO_VR_VA').valid).toBe(true);
    expect(validateWalletCompatibility('restaurante_refeicao', 'BENEFICIO_VR_VA').valid).toBe(true);
  });

  it('deve PERMITIR Saldo Livre para todas as categorias', () => {
    expect(validateWalletCompatibility('moradia_contas', 'LIVRE').valid).toBe(true);
    expect(validateWalletCompatibility('alimentacao_mercado', 'LIVRE').valid).toBe(true);
    expect(validateWalletCompatibility('restaurante_refeicao', 'LIVRE').valid).toBe(true);
    expect(validateWalletCompatibility('transporte', 'LIVRE').valid).toBe(true);
    expect(validateWalletCompatibility('saude', 'LIVRE').valid).toBe(true);
    expect(validateWalletCompatibility('lazer', 'LIVRE').valid).toBe(true);
  });
});
