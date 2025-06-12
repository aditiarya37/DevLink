import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link }  from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PostItem from '../components/PostItem';
import EditPostModal from '../components/EditPostModal';
import { FaGithub, FaLinkedin, FaLink, FaMapMarkerAlt } from 'react-icons/fa';

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
  }, [routeUsername, API_BASE_URL, currentUser]);

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
      setUserPosts(prevPosts => prevPosts.filter(p => p._id !== postId));
      setProfileUser(prev => ({...prev, postCount: Math.max(0, (prev.postCount || 1) -1)})); 
    } catch (err) {
      console.error("Error deleting post from profile:", err.response ? err.response.data : err.message);
      alert(err.response?.data?.message || "Failed to delete post.");
    }
  };

  const handleOpenEditModalOnProfile = (postToEdit) => { setEditingPost(postToEdit); };
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

  const profileInitial = profileUser.username ? profileUser.username.charAt(0).toUpperCase() : 'P';

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="bg-gray-800 shadow-xl rounded-lg p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
          <img
            src={profileUser.profilePicture || `https://ui-avatars.com/api/?name=${profileInitial}&background=random&color=fff&size=150&font-size=0.33&length=1`}
            alt={profileUser.displayName || profileUser.username}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-sky-500 object-cover flex-shrink-0"
          />
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-3xl md:text-4xl font-bold text-sky-400">
              {profileUser.displayName || profileUser.username}
            </h1>
            <p className="text-lg text-gray-400">@{profileUser.username.toLowerCase()}</p>
            
            {profileUser.location && (
              <p className="text-sm text-gray-500 mt-2 flex items-center justify-center md:justify-start">
                <FaMapMarkerAlt className="mr-1.5 h-4 w-4 text-gray-400" /> {profileUser.location}
              </p>
            )}

            {profileUser.bio ? (
              <p className="text-gray-300 mt-3 whitespace-pre-wrap">{profileUser.bio}</p>
            ) : (
              !isOwnProfile && <p className="text-gray-500 mt-3 italic">No bio yet.</p>
            )}

            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2">
              {profileUser.links?.github && (
                <a href={profileUser.links.github} target="_blank" rel="noopener noreferrer" title="GitHub Profile" className="text-gray-400 hover:text-sky-400 flex items-center text-sm">
                  <FaGithub className="mr-1.5 h-5 w-5" /> GitHub
                </a>
              )}
              {profileUser.links?.linkedin && (
                <a href={profileUser.links.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn Profile" className="text-gray-400 hover:text-sky-400 flex items-center text-sm">
                  <FaLinkedin className="mr-1.5 h-5 w-5" /> LinkedIn
                </a>
              )}
              {profileUser.links?.website && (
                <a href={profileUser.links.website} target="_blank" rel="noopener noreferrer" title="Personal Website" className="text-gray-400 hover:text-sky-400 flex items-center text-sm">
                  <FaLink className="mr-1.5 h-5 w-5" /> Website
                </a>
              )}
            </div>

            <div className="mt-5">
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

        <div className="mt-4 pt-4 border-t border-gray-700 flex justify-center md:justify-start space-x-6">
            <div><span className="font-bold text-white">{profileUser.followerCount || 0}</span> <span className="text-gray-400">Followers</span></div>
            <div><span className="font-bold text-white">{profileUser.followingCount || 0}</span> <span className="text-gray-400">Following</span></div>
        </div>

        {profileUser.skills && profileUser.skills.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="text-xl font-semibold text-sky-300 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                    {profileUser.skills.map(skill => (
                        <span key={skill} className="bg-sky-700 text-sky-100 text-xs font-medium px-3 py-1 rounded-full">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-sky-300 mb-6">
          Posts by {profileUser.displayName || profileUser.username}
        </h2>
        {loadingPosts && <div className="text-center text-sky-400">Loading posts...</div>}
        {!loadingPosts && !error && userPosts.length === 0 && (
          <div className="bg-gray-800 p-6 rounded-lg text-center text-gray-500 italic">
            This user hasn't made any posts yet.
          </div>
        )}
         {!loadingPosts && error && userPosts.length === 0 && ( 
          <div className="bg-gray-800 p-6 rounded-lg text-center text-red-400 italic">
            Could not load posts for this user.
          </div>
        )}
        {userPosts.length > 0 && (
          <div className="space-y-6">
            {userPosts.map((postFromMap) => (
              <PostItem
                key={postFromMap._id}
                post={postFromMap}
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