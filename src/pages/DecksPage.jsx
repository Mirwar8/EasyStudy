import { useNavigate, Link } from 'react-router-dom';
import { useDecks } from '../hooks/useDecks';
import { useAppStore } from '../store/useAppStore';

const COLORS = ['primary', 'secondary', 'success', 'warning', 'error'];
const EMOJIS = ['📚', '🧪', '🌍', '📐', '🧠', '💻', '🎨'];

export default function DecksPage() {
  const navigate = useNavigate();
  const { decks, isLoading, deleteDeck } = useDecks();
  const { openModal } = useAppStore();


  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if(window.confirm('¿Seguro que deseas eliminar este mazo?')) {
      await deleteDeck(id);
    }
  };

  return (
    <div className="p-6 pb-24 relative min-h-[100vh]">
      <header className="flex items-center justify-between pb-2 mb-6">
        <h1 className="text-2xl font-bold leading-tight tracking-tight">Mis Mazos</h1>
        <button 
          onClick={() => openModal('new-deck')}
          className="bg-primary/10 text-primary p-2 rounded-xl flex items-center gap-1 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span className="text-xs font-bold pr-1">Nuevo</span>
        </button>
      </header>

      {isLoading ? (
        <div className="flex flex-col gap-4 animate-pulse">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
          ))}
        </div>
      ) : decks.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center justify-center opacity-60">
          <span className="material-symbols-outlined text-6xl mb-4">auto_stories</span>
          <p className="text-lg font-bold">Sin Mazos</p>
          <p className="text-sm mt-1">Crea tu primer mazo de estudio</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {decks.map(deck => (
            <Link 
              key={deck._id} 
              to={`/decks/${deck._id}`}
              className="relative group bg-white dark:bg-card-dark rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:border-primary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`size-12 rounded-xl flex items-center justify-center text-2xl transition-colors
                  ${deck.color === 'primary' ? 'bg-primary/10 text-primary' : 
                    deck.color === 'secondary' ? 'bg-secondary/10 text-secondary' : 
                    deck.color === 'success' ? 'bg-success/10 text-success' : 
                    deck.color === 'warning' ? 'bg-warning/10 text-warning' : 
                    'bg-error/10 text-error'}`}
                >
                  {deck.emoji}
                </div>
                <div>
                  <h3 className="font-bold text-base">{deck.title}</h3>
                  {deck.description && <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{deck.description}</p>}
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{deck.cardCount} tarjetas</p>
                </div>
              </div>
              
              <button 
                onClick={(e) => handleDelete(deck._id, e)}
                className="text-slate-400 hover:text-rose-500 transition-colors p-2 z-10"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}
