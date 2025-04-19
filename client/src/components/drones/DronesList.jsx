// client/src/components/drones/DronesList.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useDroneStore from '../../stores/droneStore';
import { fetchDrones, deleteDrone } from '../../services/droneService';
import { Battery, AlertTriangle, Check, Plane } from 'lucide-react';

const DronesList = () => {
  const { drones, isLoading, error } = useDroneStore();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  useEffect(() => {
    // Fetch drones on component mount
    fetchDrones();
  }, []);
  
  const handleDelete = async (id) => {
    const success = await deleteDrone(id);
    if (success) {
      setDeleteConfirm(null);
    }
  };
  
  const getBatteryColorClass = (level) => {
    if (level > 70) return 'bg-green-500';
    if (level > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  const getStatusInfo = (status) => {
    switch(status) {
      case 'available':
        return { color: 'bg-green-100 text-green-800', label: 'Available' };
      case 'in-mission':
        return { color: 'bg-blue-100 text-blue-800', label: 'In Mission' };
      case 'maintenance':
        return { color: 'bg-yellow-100 text-yellow-800', label: 'Maintenance' };
      case 'offline':
        return { color: 'bg-red-100 text-red-800', label: 'Offline' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: status };
    }
  };
  
  if (isLoading && drones.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading drones...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Drone Fleet</h1>
          <p className="text-gray-600">Manage your drone inventory</p>
        </div>
        <Link
          to="/fleet/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add New Drone
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      
      {drones.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
          <div className="px-4 py-16 sm:px-6 text-center">
            <Plane className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No drones found</h3>
            <p className="mt-1 text-gray-500">Get started by adding a new drone to your fleet.</p>
            <div className="mt-6">
              <Link
                to="/fleet/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add New Drone
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {drones.map((drone) => {
              const statusInfo = getStatusInfo(drone.status);
              
              return (
                <li key={drone._id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {drone.status === 'available' ? (
                            <Check className="h-8 w-8 text-green-500" />
                          ) : drone.status === 'maintenance' ? (
                            <AlertTriangle className="h-8 w-8 text-yellow-500" />
                          ) : (
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                          )}
                        </div>
                        <div className="ml-4">
                          <p className="text-lg font-medium text-indigo-600 truncate">
                            {drone.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Model: {drone.model} | S/N: {drone.serialNumber}
                          </p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <div className="flex items-center text-sm text-gray-500">
                          <Battery className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-1">
                            <div 
                              className={`h-2.5 rounded-full ${getBatteryColorClass(drone.batteryLevel)}`} 
                              style={{ width: `${drone.batteryLevel}%` }}
                            ></div>
                          </div>
                          <span>{drone.batteryLevel}%</span>
                        </div>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
                          </svg>
                          Max flight time: {drone.maxFlightTime} minutes
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <div className="flex space-x-2">
                          <Link
                            to={`/fleet/${drone._id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </Link>
                          <span className="text-gray-300">|</span>
                          <Link
                            to={`/fleet/${drone._id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </Link>
                          <span className="text-gray-300">|</span>
                          {deleteConfirm === drone._id ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleDelete(drone._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(drone._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DronesList;