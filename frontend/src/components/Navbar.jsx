import React, { useState, useEffect, useRef } from 'react'; 
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationList from './NotificationList'; 

const Navbar = () => {
  const { isAuthenticated, user, logout, loading: authLoading, unreadNotificationCount } = useAuth();
  const navigate = useNavigate();
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const notificationDropdownRef = useRef(null); 

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        const bellButton = document.getElementById('notifications-menu-button');
        if (bellButton && !bellButton.contains(event.target)) {
            setShowNotificationsDropdown(false);
        }
      }
    };

    if (showNotificationsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationsDropdown]);


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
        <div className="flex items-center space-x-3 md:space-x-4">
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
              <div className="relative" ref={notificationDropdownRef}>
                <button
                  onClick={() => setShowNotificationsDropdown(prev => !prev)}
                  className="text-gray-300 hover:text-white p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                  aria-label="View notifications"
                  id="notifications-menu-button"
                  aria-expanded={showNotificationsDropdown}
                  aria-haspopup="true"
                >
                  <BellIcon />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center pointer-events-none">
                      {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                    </span>
                  )}
                </button>
                {showNotificationsDropdown && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-80 md:w-96 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-20"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="notifications-menu-button"
                  >
                    <div className="px-4 py-3 border-b border-gray-600">
                        <p className="text-sm font-medium text-white">Notifications</p>
                    </div>
                    
                    <NotificationList closeDropdown={() => setShowNotificationsDropdown(false)} />
                    
                    <div className="px-4 py-2 border-t border-gray-600 text-center block" role="none">
                        <Link 
                            to="/notifications" 
                            onClick={() => setShowNotificationsDropdown(false)} 
                            className="text-xs text-sky-400 hover:underline"
                            role="menuitem"
                        >
                            View all notifications
                        </Link>
                    </div>
                  </div>
                )}
              </div>

              <NavLink
                to={user.username ? `/profile/${user.username.toLowerCase()}` : '/profile'}
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