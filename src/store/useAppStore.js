import { create } from "zustand";

export const useAppStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("easystudy_user")) || null,
  isAuthenticated: !!localStorage.getItem("easystudy_token"),
  activeModal: null, // 'fab' | 'new-deck' | 'ai-generator' | 'fast-card'
  toasts: [],

  addToast: (message, type = "info") => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  login: (user, token) => {
    localStorage.setItem("easystudy_token", token);
    localStorage.setItem("easystudy_user", JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("easystudy_token");
    localStorage.removeItem("easystudy_user");
    set({ user: null, isAuthenticated: false });
  },

  openModal: (modalName) => set({ activeModal: modalName }),
  closeModal: () => set({ activeModal: null }),
}));
