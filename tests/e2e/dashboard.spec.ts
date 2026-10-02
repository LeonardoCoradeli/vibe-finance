import { test, expect } from '@playwright/test';

test.describe('Dashboard Financeiro E2E', () => {
  test('deve carregar a página inicial com título, bolsões de saldo e gráficos', async ({ page }) => {
    await page.goto('/');

    // 1. Título do Header
    await expect(page.getByRole('heading', { name: /Gestão Financeira/i })).toBeVisible();
    await expect(page.getByText('Modo Convidado (Em memória)')).toBeVisible();

    // 2. Os 3 Bolsões Segregados
    await expect(page.getByText('Bolsão Livre')).toBeVisible();
    await expect(page.getByText('Benefício VR / VA')).toBeVisible();
    await expect(page.getByText('Reserva de Emergência', { exact: true })).toBeVisible();

    // 3. Métricas Mensais
    await expect(page.getByText('Entradas do Mês')).toBeVisible();
    await expect(page.getByText('Saídas do Mês')).toBeVisible();
    await expect(page.getByText('Economia Líquida')).toBeVisible();

    // 4. Seção de Gráficos e Metas
    await expect(page.getByText('Despesas por Categoria')).toBeVisible();
    await expect(page.getByText('Fluxo de Entradas vs Saídas por Bolsão')).toBeVisible();
    await expect(page.getByText('Metas & Planejamento')).toBeVisible();

    // 5. Extrato de Transações
    await expect(page.getByText('Extrato de Lançamentos')).toBeVisible();
  });
});
