import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSummaries } from '../hooks/useSummaries';
import { useDecks } from '../hooks/useDecks';
import SummaryAIModal from '../components/summaries/SummaryAIModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function SummariesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deckId = searchParams.get('deckId');
  const { summaries, isLoading, deleteSummary } = useSummaries(deckId);
  const { decks } = useDecks();
  const [showAIModal, setShowAIModal] = useState(false);

  const deck = decks.find(d => d._id === deckId);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header Sticky */}
      <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-primary/10 px-4 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center justify-center p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-card-dark transition-colors"
            >
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">arrow_back</span>
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">EasyStudy</p>
              <h1 className="text-xl font-bold leading-tight">Mis Resúmenes</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto p-4 pb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">{deck?.title || 'Todos los Mazos'}</h2>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{summaries.length} Resúmenes</p>
          </div>
          <button 
            onClick={() => setShowAIModal(true)}
            className="size-14 bg-indigo-500 text-white rounded-2xl shadow-xl shadow-indigo-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-3xl">auto_awesome</span>
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-slate-200 dark:bg-card-dark rounded-3xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {summaries.map((summary) => (
              <motion.div 
                key={summary._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-card-dark rounded-[2rem] p-6 border border-slate-200 dark:border-primary/5 flex items-center justify-between group cursor-pointer hover:border-indigo-500/30 transition-all"
                onClick={() => navigate(`/summaries/${summary._id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <span className="material-symbols-outlined text-3xl">description</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight line-clamp-1">{summary.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(summary.createdAt).toLocaleDateString()} • {summary.content.split(' ').length} palabras
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); if(confirm('¿Eliminar?')) deleteSummary(summary._id); }}
                    className="p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-indigo-500 transition-colors">chevron_right</span>
                </div>
              </motion.div>
            ))}

            {summaries.length === 0 && (
              <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">auto_stories</span>
                <p className="text-slate-500 font-medium px-8">Aún no tienes resúmenes para este mazo. ¡Usa la IA para crear uno!</p>
                <button 
                  onClick={() => setShowAIModal(true)}
                  className="mt-6 text-indigo-500 font-black text-lg"
                >
                  Generar mi primer resumen
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <AnimatePresence>
        {showAIModal && (
          <SummaryAIModal 
            deckId={deckId} 
            onClose={() => setShowAIModal(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
