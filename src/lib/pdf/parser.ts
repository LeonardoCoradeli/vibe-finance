import { ParsedStatementItem, StatementParseResult } from './types';
import { categorizeTransactionLine } from './categorizer';
import { TransactionType } from '@/types/finance';

/**
 * Extrai todo o texto contido nas páginas de um arquivo PDF no navegador
 */
async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  
  // Configurar worker para execução no navegador
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '3.11.174'}/pdf.worker.min.js`;
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdfDocument = await loadingTask.promise;

  let fullText = '';
  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += `\n${pageText}`;
  }

  return fullText;
}

/**
 * Faz o parsing de linhas de texto do extrato bancário
 */
export async function parseBankStatementPDF(file: File): Promise<StatementParseResult> {
  const errors: string[] = [];
  let rawText = '';

  try {
    rawText = await extractTextFromPDF(file);
  } catch (err: any) {
    errors.push(`Falha ao ler o arquivo PDF: ${err?.message || 'Arquivo corrompido ou protegido por senha'}`);
    return {
      items: [],
      totalCredits: 0,
      totalDebits: 0,
      rawTextPreview: '',
      errors,
    };
  }

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 5);

  const parsedItems: ParsedStatementItem[] = [];
  let totalCredits = 0;
  let totalDebits = 0;

  // Regex para data brasileira (DD/MM/AAAA ou DD/MM)
  const dateRegex = /\b(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?\b/;
  // Regex para valor monetário brasileiro: R$ 1.234,56 ou -123,45 ou 45,90 D/C
  const valueRegex = /(?:R\$\s*)?([+-]?)\s*(\d{1,3}(?:\.\d{3})*,\d{2})\s*([DCdc]?)/;

  const currentYear = new Date().getFullYear();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const dateMatch = line.match(dateRegex);
    const valueMatch = line.match(valueRegex);

    if (dateMatch && valueMatch) {
      const day = dateMatch[1].padStart(2, '0');
      const month = dateMatch[2].padStart(2, '0');
      const year = dateMatch[3] ? (dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3]) : String(currentYear);
      const isoDate = `${year}-${month}-${day}`;

      // Extrai valor numérico
      const rawNumberStr = valueMatch[2].replace(/\./g, '').replace(',', '.');
      const numericAmount = parseFloat(rawNumberStr);

      if (isNaN(numericAmount) || numericAmount <= 0) {
        continue;
      }

      // Determina se é Entrada ou Saída
      const sign = valueMatch[1];
      const indicator = (valueMatch[3] || '').toUpperCase();
      let type: TransactionType = 'expense';

      if (sign === '+' || indicator === 'C') {
        type = 'income';
      } else if (sign === '-' || indicator === 'D') {
        type = 'expense';
      } else {
        // Analisa palavras indicativas na linha
        const upperLine = line.toUpperCase();
        if (
          upperLine.includes('TED RECEBIDA') ||
          upperLine.includes('PIX RECEBIDO') ||
          upperLine.includes('SALARIO') ||
          upperLine.includes('CREDITO') ||
          upperLine.includes('ESTORNO')
        ) {
          type = 'income';
        }
      }

      // Limpa a descrição removendo datas e valores encontrados
      let description = line
        .replace(dateMatch[0], '')
        .replace(valueMatch[0], '')
        .replace(/R\$/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (description.length < 3) {
        description = 'Lançamento Bancário';
      }

      // Categoriza
      const categorization = categorizeTransactionLine(description, type);

      if (type === 'income') {
        totalCredits += numericAmount;
      } else {
        totalDebits += numericAmount;
      }

      parsedItems.push({
        id: `parsed-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
        rawLine: line,
        date: isoDate,
        description,
        amount: numericAmount,
        type: categorization.type,
        suggestedCategory: categorization.category,
        suggestedWallet: categorization.wallet,
        selected: true,
        confidence: categorization.confidence,
      });
    }
  }

  return {
    items: parsedItems,
    totalCredits,
    totalDebits,
    rawTextPreview: rawText.substring(0, 500),
    errors,
  };
}
