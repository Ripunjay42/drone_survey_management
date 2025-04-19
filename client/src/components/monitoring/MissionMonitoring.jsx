// client/src/components/monitoring/MissionMonitoring.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useMissionStore from '../../stores/missionStore';
import { fetchMissions, updateMission } from '../../services/missionService';

const MissionMonitoring = () => {
  const { missions, isLoading, error } = useMissionStore();
  const [selectedMission, setSelectedMission] = useState(null);
  
  useEffect(() => {
    // Fetch missions on component mount
    fetchMissions();
    
    // Set up polling to refresh mission data every 30 seconds
    const intervalId = setInterval(() => {
      fetchMissions();
    }, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  const handleMissionSelect = (mission) => {
    setSelectedMission(mission);
  };
  
  const handleStatusUpdate = async (missionId, newStatus) => {
    try {
      await updateMission(missionId, { status: newStatus });
      // Refresh missions after status update
      fetchMissions();
      
      if (selectedMission && selectedMission._id === missionId) {
        setSelectedMission(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating mission status:', error);
    }
  };
  
  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };
  
  // Check if mission can be started based on scheduled time
  const canStartMission = (scheduledDateTime) => {
    const currentTime = new Date();
    const scheduledTime = new Date(scheduledDateTime);
    return currentTime >= scheduledTime;
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'aborted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusDot = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500';
      case 'in-progress':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'aborted':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  if (isLoading && missions.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading missions...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mission Monitoring</h1>
          <p className="text-gray-600">Monitor and control your active drone missions</p>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mission List Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Active Missions</h2>
            </div>
            
            {missions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No missions found</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {missions.map((mission) => (
                  <li 
                    key={mission._id} 
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${selectedMission && selectedMission._id === mission._id ? 'bg-indigo-50' : ''}`}
                    onClick={() => handleMissionSelect(mission)}
                  >
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${getStatusDot(mission.status)}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{mission.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {formatDateTime(mission.schedule.dateTime)}
                        </p>
                      </div>
                      <div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(mission.status)}`}>
                          {mission.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Mission Details Panel */}
        <div className="lg:col-span-2">
          {selectedMission ? (
            <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">{selectedMission.name}</h2>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedMission.status)}`}>
                  {selectedMission.status.replace('-', ' ')}
                </span>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Mission Details</h3>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Drone:</span> {selectedMission.drone?.name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Scheduled Time:</span> {formatDateTime(selectedMission.schedule.dateTime)}
                      </p>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Flight Pattern:</span> {selectedMission.flightParameters.flightPattern}
                      </p>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Altitude:</span> {selectedMission.flightParameters.altitude}m
                      </p>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Speed:</span> {selectedMission.flightParameters.speed} m/s
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Mission Controls</h3>
                    <div className="mt-2 space-y-3">
                      {selectedMission.status === 'scheduled' && (
                        <button
                          onClick={() => handleStatusUpdate(selectedMission._id, 'in-progress')}
                          disabled={!canStartMission(selectedMission.schedule.dateTime)}
                          className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${canStartMission(selectedMission.schedule.dateTime) ? 'bg-green-600 hover:bg-green-700' : 'bg-green-300 cursor-not-allowed'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                          title={!canStartMission(selectedMission.schedule.dateTime) ? 'Mission can only be started at or after the scheduled time' : ''}
                        >
                          Start Mission
                        </button>
                      )}
                      
                      {selectedMission.status === 'in-progress' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(selectedMission._id, 'completed')}
                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Complete Mission
                          </button>
                          
                          <button
                            onClick={() => handleStatusUpdate(selectedMission._id, 'aborted')}
                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Abort Mission
                          </button>
                        </>
                      )}
                      
                      {(selectedMission.status === 'scheduled' || selectedMission.status === 'completed' || selectedMission.status === 'aborted') && (
                        <Link
                          to={`/missions/${selectedMission._id}/edit`}
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Edit Mission
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Mission Description</h3>
                  <p className="text-sm text-gray-900">
                    {selectedMission.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No mission selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a mission from the list to view details and controls.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionMonitoring;