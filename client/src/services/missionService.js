// client/src/services/missionService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/missions';

// Create config object with authorization header
const getConfig = (token) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Create a new mission
export const createMission = async (missionData, token) => {
  try {
    const response = await axios.post(API_URL, missionData, getConfig(token));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to create mission';
    throw new Error(message);
  }
};

// Get all missions
export const getMissions = async (token) => {
  try {
    const response = await axios.get(API_URL, getConfig(token));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch missions';
    throw new Error(message);
  }
};

// Get a specific mission by ID
export const getMissionById = async (id, token) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, getConfig(token));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch mission details';
    throw new Error(message);
  }
};

// Update an existing mission
export const updateMission = async (id, missionData, token) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, missionData, getConfig(token));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update mission';
    throw new Error(message);
  }
};

// Delete a mission
export const deleteMission = async (id, token) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, getConfig(token));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to delete mission';
    throw new Error(message);
  }
};