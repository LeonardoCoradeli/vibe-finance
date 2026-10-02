import { test, expect } from '@playwright/test';

test.describe('Autenticação com Nuvem e Conta QA E2E', () => {
  test('deve abrir modal de credenciais, permitir login com Conta QA e gerenciar sessão', async ({ page }) => {
    await page.goto('/');

    // 1. Clica no botão de Perfil (Convidado)
    await page.getByRole('button', { name: /Perfil.*Convidado|Convidado/i }).click();

    // 2. Deve abrir o modal com orientações de credenciais Firebase e botão oficial do Google
    await expect(page.getByText('Perfis de Acesso & Conexão com a Nuvem')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar com o Google' })).toBeVisible();

    // 3. Clica para Entrar como Conta de QA
    await page.getByRole('button', { name: 'Entrar como Conta de QA' }).click();

    // 4. Modal fecha e o Header passa a exibir o avatar/email da conta conectada
    await expect(page.getByText('Perfis de Acesso & Conexão com a Nuvem')).not.toBeVisible();
    await expect(page.getByRole('button', { name: /qa\.tester@financas\.app/i })).toBeVisible();

    // 5. Cadastra uma transação autenticado
    await page.getByRole('button', { name: 'Nova Transação' }).click();
    await page.getByRole('button', { name: 'Receita (Entrada)' }).click();
    await page.getByPlaceholder('Ex: Supermercado, Aluguel, Salário').fill('Aporte QA Autenticado');
    await page.getByPlaceholder('0,00').fill('3500');
    await page.getByRole('button', { name: 'Confirmar Lançamento' }).click();

    // Deve aparecer no extrato
    await expect(page.getByText('Aporte QA Autenticado')).toBeVisible();

    // 6. Faz Logout através do modal de perfil
    await page.getByRole('button', { name: /qa\.tester@financas\.app/i }).click();
    await page.getByRole('button', { name: 'Sair do Modo QA' }).click();

    // Retorna para o Modo Convidado e limpa o extrato da visualização volátil
    await expect(page.getByRole('button', { name: /Perfil.*Convidado|Convidado/i })).toBeVisible();
    await expect(page.getByText('Aporte QA Autenticado')).not.toBeVisible();

    // 7. Faz Login novamente com a mesma Conta de QA e valida a RECUPERAÇÃO DOS DADOS salvos na nuvem
    await page.getByRole('button', { name: /Perfil.*Convidado|Convidado/i }).click();
    await page.getByRole('button', { name: 'Entrar como Conta de QA' }).click();

    // Aguarda sincronização e valida que os dados salvos anteriormente foram recuperados da nuvem
    await expect(page.getByRole('button', { name: /qa\.tester@financas\.app/i })).toBeVisible();
    await expect(page.getByText('Aporte QA Autenticado')).toBeVisible();
  });

  test('deve manter a sessão e dados da Conta QA após recarregar a página (F5) e aplicar regras de bolsões', async ({ page }) => {
    await page.goto('/');

    // 1. Entra como Conta de QA
    await page.getByRole('button', { name: /Perfil.*Convidado|Convidado/i }).click();
    await page.getByRole('button', { name: 'Entrar como Conta de QA' }).click();
    await expect(page.getByRole('button', { name: /qa\.tester@financas\.app/i })).toBeVisible();

    // 2. Lança uma receita de R$ 2.000 em Benefício VR/VA
    await page.getByRole('button', { name: 'Nova Transação' }).click();
    await page.getByRole('button', { name: 'Receita (Entrada)' }).click();
    await page.getByPlaceholder('Ex: Supermercado, Aluguel, Salário').fill('Recarga Vale Refeição QA');
    await page.getByPlaceholder('0,00').fill('2000');
    await page.locator('select').nth(1).selectOption('BENEFICIO_VR_VA');
    await page.getByRole('button', { name: 'Confirmar Lançamento' }).click();

    await expect(page.getByText('Recarga Vale Refeição QA')).toBeVisible();

    // 3. Tenta gastar VR com Moradia/Contas -> deve ser bloqueado pela regra de bolsão
    await page.getByRole('button', { name: 'Nova Transação' }).click();
    await page.getByRole('button', { name: 'Despesa (Saída)' }).click();
    await page.getByPlaceholder('Ex: Supermercado, Aluguel, Salário').fill('Conta de Luz QA');
    await page.getByPlaceholder('0,00').fill('250');
    await page.locator('select').first().selectOption('moradia_contas');
    await page.locator('select').nth(1).selectOption('BENEFICIO_VR_VA');
    await expect(page.getByText(/Regra de Não-Contaminação/i)).toBeVisible();
    await page.getByRole('button', { name: 'Cancelar' }).click();

    // 4. Executa recarregamento completo da página (page.reload / F5)
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 5. Valida que a sessão de QA continua ativa e os dados permanecem intactos
    await expect(page.getByRole('button', { name: /qa\.tester@financas\.app/i })).toBeVisible();
    await expect(page.getByText('Recarga Vale Refeição QA')).toBeVisible();

    // 6. Faz Logout e valida que a sessão é encerrada
    await page.getByRole('button', { name: /qa\.tester@financas\.app/i }).click();
    await page.getByRole('button', { name: 'Sair do Modo QA' }).click();
    await expect(page.getByRole('button', { name: /Perfil.*Convidado|Convidado/i })).toBeVisible();
  });

  test('deve abrir o modal de perfis ao clicar no botão de perfil e permitir alternar para Modo Convidado', async ({ page }) => {
    await page.goto('/');

    // 1. Clica no botão de perfil no Header
    await page.getByRole('button', { name: /Perfil.*Convidado|Convidado/i }).click();

    // 2. Deve abrir o Modal de Perfis
    await expect(page.getByText('Perfis de Acesso & Conexão com a Nuvem')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Modo Convidado' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar com o Google' })).toBeVisible();

    // 3. Entra como Conta de QA pelo modal de perfis
    await page.getByRole('button', { name: 'Entrar como Conta de QA' }).click();
    await expect(page.getByRole('button', { name: /qa\.tester@financas\.app/i })).toBeVisible();

    // 4. Clica novamente no perfil para abrir o modal de perfis
    await page.getByRole('button', { name: /qa\.tester@financas\.app/i }).click();
    await expect(page.getByText('Perfis de Acesso & Conexão com a Nuvem')).toBeVisible();

    // 5. Clica no botão "Mudar para Convidado"
    await page.getByRole('button', { name: 'Mudar para Convidado' }).click();

    // 6. Confirma que voltou ao Modo Convidado
    await expect(page.getByRole('button', { name: /Perfil.*Convidado|Convidado/i })).toBeVisible();
  });
});
