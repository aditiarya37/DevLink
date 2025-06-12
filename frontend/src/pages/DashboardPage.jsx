import React from 'react';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-sky-400 mb-4">Dashboard</h1>
      {user ? (
        <p className="text-gray-300">Welcome back, {user.displayName || user.username}!</p>
      ) : (
        <p className="text-gray-300">Loading user data...</p>
      )}
      <p className="mt-4 text-gray-400">This is a protected area.</p>
    </div>
  );
};
export default DashboardPage;