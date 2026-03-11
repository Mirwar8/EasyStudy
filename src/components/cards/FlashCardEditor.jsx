import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FlashCardEditor({ card, onSave, onClose, decks = [], initialDeckId = null }) {
  const [type, setType] = useState(card?.type || 'basic');
  const [front, setFront] = useState(card?.front || '');
  const [back, setBack] = useState(card?.back || '');
  const [options, setOptions] = useState(card?.options || ['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(card?.correctIndex ?? 0);
  const [selectedDeckId, setSelectedDeckId] = useState(initialDeckId);

  useEffect(() => {
    if (!selectedDeckId && !card && decks.length > 0) {
      setSelectedDeckId(decks[0]._id);
    }
  }, [decks, card, selectedDeckId]);

  const handleSave = () => {
    if (!front.trim()) return;
    if (!card && !selectedDeckId && decks.length > 0) return; // Need a deck for new cards

    const cardData = {
      type,
      front,
      deckId: selectedDeckId,
      ...(type === 'basic' 
        ? { back } 
        : { options, correctIndex: Number(correctIndex) }
      )
    };

    onSave(cardData);
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <motion.div 
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-white dark:bg-card-dark w-full max-w-lg rounded-[2.5rem] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800/50 max-h-[90vh] overflow-hidden"
      >
        <header className="p-6 pb-2 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {card ? 'Editar Tarjeta' : 'Nueva Tarjeta'}
          </h2>
          <button onClick={onClose} className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
          {/* Deck Selector (Solo si no viene de un deck específico y es nueva tarjeta) */}
          {!card && !initialDeckId && decks.length > 0 && (
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Seleccionar Mazo Destino</label>
              <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar snap-x">
                {decks.map((deck) => (
                  <button
                    key={deck._id}
                    type="button"
                    onClick={() => setSelectedDeckId(deck._id)}
                    className={`shrink-0 snap-start flex items-center gap-2 px-4 py-3 rounded-2xl transition-all border-2 ${
                      selectedDeckId === deck._id 
                        ? 'bg-primary/10 border-primary text-primary shadow-lg' 
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-lg">{deck.emoji || '📚'}</span>
                    <span className="text-xs font-bold whitespace-nowrap">{deck.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tipo de Tarjeta Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl shrink-0">
            <button 
              type="button"
              onClick={() => setType('basic')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${type === 'basic' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500'}`}
            >
              Básica
            </button>
            <button 
              type="button"
              onClick={() => setType('multiple')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${type === 'multiple' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500'}`}
            >
              Opción Múltiple
            </button>
          </div>

          {/* Pregunta común */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Pregunta / Enunciado</label>
            <textarea 
              autoFocus
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="¿Qué quieres aprender?"
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 outline-none focus:border-primary/50 transition-all resize-none text-lg font-bold placeholder:text-slate-300"
              rows="2"
            />
          </div>

          <AnimatePresence mode="wait">
            {type === 'basic' ? (
              <motion.div 
                key="basic"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 ml-1">Respuesta</label>
                <textarea 
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  placeholder="La respuesta correcta..."
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 outline-none focus:border-emerald-500/50 transition-all resize-none font-medium placeholder:text-slate-300"
                  rows="3"
                />
              </motion.div>
            ) : (
              <motion.div 
                key="multiple"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 ml-1">Opciones y Respuesta</label>
                <div className="grid grid-cols-1 gap-2">
                  {options.map((opt, i) => (
                    <div key={i} className="relative flex items-center">
                      <div className={`absolute left-3 size-7 rounded-lg flex items-center justify-center text-[10px] font-black ${correctIndex === i ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <input 
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(i, e.target.value)}
                        placeholder={`Opción ${String.fromCharCode(65 + i)}`}
                        className={`w-full pl-12 pr-10 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 rounded-2xl outline-none transition-all font-bold text-sm ${correctIndex === i ? 'border-emerald-500/30' : 'border-slate-100 dark:border-slate-800'}`}
                      />
                      <button 
                        type="button"
                        onClick={() => setCorrectIndex(i)}
                        className={`absolute right-3 size-7 rounded-full flex items-center justify-center transition-all ${correctIndex === i ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`}
                      >
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: correctIndex === i ? "'FILL' 1" : "" }}>
                          {correctIndex === i ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="p-6 border-t border-slate-100 dark:border-slate-800/50 shrink-0">
          <button 
            type="button"
            onClick={handleSave}
            disabled={!front.trim() || (!card && !selectedDeckId && decks.length > 0)}
            className="w-full h-14 bg-primary text-white rounded-2xl font-black text-base shadow-xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined">save</span>
            {card ? 'Guardar Cambios' : 'Crear Tarjeta'}
          </button>
        </footer>
      </motion.div>
    </div>
  );
}
