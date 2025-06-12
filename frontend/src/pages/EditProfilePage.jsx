import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const EditProfilePage = () => {
  const { user: currentUser, login: updateUserInContextGlobally, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    profilePicture: '',
    location: '',
    skills: '', 
    githubLink: '',
    linkedinLink: '',
    websiteLink: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (currentUser) {
      setFormData({
        displayName: currentUser.displayName || '',
        bio: currentUser.bio || '',
        profilePicture: currentUser.profilePicture || '',
        location: currentUser.location || '',
        skills: Array.isArray(currentUser.skills) ? currentUser.skills.join(', ') : '',
        githubLink: currentUser.links?.github || '',
        linkedinLink: currentUser.links?.linkedin || '',
        websiteLink: currentUser.links?.website || '',
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const skillsArray = formData.skills.split(',').map(skill => skill.trim().toLowerCase()).filter(skill => skill);
      
      const payload = {
        displayName: formData.displayName,
        bio: formData.bio,
        profilePicture: formData.profilePicture,
        location: formData.location,
        skills: skillsArray,
        links: {
          github: formData.githubLink,
          linkedin: formData.linkedinLink,
          website: formData.websiteLink,
        },
      };

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.put(`${API_BASE_URL}/users/me/update`, payload, config);

      if (response.data && token) {
         updateUserInContextGlobally({ ...response.data, token: token });
      }
      setSuccessMessage('Profile updated successfully! Redirecting...');
      setTimeout(() => {
        navigate(currentUser ? `/profile/${currentUser.username.toLowerCase()}` : '/');
      }, 1500);

    } catch (err) {
      console.error('Error updating profile:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !currentUser) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-xl text-sky-400">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-sky-400 mb-6 text-center">Edit Your Profile</h1>
        {error && <p className="mb-4 text-center text-red-400 bg-red-900 p-3 rounded">{error}</p>}
        {successMessage && <p className="mb-4 text-center text-green-400 bg-green-900 p-3 rounded">{successMessage}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-300">Display Name</label>
            <input type="text" name="displayName" id="displayName" value={formData.displayName} onChange={handleChange}
                   className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-700 text-white" />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-300">Bio</label>
            <textarea name="bio" id="bio" rows="4" value={formData.bio} onChange={handleChange}
                      className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-700 text-white"
                      placeholder="Tell us a bit about yourself..."></textarea>
          </div>
          <div>
            <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-300">Profile Picture URL</label>
            <input type="text" name="profilePicture" id="profilePicture" value={formData.profilePicture} onChange={handleChange}
                   className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-700 text-white"
                   placeholder="https://example.com/your-image.png" />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-300">Location</label>
            <input type="text" name="location" id="location" value={formData.location} onChange={handleChange}
                   className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-700 text-white"
                   placeholder="e.g., City, Country" />
          </div>
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-300">Skills (comma-separated)</label>
            <input type="text" name="skills" id="skills" value={formData.skills} onChange={handleChange}
                   className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-700 text-white"
                   placeholder="e.g., react, nodejs, python" />
          </div>
          <fieldset className="border border-gray-700 p-4 rounded-md">
            <legend className="text-sm font-medium text-gray-300 px-2">Links</legend>
            <div className="space-y-4 mt-2">
              <div>
                <label htmlFor="githubLink" className="block text-xs font-medium text-gray-400">GitHub Profile URL</label>
                <input type="url" name="githubLink" id="githubLink" value={formData.githubLink} onChange={handleChange}
                       className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-600 text-white"
                       placeholder="https://github.com/yourusername" />
              </div>
              <div>
                <label htmlFor="linkedinLink" className="block text-xs font-medium text-gray-400">LinkedIn Profile URL</label>
                <input type="url" name="linkedinLink" id="linkedinLink" value={formData.linkedinLink} onChange={handleChange}
                       className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-600 text-white"
                       placeholder="https://linkedin.com/in/yourusername" />
              </div>
              <div>
                <label htmlFor="websiteLink" className="block text-xs font-medium text-gray-400">Personal Website/Portfolio</label>
                <input type="url" name="websiteLink" id="websiteLink" value={formData.websiteLink} onChange={handleChange}
                       className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-600 text-white"
                       placeholder="https://yourdomain.com" />
              </div>
            </div>
          </fieldset>

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={() => navigate(currentUser ? `/profile/${currentUser.username.toLowerCase()}` : '/')}
                    className="px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none">
              Cancel
            </button>
            <button type="submit" disabled={loading || authLoading}
                    className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;