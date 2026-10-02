'use client';

import React, { useState } from 'react';
import { AuthProvider } from '@/lib/firebase/authContext';
import { FinanceProvider } from '@/context/FinanceContext';
import { Header } from '@/components/Header';
import { WalletSummaryCards } from '@/components/WalletSummaryCards';
import { ChartsSection } from '@/components/ChartsSection';
import { GoalsSection } from '@/components/GoalsSection';
import { TransactionList } from '@/components/TransactionList';
import { TransactionModal } from '@/components/TransactionModal';
import { ProposalModal } from '@/components/ProposalModal';
import { PDFImportModal } from '@/components/PDFImportModal';

function DashboardContent() {
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0f17] text-gray-100 flex flex-col">
      <Header
        onOpenProposalModal={() => setIsProposalModalOpen(true)}
        onOpenPDFModal={() => setIsPDFModalOpen(true)}
        onOpenTransactionModal={() => setIsTransactionModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Bolsões de Saldo Segregados & Métricas Mensais */}
        <section>
          <WalletSummaryCards />
        </section>

        {/* Gráficos Interativos (Despesas por Categoria & Fluxo por Bolsão) */}
        <section>
          <ChartsSection />
        </section>

        {/* Metas Financeiras (Pesquisa Operacional) */}
        <section>
          <GoalsSection />
        </section>

        {/* Extrato de Transações com Filtros Avançados */}
        <section>
          <TransactionList />
        </section>
      </main>

      {/* Rodapé Informativo */}
      <footer className="border-t border-gray-800/80 py-6 text-center text-xs text-gray-500 bg-[#0d131f]/50">
        <p>
          Gestão Financeira Inteligente — Segregação de Bolsões • Pesquisa Operacional • Detecção de Anomalias • SLM JSON
        </p>
        <p className="mt-1 text-[11px] text-gray-600">
          Privacidade total: Em modo convidado, nenhum dado financeiro sai da memória da sua sessão.
        </p>
      </footer>

      {/* Modais do Sistema */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
      />
      <ProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
      />
      <PDFImportModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <DashboardContent />
      </FinanceProvider>
    </AuthProvider>
  );
}
