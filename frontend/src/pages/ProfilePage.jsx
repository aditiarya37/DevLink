import React, { useEffect, useState } from 'react';
import { useParams, Link }  from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { username: routeUsername } = useParams();
  const { user: currentUser, isAuthenticated, loading: authLoading } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!routeUsername) {
        setError('No username provided in URL.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${API_BASE_URL}/users/profile/${routeUsername.toLowerCase()}`);
        setProfileUser(response.data);
      } catch (err) {
        console.error('Error fetching profile:', err.response ? err.response.data : err.message);
        setError(err.response?.data?.message || 'Failed to load profile. User may not exist.');
        setProfileUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
        fetchUserProfile();
    }

  }, [routeUsername, API_BASE_URL, authLoading]); 

  const isCurrentUserProfile = isAuthenticated && currentUser && currentUser.username === routeUsername;

  if (loading || authLoading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-xl text-sky-400">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-xl text-red-500">{error}</p>
        <Link to="/" className="mt-4 inline-block text-sky-400 hover:text-sky-300">
          Go to Homepage
        </Link>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-xl text-gray-400">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <img
            src={profileUser.profilePicture || `https://via.placeholder.com/150/CBD5E0/1A202C?text=${profileUser.username.charAt(0).toUpperCase()}`}
            alt={profileUser.displayName || profileUser.username}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-sky-500 object-cover mb-6 md:mb-0 md:mr-8"
          />
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-3xl md:text-4xl font-bold text-sky-400">
              {profileUser.displayName || profileUser.username}
            </h1>
            <p className="text-lg text-gray-400 mb-1">@{profileUser.username}</p>
            {profileUser.email && (isCurrentUserProfile || !profileUser.emailIsPrivate) && ( 
                 <p className="text-sm text-gray-500 mb-4">{profileUser.email}</p>
            )}


            {profileUser.bio ? (
              <p className="text-gray-300 mt-2 whitespace-pre-wrap">{profileUser.bio}</p>
            ) : (
              <p className="text-gray-500 mt-2 italic">No bio yet.</p>
            )}

            {isCurrentUserProfile && (
              <Link
                to="/profile/edit" 
                className="mt-6 inline-block bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
              >
                Edit Profile
              </Link>
            )}
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-6">
          <h2 className="text-2xl font-semibold text-sky-300 mb-4">Activity</h2>
          <p className="text-gray-500 italic">(User's posts and interactions will appear here)</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;