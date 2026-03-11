import { useState, useCallback, useEffect } from 'react';
import { useCards } from '../../hooks/useCards';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

export default function AIGenerator({ decks = [], initialDeckId = null, onClose }) {
  const [selectedDeckId, setSelectedDeckId] = useState(initialDeckId);
  const { generateCardsAI, isGeneratingAI, createCard } = useCards(selectedDeckId);
  const addToast = useAppStore(state => state.addToast);
  
  const [text, setText] = useState('');
  const [count, setCount] = useState(10);
  
  // Fases: 'input' -> 'generating' -> 'preview'
  const [phase, setPhase] = useState('input');
  const [generatedCards, setGeneratedCards] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!selectedDeckId && decks.length > 0) {
      setSelectedDeckId(decks[0]._id);
    }
  }, [decks, selectedDeckId]);

  // Dropzone setup
  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setText(reader.result);
        addToast('Documento leído con éxito', 'success');
      };
      reader.readAsText(file);
    }
  }, [addToast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'text/plain': ['.txt'], 'text/markdown': ['.md'] }
  });

  const handleGenerate = async () => {
    if (!text || text.trim().length < 20) {
      return addToast('Ingresa al menos 20 caracteres de apuntes', 'error');
    }
    if (!selectedDeckId) {
      return addToast('Selecciona un mazo destino', 'error');
    }
    
    setPhase('generating');
    try {
      const response = await generateCardsAI({ text, count });
      if (response && response.cards) {
        setGeneratedCards(response.cards);
        setPhase('preview');
        addToast('Tarjetas generadas con éxito', 'success');
      } else {
        throw new Error("No se devolvieron tarjetas válidas");
      }
    } catch (error) {
      console.error(error);
      addToast(`Error AI: ${error.message}`, 'error');
      setPhase('input');
    }
  };

  const handleRemoveCard = (index) => {
    setGeneratedCards(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
        const promises = generatedCards.map(card => 
          createCard({
            front: card.front,
            back: card.back,
            type: card.type || 'basic',
            options: card.options || [],
            correctIndex: card.correctIndex !== undefined ? card.correctIndex : null,
            deckId: selectedDeckId
          })
        );
        await Promise.all(promises);
        addToast(`${generatedCards.length} tarjetas guardadas`, 'success');
        onClose();
    } catch(e) {
      console.error(e);
      addToast('Error al guardar algunas tarjetas', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <motion.div 
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-white dark:bg-card-dark w-full max-w-2xl rounded-[2.5rem] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800/50 max-h-[90vh] overflow-hidden"
      >
        <header className="p-8 pb-4 shrink-0 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <span className="material-symbols-outlined text-3xl">auto_awesome</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Generador IA</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Gemini Intelligence</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isSaving || isGeneratingAI} className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {phase === 'input' && (
            <div className="space-y-8 pb-4">
              {/* Deck Selector Nativo */}
              {!initialDeckId && decks.length > 0 && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Seleccionar Mazo Destino</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar snap-x px-1">
                    {decks.map((deck) => (
                      <button
                        key={deck._id}
                        type="button"
                        onClick={() => setSelectedDeckId(deck._id)}
                        className={`shrink-0 snap-start flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border-2 ${
                          selectedDeckId === deck._id 
                            ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(108,99,255,0.1)]' 
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-500'
                        }`}
                      >
                        <span className="text-xl">{deck.emoji || '📚'}</span>
                        <span className="text-xs font-bold whitespace-nowrap">{deck.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-[2rem] p-10 text-center transition-all cursor-pointer ${isDragActive ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800 hover:border-primary/30 bg-slate-50/50 dark:bg-slate-800/20'}`}
              >
                <input {...getInputProps()} />
                <div className="size-16 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-primary">cloud_upload</span>
                </div>
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">Crea desde Documentos</h3>
                <p className="text-xs font-medium text-slate-400">Suelta o selecciona un archivo .txt</p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white dark:bg-card-dark px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">O Pega tus Notas</span>
                </div>
              </div>

              <div className="space-y-3">
                <textarea 
                  value={text} onChange={e => setText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 outline-none focus:border-primary/50 transition-all min-h-[160px] font-medium placeholder:text-slate-300 text-slate-700 dark:text-slate-200"
                  placeholder="Tu tema de estudio aquí..."
                />
              </div>
              
              <div className="flex items-center justify-between px-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Cantidad</span>
                <div className="flex gap-2">
                  {[5, 10, 20].map(n => (
                    <button 
                      key={n}
                      onClick={() => setCount(n)}
                      className={`size-10 rounded-xl font-black text-xs transition-all ${count === n ? 'bg-primary text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {phase === 'generating' && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-8">
              <div className="relative">
                <div className="size-32 bg-primary/20 rounded-full animate-ping absolute"></div>
                <div className="size-32 bg-primary/10 rounded-full animate-pulse absolute"></div>
                <div className="size-32 relative flex items-center justify-center bg-white dark:bg-slate-800 rounded-full shadow-2xl border border-primary/20">
                  <span className="material-symbols-outlined text-7xl text-primary animate-bounce">psychology</span>
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black">Escaneando conocimiento</h3>
                <p className="text-slate-500 font-bold max-w-[280px] leading-relaxed italic">"Extraer lo esencial requiere inteligencia, Gemini ya está en ello..."</p>
              </div>
            </div>
          )}

          {phase === 'preview' && (
            <div className="flex-1 flex flex-col gap-6">
              <div className="flex items-center justify-between bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl border border-emerald-500/20">
                <span className="text-sm font-black flex items-center gap-2">
                  <span className="material-symbols-outlined">check_circle</span>
                  ¡Misión Cumplida!
                </span>
                <span className="text-xs font-black px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full">{generatedCards.length} Tarjetas</span>
              </div>
              
              <div className="flex flex-col gap-4 pb-4">
                {generatedCards.map((card, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 relative transition-all hover:border-primary/30 group">
                    <button 
                      onClick={() => handleRemoveCard(idx)}
                      className="absolute top-4 right-4 size-8 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors bg-white dark:bg-slate-800 rounded-full shadow-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all"
                    >
                       <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                    
                    <div className="pr-10">
                      <p className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-4">{card.front}</p>
                      {card.type === 'basic' ? (
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                           <p className="text-sm text-slate-500 dark:text-slate-300 font-bold leading-relaxed">{card.back}</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2">
                          {card.options?.map((opt, i) => (
                            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl text-xs font-bold border ${i === card.correctIndex ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}>
                              <span className="size-5 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px]">{String.fromCharCode(65+i)}</span>
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <footer className="p-8 border-t border-slate-100 dark:border-slate-800/50 shrink-0">
          {phase === 'input' ? (
             <button 
              onClick={handleGenerate} 
              disabled={!text || text.length < 20 || !selectedDeckId}
              className="w-full h-16 bg-primary text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined">psychology</span>
              Iniciar Extracción
            </button>
          ) : phase === 'preview' ? (
            <div className="flex gap-4">
              <button 
                onClick={() => setPhase('input')} disabled={isSaving}
                className="flex-1 h-16 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-sm active:scale-[0.98] transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveAll} disabled={isSaving || generatedCards.length === 0}
                className="flex-[2] h-16 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="animate-pulse">Guardando...</span>
                ) : (
                  <>Finalizar Creación</>
                )}
              </button>
            </div>
          ) : null}
        </footer>
      </motion.div>
    </div>
  );
}
