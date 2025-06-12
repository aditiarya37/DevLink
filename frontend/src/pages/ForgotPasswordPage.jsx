import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgotpassword`, { email });
      setMessage(response.data.message || 'If an account with that email exists, a password reset link has been sent.');
      setEmail(''); 
    } catch (err) {
      console.error("Forgot password error:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-120px)]">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-sky-400 mb-8">Forgot Your Password?</h1>
        <p className="text-sm text-gray-400 text-center mb-6">
          No worries! Enter your email address below and we'll send you a link to reset your password.
        </p>

        {message && <p className="mb-4 text-center text-green-400 bg-green-900 border border-green-700 p-3 rounded">{message}</p>}
        {error && <p className="mb-4 text-center text-red-400 bg-red-900 border border-red-700 p-3 rounded">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-700 text-white"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-gray-800 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPasswordPage;