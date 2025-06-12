import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import PostItem from '../components/PostItem';
import { useAuth } from '../context/AuthContext';

const TagFeedPage = () => {
  const { tagName } = useParams(); 
  const { token } = useAuth(); 

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);

  const [editingPost, setEditingPost] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchPostsByTag = useCallback(async (currentPage = 1) => {
    if (!tagName) return;
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/posts/tag/${encodeURIComponent(tagName.toLowerCase())}?pageNumber=${currentPage}`);
      setPosts(response.data.posts || []);
      setPage(response.data.page || 1);
      setTotalPages(response.data.pages || 1);
      setCount(response.data.count || 0);
      if (response.data.posts.length === 0 && response.data.message) {
        setError(response.data.message);
      }
    } catch (err) {
      console.error(`Error fetching posts for tag #${tagName}:`, err);
      setError(err.response?.data?.message || `Could not load posts for tag #${tagName}.`);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [tagName, API_BASE_URL]);

  useEffect(() => {
    fetchPostsByTag(1); 
  }, [fetchPostsByTag]);

  const handlePostDelete = async (postId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE_URL}/posts/${postId}`, config);
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      setCount(prevCount => prevCount -1);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete post.");
    }
  };
  const handleOpenEditModal = (post) => setEditingPost(post);
  const handleCloseEditModal = () => setEditingPost(null);
  const handlePostUpdated = (updatedPost) => {
    setPosts(prevPosts =>
      prevPosts.map(p => (p._id === updatedPost._id ? updatedPost : p))
    );
  };


  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold text-sky-400 mb-2">
        Posts tagged with: <span className="text-white">#{tagName}</span>
      </h1>
      <p className="text-sm text-gray-400 mb-6">
        {count} {count === 1 ? 'post' : 'posts'} found.
      </p>

      {loading && <div className="text-center text-sky-400">Loading posts...</div>}
      
      {!loading && error && posts.length === 0 && ( 
        <div className="text-center text-gray-500 bg-gray-800 p-6 rounded-lg">{error}</div>
      )}

      {!loading && !error && posts.length === 0 && ( 
         <div className="text-center text-gray-500 bg-gray-800 p-6 rounded-lg">
            No posts found for this tag yet.
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="space-y-6">
          {posts.map(post => (
            <PostItem
              key={post._id}
              post={post}
              onEdit={handleOpenEditModal}
              onDelete={handlePostDelete}
            />
          ))}
        </div>
      )}

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

export default TagFeedPage;