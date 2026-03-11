import { FiFileText, FiPlus, FiTrash2, FiEdit, FiChevronRight } from "react-icons/fi";
import { motion } from "framer-motion";

export default function SummaryList({ 
  summaries = [], 
  onAdd, 
  onEdit, 
  onDelete 
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <FiFileText className="text-primary" />
          Tus Resúmenes
        </h3>
        <button 
          onClick={onAdd}
          className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-transform active:scale-95"
        >
          <FiPlus /> Crear Nuevo
        </button>
      </div>

      {summaries.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-800/20 rounded-3xl p-10 border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
          <div className="size-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-4 text-2xl">
            <FiFileText />
          </div>
          <h4 className="font-bold text-slate-600 dark:text-slate-300">No hay resúmenes aún</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
            Crea un resumen de tus apuntes o pídele a la IA que lo genere por ti.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {summaries.map((summary) => (
            <motion.div 
              key={summary._id}
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between group hover:border-primary/50 transition-all cursor-pointer shadow-sm shadow-slate-200/50 dark:shadow-none"
              onClick={() => onEdit(summary)}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="size-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl">
                  <FiFileText />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-base group-hover:text-primary transition-colors">{summary.title}</h4>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">
                    Modificado: {new Date(summary.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(summary._id);
                  }}
                  className="size-9 bg-rose-500/10 text-rose-500 rounded-lg flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                >
                  <FiTrash2 />
                </button>
                <div className="size-9 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-lg flex items-center justify-center">
                  <FiChevronRight />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
