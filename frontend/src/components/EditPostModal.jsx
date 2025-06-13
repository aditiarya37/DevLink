import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MentionsInput, Mention } from 'react-mentions';
import defaultMentionStyle from './defaultMentionStyle';
import mentionsInputStyle from './mentionsInputStyle';

const EditPostModal = ({ postToEdit, onClose, onPostUpdated }) => {
  const { token, user: currentUser } = useAuth();
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const commonLanguages = [
    'javascript', 'python', 'java', 'csharp', 'cpp', 'php', 'ruby', 'go',
    'swift', 'kotlin', 'typescript', 'html', 'css', 'sql', 'bash', 'json', 'xml', 'markdown', 'plaintext'
  ];

  useEffect(() => {
    if (postToEdit) {
      setContent(postToEdit.content || '');
      setTags(postToEdit.tags ? postToEdit.tags.join(', ') : '');
      setCodeLanguage(postToEdit.codeSnippet?.language || '');
      setCode(postToEdit.codeSnippet?.code || '');
    }
  }, [postToEdit]);

  const fetchUsersForMention = useCallback(async (query, callback) => {
    if (!query || query.length < 1) {
      return callback([]);
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}&limit=5`);
      if (response.data.users) {
        const suggestions = response.data.users.map(u => ({
          id: u.username,
          display: `${u.displayName} (@${u.username})`,
        }));
        callback(suggestions);
      } else {
        callback([]);
      }
    } catch (err) {
      console.error("Error fetching users for mention:", err);
      callback([]);
    }
  }, [API_BASE_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !code.trim()) {
      setError('Post must include content or a code snippet.');
      return;
    }
    if (code.trim() && !codeLanguage.trim()) {
        setError('Please select a language for your code snippet.');
        return;
    }
    setError('');
    setLoading(true);
    try {
      const updatedData = { content, tags };
      if (code.trim()) {
        updatedData.codeSnippet = {
          language: codeLanguage.trim().toLowerCase() || 'plaintext',
          code: code,
        };
      } else {
        updatedData.codeSnippet = { code: null, language: null };
      }
      const config = { 
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.put(`${API_BASE_URL}/posts/${postToEdit._id}`, updatedData, config);
      if (onPostUpdated) {
        onPostUpdated(response.data);
      }
      onClose();
    } catch (err) {
      console.error('Error updating post:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Failed to update post.');
    } finally {
      setLoading(false);
    }
  };

  if (!postToEdit) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-sky-400">Edit Post</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200 text-2xl">×</button>
        </div>
        {error && <p className="mb-4 text-red-400 bg-red-900 border border-red-700 p-3 rounded">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-content-mention" className="sr-only">Post Content</label>
            <MentionsInput
              id="edit-content-mention"
              value={content}
              onChange={(event, newValue) => {
                  setContent(newValue);
                  if(error) setError('');
              }}
              placeholder={currentUser ? `What's on your mind, ${currentUser.displayName || currentUser.username}? Type @ to mention users...` : "Edit post content..."}
              style={mentionsInputStyle}
              className="mentions-textarea-wrapper"
              singleLine={false}
              a11ySuggestionsListLabel={"Suggested users to mention"}
            >
              <Mention
                trigger="@"
                data={fetchUsersForMention}
                markup="@@@__id__@@@"
                style={defaultMentionStyle}
                displayTransform={(id, display) => `@${id}`}
                appendSpaceOnAdd={true}
                renderSuggestion={(suggestion, search, highlightedDisplay, index, focused) => (
                  <div className={`px-3 py-2 ${focused ? 'bg-gray-600 text-white' : 'text-gray-300'}`}>
                    {highlightedDisplay}
                  </div>
                )}
              />
            </MentionsInput>
          </div>

          <div className="border-t border-b border-gray-700 py-4 space-y-3">
            <p className="text-sm text-gray-400">Edit Code Snippet (Leave code blank to remove)</p>
            <div>
                <label htmlFor="edit-codeLanguage" className="block text-sm font-medium text-gray-300 mb-1">
                    Language
                </label>
                <select
                    id="edit-codeLanguage" name="codeLanguage" value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-700 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md bg-gray-700 text-white"
                >
                    <option value="">Select Language</option>
                    {commonLanguages.map(lang => (
                        <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="edit-code" className="sr-only">Code</label>
                <textarea
                    id="edit-code" name="code" rows="6"
                    className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-700 text-white font-mono text-sm"
                    placeholder="Paste your code here..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                ></textarea>
            </div>
          </div>
          
          <div>
            <label htmlFor="edit-tags" className="block text-sm font-medium text-gray-300">
              Tags (comma-separated)
            </label>
            <input
              type="text" name="tags" id="edit-tags"
              className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-700 text-white"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPostModal;