import { create } from 'zustand';

// Mantiene la sesión compartida por toda la aplicación y la recupera al recargar la página.
export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  // Guarda usuario y token para conservar la sesión entre recargas.
  login: (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    set({ user: userData, token });
  },
  // Elimina la sesión persistida y limpia el estado global.
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  }
}));