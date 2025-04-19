// client/src/services/droneService.js
import axios from 'axios';
import useDroneStore from '../stores/droneStore';

const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/drones`
  : 'http://localhost:5000/api/drones';

// Create config object with authorization header
const getConfig = (token) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Helper to get token from localStorage
const getToken = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token;
};

// Fetch all drones
export const fetchDrones = async () => {
  const { setLoading, setError, setDrones } = useDroneStore.getState();
  const token = getToken();
  
  if (!token) {
    setError('Authentication required');
    return null;
  }
  
  try {
    setLoading(true);
    setError(null);
    
    const response = await axios.get(API_URL, getConfig(token));
    const drones = response.data;
    
    setDrones(drones);
    setLoading(false);
    return drones;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch drones';
    setError(message);
    setLoading(false);
    console.error('Error fetching drones:', error);
    return null;
  }
};

// Fetch available drones for a specific time
export const fetchAvailableDrones = async (startDateTime, endDateTime) => {
  const { setLoading, setError, setAvailableDrones } = useDroneStore.getState();
  const token = getToken();
  
  if (!token) {
    setError('Authentication required');
    return null;
  }
  
  try {
    setLoading(true);
    setError(null);
    
    let url = `${API_URL}/available?startDateTime=${encodeURIComponent(startDateTime)}`;
    if (endDateTime) {
      url += `&endDateTime=${encodeURIComponent(endDateTime)}`;
    }
    
    const response = await axios.get(url, getConfig(token));
    const drones = response.data;
    
    setAvailableDrones(drones);
    setLoading(false);
    return drones;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch available drones';
    setError(message);
    setLoading(false);
    console.error('Error fetching available drones:', error);
    return null;
  }
};

// Fetch a specific drone by ID
export const fetchDroneById = async (id) => {
  const { setLoading, setError, setCurrentDrone } = useDroneStore.getState();
  const token = getToken();
  
  if (!token) {
    setError('Authentication required');
    return null;
  }
  
  try {
    setLoading(true);
    setError(null);
    
    const response = await axios.get(`${API_URL}/${id}`, getConfig(token));
    const drone = response.data;
    
    setCurrentDrone(drone);
    setLoading(false);
    return drone;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch drone details';
    setError(message);
    setLoading(false);
    console.error('Error fetching drone by ID:', error);
    return null;
  }
};

// Create a new drone
export const createDrone = async (droneData) => {
  const { setLoading, setError, addDroneToStore } = useDroneStore.getState();
  const token = getToken();
  
  if (!token) {
    setError('Authentication required');
    return null;
  }
  
  try {
    setLoading(true);
    setError(null);
    
    const response = await axios.post(API_URL, droneData, getConfig(token));
    const newDrone = response.data;
    
    addDroneToStore(newDrone);
    setLoading(false);
    return newDrone;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to create drone';
    setError(message);
    setLoading(false);
    console.error('Error creating drone:', error);
    return null;
  }
};

// Update an existing drone
export const updateDrone = async (id, droneData) => {
  const { setLoading, setError, updateDroneInStore } = useDroneStore.getState();
  const token = getToken();
  
  if (!token) {
    setError('Authentication required');
    return null;
  }
  
  try {
    setLoading(true);
    setError(null);
    
    const response = await axios.put(`${API_URL}/${id}`, droneData, getConfig(token));
    const updatedDrone = response.data;
    
    updateDroneInStore(id, updatedDrone);
    setLoading(false);
    return updatedDrone;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update drone';
    setError(message);
    setLoading(false);
    console.error('Error updating drone:', error);
    return null;
  }
};

// Delete a drone
export const deleteDrone = async (id) => {
  const { setLoading, setError, removeDroneFromStore } = useDroneStore.getState();
  const token = getToken();
  
  if (!token) {
    setError('Authentication required');
    return false;
  }
  
  try {
    setLoading(true);
    setError(null);
    
    await axios.delete(`${API_URL}/${id}`, getConfig(token));
    
    removeDroneFromStore(id);
    setLoading(false);
    return true;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to delete drone';
    setError(message);
    setLoading(false);
    console.error('Error deleting drone:', error);
    return false;
  }
};