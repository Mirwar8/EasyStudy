import { useState } from 'react';
import { motion } from 'framer-motion';

export default function FlashCard({ card, onEdit, onDelete }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Variante principal para girar
  const flipVariants = {
    front: { rotateY: 0 },
    back: { rotateY: 180 }
  };

  const handleFlip = (e) => {
    // Evitar girar si se hace clic en botones de acción
    if(e.target.closest('button')) return;
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className="relative w-full h-[300px] sm:h-[400px] cursor-pointer" 
      onClick={handleFlip}
      style={{ perspective: '1000px' }} // Vital para el efecto 3D
    >
      <motion.div
        className="w-full h-full relative"
        initial={false}
        animate={isFlipped ? 'back' : 'front'}
        variants={flipVariants}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* CARA FRONTAL (Pregunta) */}
        <div 
          className="absolute inset-0 w-full h-full bg-white dark:bg-card-dark rounded-3xl p-6 shadow-lg border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-lg">
              Pregunta
            </span>
            <div className="flex gap-2">
              <button onClick={() => onEdit(card)} className="text-slate-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
              <button onClick={() => onDelete(card._id)} className="text-slate-400 hover:text-error transition-colors">
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
              {card.front}
            </h3>
          </div>
          
          <div className="text-center text-xs text-slate-400">
            Toca para voltear
          </div>
        </div>

        {/* CARA TRASERA (Respuesta) */}
        <div 
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-6 shadow-xl flex flex-col justify-between text-white"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)' // La cara trasera inicia dada vuelta
          }}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-white/90 bg-white/20 px-3 py-1 rounded-lg">
              Respuesta
            </span>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-xl sm:text-2xl font-medium leading-relaxed">
              {card.back}
            </p>
          </div>
          
          <div className="text-center text-xs text-white/60">
            Toca para volver a la pregunta
          </div>
        </div>
      </motion.div>
    </div>
  );
}
