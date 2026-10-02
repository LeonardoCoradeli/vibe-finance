import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0b0f17] text-white flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold text-emerald-400">Página não encontrada</h2>
      <p className="mt-2 text-sm text-gray-400">A página solicitada não existe ou foi movida.</p>
      <Link
        href="/"
        className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition"
      >
        Voltar para o Início
      </Link>
    </div>
  );
}
