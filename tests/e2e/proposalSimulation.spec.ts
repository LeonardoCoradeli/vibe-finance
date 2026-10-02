import { test, expect } from '@playwright/test';

test.describe('Simulador de Proposta de Gasto E2E', () => {
  test('deve avaliar proposta de gasto com os 3 motores e permitir efetivação no extrato', async ({ page }) => {
    await page.goto('/');

    // Clica no botão de Proposta de Gasto
    await page.getByRole('button', { name: 'Proposta de Gasto' }).click();

    // Modal aberto
    await expect(page.getByText('Simulador de Proposta de Gasto')).toBeVisible();

    // Preenche a proposta
    await page.getByPlaceholder('Ex: Tênis novo, Viagem de feriado, Smart TV').fill('Monitor Ultrawide 34');
    await page.getByPlaceholder('0,00').fill('1500');

    // Clica em Avaliar
    await page.getByRole('button', { name: 'Avaliar Proposta de Gasto' }).click();

    // Aguarda e valida os 3 pilares exibidos na tela
    await expect(page.getByText('1. Pesq. Operacional')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('2. Estatística (Z-Score)')).toBeVisible();
    await expect(page.getByText('3. SLM Veredito JSON')).toBeVisible();

    // Valida recomendação final e score de impacto
    await expect(page.getByText('Score de Impacto')).toBeVisible();

    // Clica em Confirmar & Efetivar no Extrato
    await page.getByRole('button', { name: 'Confirmar & Efetivar no Extrato' }).click();

    // O modal fecha
    await expect(page.getByText('Simulador de Proposta de Gasto')).not.toBeVisible();

    // A transação "Monitor Ultrawide 34" deve estar no extrato
    await expect(page.getByText('Monitor Ultrawide 34')).toBeVisible();
  });
});
