import { FinancialGoal } from '@/types/finance';
import { ExpenseProposal, LinearProgrammingResult, AnomalyDetectionResult, SLMResult } from './types';

interface SLMInput {
  proposal: ExpenseProposal;
  linearProgramming: LinearProgrammingResult;
  anomalyDetection: AnomalyDetectionResult;
  goals: FinancialGoal[];
}

interface SLMPayloadResponse {
  veredito: 'sim' | 'nao';
  score_impacto: number;
  justificativa: string;
  trade_off: string;
}

/**
 * Avaliador Heurístico Local que simula a inteligência de um SLM compacto (0.5B - 1.5B)
 * de forma 100% determinística, sem depender de rede externa.
 */
function evaluateLocalSLMHeuristics(input: SLMInput): SLMResult {
  const { proposal, linearProgramming, anomalyDetection, goals } = input;

  let impactScore = 15; // Score base
  const issues: string[] = [];
  const sacrifices: string[] = [];

  // 1. Ponderação matemática da Pesquisa Operacional
  if (!linearProgramming.viable) {
    impactScore += 45;
    issues.push(...linearProgramming.violations);
  } else {
    // Se for viável mas deixar pouca folga de saldo livre
    if (linearProgramming.remainingWalletBalance < 300 && proposal.wallet === 'LIVRE') {
      impactScore += 20;
      issues.push(`Deixa uma margem de segurança crítica de apenas R$ ${linearProgramming.remainingWalletBalance.toFixed(2)}.`);
    }
  }

  // 2. Ponderação estatística de anomalias
  if (anomalyDetection.risk === 'alto') {
    impactScore += 30;
    issues.push(`Compra atípica com valor ${anomalyDetection.zScore} desvios acima da média histórica.`);
  } else if (anomalyDetection.risk === 'medio') {
    impactScore += 15;
  }

  // 3. Ponderação subjetiva frente às metas do usuário
  if (goals.length > 0) {
    const primaryGoal = goals[0];
    const impactOnGoal = (proposal.amount / primaryGoal.targetAmount) * 100;

    if (impactOnGoal > 10) {
      impactScore += 15;
      sacrifices.push(`Compromete o ritmo da meta "${primaryGoal.title}", absorvendo o equivalente a ${impactOnGoal.toFixed(0)}% do objetivo total.`);
    } else {
      sacrifices.push(`Pequeno impacto absorvível na meta "${primaryGoal.title}".`);
    }
  } else {
    sacrifices.push('Sem metas ativas declaradas no momento.');
  }

  impactScore = Math.min(Math.max(impactScore, 5), 98);

  const verdict: 'sim' | 'nao' = linearProgramming.viable && impactScore < 60 ? 'sim' : 'nao';

  let justification = '';
  if (verdict === 'sim') {
    justification = `Gasto aprovado. A despesa de R$ ${proposal.amount.toFixed(2)} é financeiramente sustentável, respeita os limites da fonte ${proposal.wallet} e mantém as metas orçamentárias sob controle.`;
  } else {
    justification = `Gasto não recomendado. ${issues.join(' ')}`;
  }

  const tradeOff = sacrifices.join(' ') || 'Necessário postergar aportes de economia em favor deste consumo.';

  return {
    verdict,
    impactScore,
    justification,
    tradeOff,
    engineUsed: 'local_heuristics',
  };
}

/**
 * Chamada para API de SLM (Gemini Flash) com fallback instantâneo para o motor heurístico local
 */
export async function evaluateSLM(input: SLMInput): Promise<SLMResult> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return evaluateLocalSLMHeuristics(input);
  }

  try {
    const prompt = `Você é um analista financeiro estrito com papel de SLM de decisão rápida e direta.
Analise a seguinte proposta de gasto com base no contexto matemático, estatístico e metas do usuário:

Contexto JSON:
${JSON.stringify(
  {
    proposta: input.proposal,
    viabilidade_matematica: {
      viavel: input.linearProgramming.viable,
      violacoes: input.linearProgramming.violations,
      saldo_restante_fonte: input.linearProgramming.remainingWalletBalance,
      margem_categoria: input.linearProgramming.categoryRemainingMargin,
    },
    estatistica_anomalia: {
      z_score: input.anomalyDetection.zScore,
      risco: input.anomalyDetection.risk,
      media_categoria: input.anomalyDetection.mean,
    },
    metas_usuario: input.goals.map((g) => ({
      titulo: g.title,
      alvo: g.targetAmount,
      atual: g.currentAmount,
      meta_mensal: g.monthlyTarget,
    })),
  },
  null,
  2
)}

Responda ESTRITAMENTE em formato JSON com o seguinte formato:
{
  "veredito": "sim" ou "nao",
  "score_impacto": número de 0 a 100 indicando o impacto negativo/risco,
  "justificativa": "frase direta e concisa explicando o motivo da decisão",
  "trade_off": "o que o usuário terá que sacrificar ou postergar caso execute esse gasto"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            response_mime_type: 'application/json',
            temperature: 0.1,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Resposta vazia da API');
    }

    const parsed: SLMPayloadResponse = JSON.parse(text);

    return {
      verdict: parsed.veredito === 'sim' ? 'sim' : 'nao',
      impactScore: Number(parsed.score_impacto) || 50,
      justification: parsed.justificativa,
      tradeOff: parsed.trade_off,
      engineUsed: 'gemini_slm',
    };
  } catch (error) {
    console.warn('Fallback ativado para SLM Local Heuristics:', error);
    return evaluateLocalSLMHeuristics(input);
  }
}
