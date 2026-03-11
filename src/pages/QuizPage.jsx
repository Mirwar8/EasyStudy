import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCards } from "../hooks/useCards";
import { useDecks } from "../hooks/useDecks";
import { useQuiz } from "../hooks/useQuiz";
import { useStats } from "../hooks/useStats";

export default function QuizPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { decks } = useDecks();
  const { cards, isLoading } = useCards(deckId);
  
  const {
    currentCard,
    currentIndex,
    totalQuestions,
    isFinished,
    nextQuestion,
    resetQuiz,
    stats,
    progress,
  } = useQuiz(cards || []);

  const { saveStat } = useStats();
  const [hasSaved, setHasSaved] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (!isFinished && !isLoading) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isFinished, isLoading]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isFinished && !hasSaved && deckId) {
      saveStat({
        deckId,
        score: stats.score,
        totalCards: totalQuestions,
        timeSpent: timer,
      }).catch(console.error);
      setHasSaved(true);
    }
  }, [isFinished, hasSaved, stats, deckId, totalQuestions, saveStat, timer]);

  if (!deckId) return <div className="p-6 text-center">Error: No se proporcionó un ID de mazo.</div>;

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="relative size-20">
             <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 font-black tracking-tighter text-primary animate-pulse">CARGANDO DESAFÍO</p>
      </div>
    );
  }

  const deck = decks.find((d) => d._id === deckId);
  if (!deck) return <div className="p-6 text-center">Mazo no encontrado o no disponible.</div>;

  if (!cards || cards.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center p-8 bg-background-light dark:bg-background-dark">
        <div className="size-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 shadow-inner">
           <span className="material-symbols-outlined text-5xl text-primary">layers_clear</span>
        </div>
        <h2 className="text-3xl font-black mb-3">Mazo Vacío</h2>
        <p className="text-slate-500 mb-10 max-w-xs font-medium">No hay tarjetas para evaluar en este momento.</p>
        <button
          onClick={() => navigate(`/decks/${deckId}`)}
          className="w-full max-w-xs h-16 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/30 active:scale-95 transition-all"
        >
          Volver al mazo
        </button>
      </div>
    );
  }

  const handleConfirm = () => {
    if (currentCard?.options?.length > 0) {
      if (selectedOption === null) return;
      setShowResult(true);
    } else {
      setIsFlipped(true);
      setShowResult(true);
    }
  };

  const handleNext = (selfAssessedCorrect = null) => {
    let isCorrect;
    if (currentCard?.options?.length > 0) {
      isCorrect = selectedOption === (currentCard?.correctIndex ?? 0);
    } else {
      isCorrect = selfAssessedCorrect;
    }
    
    setSelectedOption(null);
    setShowResult(false);
    setIsFlipped(false);
    nextQuestion(isCorrect);
  };

  if (isFinished) {
    const grade = stats.score >= 90 ? 'A+' : stats.score >= 80 ? 'B' : stats.score >= 60 ? 'C' : 'D';
    const msg = stats.score >= 80 ? '¡Muy Bueno!' : stats.score >= 60 ? 'Pasable' : 'Necesitas repasar';

    return (
      <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark">
        <header className="flex items-center justify-between p-6 shrink-0">
          <button onClick={() => navigate(`/decks/${deckId}`)} className="size-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl group active:scale-90 transition-all">
            <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">arrow_back</span>
          </button>
          <div className="text-center">
            <h1 className="text-base font-black uppercase tracking-widest text-primary">Evaluación</h1>
            <p className="text-[10px] font-bold text-slate-400">Finalizada</p>
          </div>
          <div className="size-12"></div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 pb-32">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-4 p-8 rounded-[2.5rem] bg-gradient-to-br from-primary to-indigo-600 text-white relative overflow-hidden shadow-2xl shadow-primary/20"
          >
            <div className="relative z-10 flex flex-col items-center py-6 text-center">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black border border-white/30 uppercase tracking-widest">{grade}</span>
                <span className="text-sm font-black opacity-90">{msg}</span>
              </div>
              <div className="text-8xl font-black tracking-tighter mb-2">{stats.score}</div>
              <div className="text-lg opacity-60 font-black tracking-tighter">PUNTUACIÓN TOTAL</div>
            </div>
            <div className="absolute -right-12 -bottom-12 size-48 bg-white/10 rounded-full blur-3xl"></div>
          </motion.div>

          <div className="mt-8 flex items-center justify-between bg-white dark:bg-slate-800/20 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800/50">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Resultado de</p>
              <h2 className="text-xl font-black text-slate-900 dark:text-white line-clamp-1">{deck.title}</h2>
            </div>
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl">
              {deck.emoji || '📚'}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white dark:bg-slate-800/40 p-5 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 text-center shadow-sm">
              <span className="material-symbols-outlined text-emerald-500 mb-2">check_circle</span>
              <p className="text-2xl font-black">{Math.round((stats.score / 100) * totalQuestions)}</p>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Éxitos</p>
            </div>
            <div className="bg-white dark:bg-slate-800/40 p-5 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 text-center shadow-sm">
              <span className="material-symbols-outlined text-rose-500 mb-2">cancel</span>
              <p className="text-2xl font-black">{totalQuestions - Math.round((stats.score / 100) * totalQuestions)}</p>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Fallos</p>
            </div>
            <div className="bg-white dark:bg-slate-800/40 p-5 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 text-center shadow-sm">
              <span className="material-symbols-outlined text-amber-500 mb-2">timer</span>
              <p className="text-2xl font-black">{formatTime(timer).split(':')[0]}m</p>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Tiempo</p>
            </div>
          </div>
        </main>

        <footer className="p-6 pt-0 bg-background-light dark:bg-background-dark shrink-0">
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate(0)} className="w-full h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 transition-all">
              <span className="material-symbols-outlined">refresh</span> REPETIR QUIZ
            </button>
            <button onClick={() => navigate("/")} className="w-full h-14 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black rounded-2xl active:scale-95 transition-all uppercase text-xs tracking-widest">
               Volver al Inicio
            </button>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Header Quiz Flotante */}
      <header className="flex items-center p-6 justify-between shrink-0">
        <button onClick={() => navigate(`/decks/${deckId}`)} className="size-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-slate-400 shadow-sm border border-slate-100 dark:border-slate-800 group active:scale-90 transition-all">
          <span className="material-symbols-outlined group-hover:text-rose-500 transition-colors">close</span>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Pregunta {currentIndex + 1}/{totalQuestions}</h2>
          <div className="flex items-center gap-1.5 mt-1 text-primary">
            <span className="material-symbols-outlined text-[14px]">timer</span>
            <p className="text-xs font-black tracking-tighter">{formatTime(timer)}</p>
          </div>
        </div>
        <div className="size-12"></div>
      </header>

      {/* Progress Bar Minimalista */}
      <div className="px-8 mb-4 shrink-0">
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-primary rounded-full transition-all shadow-[0_0_10px_rgba(108,99,255,0.5)]" 
          />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Question Card */}
          <div className="perspective-1000">
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative w-full min-h-[250px]"
            >
              {/* Front Side */}
              <div 
                className="absolute inset-0 w-full h-full bg-white dark:bg-card-dark rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800/50 flex flex-col items-center justify-center text-center"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-primary/20"></div>
                <h1 className="text-slate-900 dark:text-white text-2xl font-black leading-tight">
                  {currentCard?.front}
                </h1>
                <div className="mt-8 flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="material-symbols-outlined text-primary text-xl">help_outline</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none">
                    {currentCard?.options?.length > 0 ? "Selecciona la correcta" : "Tarjeta Básica - Voltea para ver"}
                  </p>
                </div>
              </div>

              {/* Back Side (Only for Basic cards) */}
              <div 
                className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary to-indigo-600 rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center justify-center text-center text-white"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <p className="text-xl font-bold leading-relaxed">{currentCard?.back}</p>
                <div className="mt-6 flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full">
                   <span className="material-symbols-outlined text-xs">visibility</span>
                   <span className="text-[10px] font-black uppercase tracking-widest">Respuesta</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Options Grid */}
          <div className="flex flex-col gap-3 pb-8">
            {currentCard?.options?.length > 0 ? (
              currentCard.options.map((option, idx) => {
                const letters = ['A', 'B', 'C', 'D'];
                const isSelected = selectedOption === idx;
                const isCorrectTarget = idx === currentCard.correctIndex;
                
                let style = "bg-white dark:bg-card-dark border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200";
                let icon = null;

                if (showResult) {
                  if (isCorrectTarget) {
                    style = "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 z-10 scale-[1.02] shadow-xl shadow-emerald-500/10";
                    icon = <span className="material-symbols-outlined ml-auto text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>;
                  } else if (isSelected) {
                    style = "bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 animate-shake";
                    icon = <span className="material-symbols-outlined ml-auto text-rose-500">cancel</span>;
                  } else {
                    style = "opacity-40 grayscale-[0.5]";
                  }
                } else if (isSelected) {
                  style = "bg-primary/5 border-primary text-primary shadow-lg scale-[1.01] z-10";
                  icon = <span className="material-symbols-outlined ml-auto text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>;
                }

                return (
                  <button
                    key={idx}
                    disabled={showResult}
                    onClick={() => setSelectedOption(idx)}
                    className={`group flex items-center gap-4 w-full p-5 rounded-3xl border-2 transition-all duration-300 ${style}`}
                  >
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-black transition-all ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-primary'}`}>
                      {letters[idx]}
                    </div>
                    <span className="text-base font-bold text-left flex-1 leading-tight">{option}</span>
                    {icon}
                  </button>
                );
              })
            ) : (
              <div className="py-12 px-8 bg-slate-100/50 dark:bg-slate-800/20 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                 <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">auto_awesome_motion</span>
                 <p className="text-sm font-bold text-slate-500 dark:text-slate-400 italic">Esta tarjeta es básica, intenta recordarla antes de continuar.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Action Bar */}
      <footer className="p-6 shrink-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800/50">
        <div className="max-w-2xl mx-auto">
          {currentCard?.options?.length > 0 ? (
            !showResult ? (
              <button 
                disabled={selectedOption === null}
                onClick={handleConfirm}
                className="flex w-full items-center justify-center rounded-2xl h-16 bg-primary text-white text-lg font-black shadow-2xl shadow-primary/40 disabled:opacity-50 active:scale-95 transition-all gap-2"
              >
                CONFIRMAR RESPUESTA <span className="material-symbols-outlined">chevron_right</span>
              </button>
            ) : (
              <button 
                onClick={() => handleNext()}
                className="flex w-full items-center justify-center rounded-2xl h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-lg font-black shadow-2xl active:scale-95 transition-all gap-2"
              >
                CONTINUAR PRUEBA <span className="material-symbols-outlined text-2xl">arrow_forward</span>
              </button>
            )
          ) : (
            !showResult ? (
              <button 
                onClick={handleConfirm}
                className="flex w-full items-center justify-center rounded-2xl h-16 bg-primary text-white text-lg font-black shadow-2xl shadow-primary/40 active:scale-95 transition-all gap-2"
              >
                VER RESPUESTA <span className="material-symbols-outlined">visibility</span>
              </button>
            ) : (
              <div className="flex gap-4">
                <button 
                  onClick={() => handleNext(false)}
                  className="flex-1 flex flex-col items-center justify-center rounded-2xl h-16 bg-rose-500 text-white font-black shadow-lg active:scale-95 transition-all"
                >
                  <span className="text-[10px] font-black tracking-widest leading-none mb-1">REPASAR</span>
                  NO LA SABÍA
                </button>
                <button 
                  onClick={() => handleNext(true)}
                  className="flex-1 flex flex-col items-center justify-center rounded-2xl h-16 bg-emerald-500 text-white font-black shadow-lg active:scale-95 transition-all"
                >
                  <span className="text-[10px] font-black tracking-widest leading-none mb-1">PERFECTO</span>
                  DOMINADA
                </button>
              </div>
            )
          )}
        </div>
      </footer>
    </div>
  );
}
