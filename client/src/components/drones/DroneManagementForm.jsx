// client/src/components/drones/DroneManagementForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useDroneStore from '../../stores/droneStore';
import { createDrone, fetchDroneById, updateDrone } from '../../services/droneService';

const DroneManagementForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { isLoading, error, clearError, currentDrone } = useDroneStore();
  
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    model: '',
    status: 'available',
    batteryLevel: 100,
    maxFlightTime: 30
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  // If editing, fetch the drone data
  useEffect(() => {
    if (isEditing) {
      const loadDrone = async () => {
        await fetchDroneById(id);
      };
      
      loadDrone();
    }
  }, [id, isEditing]);
  
  // Populate form when drone data is loaded
  useEffect(() => {
    if (isEditing && currentDrone) {
      setFormData({
        name: currentDrone.name || '',
        serialNumber: currentDrone.serialNumber || '',
        model: currentDrone.model || '',
        status: currentDrone.status || 'available',
        batteryLevel: currentDrone.batteryLevel || 100,
        maxFlightTime: currentDrone.maxFlightTime || 30
      });
    }
  }, [isEditing, currentDrone]);
  
  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Drone name is required';
    if (!formData.serialNumber.trim()) errors.serialNumber = 'Serial number is required';
    if (!formData.model.trim()) errors.model = 'Drone model is required';
    
    if (formData.maxFlightTime < 5 || formData.maxFlightTime > 180) {
      errors.maxFlightTime = 'Max flight time must be between 5 and 180 minutes';
    }
    
    if (formData.batteryLevel < 0 || formData.batteryLevel > 100) {
      errors.batteryLevel = 'Battery level must be between 0 and 100 percent';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        if (isEditing) {
          await updateDrone(id, formData);
        } else {
          await createDrone(formData);
        }
        navigate('/fleet');
      } catch (error) {
        console.error('Error saving drone:', error);
      }
    }
  };
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'number' ? Number(value) : value
    });
    
    // Clear related error if any
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined
      });
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditing ? 'Edit Drone' : 'Add New Drone'}
        </h1>
        <p className="text-gray-600">
          {isEditing 
            ? 'Update your drone information' 
            : 'Register a new drone to your fleet'
          }
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={clearError}
                  className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Drone Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Drone Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    formErrors.name ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="Enter drone name"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Serial Number *
                </label>
                <input
                  type="text"
                  id="serialNumber"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    formErrors.serialNumber ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="Enter serial number"
                  disabled={isEditing} // Cannot edit serial number if editing existing drone
                />
                {formErrors.serialNumber && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.serialNumber}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                  Drone Model *
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    formErrors.model ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="Enter drone model"
                />
                {formErrors.model && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.model}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Status and Parameters */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Status and Parameters</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="batteryLevel" className="block text-sm font-medium text-gray-700 mb-1">
                  Battery Level (%)
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    id="batteryLevel"
                    name="batteryLevel"
                    min="0"
                    max="100"
                    value={formData.batteryLevel}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-3 text-gray-700 w-12 text-right">
                    {formData.batteryLevel}%
                  </span>
                </div>
                {formErrors.batteryLevel && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.batteryLevel}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="maxFlightTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Flight Time (minutes) *
                </label>
                <input
                  type="number"
                  id="maxFlightTime"
                  name="maxFlightTime"
                  min="5"
                  max="180"
                  value={formData.maxFlightTime}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    formErrors.maxFlightTime ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                />
                {formErrors.maxFlightTime && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.maxFlightTime}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/fleet')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
          >
            {isLoading ? 'Saving...' : isEditing ? 'Update Drone' : 'Add Drone'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DroneManagementForm;