# Gestão Financeira Inteligente 💼⚡
> **Um projeto construído sob a filosofia do Vibe Coding com IA Pair Programming de alta precisão.**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.4-fbf0df?style=flat&logo=bun)](https://bun.sh/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-45ba4b?style=flat&logo=playwright)](https://playwright.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-ffca28?style=flat&logo=firebase)](https://firebase.google.com/)
[![CI](https://github.com/features/actions/badge.svg)](https://github.com/features/actions)

---

## 🧭 Sumário

1. [A Filosofia & Metodologia: Vibe Coding com IA](#-a-filosofia--metodologia-vibe-coding-com-ia)
2. [Habilidades do Agente (Agent Skills) & Ferramental](#-habilidades-do-agente-agent-skills--ferramental)
3. [A Jornada de Construção: Processo Passo a Passo](#-a-jornada-de-construção-processo-passo-a-passo)
4. [Visão Geral do Projeto & Arquitetura](#-visão-geral-do-projeto--arquitetura)
5. [Regras de Negócio Centrais](#-regras-de-negócio-centrais)
6. [Estratégia de Testes & Qualidade](#-estratégia-de-testes--qualidade)
7. [Como Executar o Projeto Localmente](#-como-executar-o-projeto-localmente)
8. [Integração Contínua (CI/CD no GitHub)](#-integração-contínua-cicd-no-github)

---

## 🎨 A Filosofia & Metodologia: Vibe Coding com IA

Este projeto não foi construído escrevendo manualmente cada tag HTML ou cada função de utilidade. Ele foi concebido, arquitetado e refinado sob o paradigma de **Vibe Coding com Engenharia Rigorosa**:

- **O Desenvolvedor como Arquiteto e Diretor de Orquestra**: O usuário fornece a visão de produto, regras fundamentais de domínio, restrições financeiras e feedback interativo de alto nível.
- **A IA como Agente de Execução Autônoma de Ponta a Ponta**: A IA é responsável por criar o scaffold, implementar a lógica matemática, configurar o bundler, resolver conflitos de compilação, estruturar a persistência e — o mais importante — **escrever e rodar a suíte completa de testes para provar que a aplicação funciona**.
- **O Loop Virtuoso de Confiança**:
  $$\text{Intenção} \longrightarrow \text{Plano Estruturado} \longrightarrow \text{Implementação em Branches} \longrightarrow \text{Validação por Testes Unitários/E2E} \longrightarrow \text{Feedback Visual}$$
- **Zero Alucinações**: Nenhuma funcionalidade é considerada concluída sem que um teste automatizado (Bun Test ou Playwright) comprove sua execução com saída verde (`pass`).

---

## 🤹 Habilidades do Agente (Agent Skills) & Ferramental

Durante as sessões de pair programming, foram acionadas competências e ferramentas especializadas do agente de IA:

| Habilidade / Skill | Finalidade no Projeto |
| :--- | :--- |
| **`hyperplan` & Planejamento Estruturado** | Criação prévia de um documento de plano formal (`plan_app_financeiro.md`) detalhando a arquitetura de bolsões, equações de pesquisa operacional e contratos de teste antes de gerar código. |
| **`grilling` / Alinhamento de Domínio** | Debate socrático sobre trade-offs críticos de engenharia (ex: migração para o **Bun** via `mise`, isolamento do **Zero State** por padrão e fallback offline do SLM). |
| **`git-commit-formatter`** | Aplicação estrita da convenção de **Conventional Commits** (`feat:`, `fix:`, `test:`, `merge:`), organizando o histórico em branches isoladas (`feat/*`, `develop`, `main`). |
| **`Playwright Browser Automation`** | Capacidade do agente de interagir diretamente com o navegador Chromium sem intervenção humana: abrir páginas, preencher modais, testar regras de validação e capturar screenshots. |
| **`Runtime Bun + Mise`** | Utilização do runtime **Bun 1.4+** para execução instantânea de suítes de testes unitários em **~170ms** e compilação otimizada. |

---

## 🛣️ A Jornada de Construção: Processo Passo a Passo

O desenvolvimento seguiu uma evolução incremental dividida em marcos técnicos:

### 1. Modelagem Matemática & Domínio Financeiro
- Formulação das regras de **segregação de fontes de recursos (bolsões)**: Saldo Livre, Benefício VR/VA e Reserva de Emergência.
- Implementação da regra matemática de **não-contaminação**: bloqueio algorítmico do uso de auxílio-alimentação em despesas de moradia, contas de consumo, saúde e investimentos.
- Criação do **Motor Triplo de Decisão de Propostas**:
  1. *Pesquisa Operacional (Programação Linear)*: cálculo exato de folga de liquidez, metas mensais e estouros orçamentários em centavos.
  2. *Detecção de Anomalias Estatísticas (Z-Score & IQR)*: identificação de gastos que ultrapassem $2.5\sigma$ da média histórica da categoria.
  3. *SLM com JSON Estruturado*: avaliação semântica retornando exclusivamente um schema determinístico com score de impacto (0 a 100).

### 2. Leitor Client-Side de Extratos em PDF
- Integração do motor `pdfjs-dist` rodando **100% no navegador do usuário**, preservando o sigilo de dados bancários.
- Dicionário heurístico de expressões regulares para autocategorização inteligente (ex: *iFood* ➔ Alimentação/VR; *Enel/Aluguel* ➔ Moradia/Livre).
- Modal interativo de conferência com seleção granular por checkboxes.

### 3. Superação Autônoma de Desafios Técnicos
Durante o processo de vibe coding, surgiram desafios reais de ambiente que o agente diagnosticou e resolveu:
- **Colisão de Cache de Chunks no Next.js (`./vendor-chunks/next.js`)**: Ocorrida na transição entre compilações de desenvolvimento e produção; resolvida com a criação da página customizada `not-found.tsx` e sanitização automática de cache no script de `dev`.
- **Compatibilidade ESM do Firebase no Webpack e Bun**: Ajuste explícito de aliases no `next.config.mjs` e `tsconfig.json` para direcionar a resolução aos módulos ESM puros do Firebase SDK.
- **Zero State e Modo Convidado Sem Contaminação**: Ajuste solicitado pelo usuário para que a aplicação sempre inicialize do zero absoluto (`R$ 0,00`), mantendo dados apenas em memória temporária durante a navegação como convidado.
- **Persistência Híbrida & Conta de QA Automática**: Criação de uma simulação local de nuvem que permite à equipe de QA salvar transações, recarregar a página (F5) mantendo a sessão via `sessionStorage`, e fazer logout retornando ao Zero State — tudo isso mesmo que as credenciais de produção do Firebase ainda não estejam ativas no console do Google.
- **Proteção por Timeout no Firestore (`Promise.race`)**: Diagnóstico de que a API do Firestore no projeto Google retornava permissão pendente, equipando o serviço com timeout defensivo de 6 segundos para jamais congelar a interface.

---

## 🏗️ Visão Geral do Projeto & Arquitetura

```
novo-app-financeiro/
├── .github/
│   └── workflows/
│       └── ci.yml               # Pipeline de CI/CD automatizada no GitHub Actions
├── artifacts/
│   └── screenshots/             # Evidências visuais geradas pelos robôs de teste
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Layout raiz com fontes e viewport
│   │   ├── page.tsx             # Dashboard financeiro principal
│   │   └── not-found.tsx        # Fallback de rota 404
│   ├── components/
│   │   ├── Header.tsx           # Navegação, seletor de mês e controle de nuvem/QA
│   │   ├── WalletCards.tsx      # Exibição dos 3 bolsões com segregação visual
│   │   ├── FinancialCharts.tsx  # Gráficos de barras e rosca (Recharts)
│   │   ├── TransactionList.tsx  # Extrato mensal com filtros e badges
│   │   ├── TransactionModal.tsx # Lançamento manual com regra de compatibilidade
│   │   ├── ProposalModal.tsx    # Simulador do Motor Triplo (PO, Stats, SLM)
│   │   └── PDFImportModal.tsx   # Importador client-side de PDF com conferência
│   ├── context/
│   │   └── FinanceContext.tsx   # Gerenciamento de estado, cálculos e persistência
│   ├── lib/
│   │   ├── engine/              # Motor Triplo (linearProgramming, anomaly, slm)
│   │   ├── firebase/            # Configuração, AuthContext e SyncService
│   │   ├── pdf/                 # Parser PDF.js e autocategorizador heurístico
│   │   └── formatters.ts        # Formatadores monetários em BRL (R$) e datas
│   └── types/
│       └── finance.ts           # Modelos de domínio, categorias e carteiras
├── tests/
│   ├── unit/                    # 17 testes unitários (Bun Test)
│   └── e2e/                     # 6 testes de ponta a ponta (Playwright)
├── scripts/
│   └── run-visual-validation.ts # Robô de automação visual Playwright
├── playwright.config.ts         # Configuração do Playwright com auto-start
└── .env.example                 # Guia de variáveis de ambiente
```

---

## 🍱 Regras de Negócio Centrais

### 1. Segregação Rígida de Bolsões (Wallets)
```
       ┌───────────────────────────────┐
       │      ENTRADAS MONETÁRIAS      │
       └──────────────┬────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌──────────────┐            ┌──────────────┐
│  Bolsão VR   │            │ Bolsão LIVRE │
└───────┬──────┘            └──────┬───────┘
        │                          │
        ├─► ✅ Alimentação         ├─► ✅ Qualquer categoria
        │                          ├─► ✅ Boletos e contas
        └─► ❌ Bloqueio estrito:   ├─► ✅ Lazer, viagens e saúde
            - Moradia e contas     └─► ✅ Metas e investimentos
            - Boletos e luz/água
            - Transporte e lazer
```

### 2. Motor Triplo de Proposta de Gasto
Antes de comprometer o orçamento com uma despesa extraordinária, o usuário submete o valor a três filtros em tempo real:
1. **Filtro Determinístico (PO)**: Verifica se há saldo suficiente no bolsão selecionado e se o teto orçamentário da categoria suporta o gasto sem comprometer a meta de poupança.
2. **Filtro Estatístico ($Z$-Score & $IQR$)**: Compara a compra com o desvio padrão histórico daquela categoria específica, alertando sobre risco de outlier financeiro.
3. **Filtro Semântico (SLM JSON)**: Analisa o impacto cognitivo do gasto com base nos objetivos do usuário e emite veredito (`"sim"` ou `"nao"`), score de 0 a 100 e trade-off claro.

---

## 🧪 Estratégia de Testes & Qualidade

A aplicação conta com uma pirâmide de testes totalmente automatizada:

```
           / \
          /   \     Testes Visuais (Screenshots Playwright)
         /-----\
        /  E2E  \   6 Cenários Playwright (Zero State, Bolsões, QA, Reload)
       /---------\
      / Unitários \  17 Testes com Bun Test (~170ms)
     /-------------\
```

### 1. Testes Unitários (`bun test`)
Cobrem as regras matemáticas puras, sem interface:
- **`wallets.test.ts`**: Valida o bloqueio estrito de VR para contas de consumo e liberação para alimentação.
- **`linearProgramming.test.ts`**: Valida a aprovação e reprovação de gastos com estouros matemáticos em reais.
- **`anomalyDetection.test.ts`**: Valida a classificação de risco por desvio padrão e limites interquartis.
- **`pdfCategorizer.test.ts`**: Valida expressões regulares de identificação bancária (iFood, Enel, Uber, Salário).
- **`firebaseSync.test.ts`**: Valida o comportamento seguro em ambiente sem chaves e a formatação do payload da Conta de QA.

### 2. Testes E2E com Playwright (`playwright test`)
Simulam um usuário real interagindo com a interface no Chromium:
- **`freshStart.spec.ts`**: Garante que o app abre com `R$ 0,00` e que aportes em Saldo Livre e VR não se misturam.
- **`walletRules.spec.ts`**: Tenta lançar despesas de contas usando VR e valida o travamento do formulário.
- **`proposalSimulation.spec.ts`**: Executa a simulação dos 3 motores e adiciona a compra ao extrato.
- **`authSync.spec.ts`**:
  - Testa login com a Conta de QA (`qa.tester@financas.app`);
  - Cadastra movimentação autenticado;
  - Testa sobrevivência da sessão e dados após recarregar a página (**F5 / `page.reload()`**);
  - Testa logout e confirma retorno ao **Modo Convidado** limpo;
  - Realiza login novamente e valida que **os dados salvos em nuvem são restaurados com fidelidade**.

---

## 💻 Como Executar o Projeto Localmente

### Pré-requisitos
- [Bun](https://bun.sh/) 1.1+ (ou Node.js 18+ com `npm`)
- Git

### 1. Clonar e Instalar
```bash
git clone <url-do-repositorio>
cd "Novo app financeiro"

# Instalar dependências ultra-rápido com o Bun:
bun install
```

### 2. Executar em Desenvolvimento
```bash
bun run dev
```
Abra [http://localhost:3000](http://localhost:3000) no seu navegador. O app iniciará no **Modo Convidado (Zero State)**.

### 3. Rodar os Testes Unitários
```bash
bun test
```

### 4. Rodar os Testes E2E (Playwright)
```bash
# Executa todos os 6 cenários de ponta a ponta com servidor automático:
npx playwright test
```

### 5. Executar Validação Visual com Captura de Telas
```bash
# Sobe o app e gera screenshots em ./artifacts/screenshots/:
bun run test:visual
```

---

## 🔄 Integração Contínua (CI/CD no GitHub)

O repositório já inclui uma esteira automatizada configurada em [`.github/workflows/ci.yml`](.github/workflows/ci.yml). 

A cada `git push` ou `Pull Request` enviado para as branches `main` ou `develop`:
1. Uma máquina Linux neutra no GitHub Actions é provisionada;
2. O ambiente **Bun** e as dependências são instalados;
3. Os **17 testes unitários** são executados;
4. O navegador Chromium headless do **Playwright** é instalado;
5. O build de produção do **Next.js** é compilado;
6. Todos os **testes E2E** são executados contra o build de produção;
7. Se houver qualquer falha, relatórios com capturas de tela são anexados automaticamente aos artefatos da Action.

---

## 📄 Licença

Distribuído sob a licença MIT. Consulte `LICENSE` para mais detalhes.
