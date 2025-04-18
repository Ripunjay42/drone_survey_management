import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout Components
import DashboardLayout from './components/layout/DashboardLayout';

// Dashboard Components
import Dashboard from './components/dashboard/Dashboard';

// Mission Planning Components
import MissionsList from './components/missions/MissionsList';
import MissionPlanningForm from './components/missions/MissionPlanningForm';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes with Dashboard Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Mission Routes */}
            <Route path="/missions" element={<MissionsList />} />
            <Route path="/missions/new" element={<MissionPlanningForm />} />
            
            {/* These routes are placeholders for future implementation */}
            <Route path="/fleet" element={<div className="p-8">Fleet Management (Coming Soon)</div>} />
            <Route path="/analytics" element={<div className="p-8">Analytics (Coming Soon)</div>} />
            <Route path="/schedule" element={<div className="p-8">Schedule (Coming Soon)</div>} />
            <Route path="/users" element={<div className="p-8">Users (Coming Soon)</div>} />
            <Route path="/settings" element={<div className="p-8">Settings (Coming Soon)</div>} />
            <Route path="/activity" element={<div className="p-8">Activity (Coming Soon)</div>} />
          </Route>
        </Route>
        
        {/* Redirect to dashboard if authenticated, or login if not */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
