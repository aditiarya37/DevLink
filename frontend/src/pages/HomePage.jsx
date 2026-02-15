import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import CreatePost from "../components/CreatePost";
import PostItem from "../components/PostItem";
import EditPostModal from "../components/EditPostModal";

const HomePage = () => {
  const { isAuthenticated, user, loading: authLoading, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState("");
  const [editingPost, setEditingPost] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch posts based on auth state
  const fetchPosts = useCallback(
    async (pageNum = 1) => {
      setLoadingPosts(true);
      setPostsError("");
      try {
        let url;
        if (isAuthenticated) {
          // Authenticated users get their personalized feed
          url = `${API_BASE_URL}/posts?pageNumber=${pageNum}`;
        } else {
          // Unauthenticated users get the global public feed
          url = `${API_BASE_URL}/posts/global?pageNumber=${pageNum}`;
        }
        const response = await axios.get(url);
        setPosts(response.data.posts || []);
      } catch (err) {
        console.error(
          "Error fetching posts:",
          err.response ? err.response.data : err.message,
        );
        if (isAuthenticated && err.response && err.response.status === 401) {
          setPostsError("Your session may have expired. Please log in again.");
        } else if (!isAuthenticated && err.response) {
          setPostsError(
            "Could not load recent activity. Please try again later.",
          );
        } else {
          setPostsError(err.response?.data?.message || "Could not load posts.");
        }
        setPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    },
    [API_BASE_URL, isAuthenticated],
  );

  // Initial load
  useEffect(() => {
    const action = () => {
      if (!authLoading) {
        fetchPosts();
      } else {
        setPosts([]);
        setLoadingPosts(true);
      }
    };
    action();
  }, [authLoading, fetchPosts]);

  const handlePostCreated = (newPost) => {
    if (isAuthenticated) {
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    } else {
      fetchPosts();
    }
  };

  const handlePostDelete = async (postId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE_URL}/posts/${postId}`, config);
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
    } catch (err) {
      console.error(
        "Error deleting post:",
        err.response ? err.response.data : err.message,
      );
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
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p._id === updatedPost._id ? updatedPost : p)),
    );
  };

  if (authLoading) {
    return (
      <div className="container mx-auto p-4 text-center mt-20">
        <div className="animate-pulse text-xl text-sky-400 font-medium">
          Loading DevLink...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* LANDING PAGE HEADER (Unauthenticated) */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 pb-16 pt-20 px-4">
          <div className="container mx-auto max-w-5xl text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-500 mb-6 tracking-tight">
              Connect. Code. Collaborate.
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              DevLink is the premier social network for developers. Share your
              projects, find answers, and grow your career with a community that
              speaks your language.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white text-lg font-bold rounded-lg shadow-lg hover:shadow-sky-500/30 transition-all transform hover:-translate-y-1"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white text-lg font-bold rounded-lg shadow-lg transition-all transform hover:-translate-y-1 border border-gray-600"
              >
                Log In
              </Link>
            </div>

            {/* Feature Highlights */}
            <div className="grid md:grid-cols-3 gap-8 text-left mt-12">
              <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 shadow-sm">
                <div className="text-cyan-400 mb-4">
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Share Code Snippets
                </h3>
                <p className="text-gray-400">
                  Post code with syntax highlighting and get feedback from peers
                  instantly.
                </p>
              </div>
              <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 shadow-sm">
                <div className="text-purple-400 mb-4">
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Connect with Devs
                </h3>
                <p className="text-gray-400">
                  Follow other developers, network, and find collaborators for
                  your next big idea.
                </p>
              </div>
              <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 shadow-sm">
                <div className="text-green-400 mb-4">
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Stay Updated
                </h3>
                <p className="text-gray-400">
                  Your feed is personalized to show you the latest trends,
                  libraries, and discussions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT CONTAINER */}
      <div className="container mx-auto p-4 max-w-3xl">
        {/* DASHBOARD HEADER (Authenticated) */}
        {isAuthenticated && user && (
          <div className="mb-8 mt-6">
            <h1 className="text-3xl font-bold text-gray-100 mb-2">
              Welcome back,{" "}
              <span className="text-cyan-400">
                {user.displayName || user.username}
              </span>
              !
            </h1>
            <CreatePost onPostCreated={handlePostCreated} />
          </div>
        )}

        {/* FEED SECTION (Shared by both Auth and Non-Auth) */}
        <div className={!isAuthenticated ? "mt-16" : "mt-10"}>
          <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
            <h2 className="text-2xl font-bold text-gray-200">
              {isAuthenticated ? "Your Feed" : "Recent Activity"}
            </h2>
            {!isAuthenticated && (
              <span className="text-sm text-gray-500 uppercase tracking-wider font-semibold">
                Global Feed
              </span>
            )}
          </div>

          {loadingPosts && (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500 mb-2"></div>
              <p className="text-gray-400">Loading posts...</p>
            </div>
          )}

          {postsError && (
            <div className="text-center text-red-200 bg-red-900/50 border border-red-800 p-4 rounded-lg">
              {postsError}
            </div>
          )}

          {!loadingPosts && !postsError && posts.length === 0 && (
            <div className="text-center bg-gray-800/50 p-8 rounded-xl border border-gray-700 border-dashed">
              <p className="text-gray-400 text-lg">
                {isAuthenticated
                  ? "Your feed is empty. Follow some developers or create your first post!"
                  : "No recent activity to show right now. Be the first to post!"}
              </p>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="inline-block mt-4 text-sky-400 hover:text-sky-300 font-medium"
                >
                  Create an account to post &rarr;
                </Link>
              )}
            </div>
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
