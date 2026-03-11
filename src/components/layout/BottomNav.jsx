import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

export default function BottomNav() {
  const { openModal } = useAppStore();
  const baseClasses = "flex flex-col items-center gap-1 transition-colors";
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-card-dark/80 backdrop-blur-xl border-t border-slate-200 dark:border-primary/10 px-6 pb-safe pt-3 flex items-center justify-between z-30 max-w-[430px] mx-auto">
      <NavLink
        to="/"
        className={({ isActive }) => `${baseClasses} ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary'}`}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
        <span className="text-[10px] font-bold">Inicio</span>
      </NavLink>

      <NavLink
        to="/decks"
        className={({ isActive }) => `${baseClasses} ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary'}`}
      >
        <span className="material-symbols-outlined">library_books</span>
        <span className="text-[10px] font-bold">Mazos</span>
      </NavLink>

      <div className="relative -top-8">
        <button 
          onClick={() => openModal('fab')}
          className="bg-primary text-white size-14 rounded-full shadow-lg shadow-primary/40 flex items-center justify-center hover:scale-105 transition-transform active:scale-95 z-40"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </div>

      <NavLink
        to="/stats"
        className={({ isActive }) => `${baseClasses} ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary'}`}
      >
        <span className="material-symbols-outlined">bar_chart</span>
        <span className="text-[10px] font-bold">Stats</span>
      </NavLink>

      <NavLink
        to="/settings"
        className={({ isActive }) => `${baseClasses} ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary'}`}
      >
        <span className="material-symbols-outlined">settings</span>
        <span className="text-[10px] font-bold">Config</span>
      </NavLink>
    </nav>
  );
}
