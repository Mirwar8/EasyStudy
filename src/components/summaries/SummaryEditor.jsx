import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { FiSave, FiX, FiZap, FiEdit3, FiEye } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function SummaryEditor({ 
  initialData = { title: "", content: "" }, 
  onSave, 
  onClose, 
  onGenerateAI,
  isGenerating = false 
}) {
  const [title, setTitle] = useState(initialData.title);
  const [content, setContent] = useState(initialData.content);
  const [viewMode, setViewMode] = useState("edit"); // edit | preview
  const [aiInput, setAiInput] = useState("");
  const [showAiInput, setShowAiInput] = useState(false);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    onSave({ title, content });
  };

  const handleAiGenerate = async () => {
    if (!aiInput.trim()) return;
    try {
      const response = await onGenerateAI(aiInput);
      // Extraemos solo el texto del resumen del objeto de respuesta { summary: "..." }
      if (response && response.summary) {
        setContent(response.summary);
        setShowAiInput(false);
        setViewMode("preview");
      } else {
        alert("La IA no devolvió un formato válido de resumen.");
      }
    } catch (error) {
      console.error("Error generating AI summary:", error);
      alert("Error al generar el resumen: " + (error.message || "Error desconocido"));
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[90vh] rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <header className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex-1 mr-4">
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del resumen..."
              className="text-xl font-black bg-transparent border-none outline-none w-full placeholder:text-slate-300"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex">
              <button 
                onClick={() => setViewMode("edit")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'edit' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500'}`}
              >
                <FiEdit3 /> Editar
              </button>
              <button 
                onClick={() => setViewMode("preview")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'preview' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500'}`}
              >
                <FiEye /> Vista Previa
              </button>
            </div>
            
            <button 
              onClick={() => setShowAiInput(!showAiInput)}
              className={`size-9 rounded-xl flex items-center justify-center transition-colors ${showAiInput ? 'bg-indigo-500 text-white' : 'bg-indigo-500/10 text-indigo-500'}`}
            >
              <FiZap />
            </button>
            
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm flex items-center gap-2"
            >
              <FiSave /> Guardar
            </button>
            
            <button onClick={onClose} className="size-9 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center">
              <FiX />
            </button>
          </div>
        </header>

        {/* AI Input Panel */}
        <AnimatePresence>
          {showAiInput && (
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-900/30"
            >
              <div className="p-6">
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">Generar resumen con IA</p>
                <div className="flex gap-3">
                  <textarea 
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Pega aquí tus apuntes, transcripciones o texto largo para que la IA lo resuma..."
                    className="flex-1 bg-white dark:bg-slate-800 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                  />
                  <button 
                    onClick={handleAiGenerate}
                    disabled={isGenerating || !aiInput.trim()}
                    className="self-end px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex flex-col items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <FiZap />
                        <span className="text-[10px]">Generar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white dark:bg-slate-900">
          <div className="max-w-prose mx-auto w-full h-full">
            {viewMode === "edit" ? (
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe tu resumen aquí (la IA se encargará del formato)..."
                className="w-full h-full bg-transparent border-none outline-none resize-none font-display text-lg leading-relaxed text-slate-700 dark:text-slate-200 placeholder:text-slate-300"
              />
            ) : (
              <div className="prose dark:prose-invert max-w-none prose-slate prose-headings:font-black prose-p:leading-relaxed prose-strong:text-primary">
                <ReactMarkdown>{content || "*No hay contenido aún*"}</ReactMarkdown>
              </div>
            )}
          </div>
        </main>
      </motion.div>
    </div>
  );
}
