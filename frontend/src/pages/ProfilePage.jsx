import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link }  from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PostItem from '../components/PostItem';
import EditPostModal from '../components/EditPostModal';

const ProfilePage = () => {
  const { username: routeUsername } = useParams();
  const { user: currentUser, isAuthenticated, loading: authLoading, token } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const isOwnProfile = isAuthenticated && currentUser && currentUser.username === routeUsername?.toLowerCase();

  const fetchProfileData = useCallback(async () => {
    if (!routeUsername) {
      setError('No username provided in URL.');
      setLoadingProfile(false); setLoadingPosts(false); return;
    }
    setLoadingProfile(true); setLoadingPosts(true); setError('');

    try {
      const profileRes = await axios.get(`${API_BASE_URL}/users/profile/${routeUsername.toLowerCase()}`);
      const fetchedProfileUser = profileRes.data;
      setProfileUser(fetchedProfileUser);

      if (fetchedProfileUser && fetchedProfileUser._id) {
        const postsRes = await axios.get(`${API_BASE_URL}/posts/user/${fetchedProfileUser._id}`);
        setUserPosts(postsRes.data);

        if (currentUser && fetchedProfileUser._id !== currentUser._id && Array.isArray(currentUser.following)) {
          const currentlyFollowing = currentUser.following.some(
            (followedUserId) => followedUserId === fetchedProfileUser._id
          );
          setIsFollowing(currentlyFollowing);
        } else {
          setIsFollowing(false);
        }
      } else {
        setUserPosts([]);
        setIsFollowing(false);
      }
    } catch (err) {
      console.error('Error fetching profile or posts:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Failed to load profile or posts. User may not exist.');
      setProfileUser(null); setUserPosts([]); setIsFollowing(false);
    } finally {
      setLoadingProfile(false); setLoadingPosts(false);
    }
  }, [routeUsername, API_BASE_URL, currentUser]); // Removed authLoading, let parent handle initial load blocking

  useEffect(() => {
    if (!authLoading) {
      fetchProfileData();
    }
  }, [authLoading, fetchProfileData]);


  const handleFollowToggle = async () => {
    if (!profileUser || !profileUser._id || !token || isOwnProfile) return;
    setFollowLoading(true);
    const action = isFollowing ? 'unfollow' : 'follow';
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_BASE_URL}/users/${profileUser._id}/${action}`, {}, config);
      setIsFollowing(!isFollowing);
      // TODO: Update follower count on profileUser and current user in AuthContext.
      // For now, we might need to re-fetch currentUser to update its 'following' list accurately
      // Or have the backend return the updated currentUser.following list.
    } catch (err) {
      console.error(`Error ${action}ing user:`, err.response ? err.response.data : err.message);
      alert(`Failed to ${action} user. ` + (err.response?.data?.message || ''));
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostDeleteOnProfile = async (postId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE_URL}/posts/${postId}`, config);
      setUserPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
    } catch (err) {
      console.error("Error deleting post from profile:", err.response ? err.response.data : err.message);
      alert(err.response?.data?.message || "Failed to delete post.");
    }
  };

  const handleOpenEditModalOnProfile = (post) => { setEditingPost(post); };
  const handleCloseEditModalOnProfile = () => { setEditingPost(null); };
  const handlePostUpdatedOnProfile = (updatedPost) => {
    setUserPosts(prevPosts =>
      prevPosts.map(p => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  const isLoading = loadingProfile || authLoading;

  if (isLoading) {
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
      <div className="bg-gray-800 shadow-xl rounded-lg p-6 md:p-8 mb-8">
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
            <p className="text-lg text-gray-400 mb-1">@{profileUser.username.toLowerCase()}</p>
            {profileUser.email && (isOwnProfile) && (
                 <p className="text-sm text-gray-500 mb-4">{profileUser.email}</p>
            )}
            {profileUser.bio ? (
              <p className="text-gray-300 mt-2 whitespace-pre-wrap">{profileUser.bio}</p>
            ) : (
              <p className="text-gray-500 mt-2 italic">No bio yet.</p>
            )}

            <div className="mt-6">
              {isAuthenticated && !isOwnProfile && profileUser && (
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading || authLoading}
                  className={`px-6 py-2 rounded-md shadow-sm text-sm font-medium text-white transition duration-150 ease-in-out disabled:opacity-70
                    ${isFollowing
                      ? 'bg-gray-600 hover:bg-gray-700'
                      : 'bg-green-500 hover:bg-green-600'
                    }`}
                >
                  {followLoading ? '...' : (isFollowing ? 'Unfollow' : 'Follow')}
                </button>
              )}
              {isOwnProfile && (
                <Link
                  to="/profile/edit"
                  className="inline-block bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm"
                >
                  Edit Profile
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-sky-300 mb-6">
          Posts by {profileUser.displayName || profileUser.username}
        </h2>
        {loadingPosts && <div className="text-center text-sky-400">Loading posts...</div>}
        {!loadingPosts && userPosts.length === 0 && (
          <div className="bg-gray-800 p-6 rounded-lg text-center text-gray-500 italic">
            This user hasn't made any posts yet.
          </div>
        )}
        {userPosts.length > 0 && (
          <div className="space-y-6">
            {userPosts.map((post) => (
              <PostItem
                key={post._id}
                post={post}
                onEdit={handleOpenEditModalOnProfile}
                onDelete={handlePostDeleteOnProfile}
              />
            ))}
          </div>
        )}
      </div>

      {editingPost && (
        <EditPostModal
          postToEdit={editingPost}
          onClose={handleCloseEditModalOnProfile}
          onPostUpdated={handlePostUpdatedOnProfile}
        />
      )}
    </div>
  );
};

export default ProfilePage;