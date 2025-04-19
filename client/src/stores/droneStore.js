// client/src/stores/droneStore.js
import { create } from 'zustand';

const useDroneStore = create((set) => ({
  drones: [],
  availableDrones: [],
  currentDrone: null,
  isLoading: false,
  error: null,
  
  // Set all drones
  setDrones: (drones) => set({ drones }),
  
  // Set available drones
  setAvailableDrones: (availableDrones) => set({ availableDrones }),
  
  // Set current drone
  setCurrentDrone: (drone) => set({ currentDrone: drone }),
  
  // Add a drone to the store
  addDroneToStore: (drone) => set((state) => ({ 
    drones: [drone, ...state.drones] 
  })),
  
  // Update a drone in the store
  updateDroneInStore: (id, updatedDrone) => set((state) => ({
    drones: state.drones.map((drone) => 
      drone._id === id ? updatedDrone : drone
    ),
    currentDrone: state.currentDrone?._id === id 
      ? updatedDrone 
      : state.currentDrone
  })),
  
  // Remove a drone from the store
  removeDroneFromStore: (id) => set((state) => ({
    drones: state.drones.filter((drone) => drone._id !== id),
    currentDrone: state.currentDrone?._id === id 
      ? null 
      : state.currentDrone
  })),
  
  // Set loading state
  setLoading: (isLoading) => set({ isLoading }),
  
  // Set error state
  setError: (error) => set({ error }),
  
  // Clear error state
  clearError: () => set({ error: null }),
  
  // Reset store
  reset: () => set({ 
    drones: [],
    availableDrones: [],
    currentDrone: null,
    isLoading: false,
    error: null
  })
}));

export default useDroneStore;