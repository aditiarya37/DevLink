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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [shouldRemoveMedia, setShouldRemoveMedia] = useState(false);

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
      if (postToEdit.mediaUrl) {
        setImagePreview(postToEdit.mediaUrl);
      } else {
        setImagePreview('');
      }
      
      setImageFile(null);
      setShouldRemoveMedia(false);
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

    if (!content.trim() && !code.trim() && !imageFile && (postToEdit.mediaUrl && !shouldRemoveMedia)) {
      alert('A post cannot be completely empty. Please add some content, an image, or a code snippet.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();

    formData.append('content', content);
    formData.append('tags', tags);
    
    if (code.trim()) {
      formData.append('codeSnippet[code]', code);
      formData.append('codeSnippet[language]', codeLanguage.trim().toLowerCase() || 'plaintext');
    } else {
      formData.append('codeSnippet[code]', ''); 
    }

    if (imageFile) {
      formData.append('postImage', imageFile);
    }

    if (shouldRemoveMedia) {
      formData.append('removeMedia', 'true');
    }
    
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      };

      const { data } = await axios.put(`${API_BASE_URL}/posts/${postToEdit._id}`, formData, config);

      onPostUpdated(data); 
      onClose(); 

    } catch (err) {
      console.error("Failed to update post:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'An error occurred while updating the post.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setShouldRemoveMedia(false);
    }
  };

  if (!postToEdit) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-start p-4 pt-10 sm:pt-16 md:pt-20 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex-shrink-0 p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-sky-400">Edit Post</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200 text-3xl leading-none font-light">×</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
          
          {error && <p className="mb-4 text-red-400 bg-red-900 border border-red-700 p-3 rounded">{error}</p>}

          <div>
            <label htmlFor="edit-content-mention" className="sr-only">Post Content</label>
            <MentionsInput
              id="edit-content-mention"
              value={content}
              onChange={(event, newValue) => {
                  setContent(newValue);
                  if(error) setError('');
              }}
              placeholder={currentUser ? `What's on your mind, ${currentUser.displayName || currentUser.username}?` : "Edit post content..."}
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

          <div className="my-4">
            {imagePreview && (
              <div className="relative group">
                <img src={imagePreview} alt="Post preview" className="w-full h-auto max-h-80 object-contain rounded-lg" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview('');
                    setShouldRemoveMedia(true); 
                  }}
                  className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-1.5"
                  aria-label="Remove image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}
            <div className="mt-2">
              <label htmlFor="edit-image-upload" className="cursor-pointer text-sky-400 hover:text-sky-300 font-semibold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {postToEdit.mediaUrl || imagePreview ? 'Replace Image' : 'Add Image'}
              </label>
              <input id="edit-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>
          </div>

          <div className="border-t border-b border-gray-700 py-4 space-y-3">
            <p className="text-sm text-gray-400">Edit Code Snippet (Leave code blank to remove)</p>
            <div>
                <label htmlFor="edit-codeLanguage" className="block text-sm font-medium text-gray-300 mb-1">Language</label>
                <select id="edit-codeLanguage" name="codeLanguage" value={codeLanguage} onChange={(e) => setCodeLanguage(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-700 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md bg-gray-700 text-white">
                    <option value="">Select Language</option>
                    {commonLanguages.map(lang => ( <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option> ))}
                </select>
            </div>
            <div>
                <label htmlFor="edit-code" className="sr-only">Code</label>
                <textarea id="edit-code" name="code" rows="6"
                    className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-700 text-white font-mono text-sm"
                    placeholder="Paste your code here..." value={code} onChange={(e) => setCode(e.target.value)}
                ></textarea>
            </div>
          </div>
          
          <div>
            <label htmlFor="edit-tags" className="block text-sm font-medium text-gray-300">Tags (comma-separated)</label>
            <input type="text" name="tags" id="edit-tags"
              className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-700 text-white"
              value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>

        <div className="flex justify-end space-x-3 pt-2">
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