import { test, expect } from '@playwright/test';

test.describe('Regra de Não-Contaminação e Transações E2E', () => {
  test('deve bloquear tentativa de pagar Moradia & Contas com VR e aceitar com Saldo Livre', async ({ page }) => {
    await page.goto('/');

    // Abre o modal de nova transação
    await page.getByRole('button', { name: 'Nova Transação' }).click();
    await expect(page.getByText('Novo Lançamento')).toBeVisible();

    // Preenche descrição e valor
    await page.getByPlaceholder('Ex: Supermercado, Aluguel, Salário').fill('Boleto Internet Fibra');
    await page.getByPlaceholder('0,00').fill('150');

    // Seleciona Categoria "Moradia & Contas"
    await page.locator('select').first().selectOption('moradia_contas');

    // Tenta selecionar o Bolsão "Benefício VR / VA"
    await page.locator('select').nth(1).selectOption('BENEFICIO_VR_VA');

    // Deve exibir o aviso de não-contaminação
    await expect(
      page.getByText('Regra de Não-Contaminação: Benefício VR/VA não pode ser usado para pagar contas e boletos.')
    ).toBeVisible();

    // Seleciona o Bolsão correto "LIVRE"
    await page.locator('select').nth(1).selectOption('LIVRE');

    // Submete o formulário
    await page.getByRole('button', { name: 'Confirmar Lançamento' }).click();

    // Modal fecha
    await expect(page.getByText('Novo Lançamento')).not.toBeVisible();

    // Transação deve aparecer na lista
    await expect(page.getByText('Boleto Internet Fibra')).toBeVisible();
  });
});
