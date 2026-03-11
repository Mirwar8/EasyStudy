import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useDecks } from '../../hooks/useDecks';
import { useCards } from '../../hooks/useCards';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import FlashCardEditor from '../cards/FlashCardEditor';
import AIGenerator from '../cards/AIGenerator';
import { apiFetch } from '../../services/api';

export default function GlobalModals() {
  const { activeModal, closeModal, openModal, addToast } = useAppStore();
  const { decks, createDeck } = useDecks();
  const location = useLocation();
  
  // Extraer deckId de la URL si estamos en páginas específicas
  const pathParts = location.pathname.split('/');
  const currentDeckId = ['decks', 'quiz', 'study'].includes(pathParts[1]) ? pathParts[2] : null;

  // States
  const [deckTitle, setDeckTitle] = useState('');

  const handleCreateDeck = async () => {
    if (!deckTitle.trim()) return;
    try {
      await createDeck({ title: deckTitle });
      addToast('Mazo creado correctamente', 'success');
      setDeckTitle('');
      closeModal();
    } catch (e) {
      addToast('Error al crear el mazo', 'error');
    }
  };

  const handleFastCardSave = async (cardData) => {
    try {
      await apiFetch("/cards", {
        method: "POST",
        body: JSON.stringify(cardData),
      });
      addToast('Tarjeta guardada', 'success');
      closeModal();
    } catch (e) {
      console.error(e);
      addToast('Error al guardar la tarjeta', 'error');
    }
  };

  return (
    <AnimatePresence>
      {activeModal === 'fab' && (
        <FABMenu key="fab" onClose={closeModal} onAction={(action) => openModal(action)} />
      )}
      
      {activeModal === 'new-deck' && (
        <div key="new-deck" className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="bg-white dark:bg-card-dark w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800/50"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Nuevo Mazo</h2>
              <button onClick={closeModal} className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Nombre del Mazo</label>
                <input 
                  autoFocus
                  type="text"
                  value={deckTitle}
                  onChange={(e) => setDeckTitle(e.target.value)}
                  placeholder="Ej: Anatomía II, React Hooks..."
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 outline-none focus:border-primary/50 transition-all text-lg font-bold"
                />
              </div>
            </div>

            <div className="mt-10">
              <button 
                onClick={handleCreateDeck}
                className="w-full h-16 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined">add_circle</span>
                Crear Mazo
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {activeModal === 'fast-card' && (
        <FlashCardEditor 
          key="fast-card"
          decks={decks}
          initialDeckId={currentDeckId}
          onSave={handleFastCardSave}
          onClose={closeModal}
        />
      )}
      
      {activeModal === 'upload' && (
        <AIGenerator 
          key="upload"
          decks={decks}
          initialDeckId={currentDeckId}
          onClose={closeModal} 
        />
      )}
    </AnimatePresence>
  );
}

function FABMenu({ onClose, onAction }) {
  const actions = [
    { id: 'new-deck', icon: 'layers', label: 'Nuevo Mazo', color: 'bg-primary' },
    { id: 'fast-card', icon: 'bolt', label: 'Tarjeta Rápida', color: 'bg-amber-500' },
    { id: 'upload', icon: 'upload_file', label: 'Subir Documento', color: 'bg-indigo-500' },
  ];

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center px-4 pb-24 group">
      {/* Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      {/* Menu */}
      <motion.div 
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-[360px] bg-white dark:bg-card-dark rounded-3xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800/50"
      >
        <div className="grid grid-cols-1 gap-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              className="flex items-center gap-4 w-full p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all active:scale-[0.98]"
            >
              <div className={`size-12 rounded-xl ${action.color} flex items-center justify-center text-white shadow-lg`}>
                <span className="material-symbols-outlined text-2xl">{action.icon}</span>
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-200">{action.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
