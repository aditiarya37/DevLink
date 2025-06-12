import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading && isAuthenticated === null) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-xl text-sky-400">Loading DevLink...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 text-center">
      <div className="bg-gray-800 shadow-xl rounded-lg p-8 md:p-12 max-w-2xl mx-auto mt-10">
        <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-6">
          Welcome to DevLink!
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8">
          The premier social network for developers to connect, share, and grow.
        </p>

        {isAuthenticated && user ? (
          <div>
            <p className="text-2xl text-sky-300 mb-4">
              Hello, {user.displayName || user.username}!
            </p>
            <p className="text-gray-400 mb-6">
              Your personalized feed and developer tools are just a click away.
            </p>
            <div className="space-y-4">
              <Link
                to="/dashboard" 
                className="inline-block bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-150 ease-in-out text-lg"
              >
                Go to Your Feed
              </Link>
              <p className="text-sm text-gray-500">(Feed functionality coming soon!)</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-gray-400">
              Join our vibrant community to showcase your projects, collaborate with peers,
              and stay updated with the latest in tech.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/login"
                className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-150 ease-in-out text-lg"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-150 ease-in-out text-lg"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;