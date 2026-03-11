import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDecks } from '../hooks/useDecks';
import { useCards } from '../hooks/useCards';
import FlashCardEditor from '../components/cards/FlashCardEditor';

export default function DeckDetailPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { decks } = useDecks();
  const { cards, isLoading, createCard, updateCard, deleteCard } = useCards(deckId);
  const [deck, setDeck] = useState(null);

  // Editor State
  const [showEditor, setShowEditor] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  useEffect(() => {
    // Solo redirigir si NO estamos cargando y efectivamente no se encontró el mazo
    if (!isLoading && decks.length > 0) {
      const found = decks.find(d => d._id === deckId);
      if (found) setDeck(found);
      else navigate('/decks');
    }
  }, [decks, deckId, navigate, isLoading]);

  const handleOpenEditor = (card = null) => {
    setEditingCard(card);
    setShowEditor(true);
  };

  const handleSaveCard = async (cardData) => {
    if (editingCard) {
      await updateCard({ id: editingCard._id, ...cardData });
    } else {
      await createCard(cardData);
    }
    setShowEditor(false);
    setEditingCard(null);
  };

  if (!deck || isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 animate-pulse">
        <div className="size-20 bg-slate-200 dark:bg-card-dark rounded-2xl mb-4"></div>
        <div className="h-6 w-48 bg-slate-200 dark:bg-card-dark rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header Sticky Blur */}
      <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-primary/10 px-4 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center justify-center p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-card-dark transition-colors"
            >
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">arrow_back</span>
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">EasyStudy</p>
              <h1 className="text-xl font-bold leading-tight line-clamp-1">{deck.title}</h1>
            </div>
          </div>
          <button className="flex items-center justify-center p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-card-dark">
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">more_vert</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto pb-24">
        {/* Chapters/Topics */}
        <div className="flex gap-2 p-4 overflow-x-auto items-center hide-scrollbar">
          <button className="shrink-0 px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/20">Todos</button>
          <button className="shrink-0 px-4 py-2 rounded-full bg-slate-200 dark:bg-card-dark text-slate-600 dark:text-slate-300 text-sm font-medium border border-transparent hover:border-primary/30 transition-all">Cap.1</button>
          <button className="shrink-0 px-4 py-2 rounded-full bg-slate-200 dark:bg-card-dark text-slate-600 dark:text-slate-300 text-sm font-medium border border-transparent hover:border-primary/30 transition-all">Cap.2</button>
          <button className="shrink-0 flex items-center gap-1 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20">
            <span className="material-symbols-outlined text-sm">add</span>Nuevo tema
          </button>
        </div>

        {/* Study Actions Grid */}
        <div className="grid grid-cols-1 gap-3 px-4 py-4">
          <Link 
            to={`/study/${deckId}`}
            className="flex items-center justify-between w-full h-16 px-6 bg-primary rounded-xl text-white font-bold text-lg shadow-xl shadow-primary/25 hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined">menu_book</span>
              <span>Estudiar</span>
            </div>
            <span className="material-symbols-outlined">chevron_right</span>
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <Link 
              to={`/quiz/${deckId}`}
              className="flex flex-col items-center justify-center h-24 bg-slate-200 dark:bg-card-dark rounded-xl border border-slate-300 dark:border-primary/10 hover:border-primary/50 transition-colors"
            >
              <span className="material-symbols-outlined text-primary mb-1">quiz</span>
              <span className="font-bold text-slate-900 dark:text-white">Quiz</span>
            </Link>
            <Link 
              to={`/summaries?deckId=${deckId}`}
              className="flex flex-col items-center justify-center h-24 bg-slate-200 dark:bg-card-dark rounded-xl border border-slate-300 dark:border-primary/10 hover:border-primary/50 transition-colors"
            >
              <span className="material-symbols-outlined text-primary mb-1">description</span>
              <span className="font-bold text-slate-900 dark:text-white">Resúmenes</span>
            </Link>
          </div>
        </div>

        {/* Card List */}
        <div className="mt-4 px-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Tarjetas del Mazo</h3>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{cards.length} tarjetas</span>
          </div>

          <div className="space-y-3">
            {cards.map((card, idx) => (
              <div 
                key={card._id} 
                className="p-4 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-primary/5 flex items-center justify-between group cursor-pointer hover:border-primary/40 transition-all font-display"
                onClick={() => handleOpenEditor(card)}
              >
                <div className="flex items-center gap-4">
                  <div className={`size-10 rounded-lg flex items-center justify-center font-display font-bold ${card.type === 'multiple' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-primary/10 text-primary'}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{card.front}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {card.type === 'multiple' ? 'Opción Múltiple' : 'Flashcard'} • Capítulo 1
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                   onClick={(e) => { e.stopPropagation(); if(window.confirm('¿Eliminar?')) deleteCard(card._id); }}
                   className="p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">edit</span>
                </div>
              </div>
            ))}
            
            {cards.length === 0 && (
              <div className="py-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-slate-500">No hay tarjetas en este mazo.</p>
                <button 
                  onClick={() => handleOpenEditor()}
                  className="text-primary font-bold mt-2"
                >
                  Crear mi primera tarjeta
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* FAB Button */}
      <button 
        onClick={() => handleOpenEditor()}
        className="fixed bottom-24 right-6 size-14 bg-primary rounded-full text-white shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-10"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <FlashCardEditor 
            card={editingCard}
            onSave={handleSaveCard}
            onClose={() => { setShowEditor(false); setEditingCard(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
