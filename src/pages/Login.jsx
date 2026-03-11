import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorStr, setErrorStr] = useState('');
  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorStr('');
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setErrorStr(err.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center px-6 py-12 max-w-[430px] mx-auto bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      <div className="text-center mb-10">
        <motion.img
          src="/logo.png"
          alt="EasyStudy Logo"
          className="mx-auto w-48 mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <motion.p
          className="text-slate-500 text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          Acelera tu aprendizaje con IA
        </motion.p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-slate-200/50 dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl py-4 px-4 focus:ring-2 focus:ring-primary outline-none transition-all text-base"
            placeholder="correo@ejemplo.com"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-slate-200/50 dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl py-4 px-4 focus:ring-2 focus:ring-primary outline-none transition-all text-base"
            placeholder="••••••••"
            required
          />
        </div>

        {errorStr && <p className="text-error text-sm font-semibold text-center">{errorStr}</p>}

        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-xl shadow-primary/30 mt-4 active:scale-95 transition-all disabled:opacity-50"
        >
          {isLoggingIn ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>

      <p className="text-center text-slate-500 mt-8 text-sm">
        ¿No tienes cuenta? <Link to="/register" className="text-primary font-bold">Regístrate</Link>
      </p>
    </div>
  );
}
