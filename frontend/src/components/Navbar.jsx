import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (authLoading && isAuthenticated === null) {
    return (
        <nav className="bg-gray-800 p-4 shadow-lg sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-cyan-400">DevLink</Link>
                <div className="text-gray-300 text-sm">Loading user...</div>
            </div>
        </nav>
    );
  }

  return (
    <nav className="bg-gray-800 p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-cyan-400 hover:text-cyan-300">
          DevLink
        </Link>
        <div className="flex items-center space-x-2 md:space-x-4">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium ${
                isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            Home
          </NavLink>

          {isAuthenticated && user ? (
            <>
              <NavLink
                to={user.username ? `/profile/${user.username}` : '/profile'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                {user.displayName || user.username || 'Profile'}
              </NavLink>
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:bg-red-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;