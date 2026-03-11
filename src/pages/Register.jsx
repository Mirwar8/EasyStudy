import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorStr, setErrorStr] = useState('');
  const { register, isRegistering } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorStr('');
    try {
      await register({ email, password, displayName });
      navigate('/dashboard');
    } catch (err) {
      setErrorStr(err.message || 'Error al registrar usuario');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 max-w-[430px] mx-auto w-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      <div className="text-center mb-8">
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Nombre</label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="w-full bg-slate-200/50 dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none transition-all text-base"
            placeholder="Ej. Ana"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-slate-200/50 dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none transition-all text-base"
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
            className="w-full bg-slate-200/50 dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none transition-all text-base"
            placeholder="Mínimo 8 caracteres"
            minLength="8"
            required
          />
        </div>

        {errorStr && <p className="text-error text-sm font-semibold text-center">{errorStr}</p>}

        <button
          type="submit"
          disabled={isRegistering}
          className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-xl shadow-primary/30 mt-4 active:scale-95 transition-all disabled:opacity-50"
        >
          {isRegistering ? 'Creando cuenta...' : 'Registrarme'}
        </button>
      </form>

      <p className="text-center text-slate-500 mt-8 text-sm">
        ¿Ya tienes cuenta? <Link to="/login" className="text-primary font-bold">Inicia Sesión</Link>
      </p>
    </div>
  );
}
