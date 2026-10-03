import { test, expect } from '@playwright/test';

test.describe('Bolsões Customizados e Categorias Dinâmicas com Blocklist E2E', () => {
  test('deve permitir criar novo bolsão customizado e visualizá-lo no carrossel e no lançamento', async ({ page }) => {
    await page.goto('/');

    // 1. Clica no card "+ Adicionar Bolsão"
    await page.getByRole('button', { name: '+ Adicionar Bolsão' }).click();

    // 2. Abre o modal de gerenciamento de bolsões
    await expect(page.getByText('Gerenciar Bolsões de Saldo')).toBeVisible();

    // 3. Preenche o formulário de criação de novo bolsão
    await page.getByPlaceholder('Ex: Vale Mobilidade, Caixinha Viagem, PJ').fill('Vale Mobilidade');
    await page.getByPlaceholder('Ex: Exclusivo para combustível e transporte.').fill('Verba de deslocamento da empresa');
    await page.getByRole('button', { name: 'Salvar Bolsão' }).click();

    // 4. Fecha o modal
    await page.getByRole('button', { name: 'Concluir' }).click();

    // 5. O novo bolsão deve estar visível no carrossel do Dashboard
    await expect(page.getByText('Vale Mobilidade').first()).toBeVisible();

    // 6. Ao abrir Nova Transação, o novo bolsão deve constar no seletor de bolsão
    await page.getByRole('button', { name: 'Nova Transação' }).click();
    await expect(page.locator('select').nth(1)).toContainText('Vale Mobilidade');
    await page.getByRole('button', { name: 'Cancelar' }).click();
  });

  test('deve permitir criar nova categoria customizada com regra de Blocklist e respeitar a validação', async ({ page }) => {
    await page.goto('/');

    // 1. Abre Nova Transação
    await page.getByRole('button', { name: 'Nova Transação' }).click();

    // 2. Clica no atalho para criar nova categoria
    await page.getByRole('button', { name: 'Gerenciar / Criar' }).click();

    // 3. Abre o modal de gerenciamento de categorias
    await expect(page.getByText('Categorias & Regras de Não-Contaminação')).toBeVisible();

    // 4. Preenche o formulário da nova categoria
    await page.getByPlaceholder('Ex: Transporte, Lazer, Saúde, Pets, Educação').fill('Combustível & Posto');

    // 5. Marca VR/VA como BLOQUEADO na blocklist
    await page.getByRole('checkbox', { name: /Benefício VR \/ VA/i }).check();

    // 6. Salva a nova categoria (o modal fecha automaticamente e já seleciona a nova categoria)
    await page.getByRole('button', { name: 'Salvar Categoria' }).click();

    // 7. Tenta pagar com VR/VA -> deve ser bloqueado!
    await page.locator('select').nth(1).selectOption('BENEFICIO_VR_VA');

    // Deve exibir aviso de bloqueio
    await expect(page.getByText(/Regra de Não-Contaminação/i).first()).toBeVisible();

    // 8. Seleciona Saldo Livre -> deve ser aceito!
    await page.locator('select').nth(1).selectOption('LIVRE');
    await page.getByPlaceholder('Ex: Supermercado, Aluguel, Salário').fill('Gasolina Ipiranga');
    await page.getByPlaceholder('0,00').fill('120');
    await page.getByRole('button', { name: 'Confirmar Lançamento' }).click();

    // 9. Lançamento aparece no extrato com a categoria customizada
    await expect(page.getByText('Gasolina Ipiranga')).toBeVisible();
    await expect(page.getByText('Combustível & Posto', { exact: true }).first()).toBeVisible();
  });

  test('deve proteger bolsão customizado contra exclusão se possuir transações registradas nele', async ({ page }) => {
    await page.goto('/');

    // 1. Cria bolsão "Caixinha Reserva"
    await page.getByRole('button', { name: 'Gerenciar' }).click();
    await page.getByRole('button', { name: 'Adicionar Novo Bolsão de Saldo' }).click();
    await page.getByPlaceholder('Ex: Vale Mobilidade, Caixinha Viagem, PJ').fill('Caixinha Teste');
    await page.getByRole('button', { name: 'Salvar Bolsão' }).click();
    await page.getByRole('button', { name: 'Concluir' }).click();

    // 2. Lança uma receita usando "Caixinha Teste"
    await page.getByRole('button', { name: 'Nova Transação' }).click();
    await page.getByRole('button', { name: 'Receita (Entrada)' }).click();
    await page.getByPlaceholder('Ex: Supermercado, Aluguel, Salário').fill('Aporte Caixinha');
    await page.getByPlaceholder('0,00').fill('500');
    await page.locator('select').nth(1).selectOption({ label: 'Caixinha Teste' });
    await page.getByRole('button', { name: 'Confirmar Lançamento' }).click();

    // 3. Tenta excluir o bolsão "Caixinha Teste" no gerenciador
    await page.getByRole('button', { name: 'Gerenciar' }).click();
    await page.getByTitle('Excluir bolsão customizado').first().click();

    // 4. Deve exibir mensagem de bloqueio impedindo a exclusão
    await expect(
      page.getByText(/Não é possível excluir este bolsão pois existem transações registradas nele/i)
    ).toBeVisible();

    await page.getByRole('button', { name: 'Concluir' }).click();
  });
});
