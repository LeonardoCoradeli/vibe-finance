import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';

async function isServerRunning(url: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    return res.status < 500;
  } catch {
    return false;
  }
}

async function waitForServer(url: string, maxAttempts = 30): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    if (await isServerRunning(url)) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('Servidor não iniciou a tempo na porta 3000.');
}

async function main() {
  console.log('🚀 Iniciando Validação Visual Automatizada com Playwright...');

  const outputDir = path.resolve('./artifacts/screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let serverProcess: ChildProcess | null = null;
  const serverUrl = 'http://localhost:3000';

  if (!(await isServerRunning(serverUrl))) {
    console.log('Iniciando servidor de produção local em http://localhost:3000...');
    serverProcess = spawn('bun', ['run', 'start', '--', '-p', '3000'], {
      shell: true,
      stdio: 'ignore',
    });
    await waitForServer(serverUrl);
  }

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();

  console.log('1. Acessando http://localhost:3000...');
  await page.goto(serverUrl);
  await page.waitForLoadState('networkidle');

  // Screenshot 1: Dashboard Inicial
  await page.screenshot({ path: path.join(outputDir, '01-dashboard-completo.png'), fullPage: true });
  console.log('📸 01-dashboard-completo.png capturado.');

  // Screenshot 2: Validação da Regra de Não-Contaminação
  console.log('2. Testando bloqueio de não-contaminação (VR para Contas)...');
  await page.getByRole('button', { name: 'Nova Transação' }).click();
  await page.waitForSelector('text=Novo Lançamento');
  await page.locator('select').first().selectOption('moradia_contas');
  await page.locator('select').nth(1).selectOption('BENEFICIO_VR_VA');
  await page.screenshot({ path: path.join(outputDir, '02-regra-bloqueio-vr.png') });
  console.log('📸 02-regra-bloqueio-vr.png capturado.');
  await page.getByRole('button', { name: 'Cancelar' }).click();

  // Screenshot 3: Motor Triplo de Proposta de Gasto
  console.log('3. Testando simulador de proposta de gasto com IA & PO...');
  await page.getByRole('button', { name: 'Proposta de Gasto' }).click();
  await page.waitForSelector('text=Simulador de Proposta de Gasto');
  await page.getByPlaceholder('Ex: Tênis novo, Viagem de feriado, Smart TV').fill('Viagem de Férias na Praia');
  await page.getByPlaceholder('0,00').fill('1800');
  await page.getByRole('button', { name: 'Avaliar Proposta de Gasto' }).click();
  await page.waitForSelector('text=Score de Impacto', { timeout: 15000 });
  await page.screenshot({ path: path.join(outputDir, '03-motor-proposta-avaliado.png') });
  console.log('📸 03-motor-proposta-avaliado.png capturado.');
  // Fecha o modal via tecla Escape ou recarregando a página
  await page.goto('http://localhost:3000');

  // Screenshot 4: Modal de Extrato PDF
  console.log('4. Abrindo modal de importação de extrato PDF...');
  await page.getByRole('button', { name: 'Extrato PDF' }).click();
  await page.waitForSelector('text=Importador de Extrato Bancário em PDF');
  await page.screenshot({ path: path.join(outputDir, '04-modal-extrato-pdf.png') });
  console.log('📸 04-modal-extrato-pdf.png capturado.');
  await page.goto('http://localhost:3000');

  // Screenshot 5: Conexão com a Nuvem e Conta de QA (Modal de Perfis)
  console.log('5. Abrindo modal de perfis e sincronização em nuvem...');
  await page.getByRole('button', { name: /Gestão Financeira|Entrar com Google/i }).first().click();
  await page.waitForSelector('text=Perfis de Acesso & Conexão com a Nuvem');
  await page.screenshot({ path: path.join(outputDir, '05-modal-conexao-nuvem-qa.png') });
  console.log('📸 05-modal-conexao-nuvem-qa.png capturado.');

    console.log('✅ Validação visual concluída com sucesso! Todos os screenshots salvos em ./artifacts/screenshots/');
  } finally {
    if (browser) {
      await browser.close();
    }
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

main().catch((err) => {
  console.error('❌ Erro na validação visual:', err);
  process.exit(1);
});
