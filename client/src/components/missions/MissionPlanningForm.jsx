// client/src/components/missions/MissionPlanningForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useMissionStore from '../../stores/missionStore';
import useDroneStore from '../../stores/droneStore';
import MapComponent from '../map/MapComponent';
import FlightPatternPreview from './FlightPatternPreview';
import { createMission } from '../../services/missionService';
import { fetchAvailableDrones } from '../../services/droneService';

const MissionPlanningForm = () => {
  const navigate = useNavigate();
  const { isLoading, error, clearError } = useMissionStore();
  const { availableDrones } = useDroneStore();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    surveyArea: null,
    drone: '',
    flightParameters: {
      altitude: 50,
      speed: 5,
      flightPattern: 'grid',
      overlap: 70
    },
    schedule: {
      type: 'oneTime',
      dateTime: '',
      recurrence: {
        frequency: 'weekly',
        interval: 1,
        endDate: ''
      }
    }
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [showRecurrence, setShowRecurrence] = useState(false);
  
  // Fetch available drones when schedule date changes
  useEffect(() => {
    if (formData.schedule.dateTime) {
      const fetchDrones = async () => {
        // Calculate an estimated end time (add 2 hours to start time)
        const startDate = new Date(formData.schedule.dateTime);
        const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000)); // Add 2 hours
        
        await fetchAvailableDrones(
          formData.schedule.dateTime,
          endDate.toISOString()
        );
      };
      
      fetchDrones();
    }
  }, [formData.schedule.dateTime]);
  
  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Mission name is required';
    if (!formData.surveyArea) errors.surveyArea = 'You must draw a survey area on the map';
    if (!formData.schedule.dateTime) errors.dateTime = 'Mission date and time is required';
    if (!formData.drone) errors.drone = 'You must select a drone for the mission';
    
    // Validate flight parameters
    if (formData.flightParameters.altitude < 10 || formData.flightParameters.altitude > 500) {
      errors.altitude = 'Altitude must be between 10m and 500m';
    }
    
    if (formData.flightParameters.speed < 1 || formData.flightParameters.speed > 20) {
      errors.speed = 'Speed must be between 1 and 20 m/s';
    }
    
    // Validate recurrence if selected
    if (formData.schedule.type === 'recurring') {
      if (!formData.schedule.recurrence.endDate) {
        errors.endDate = 'End date is required for recurring missions';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await createMission(formData);
        navigate('/missions');
      } catch (error) {
        console.error('Error creating mission:', error);
      }
    }
  };
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (e.g., flightParameters.altitude)
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else if (name.includes('recurrence.')) {
      // Handle recurrence properties
      const field = name.replace('recurrence.', '');
      setFormData({
        ...formData,
        schedule: {
          ...formData.schedule,
          recurrence: {
            ...formData.schedule.recurrence,
            [field]: value
          }
        }
      });
    } else {
      // Handle top-level properties
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear related error if any
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined
      });
    }
  };
  
  // Handle flight parameter changes
  const handleFlightParamChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      flightParameters: {
        ...formData.flightParameters,
        [name]: name === 'flightPattern' ? value : Number(value)
      }
    });
    
    // Clear related error if any
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined
      });
    }
  };
  
  // Handle schedule type change
  const handleScheduleTypeChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        type: value
      }
    });
    
    setShowRecurrence(value === 'recurring');
  };
  
  // Handle date/time change
  const handleDateTimeChange = (e) => {
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        dateTime: e.target.value
      }
    });
    
    // Clear related error if any
    if (formErrors.dateTime) {
      setFormErrors({
        ...formErrors,
        dateTime: undefined
      });
    }
  };
  
  // Handle area drawn on map
  const handleAreaDrawn = (areaData) => {
    setFormData({
      ...formData,
      surveyArea: areaData ? areaData.polygon : null
    });
    
    // Clear related error if any
    if (formErrors.surveyArea) {
      setFormErrors({
        ...formErrors,
        surveyArea: undefined
      });
    }
  };
  
  // Handle drone selection
  const handleDroneChange = (e) => {
    setFormData({
      ...formData,
      drone: e.target.value
    });
    
    // Clear related error if any
    if (formErrors.drone) {
      setFormErrors({
        ...formErrors,
        drone: undefined
      });
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Mission</h1>
        <p className="text-gray-600">Plan your drone survey mission</p>
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
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mission Details</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Mission Name *
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
                  placeholder="Enter mission name"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter mission description"
                ></textarea>
              </div>
            </div>
          </div>
          
          {/* Drone Selection */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Drone Selection</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="drone" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Drone *
                </label>
                <select
                  id="drone"
                  name="drone"
                  value={formData.drone}
                  onChange={handleDroneChange}
                  className={`w-full px-3 py-2 border ${
                    formErrors.drone ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                >
                  <option value="">-- Select a drone --</option>
                  {availableDrones.map((drone) => (
                    <option key={drone._id} value={drone._id}>
                      {drone.name} - {drone.model} ({drone.batteryLevel}% battery)
                    </option>
                  ))}
                </select>
                {formErrors.drone && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.drone}</p>
                )}
                
                {formData.schedule.dateTime && availableDrones.length === 0 && (
                  <p className="mt-3 text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-md p-2">
                    No drones available for the selected time. Please select a different time or add more drones.
                  </p>
                )}
                
                {!formData.schedule.dateTime && (
                  <p className="mt-3 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md p-2">
                    Select a mission date and time to see available drones.
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Flight Parameters */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Flight Parameters</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="altitude" className="block text-sm font-medium text-gray-700 mb-1">
                    Altitude (meters) *
                  </label>
                  <input
                    type="number"
                    id="altitude"
                    name="altitude"
                    min="10"
                    max="500"
                    value={formData.flightParameters.altitude}
                    onChange={handleFlightParamChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.altitude ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  />
                  {formErrors.altitude && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.altitude}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="speed" className="block text-sm font-medium text-gray-700 mb-1">
                    Speed (m/s) *
                  </label>
                  <input
                    type="number"
                    id="speed"
                    name="speed"
                    min="1"
                    max="20"
                    step="0.5"
                    value={formData.flightParameters.speed}
                    onChange={handleFlightParamChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.speed ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  />
                  {formErrors.speed && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.speed}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="flightPattern" className="block text-sm font-medium text-gray-700 mb-1">
                  Flight Pattern
                </label>
                <select
                  id="flightPattern"
                  name="flightPattern"
                  value={formData.flightParameters.flightPattern}
                  onChange={handleFlightParamChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="grid">Grid (Default)</option>
                  <option value="perimeter">Perimeter</option>
                  <option value="crosshatch">Crosshatch</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="overlap" className="block text-sm font-medium text-gray-700 mb-1">
                  Image Overlap (%)
                </label>
                <input
                  type="range"
                  id="overlap"
                  name="overlap"
                  min="0"
                  max="90"
                  step="5"
                  value={formData.flightParameters.overlap}
                  onChange={handleFlightParamChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>{formData.flightParameters.overlap}%</span>
                  <span>90%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Scheduling */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mission Schedule</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="scheduleType" className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule Type
                </label>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="oneTime"
                      name="scheduleType"
                      value="oneTime"
                      checked={formData.schedule.type === 'oneTime'}
                      onChange={handleScheduleTypeChange}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="oneTime" className="ml-2 text-sm text-gray-700">
                      One-time
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="recurring"
                      name="scheduleType"
                      value="recurring"
                      checked={formData.schedule.type === 'recurring'}
                      onChange={handleScheduleTypeChange}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="recurring" className="ml-2 text-sm text-gray-700">
                      Recurring
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date and Time *
                </label>
                <input
                  type="datetime-local"
                  id="dateTime"
                  name="dateTime"
                  value={formData.schedule.dateTime}
                  onChange={handleDateTimeChange}
                  className={`w-full px-3 py-2 border ${
                    formErrors.dateTime ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                />
                {formErrors.dateTime && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.dateTime}</p>
                )}
              </div>
              
              {showRecurrence && (
                <div className="space-y-4 border-t border-gray-200 pt-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency
                      </label>
                      <select
                        id="frequency"
                        name="recurrence.frequency"
                        value={formData.schedule.recurrence.frequency}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="interval" className="block text-sm font-medium text-gray-700 mb-1">
                        Every
                      </label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          id="interval"
                          name="recurrence.interval"
                          min="1"
                          max="30"
                          value={formData.schedule.recurrence.interval}
                          onChange={handleChange}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          {formData.schedule.recurrence.frequency === 'daily' && 'day(s)'}
                          {formData.schedule.recurrence.frequency === 'weekly' && 'week(s)'}
                          {formData.schedule.recurrence.frequency === 'monthly' && 'month(s)'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="recurrence.endDate"
                      value={formData.schedule.recurrence.endDate}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        formErrors.endDate ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    />
                    {formErrors.endDate && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.endDate}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Submit/Cancel Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/missions')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              {isLoading ? 'Creating...' : 'Create Mission'}
            </button>
          </div>
        </div>
        
        {/* Map Section */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Survey Area</h2>
            <div className=" bg-white p-2 rounded shadow-md text-sm">
                Draw a polygon to define the survey area
            </div> 
            <MapComponent onAreaDrawn={handleAreaDrawn} />
            
            {formErrors.surveyArea && (
              <p className="mt-3 text-sm text-red-600">{formErrors.surveyArea}</p>
            )}
            
            {formData.surveyArea && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-green-700 font-medium">Survey area defined</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Flight Pattern Preview */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Flight Preview</h2>
            
            {formData.surveyArea ? (
              <FlightPatternPreview 
                flightPattern={formData.flightParameters.flightPattern}
                surveyArea={formData.surveyArea}
              />
            ) : (
              <div className="bg-gray-100 rounded-lg p-6 text-center h-60 flex items-center justify-center">
                <div className="text-gray-500">
                  <p>Define a survey area to see flight preview</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Mission Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mission Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-sm text-gray-500">Altitude:</span>
                <span className="text-sm font-medium">{formData.flightParameters.altitude} meters</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-sm text-gray-500">Speed:</span>
                <span className="text-sm font-medium">{formData.flightParameters.speed} m/s</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-sm text-gray-500">Flight Pattern:</span>
                <span className="text-sm font-medium capitalize">{formData.flightParameters.flightPattern}</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-sm text-gray-500">Image Overlap:</span>
                <span className="text-sm font-medium">{formData.flightParameters.overlap}%</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-sm text-gray-500">Schedule Type:</span>
                <span className="text-sm font-medium">
                  {formData.schedule.type === 'oneTime' ? 'One-time' : 'Recurring'}
                </span>
              </div>
              
              {formData.schedule.dateTime && (
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-sm text-gray-500">Start Date/Time:</span>
                  <span className="text-sm font-medium">
                    {new Date(formData.schedule.dateTime).toLocaleString()}
                  </span>
                </div>
              )}
              
              {formData.drone && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Selected Drone:</span>
                  <span className="text-sm font-medium">
                    {availableDrones.find(d => d._id === formData.drone)?.name || 'Loading...'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MissionPlanningForm;