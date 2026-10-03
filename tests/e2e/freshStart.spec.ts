import { test, expect } from '@playwright/test';

test.describe('Início do Zero (Zero State) e Fluxo Manual Passo a Passo E2E', () => {
  test('deve iniciar zerado e acumular lançamentos nos bolsões corretos sem misturar', async ({ page }) => {
    await page.goto('/');

    // 1. Validar que inicia com R$ 0,00 em todos os bolsões
    await expect(page.getByText('Saldo Total: R$ 0,00')).toBeVisible();
    await expect(page.locator('text=R$ 0,00').first()).toBeVisible();

    // 2. Extrato deve estar vazio
    await expect(page.getByText('0 transações no período selecionado')).toBeVisible();
    await expect(page.getByText('Nenhuma transação encontrada com os filtros selecionados.')).toBeVisible();

    // 3. Cadastrar 1ª Entrada: Salário Líquido (R$ 5.000,00) no bolsão LIVRE
    await page.getByRole('button', { name: 'Nova Transação' }).click();
    await page.getByRole('button', { name: 'Receita (Entrada)' }).click();
    await page.getByPlaceholder('Ex: Supermercado, Aluguel, Salário').fill('Salário Mensal QA');
    await page.getByPlaceholder('0,00').fill('5000');
    await page.locator('select').nth(1).selectOption('LIVRE');
    await page.getByRole('button', { name: 'Confirmar Lançamento' }).click();

    // Validar atualização do Bolsão Livre
    await expect(page.getByText('R$ 5.000,00').first()).toBeVisible();

    // 4. Cadastrar 2ª Entrada: Benefício VR (R$ 1.000,00) no bolsão VR/VA
    await page.getByRole('button', { name: 'Nova Transação' }).click();
    await page.getByRole('button', { name: 'Receita (Entrada)' }).click();
    await page.getByPlaceholder('Ex: Supermercado, Aluguel, Salário').fill('Crédito Vale Refeição QA');
    await page.getByPlaceholder('0,00').fill('1000');
    await page.locator('select').first().selectOption('alimentacao');
    await page.locator('select').nth(1).selectOption('BENEFICIO_VR_VA');
    await page.getByRole('button', { name: 'Confirmar Lançamento' }).click();

    // Validar saldos segregados: Total R$ 6.000,00, Livre R$ 5.000,00, VR R$ 1.000,00
    await expect(page.getByText(/Saldo Total:\s*R\$\s*6\.000,00/)).toBeVisible();
    await expect(page.locator('p:has-text("1.000,00")').first()).toBeVisible();

    // 5. Cadastrar Despesa: Conta de Luz (R$ 250,00) no bolsão LIVRE
    await page.getByRole('button', { name: 'Nova Transação' }).click();
    await page.getByRole('button', { name: 'Despesa (Saída)' }).click();
    await page.getByPlaceholder('Ex: Supermercado, Aluguel, Salário').fill('Boleto Energia Enel');
    await page.getByPlaceholder('0,00').fill('250');
    await page.locator('select').first().selectOption('contas');
    await page.locator('select').nth(1).selectOption('LIVRE');
    await page.getByRole('button', { name: 'Confirmar Lançamento' }).click();

    // Validar que o Livre foi debitado para R$ 4.750,00 e o VR permaneceu em R$ 1.000,00
    await expect(page.locator('p:has-text("4.750,00")')).toBeVisible();
    await expect(page.getByText(/Saldo Total:\s*R\$\s*5\.750,00/)).toBeVisible();

    // 6. Validar que as 3 transações aparecem listadas no extrato
    await expect(page.getByText('Salário Mensal QA')).toBeVisible();
    await expect(page.getByText('Crédito Vale Refeição QA')).toBeVisible();
    await expect(page.getByText('Boleto Energia Enel')).toBeVisible();
    await expect(page.getByText('3 transações no período selecionado')).toBeVisible();
  });
});
