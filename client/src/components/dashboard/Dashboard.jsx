// client/src/components/dashboard/Dashboard.jsx
import { useState } from 'react';
import { 
  MapPin, 
  Plane, 
  Calendar, 
  CheckCircle,
  AlertTriangle,
  Battery,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // This would come from a real API in a production app
  const dashboardStats = {
    totalMissions: 24,
    completedMissions: 19,
    inProgressMissions: 2,
    scheduledMissions: 3,
    totalDrones: 8,
    availableDrones: 5,
    maintenanceDrones: 2,
    offlineDrones: 1,
    upcomingMissions: [
      { id: 1, name: 'Factory Roof Inspection', date: '2023-10-15T09:00:00', location: 'Chicago HQ' },
      { id: 2, name: 'Weekly Perimeter Survey', date: '2023-10-16T10:30:00', location: 'Atlanta Campus' },
      { id: 3, name: 'Solar Panel Efficiency Check', date: '2023-10-17T13:00:00', location: 'Phoenix Office' }
    ],
    recentActivities: [
      { id: 1, type: 'completion', mission: 'Monthly Security Survey', time: '2 hours ago' },
      { id: 2, type: 'start', mission: 'Parking Lot Survey', time: '4 hours ago' },
      { id: 3, type: 'scheduled', mission: 'Factory Roof Inspection', time: '6 hours ago' },
      { id: 4, type: 'drone-maintenance', drone: 'Drone-003', time: '1 day ago' }
    ]
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Welcome to your drone survey command center</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Mission Stats Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPin className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Missions
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {dashboardStats.totalMissions}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/missions" className="font-medium text-indigo-600 hover:text-indigo-500">
                View all missions
              </Link>
            </div>
          </div>
        </div>

        {/* Drone Stats Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Plane className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Available Drones
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {dashboardStats.availableDrones} / {dashboardStats.totalDrones}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/fleet" className="font-medium text-indigo-600 hover:text-indigo-500">
                View fleet status
              </Link>
            </div>
          </div>
        </div>

        {/* Scheduled Missions Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Scheduled Missions
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {dashboardStats.scheduledMissions}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/schedule" className="font-medium text-indigo-600 hover:text-indigo-500">
                View schedule
              </Link>
            </div>
          </div>
        </div>

        {/* Completed Missions Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed Missions
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {dashboardStats.completedMissions}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/analytics" className="font-medium text-indigo-600 hover:text-indigo-500">
                View analytics
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h2>
        <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                  <MapPin className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Plan New Mission</h3>
                  <p className="mt-1 text-sm text-gray-500">Create a new drone survey mission</p>
                </div>
              </div>
              <div className="mt-5">
                <Link
                  to="/missions/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Mission
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <Plane className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Check Fleet Status</h3>
                  <p className="mt-1 text-sm text-gray-500">View and manage your drone fleet</p>
                </div>
              </div>
              <div className="mt-5">
                <Link
                  to="/fleet"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  View Fleet
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">View Mission Calendar</h3>
                  <p className="mt-1 text-sm text-gray-500">See your mission schedule</p>
                </div>
              </div>
              <div className="mt-5">
                <Link
                  to="/schedule"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  View Calendar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Missions and Recent Activity section */}
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Upcoming Missions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Upcoming Missions
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {dashboardStats.upcomingMissions.map((mission) => (
                  <li key={mission.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-indigo-100 text-indigo-600">
                          <MapPin className="h-6 w-6" />
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {mission.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {mission.location}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <p className="text-sm text-gray-500">
                          {new Date(mission.date).toLocaleDateString()} at{' '}
                          {new Date(mission.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <Link
                to="/schedule"
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                View All
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Activity
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {dashboardStats.recentActivities.map((activity) => (
                  <li key={activity.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {activity.type === 'completion' && (
                          <span className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-green-100 text-green-600">
                            <CheckCircle className="h-6 w-6" />
                          </span>
                        )}
                        {activity.type === 'start' && (
                          <span className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-blue-100 text-blue-600">
                            <MapPin className="h-6 w-6" />
                          </span>
                        )}
                        {activity.type === 'scheduled' && (
                          <span className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-indigo-100 text-indigo-600">
                            <Calendar className="h-6 w-6" />
                          </span>
                        )}
                        {activity.type === 'drone-maintenance' && (
                          <span className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-yellow-100 text-yellow-600">
                            <AlertTriangle className="h-6 w-6" />
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.type === 'completion' && `Mission Completed: ${activity.mission}`}
                          {activity.type === 'start' && `Mission Started: ${activity.mission}`}
                          {activity.type === 'scheduled' && `Mission Scheduled: ${activity.mission}`}
                          {activity.type === 'drone-maintenance' && `Drone Maintenance: ${activity.drone}`}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <Link
                to="/activity"
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                View All Activity
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;