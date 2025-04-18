// client/src/stores/missionStore.js
import { create } from 'zustand';
import {
  createMission,
  getMissions,
  getMissionById,
  updateMission,
  deleteMission
} from '../services/missionService';

const useMissionStore = create((set, get) => ({
  missions: [],
  currentMission: null,
  isLoading: false,
  error: null,
  
  // Set loading state
  setLoading: (isLoading) => set({ isLoading }),
  
  // Set error message
  setError: (errorMessage) => set({ error: errorMessage }),
  
  // Clear error
  clearError: () => set({ error: null }),
  
  // Fetch all missions
  fetchMissions: async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    try {
      set({ isLoading: true, error: null });
      const missions = await getMissions(user.token);
      set({ missions, isLoading: false });
      return missions;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error('Error fetching missions:', error);
    }
  },
  
  // Fetch a single mission by ID
  fetchMissionById: async (id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    try {
      set({ isLoading: true, error: null });
      const mission = await getMissionById(id, user.token);
      set({ currentMission: mission, isLoading: false });
      return mission;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error('Error fetching mission details:', error);
    }
  },
  
  // Create a new mission
  addMission: async (missionData) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    try {
      set({ isLoading: true, error: null });
      const newMission = await createMission(missionData, user.token);
      set((state) => ({ 
        missions: [newMission, ...state.missions],
        currentMission: newMission,
        isLoading: false 
      }));
      return newMission;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error('Error creating mission:', error);
    }
  },
  
  // Update an existing mission
  updateMission: async (id, missionData) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    try {
      set({ isLoading: true, error: null });
      const updatedMission = await updateMission(id, missionData, user.token);
      set((state) => ({ 
        missions: state.missions.map(mission => 
          mission._id === id ? updatedMission : mission
        ),
        currentMission: updatedMission,
        isLoading: false 
      }));
      return updatedMission;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error('Error updating mission:', error);
    }
  },
  
  // Delete a mission
  deleteMission: async (id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    try {
      set({ isLoading: true, error: null });
      await deleteMission(id, user.token);
      set((state) => ({ 
        missions: state.missions.filter(mission => mission._id !== id),
        isLoading: false 
      }));
      return true;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error('Error deleting mission:', error);
      return false;
    }
  },
  
  // Reset current mission
  resetCurrentMission: () => set({ currentMission: null }),
}));

export default useMissionStore;