import { useAppStore } from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { user, logout } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark">
      {/* Header Sticky */}
      <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-primary/10 px-4 py-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white max-w-2xl mx-auto w-full text-center">Configuración</h1>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto p-4 pb-32 space-y-8">
        {/* Profile Card */}
        <section className="bg-white dark:bg-card-dark rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800/50 flex flex-col items-center text-center">
          <div className="size-24 rounded-full bg-gradient-to-tr from-primary to-indigo-400 p-1 mb-6 shadow-2xl shadow-primary/20">
            <div className="size-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-4xl font-black text-primary">
              {user?.name?.[0] || 'U'}
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{user?.name || 'Usuario'}</h2>
          <p className="text-slate-500 font-medium mb-6">{user?.email || 'estudiante@easystudy.com'}</p>
          <button className="px-6 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-primary hover:text-white transition-all active:scale-95">
            Editar Perfil
          </button>
        </section>

        {/* Options List */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-4 mb-4">Ajustes de la App</h3>
          
          <div className="bg-white dark:bg-card-dark rounded-[2rem] border border-slate-100 dark:border-slate-800/50 overflow-hidden divide-y divide-slate-50 dark:divide-slate-800/50">
            {/* Dark Mode Toggle */}
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <span className="material-symbols-outlined text-2xl">dark_mode</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Modo Oscuro</p>
                  <p className="text-xs text-slate-500 font-medium">Auto-detectado por el sistema</p>
                </div>
              </div>
              <div className="size-8 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-sm">done</span>
              </div>
            </div>

            {/* Notifications */}
            <div className="p-6 flex items-center justify-between opacity-50">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <span className="material-symbols-outlined text-2xl">notifications</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Notificaciones</p>
                  <p className="text-xs text-slate-500 font-medium">Recordatorios de estudio</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </div>

            {/* Language */}
            <div className="p-6 flex items-center justify-between opacity-50">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <span className="material-symbols-outlined text-2xl">language</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Idioma</p>
                  <p className="text-xs text-slate-500 font-medium">Español (Latinoamérica)</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="pt-4">
          <button 
            onClick={handleLogout}
            className="w-full h-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-all hover:bg-rose-500 hover:text-white shadow-lg hover:shadow-rose-500/30"
          >
            <span className="material-symbols-outlined">logout</span>
            Cerrar Sesión
          </button>
          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6">EasyStudy Alpha v2.0.1</p>
        </section>
      </main>
    </div>
  );
}
