import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCards } from '../hooks/useCards';
import { motion, AnimatePresence } from 'framer-motion';
import FlashCard from '../components/cards/FlashCard';

export default function StudyPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { cards, isLoading } = useCards(deckId);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [learningCount, setLearningCount] = useState(0);

  const currentCard = cards?.[currentIndex];
  const progress = cards?.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

  const handleNext = (isKnown) => {
    if (isKnown) setKnownCount(prev => prev + 1);
    else setLearningCount(prev => prev + 1);

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Final del mazo
      alert('¡Has terminado de estudiar este mazo!');
      navigate(`/decks/${deckId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <div className="size-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-bold">Preparando tus tarjetas...</p>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">style</span>
        <h2 className="text-xl font-bold mb-2">Este mazo está vacío</h2>
        <button onClick={() => navigate(-1)} className="text-primary font-bold">Volver</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark min-h-screen">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-card-dark text-slate-500">
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Estudiando</p>
          <p className="text-xs font-bold text-slate-500">{currentIndex + 1} de {cards.length}</p>
        </div>
        <button className="size-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-card-dark text-slate-500">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </header>

      {/* Progress Bar */}
      <div className="px-6 h-1 w-full flex gap-1">
        <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card Container */}
      <main className="flex-1 p-6 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <FlashCard card={currentCard} />
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleNext(false)}
            className="h-20 bg-rose-500/10 border-2 border-rose-500/20 rounded-[2rem] flex flex-col items-center justify-center text-rose-600 dark:text-rose-400 font-black active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined mb-1">sentiment_dissatisfied</span>
            Aún no
          </button>
          <button 
            onClick={() => handleNext(true)}
            className="h-20 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-[2rem] flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 font-black active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined mb-1">sentiment_very_satisfied</span>
            Dominado
          </button>
        </div>
      </main>

      {/* Stats Summary Footer */}
      <footer className="p-6 flex justify-around border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-card-dark/50 backdrop-blur-sm">
        <div className="text-center">
          <p className="text-xl font-black text-emerald-500">{knownCount}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Sabidas</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-black text-rose-500">{learningCount}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Aprendiendo</p>
        </div>
      </footer>
    </div>
  );
}
