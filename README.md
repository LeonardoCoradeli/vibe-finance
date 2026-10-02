# Gestão Financeira Inteligente 💼⚡

Aplicativo web moderno para controle financeiro inteligente, integrando segregação rigorosa de fontes de recursos (bolsões monetários), leitura client-side de extratos bancários em PDF e um **Motor Triplo de Avaliação de Propostas de Gastos** (Pesquisa Operacional, Detecção de Anomalias Estatísticas e SLM em JSON).

---

## 🚀 Principais Funcionalidades

### 1. 🛡️ Modo Convidado (Local-First, Zero Fricção)
- O aplicativo pode ser utilizado **imediatamente sem necessidade de cadastro ou login**.
- O estado reside em memória reativa de alta performance. Ao fechar a aba ou recarregar, nada fica salvo localmente por privacidade.
- Suporte opcional a **Sincronização na Nuvem** (Login com Google via Firebase Auth e persistência por UID no Cloud Firestore) para salvar e sincronizar quando o usuário desejar.

### 2. 🍱 Bolsões de Saldo (Wallets) & Regra de Não-Contaminação
Nem todo dinheiro na conta pode ser tratado da mesma forma. O app separa as entradas em:
- **`LIVRE`**: Dinheiro líquido não carimbado (salário, pix, rendimentos). Pode custear qualquer despesa.
- **`BENEFICIO_VR_VA`**: Vale Refeição / Alimentação.
  - **Regra de Bloqueio Estrito**: Não pode, sob hipótese alguma, pagar contas de consumo, boletos, aluguel, transporte ou lazer não alimentício.
  - **Prioridade**: É consumido automaticamente antes do dinheiro livre em compras de supermercado e restaurantes.
- **`RESERVA_EMERGENCIA`**: Fundo protegido para metas e imprevistos.

### 3. 📄 Leitor de Extrato em PDF (100% Client-Side)
- Importe o extrato em PDF gerado pelo seu banco diretamente no navegador.
- Processamento seguro sem enviar arquivos sensíveis para a nuvem.
- Reconhecimento automático de linhas, datas, valores e tipo (crédito/débito).
- Dicionário de autocategorização inteligente (ex: iFood ➔ Alimentação/VR; Enel/Condomínio ➔ Contas/Livre).
- Modal de conferência interativo com checkboxes antes da importação.

### 4. 🧠 Motor Triplo de Avaliação de Propostas de Gastos
Antes de realizar um gasto extraordinário (ex: comprar um produto ou fazer uma viagem), o usuário pode submeter uma **Proposta de Gasto**. O sistema submete a compra a três análises independentes:

1. **Pesquisa Operacional (Programação Linear)**:
   - Modela o orçamento como equações de restrições determinísticas:
     - $\text{SaldoDisponivel}(\text{Fonte}) - \text{Valor} \ge 0$
     - $\text{Gastos}(\text{Categoria}) + \text{Valor} \le \text{LimiteMensal}$
     - $(\text{SaldoLivreLíquido} - \text{Valor}) \ge \text{MetaPoupancaMes}$
   - Retorna viabilidade booleana estrita e o valor exato de qualquer estouro orçamentário.
2. **Detecção Estatística de Anomalias (Z-Score & IQR)**:
   - Analisa o histórico de gastos do usuário na categoria.
   - Calcula média ($\mu$), desvio padrão ($\sigma$) e amplitude interquartil ($IQR$).
   - Alerta sobre outliers atípicos ($Z \ge 2.5$).
3. **SLM Compacto (Veredito JSON Estruturado)**:
   - Interpreta o impacto semântico nas metas subjetivas do usuário (ex: "Poupar para viagem", "Evitar compras por impulso").
   - Retorna exclusivamente um schema JSON com veredito (`"sim"` ou `"nao"`), score de impacto (0-100) e trade-off claro, sem conversas desnecessárias de chat.
   - Funciona via API do Gemini ou através de motor heurístico local sem necessidade de internet.

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19 / 18, TypeScript)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Componentes & Ícones**: [Lucide React](https://lucide.dev/)
- **Visualização de Dados**: [Recharts](https://recharts.org/)
- **Parser de PDF**: [pdfjs-dist](https://mozilla.github.io/pdf.js/)
- **Autenticação & Banco (Opcional)**: Firebase Auth (Google Provider) & Cloud Firestore

---

## 📦 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+ (ou Node.js 20/22/26)
- Gerenciador de pacotes `npm` ou `yarn`

### Passo a passo
1. Clone o repositório ou navegue até o diretório:
   ```bash
   git clone <repo_url>
   cd "gestao-financeira"
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse no seu navegador:
   ```
   http://localhost:3000
   ```

---

## 🌳 Estrutura de Branches & Versionamento

O projeto segue as convenções de **Conventional Commits**:
- `main`: Branch de produção estável.
- `develop`: Branch de integração de desenvolvimento.
- `feat/*`: Ramificações de funcionalidades dedicadas.
