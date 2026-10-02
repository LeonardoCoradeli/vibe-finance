import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('🚀 Iniciando Validação Visual Automatizada com Playwright...');

  const outputDir = path.resolve('./artifacts/screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  console.log('1. Acessando http://localhost:3000...');
  await page.goto('http://localhost:3000');
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

  await browser.close();
  console.log('✅ Validação visual concluída com sucesso! Todos os screenshots salvos em ./artifacts/screenshots/');
}

main().catch((err) => {
  console.error('❌ Erro na validação visual:', err);
  process.exit(1);
});
