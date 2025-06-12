import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CreatePost = ({ onPostCreated }) => {
  const { token, user } = useAuth();
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Post content cannot be empty.');
      return;
    }
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const postData = {
        content,
        tags,
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(`${API_BASE_URL}/posts`, postData, config);

      setSuccessMessage('Post created successfully!');
      setContent('');
      setTags('');

      if (onPostCreated) {
        onPostCreated(response.data);
      }

      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (err) {
      console.error('Error creating post:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-8">
      <h2 className="text-2xl font-semibold text-sky-400 mb-4">Create a New Post</h2>

      {error && <p className="mb-4 text-red-400 bg-red-900 border border-red-700 p-3 rounded">{error}</p>}
      {successMessage && <p className="mb-4 text-green-400 bg-green-900 border border-green-700 p-3 rounded">{successMessage}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-300 sr-only">
            What's on your mind, {user.displayName || user.username}?
          </label>
          <textarea
            id="content"
            name="content"
            rows="4"
            className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-700 text-white"
            placeholder={`What's on your mind, ${user.displayName || user.username}? Share an update, a code snippet, or ask a question...`}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if(error) setError('');
              if(successMessage) setSuccessMessage('');
            }}
            required
          ></textarea>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-300">
            Tags (comma-separated, e.g., react,javascript,webdev)
          </label>
          <input
            type="text"
            name="tags"
            id="tags"
            className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-700 text-white"
            placeholder="e.g., react, nodejs, tailwindcss"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-gray-800 disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;