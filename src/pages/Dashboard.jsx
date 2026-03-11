import { useAppStore } from '../store/useAppStore';
import { useDecks } from '../hooks/useDecks';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const user = useAppStore(state => state.user);
  const { decks, isLoading } = useDecks();

  // Filtrar para mostrar un resumen (en una app real esto vendría de stats)
  const totalCards = decks.reduce((acc, d) => acc + (d.cardCount || 0), 0);
  const categories = ["Todas", "Biología", "Cálculo", "Historia"];

  return (
    <div className="flex-1 flex flex-col">
      <header className="flex items-center justify-between p-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-full border-2 border-primary/30 p-0.5">
            <div 
              className="w-full h-full rounded-full bg-cover bg-center bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-primary font-bold"
              style={user?.photoURL ? { backgroundImage: `url(${user.photoURL})` } : {}}
            >
              {!user?.photoURL && (user?.displayName?.charAt(0).toUpperCase() || 'A')}
            </div>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Bienvenida</p>
            <h1 className="text-xl font-bold leading-tight">Hola, {user?.displayName || 'Ana'} 👋</h1>
          </div>
        </div>
        <button className="relative p-2 rounded-xl bg-slate-200 dark:bg-card-dark text-slate-700 dark:text-slate-300">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2.5 size-2 bg-primary rounded-full border-2 border-background-light dark:border-background-dark"></span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {/* Stats Summary */}
        <div className="flex gap-4 p-6">
          <div className="flex-1 bg-primary/10 dark:bg-card-dark border border-primary/20 dark:border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-xl">layers</span>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Mazos</p>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{decks.length}</p>
          </div>
          <div className="flex-1 bg-primary/10 dark:bg-card-dark border border-primary/20 dark:border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-xl">style</span>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Tarjetas</p>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalCards}</p>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 mb-6">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
            <input 
              className="w-full bg-slate-200 dark:bg-card-dark border-none rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary text-sm transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-500" 
              placeholder="Buscar en tus mazos..." 
              type="text"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-3 px-6 mb-8 overflow-x-auto hide-scrollbar">
          {categories.map((cat, i) => (
            <button key={i} className={`flex items-center whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all ${i === 0 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-200 dark:bg-card-dark text-slate-700 dark:text-slate-300'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Deck List */}
        <div className="px-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Tus Mazos</h3>
            <Link to="/decks" className="text-primary text-sm font-bold">Ver todo</Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-card-dark rounded-xl animate-pulse"></div>)}
            </div>
          ) : decks.length === 0 ? (
            <div className="p-8 text-center bg-slate-100 dark:bg-card-dark rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
               <p className="text-slate-500 mb-4">Aún no tienes mazos generados.</p>
               <button className="text-primary font-bold">Crear uno ahora</button>
            </div>
          ) : (
            decks.map(deck => (
              <Link key={deck._id} to={`/decks/${deck._id}`} className="block bg-slate-200 dark:bg-card-dark rounded-xl p-5 border border-transparent hover:border-primary/50 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <div className="size-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined">{deck.color === "calculate" ? "calculate" : "biotech"}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{deck.title}</h4>
                      <p className="text-xs text-slate-500">{deck.cardCount || 0} Tarjetas</p>
                    </div>
                  </div>
                  <span className="text-primary text-sm font-bold">80%</span>
                </div>
                <div className="w-full bg-slate-300 dark:bg-slate-800 rounded-full h-2 mb-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Visto hoy</p>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
