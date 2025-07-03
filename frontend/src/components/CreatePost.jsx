import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MentionsInput, Mention } from 'react-mentions';
import defaultMentionStyle from './defaultMentionStyle';
import mentionsInputStyle from './mentionsInputStyle';

const CreatePost = ({ onPostCreated }) => {
  const { token, user } = useAuth();
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null); 
  const [imagePreview, setImagePreview] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const commonLanguages = [
    'javascript', 'python', 'java', 'csharp', 'cpp', 'php', 'ruby', 'go',
    'swift', 'kotlin', 'typescript', 'html', 'css', 'sql', 'bash', 'json', 'xml', 'markdown', 'plaintext'
  ];

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
    
    if (!content.trim() && !imageFile && !code.trim()) {
      alert('Please add some content, an image, or a code snippet.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    const formData = new FormData();
    
    formData.append('content', content);
    formData.append('tags', tags);
    
    if (code.trim()) {
      formData.append('codeSnippet[code]', code);
      formData.append('codeSnippet[language]', codeLanguage.trim().toLowerCase() || 'plaintext');
    }

    if (imageFile) {
      formData.append('postImage', imageFile);
    }

    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      };

      const response = await axios.post(`${API_BASE_URL}/posts`, formData, config);
      
      if (onPostCreated) {
        onPostCreated(response.data);
      }

      setSuccessMessage('Post created successfully!');
      setContent('');
      setTags('');
      setCode('');
      setCodeLanguage('');
      setImageFile(null);
      setImagePreview('');
      
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (err) {
      console.error('Error creating post:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); 
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  if (!user) return null;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-8">
      <h2 className="text-2xl font-semibold text-sky-400 mb-4">Create a New Post</h2>
      {error && <p className="mb-4 text-red-400 bg-red-900 border border-red-700 p-3 rounded">{error}</p>}
      {successMessage && <p className="mb-4 text-green-400 bg-green-900 border border-green-700 p-3 rounded">{successMessage}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="content-mention" className="sr-only">Post Content</label>
          <MentionsInput
            id="content-mention"
            value={content}
            onChange={(event, newValue) => {
                setContent(newValue);
                if(error) setError('');
            }}
            placeholder={`What's on your mind, ${user.displayName || user.username}? Type @ to mention users...`}
            style={mentionsInputStyle}
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

        <div className="my-4">
          {imagePreview && (
            <div className="relative group">
              <img src={imagePreview} alt="Post preview" className="w-full h-auto max-h-96 object-contain rounded-lg" />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview('');
                }}
                className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-1.5 hover:bg-opacity-80 transition-opacity"
                aria-label="Remove image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="mt-2">
            <label htmlFor="image-upload" className="cursor-pointer text-sky-400 hover:text-sky-300 font-semibold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Add Image
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/png, image/jpeg, image/gif"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        </div>

        <div className="border-t border-b border-gray-700 py-4 space-y-3">
            <p className="text-sm text-gray-400">Add a Code Snippet (Optional)</p>
            <div>
                <label htmlFor="codeLanguage" className="block text-sm font-medium text-gray-300 mb-1">
                    Language
                </label>
                <select
                    id="codeLanguage"
                    name="codeLanguage"
                    value={codeLanguage}
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
                <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-1 sr-only">
                    Code
                </label>
                <textarea
                    id="code" name="code" rows="6"
                    className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-700 text-white font-mono text-sm"
                    placeholder="Paste your code here..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                ></textarea>
            </div>
        </div>
        
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-300">
            Tags (comma-separated)
          </label>
          <input
            type="text" name="tags" id="tags"
            className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-700 text-white"
            placeholder="e.g., react, nodejs, algorithms"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <div>
          <button
            type="submit" disabled={loading}
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