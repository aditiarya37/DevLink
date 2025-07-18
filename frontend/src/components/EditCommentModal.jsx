import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const EditCommentModal = ({ commentToEdit, postId, onClose, onCommentUpdated }) => {
  const { token } = useAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (commentToEdit) {
      setText(commentToEdit.text || '');
    }
  }, [commentToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Comment text cannot be empty.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const updatedData = { text };
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.put(
        `${API_BASE_URL}/posts/${postId}/comments/${commentToEdit._id}`,
        updatedData,
        config
      );

      if (onCommentUpdated) {
        onCommentUpdated(response.data); 
      }
      onClose(); 
    } catch (err) {
      console.error('Error updating comment:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Failed to update comment.');
    } finally {
      setLoading(false);
    }
  };

  if (!commentToEdit) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-sky-400">Edit Comment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {error && <p className="mb-4 text-red-400 bg-red-900 border border-red-700 p-3 rounded">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-comment-text" className="block text-sm font-medium text-gray-300 sr-only">
              Comment Text
            </label>
            <textarea
              id="edit-comment-text"
              name="text"
              rows="4"
              className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-700 text-white"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError('');
              }}
              required
            ></textarea>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCommentModal;