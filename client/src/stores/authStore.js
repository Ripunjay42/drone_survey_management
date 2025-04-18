// client/src/stores/authStore.js
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  isLoading: false,
  error: null,
  
  // Set user after successful authentication
  setUser: (userData) => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    set({ user: userData, error: null });
  },
  
  // Set loading state
  setLoading: (isLoading) => set({ isLoading }),
  
  // Set error message
  setError: (errorMessage) => set({ error: errorMessage }),
  
  // Logout user
  logout: () => {
    localStorage.removeItem('user');
    set({ user: null });
  },
  
  // Reset error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;