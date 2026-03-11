import { useParams, useNavigate } from 'react-router-dom';
import { useSummary } from '../hooks/useSummaries';
import ReactMarkdown from 'react-markdown';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function SummaryReader() {
  const { summaryId } = useParams();
  const navigate = useNavigate();
  const { summary, isLoading } = useSummary(summaryId);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="size-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-black tracking-tighter animate-pulse">ABRIENDO RESUMEN...</p>
      </div>
    );
  }

  if (!summary) return (
    <div className="h-screen flex flex-col items-center justify-center p-8 text-center bg-background-light dark:bg-background-dark">
      <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">search_off</span>
      <h2 className="text-2xl font-black mb-2">Resumen extraviado</h2>
      <button onClick={() => navigate(-1)} className="text-primary font-black uppercase text-sm tracking-widest mt-4">Volver al inicio</button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background-dark">
      {/* Navigation & Progress */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-background-dark/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800/50">
        <motion.div 
          className="h-1 bg-primary origin-left w-full absolute top-0" 
          style={{ scaleX }}
        />
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-all active:scale-90"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex-1 text-center px-4">
            <h1 className="text-[10px] font-black uppercase tracking-widest text-primary line-clamp-1">Lector de Inteligencia</h1>
          </div>
          <button className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-amber-500 transition-all active:scale-90">
            <span className="material-symbols-outlined">bookmark</span>
          </button>
        </div>
      </header>

      {/* Hero Section Premium */}
      <div className="bg-white dark:bg-card-dark px-6 py-12 border-b border-slate-100 dark:border-slate-800/50">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
             <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">Generado con Gemini</span>
             <span className="size-1.5 rounded-full bg-slate-200 dark:bg-slate-800"></span>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(summary.createdAt).toLocaleDateString()}</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-tight mb-8 tracking-tighter">
            {summary.title}
          </h1>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                   <span className="material-symbols-outlined text-base">timer</span>
                </div>
                <span className="text-xs font-bold text-slate-500">3 min</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                   <span className="material-symbols-outlined text-base">menu_book</span>
                </div>
                <span className="text-xs font-bold text-slate-500">{summary.content.split(' ').length} palabras</span>
             </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <main className="max-w-2xl mx-auto px-6 py-12 pb-40">
        <article className="prose prose-slate dark:prose-invert prose-lg max-w-none 
          prose-headings:text-slate-900 dark:prose-headings:text-white
          prose-headings:font-black prose-headings:tracking-tighter 
          prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:font-medium
          prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-black
          prose-pre:bg-slate-900 dark:prose-pre:bg-slate-800 prose-pre:rounded-[2rem] prose-pre:p-8
        ">
          <ReactMarkdown>{summary.content}</ReactMarkdown>
        </article>
      </main>

      {/* Bottom Floating Bar */}
      <div className="fixed bottom-8 left-6 right-6 z-40">
          <div className="max-w-2xl mx-auto bg-slate-900/95 dark:bg-white/95 backdrop-blur-xl p-3 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 dark:border-slate-200/50 flex items-center justify-between">
            <div className="flex items-center gap-1">
                <button className="size-12 flex items-center justify-center text-white dark:text-slate-900 hover:bg-white/10 dark:hover:bg-black/5 rounded-2xl transition-all">
                  <span className="material-symbols-outlined">text_increase</span>
                </button>
                <button className="size-12 flex items-center justify-center text-white dark:text-slate-900 hover:bg-white/10 dark:hover:bg-black/5 rounded-2xl transition-all">
                  <span className="material-symbols-outlined">translate</span>
                </button>
            </div>
            
            <button className="flex-1 mx-4 h-12 bg-primary dark:bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2">
               <span className="material-symbols-outlined text-lg">edit_square</span>
               Anotar Algo
            </button>

            <button className="size-12 flex items-center justify-center text-white dark:text-slate-900 hover:bg-white/10 dark:hover:bg-black/5 rounded-2xl transition-all">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
      </div>
    </div>
  );
}
