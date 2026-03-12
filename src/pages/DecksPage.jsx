import { useNavigate, Link } from 'react-router-dom';
import { useDecks } from '../hooks/useDecks';
import { useAppStore } from '../store/useAppStore';
import { apiFetch } from '../services/api';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useRef } from 'react';

const COLORS = ['primary', 'secondary', 'success', 'warning', 'error'];
const EMOJIS = ['📚', '🧪', '🌍', '📐', '🧠', '💻', '🎨'];

export default function DecksPage() {
  const navigate = useNavigate();
  const { decks, isLoading, deleteDeck } = useDecks();
  const { openModal, addToast } = useAppStore();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if(window.confirm('¿Seguro que deseas eliminar este mazo?')) {
      await deleteDeck(id);
    }
  };

  const handleDeleteAll = async () => {
    if (decks.length === 0) return;
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar los ${decks.length} mazo(s) y todas sus tarjetas? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    // Segunda confirmación para acción destructiva
    const doubleConfirmed = window.confirm('⚠️ Última advertencia: ¿Confirmas que deseas eliminar TODOS tus mazos?');
    if (!doubleConfirmed) return;

    try {
      setIsDeletingAll(true);
      for (const deck of decks) {
        await apiFetch(`/decks/${deck._id}`, { method: 'DELETE' });
      }
      await queryClient.invalidateQueries({ queryKey: ['decks'] });
      addToast('Todos los mazos han sido eliminados', 'success');
    } catch (error) {
      console.error('Error al eliminar mazos:', error);
      addToast('Error al eliminar los mazos', 'error');
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const allDecks = await apiFetch("/decks");
      const exportData = [];

      for (const deck of allDecks) {
        const cards = await apiFetch(`/cards/${deck._id}`);
        // Limpiamos IDs y campos de DB para que la importación sea limpia
        const { _id, userId, createdAt, updatedAt, ...cleanDeck } = deck;
        const cleanCards = cards.map(({ _id, deckId, userId, createdAt, updatedAt, ...c }) => c);
        
        exportData.push({
          deck: cleanDeck,
          cards: cleanCards
        });
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'easystudy-decks.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      addToast('Mazos exportados correctamente', 'success');
    } catch (error) {
      console.error("Error al exportar:", error);
      addToast('Error al exportar los mazos', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const text = await file.text();
      const importedData = JSON.parse(text);

      if (!Array.isArray(importedData)) {
        throw new Error("El archivo no tiene el formato correcto.");
      }

      let successCount = 0;

      for (const item of importedData) {
        if (!item.deck || !item.deck.title) continue; // Validación básica

        // 1. Crear el mazo
        const newDeck = await apiFetch("/decks", {
          method: "POST",
          body: JSON.stringify(item.deck),
        });

        // 2. Crear sus tarjetas si tiene
        if (Array.isArray(item.cards) && item.cards.length > 0) {
          for (const card of item.cards) {
            await apiFetch("/cards", {
              method: "POST",
              body: JSON.stringify({ ...card, deckId: newDeck._id }),
            });
          }
        }
        successCount++;
      }

      await queryClient.invalidateQueries({ queryKey: ["decks"] });
      addToast(`${successCount} mazo(s) importado(s) correctamente`, 'success');
    } catch (error) {
      console.error("Error al importar:", error);
      addToast('Error al importar el archivo. Verifica el formato.', 'error');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Resetear input
      }
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

      {/* Import / Export / Delete All Buttons Section */}
      <div className="mt-8 flex flex-wrap gap-4 items-center justify-center border-t border-slate-200 dark:border-slate-800 pt-6">
        <input 
          type="file" 
          accept=".json" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleImport} 
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          {isImporting ? (
             <span className="material-symbols-outlined animate-spin text-lg">autorenew</span>
          ) : (
             <span className="material-symbols-outlined text-lg">upload</span>
          )}
          {isImporting ? 'Importando...' : 'Importar'}
        </button>

        <button
          onClick={handleExport}
          disabled={isExporting || decks.length === 0 || isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          {isExporting ? (
            <span className="material-symbols-outlined animate-spin text-lg">autorenew</span>
          ) : (
            <span className="material-symbols-outlined text-lg">download</span>
          )}
          {isExporting ? 'Exportando...' : 'Exportar'}
        </button>

        <button
          onClick={handleDeleteAll}
          disabled={isDeletingAll || decks.length === 0 || isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-medium hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors disabled:opacity-50"
        >
          {isDeletingAll ? (
            <span className="material-symbols-outlined animate-spin text-lg">autorenew</span>
          ) : (
            <span className="material-symbols-outlined text-lg">delete_sweep</span>
          )}
          {isDeletingAll ? 'Eliminando...' : 'Eliminar Todo'}
        </button>
      </div>

    </div>
  );
}
