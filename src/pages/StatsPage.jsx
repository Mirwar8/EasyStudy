import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { useStats } from '../hooks/useStats';
import { FiTrendingUp, FiCheckCircle, FiClock, FiCalendar } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function StatsPage() {
  const { summary, isLoadingSummary } = useStats();

  if (isLoadingSummary) {
    return (
      <div className="p-6 h-screen flex items-center justify-center animate-pulse">
        <div className="w-full max-w-2xl h-64 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem]"></div>
      </div>
    );
  }

  // Preparar datos para el gráfico (últimos 7 registros)
  const chartData = summary.recentHistory.map(s => ({
    name: new Date(s.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
    score: s.score,
    time: s.timeSpent
  }));

  return (
    <div className="p-6 pb-32 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">Tu Progreso</h1>
          <p className="text-sm text-slate-500 font-medium">Análisis de rendimiento y rachas</p>
        </div>
        <div className="size-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl">
          <FiTrendingUp />
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard 
          icon={<FiCheckCircle className="text-emerald-500" />} 
          label="Precisión Media" 
          value={`${summary.avgScore}%`}
          desc="Promedio total"
        />
        <StatCard 
          icon={<FiClock className="text-indigo-500" />} 
          label="Tiempo Total" 
          value={`${Math.round(summary.totalTime / 60)} min`}
          desc="En sesiones de quiz"
        />
        <StatCard 
          icon={<FiCalendar className="text-amber-500" />} 
          label="Sesiones" 
          value={summary.totalSessions}
          desc="Quizzes completados"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Desempeño */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Desempeño Reciente</h3>
          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6C63FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#6C63FF" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartMsg />
            )}
          </div>
        </section>

        {/* Gráfico de Tiempo */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Tiempo por Sesión</h3>
          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: 'rgba(108, 99, 255, 0.05)' }}
                  />
                  <Bar dataKey="time" fill="#FF6584" radius={[6, 6, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartMsg />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, desc }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm"
    >
      <div className="size-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4 text-xl">
        {icon}
      </div>
      <div>
        <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</span>
        <h4 className="text-2xl font-black">{value}</h4>
        <p className="text-[10px] text-slate-500 mt-1">{desc}</p>
      </div>
    </motion.div>
  );
}

function EmptyChartMsg() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
      <FiTrendingUp className="text-4xl mb-2" />
      <p className="text-sm">No hay datos suficientes</p>
    </div>
  );
}
