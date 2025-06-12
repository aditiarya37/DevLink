import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CreatePost from '../components/CreatePost';
import PostItem from '../components/PostItem';
import EditPostModal from '../components/EditPostModal';

const HomePage = () => {
  const { isAuthenticated, user, loading: authLoading, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState('');
  const [editingPost, setEditingPost] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchPosts = async (pageNum = 1) => {
    setLoadingPosts(true);
    setPostsError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/posts?pageNumber=${pageNum}`);
      setPosts(response.data.posts);
    } catch (err) {
      console.error('Error fetching posts:', err.response ? err.response.data : err.message);
      setPostsError(err.response?.data?.message || 'Could not load posts.');
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [API_BASE_URL]);

  const handlePostCreated = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const handlePostDelete = async (postId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(`${API_BASE_URL}/posts/${postId}`, config);
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err.response ? err.response.data : err.message);
      alert(err.response?.data?.message || "Failed to delete post.");
    }
  };

  const handleOpenEditModal = (post) => {
    setEditingPost(post);
  };

  const handleCloseEditModal = () => {
    setEditingPost(null);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(prevPosts =>
      prevPosts.map(p => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  if (authLoading && isAuthenticated === null) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-xl text-sky-400">Loading DevLink...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      {isAuthenticated && user ? (
        <>
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">
              Welcome back, {user.displayName || user.username}!
            </h1>
            <p className="text-gray-400">Share your thoughts or see what's new.</p>
          </div>
          <CreatePost onPostCreated={handlePostCreated} />
        </>
      ) : (
        <div className="text-center">
            <div className="bg-gray-800 shadow-xl rounded-lg p-8 md:p-12 max-w-2xl mx-auto mt-10">
                <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-6">
                Welcome to DevLink!
                </h1>
                <p className="text-lg md:text-xl text-gray-300 mb-8">
                The premier social network for developers to connect, share, and grow.
                </p>
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
            </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-sky-300 mb-6 text-center md:text-left">
          {isAuthenticated ? "Your Feed" : "Recent Activity"}
        </h2>
        {loadingPosts && (
          <div className="text-center text-sky-400">Loading posts...</div>
        )}
        {postsError && (
          <div className="text-center text-red-500 bg-red-900 border border-red-700 p-3 rounded">{postsError}</div>
        )}
        {!loadingPosts && !postsError && posts.length === 0 && (
          <div className="text-center text-gray-500 bg-gray-800 p-6 rounded-lg">No posts to show yet. Be the first to share!</div>
        )}
        {!loadingPosts && !postsError && posts.length > 0 && (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostItem
                key={post._id}
                post={post}
                onEdit={handleOpenEditModal}
                onDelete={handlePostDelete}
              />
            ))}
          </div>
        )}
      </div>

      {editingPost && (
        <EditPostModal
          postToEdit={editingPost}
          onClose={handleCloseEditModal}
          onPostUpdated={handlePostUpdated}
        />
      )}
    </div>
  );
};

export default HomePage;