import { test, expect } from '@playwright/test';

test.describe('Autenticação com Nuvem e Conta QA E2E', () => {
  test('deve abrir modal de credenciais, permitir login com Conta QA e gerenciar sessão', async ({ page }) => {
    await page.goto('/');

    // 1. Clica no botão Salvar na Nuvem
    await page.getByRole('button', { name: 'Salvar na Nuvem' }).click();

    // 2. Deve abrir o modal com orientações de credenciais Firebase
    await expect(page.getByText('Conexão com a Nuvem')).toBeVisible();
    await expect(page.getByText('Como conectar seu projeto Firebase real:')).toBeVisible();

    // 3. Clica para Entrar como Conta de QA
    await page.getByRole('button', { name: 'Entrar como Conta de QA' }).click();

    // 4. Modal fecha e o Header passa a exibir status de nuvem com a conta conectada
    await expect(page.getByText('Conexão com a Nuvem')).not.toBeVisible();
    await expect(page.getByText(/Nuvem: qa\.tester/i)).toBeVisible();

    // 5. Cadastra uma transação autenticado
    await page.getByRole('button', { name: 'Nova Transação' }).click();
    await page.getByRole('button', { name: 'Receita (Entrada)' }).click();
    await page.getByPlaceholder('Ex: Supermercado, Aluguel, Salário').fill('Aporte QA Autenticado');
    await page.getByPlaceholder('0,00').fill('3500');
    await page.getByRole('button', { name: 'Confirmar Lançamento' }).click();

    // Deve aparecer no extrato
    await expect(page.getByText('Aporte QA Autenticado')).toBeVisible();

    // 6. Faz Logout
    await page.getByTitle('Sair da conta').click();

    // Retorna para o Modo Convidado e limpa o extrato da visualização volátil
    await expect(page.getByText('Modo Convidado (Em memória)')).toBeVisible();
    await expect(page.getByText('Aporte QA Autenticado')).not.toBeVisible();

    // 7. Faz Login novamente com a mesma Conta de QA e valida a RECUPERAÇÃO DOS DADOS salvos na nuvem
    await page.getByRole('button', { name: 'Salvar na Nuvem' }).click();
    await page.getByRole('button', { name: 'Entrar como Conta de QA' }).click();

    // Aguarda sincronização e valida que os dados salvos anteriormente foram recuperados da nuvem
    await expect(page.getByText(/Nuvem: qa\.tester/i)).toBeVisible();
    await expect(page.getByText('Aporte QA Autenticado')).toBeVisible();
  });
});
