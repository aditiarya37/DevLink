import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ResetPasswordPage = () => {
  const { token: resetToken } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/auth/resetpassword/${resetToken}`, { password });
      setMessage(response.data.message || 'Password has been reset successfully! Redirecting to login...');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        navigate('/login');
      }, 3000); 
    } catch (err) {
      console.error("Reset password error:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) { 
      return (
        <div className="container mx-auto p-4 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-red-500 mb-6">Invalid Password Reset Link</h1>
            <p className="text-gray-400">The password reset link is missing or invalid. Please request a new one.</p>
            <Link to="/forgot-password" className="mt-4 inline-block text-sky-400 hover:text-sky-300">Request a new link</Link>
        </div>
      )
  }


  return (
    <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-120px)]">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-sky-400 mb-8">Reset Your Password</h1>
        
        {message && <p className="mb-4 text-center text-green-400 bg-green-900 border border-green-700 p-3 rounded">{message}</p>}
        {error && <p className="mb-4 text-center text-red-400 bg-red-900 border border-red-700 p-3 rounded">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-300">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-700 text-white"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword"className="block text-sm font-medium text-gray-300">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-700 text-white"
              placeholder="••••••••"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-gray-800 disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
        <p className="mt-8 text-center text-sm">
          <Link to="/login" className="font-medium text-sky-400 hover:text-sky-300">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;