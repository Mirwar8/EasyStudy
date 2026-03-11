import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSummaries } from '../../hooks/useSummaries';

export default function SummaryAIModal({ deckId, onClose }) {
  const { generateSummaryAI, createSummary, isGeneratingAI } = useSummaries(deckId);
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  
  // Fases: 'input' -> 'generating' -> 'preview'
  const [phase, setPhase] = useState('input');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async () => {
    if (!text || text.trim().length < 50) return alert('Por favor ingresa al menos 50 caracteres para un resumen de calidad.');
    
    setPhase('generating');
    try {
      const response = await generateSummaryAI({ text, title });
      if (response && response.summary) {
        setGeneratedContent(response.summary);
        setPhase('preview');
      } else {
        throw new Error("No se devolvió un resumen válido");
      }
    } catch (error) {
      console.error(error);
      alert(`Error con la IA: ${error.message}`);
      setPhase('input');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await createSummary({
        title: title || 'Resumen de ' + new Date().toLocaleDateString(),
        content: generatedContent
      });
      onClose();
    } catch(e) {
      console.error(e);
      alert('Error guardando el resumen.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="bg-white dark:bg-card-dark w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800/50 flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <span className="material-symbols-outlined text-3xl">auto_stories</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Generador de Resúmenes</h2>
          </div>
          <button onClick={onClose} className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {phase === 'input' && (
          <div className="space-y-6 overflow-y-auto pr-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 ml-1">Título del tema</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Mitosis y Meiosis..."
                className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 outline-none focus:border-indigo-500/50 transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 ml-1">Contenido / Apuntes</label>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Pega aquí todo el texto que quieras resumir..."
                className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 outline-none focus:border-indigo-500/50 transition-all resize-none font-medium h-64"
              />
            </div>
            <button 
              onClick={handleGenerate}
              disabled={isGeneratingAI}
              className="w-full h-16 bg-indigo-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
            >
              <span className="material-symbols-outlined">psychology</span>
              {isGeneratingAI ? 'Procesando con IA...' : 'Analizar y Resumir'}
            </button>
          </div>
        )}

        {phase === 'generating' && (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <div className="relative size-24 mb-8">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-indigo-500 animate-pulse">auto_awesome</span>
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 text-center">Creando tu resumen premium...</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center text-sm">Organizando conceptos y sintetizando ideas clave.</p>
          </div>
        )}

        {phase === 'preview' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 font-display">
              <div className="prose dark:prose-invert max-w-none">
                {generatedContent.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setPhase('input')}
                className="flex-1 h-14 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold active:scale-[0.98] transition-all"
              >
                Editar Entrada
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex-[2] h-14 bg-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined">bookmark_add</span>
                {isSaving ? 'Guardando...' : 'Guardar Resumen'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
