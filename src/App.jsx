import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import DecksPage from './pages/DecksPage';
import DeckDetailPage from './pages/DeckDetailPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';
import QuizPage from './pages/QuizPage';
import StudyPage from './pages/StudyPage';
import SummariesPage from './pages/SummariesPage';
import SummaryReader from './pages/SummaryReader';
import SummaryEditor from './components/summaries/SummaryEditor';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAppStore } from './store/useAppStore';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAppStore(state => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const isAuthenticated = useAppStore(state => state.isAuthenticated);

  return (
    <Routes>
      {/* Raíz: si ya tiene sesión → dashboard, si no → login */}
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
      />

      {/* Rutas públicas: si ya está logueado no tiene sentido volver a login */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      {/* Rutas protegidas */}
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/decks" element={<DecksPage />} />
        <Route path="/decks/:deckId" element={<DeckDetailPage />} />
        <Route path="/study/:deckId" element={<StudyPage />} />
        <Route path="/quiz/:deckId" element={<QuizPage />} />
        <Route path="/summaries" element={<SummariesPage />} />
        <Route path="/summaries/:summaryId" element={<SummaryReader />} />
        <Route path="/summaries/:summaryId/edit" element={<SummaryEditor />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Ruta desconocida → raíz */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
