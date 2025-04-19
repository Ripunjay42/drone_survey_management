// client/src/components/monitoring/MissionMonitoring.jsx
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import useMissionStore from '../../stores/missionStore';
import { fetchMissions, updateMission } from '../../services/missionService';
import MapComponent from '../map/MapComponent';

const MissionMonitoring = () => {
  const { missions, isLoading, error } = useMissionStore();
  const [selectedMission, setSelectedMission] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [dronePosition, setDronePosition] = useState(null);
  const [flightPath, setFlightPath] = useState([]);
  const [completionPercent, setCompletionPercent] = useState(0);
  const simulationInterval = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // Fetch missions on component mount
    fetchMissions();

    // Set up polling to refresh mission data every 30 seconds
    const intervalId = setInterval(() => {
      fetchMissions();
    }, 30000);

    // Clean up interval on component unmount
    return () => {
      clearInterval(intervalId);
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    };
  }, []);

  const handleMissionSelect = (mission) => {
    // Stop any existing simulation
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      setIsSimulating(false);
      setDronePosition(null);
      setFlightPath([]);
      setCompletionPercent(0);
    }

    setSelectedMission(mission);

    // If mission is in progress, start simulation
    if (mission.status === 'in-progress') {
      startDroneSimulation(mission);
    }
  };

  const startDroneSimulation = (mission) => {
    // Check if we have the survey area coordinates
    if (!mission.surveyArea || !mission.surveyArea.coordinates || !mission.surveyArea.coordinates[0]) {
      console.error('No survey area coordinates found for mission');
      return;
    }

    // Get the polygon coordinates
    const polygonCoords = mission.surveyArea.coordinates[0];

    // Set the initial drone position to the first coordinate of the polygon
    const initialPosition = {
      lng: polygonCoords[0][0],
      lat: polygonCoords[0][1]
    };

    setDronePosition(initialPosition);
    setFlightPath([initialPosition]);
    setIsSimulating(true);
    setCompletionPercent(0);

    // Generate flight path based on the mission's flight pattern
    const simulatedFlightPath = generateSimulatedFlightPath(
      polygonCoords,
      mission.flightParameters.flightPattern,
      mission.flightParameters.altitude
    );

    // Set up interval to update drone position along the path
    let currentIndex = 0;

    simulationInterval.current = setInterval(() => {
      if (currentIndex < simulatedFlightPath.length - 1) {
        currentIndex++;
        const newPosition = simulatedFlightPath[currentIndex];

        setDronePosition(newPosition);
        setFlightPath(prevPath => [...prevPath, newPosition]);
        setCompletionPercent(Math.round((currentIndex / (simulatedFlightPath.length - 1)) * 100));
      } else {
        // End of path reached
        clearInterval(simulationInterval.current);
        simulationInterval.current = null;
        setCompletionPercent(100);

        // Auto-complete the mission if we reach the end of the path
        handleStatusUpdate(mission._id, 'completed');
      }
    }, 1000); // Update position every second
  };

  // Generate a simulated flight path based on the survey area and flight pattern
  const generateSimulatedFlightPath = (polygonCoords, flightPattern, altitude) => {
    const path = [];

    // Get the bounding box of the polygon
    let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;

    polygonCoords.forEach(coord => {
      minLng = Math.min(minLng, coord[0]);
      maxLng = Math.max(maxLng, coord[0]);
      minLat = Math.min(minLat, coord[1]);
      maxLat = Math.max(maxLat, coord[1]);
    });

    // Add first position (start point)
    path.push({ lng: polygonCoords[0][0], lat: polygonCoords[0][1], altitude });

    // Generate different paths based on flight pattern
    if (flightPattern === 'grid') {
      // Grid pattern - lawnmower pattern
      const step = 0.0003; // Small step for visible movement
      const lines = Math.ceil((maxLat - minLat) / step);

      for (let i = 0; i < lines; i++) {
        const lat = minLat + (i * step);

        // Add points along the line, alternating direction
        if (i % 2 === 0) {
          // Left to right
          for (let lng = minLng; lng <= maxLng; lng += step) {
            path.push({ lng, lat, altitude });
          }
        } else {
          // Right to left
          for (let lng = maxLng; lng >= minLng; lng -= step) {
            path.push({ lng, lat, altitude });
          }
        }
      }
    } else if (flightPattern === 'perimeter') {
      // Follow the perimeter first
      polygonCoords.forEach(coord => {
        path.push({ lng: coord[0], lat: coord[1], altitude });
      });

      // Then do a spiral inward
      const centerLng = (minLng + maxLng) / 2;
      const centerLat = (minLat + maxLat) / 2;
      const maxRadius = Math.max((maxLng - minLng) / 2, (maxLat - minLat) / 2);

      for (let radius = maxRadius; radius > maxRadius / 10; radius -= maxRadius / 20) {
        // Add points around a circle
        for (let angle = 0; angle < 360; angle += 10) {
          const radians = (angle * Math.PI) / 180;
          const lng = centerLng + radius * Math.cos(radians) * 0.7; // Adjust for lng/lat distortion
          const lat = centerLat + radius * Math.sin(radians);
          path.push({ lng, lat, altitude });
        }
      }
    } else if (flightPattern === 'crosshatch') {
      // Horizontal lines
      const stepLat = (maxLat - minLat) / 10;
      for (let lat = minLat; lat <= maxLat; lat += stepLat) {
        path.push({ lng: minLng, lat, altitude });
        path.push({ lng: maxLng, lat, altitude });
      }

      // Vertical lines
      const stepLng = (maxLng - minLng) / 10;
      for (let lng = minLng; lng <= maxLng; lng += stepLng) {
        path.push({ lng, lat: minLat, altitude });
        path.push({ lng, lat: maxLat, altitude });
      }

      // Add diagonal lines for complete crosshatch
      path.push({ lng: minLng, lat: minLat, altitude });
      path.push({ lng: maxLng, lat: maxLat, altitude });
      path.push({ lng: minLng, lat: maxLat, altitude });
      path.push({ lng: maxLng, lat: minLat, altitude });
    }

    // Add last position (return to start)
    path.push({ lng: polygonCoords[0][0], lat: polygonCoords[0][1], altitude });

    return path;
  };

  const handleStatusUpdate = async (missionId, newStatus) => {
    try {
      await updateMission(missionId, { status: newStatus });
      // Refresh missions after status update
      fetchMissions();

      if (selectedMission && selectedMission._id === missionId) {
        const updatedMission = { ...selectedMission, status: newStatus };
        setSelectedMission(updatedMission);

        // Start simulation if mission was set to in-progress
        if (newStatus === 'in-progress') {
          startDroneSimulation(updatedMission);
        } else {
          // Stop simulation if mission was completed or aborted
          if (simulationInterval.current) {
            clearInterval(simulationInterval.current);
            simulationInterval.current = null;
            setIsSimulating(false);
          }
        }
      }
    } catch (error) {
      console.error('Error updating mission status:', error);
    }
  };

  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };

  // Check if mission can be edited (only scheduled missions can be edited)
  const canEditMission = (status) => {
    return status === 'scheduled';
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
              <ul className="divide-y divide-gray-200 max-h-[calc(100vh-300px)] overflow-y-auto">
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
                {/* Live Flight Tracking */}
                {selectedMission.status === 'in-progress' && (
                  <div className="mb-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Live Flight Tracking</h3>
                      <div className="h-64 relative mb-3">
                        <MapComponent
                          ref={mapRef}
                          initialLocation={dronePosition || (selectedMission.surveyArea?.coordinates[0][0] ?
                            { lng: selectedMission.surveyArea.coordinates[0][0][0], lat: selectedMission.surveyArea.coordinates[0][0][1] } :
                            null)}
                          dronePosition={dronePosition}
                          flightPath={flightPath}
                          surveyArea={selectedMission.surveyArea}
                        />
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full"
                          style={{ width: `${completionPercent}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Mission Progress</span>
                        <span>{completionPercent}%</span>
                      </div>

                      {dronePosition && (
                        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                          <div className="flex flex-col">
                            <span className="text-gray-500">Current Coordinates</span>
                            <span className="font-medium">
                              {dronePosition.lat.toFixed(6)}, {dronePosition.lng.toFixed(6)}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500">Altitude</span>
                            <span className="font-medium">
                              {dronePosition.altitude || selectedMission.flightParameters.altitude}m
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

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

                      {canEditMission(selectedMission.status) && (
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