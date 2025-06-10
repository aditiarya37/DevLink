import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register, error: authError, clearErrors, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    displayName: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { username, email, displayName, password, confirmPassword } = formData;

  useEffect(() => {
    if (isAuthenticated) {
      setSuccessMessage('Registration successful! Redirecting...');
      const timer = setTimeout(() => {
        navigate('/');
      }, 1500);
      return () => clearTimeout(timer); 
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      clearErrors();
    };
  }, [clearErrors]); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formError) setFormError('');
    if (successMessage) setSuccessMessage(''); 
    if (authError) clearErrors();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');
    if (authError) clearErrors();

    if (!username || !email || !password || !confirmPassword) {
      setFormError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    try {
      const userData = {
        username,
        email,
        password,
        displayName: displayName || username,
      };
      await register(userData);
    } catch (err) {
      console.error('Registration component error catcher:', err);
    } finally {
    }
  };

  return (
    <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-120px)]">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-sky-400 mb-8">Create Account</h1>

        {formError && <p className="mb-4 text-center text-red-400 bg-red-900 border border-red-700 p-3 rounded">{formError}</p>}
        {!formError && authError && <p className="mb-4 text-center text-red-400 bg-red-900 border border-red-700 p-3 rounded">{authError}</p>}
        {successMessage && !authError && <p className="mb-4 text-center text-green-400 bg-green-900 border border-green-700 p-3 rounded">{successMessage}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              id="username" name="username" type="text" value={username} onChange={handleChange} required
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-700 text-white"
              placeholder="your_unique_username"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email" name="email" type="email" value={email} onChange={handleChange} required
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-700 text-white"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-300">
              Display Name (Optional)
            </label>
            <input
              id="displayName" name="displayName" type="text" value={displayName} onChange={handleChange}
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-700 text-white"
              placeholder="Your Display Name"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="password" name="password" type="password" value={password} onChange={handleChange} required minLength="6"
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-700 text-white"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword" name="confirmPassword" type="password" value={confirmPassword} onChange={handleChange} required minLength="6"
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-700 text-white"
              placeholder="••••••••"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={authLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-gray-800 disabled:opacity-50"
            >
              {authLoading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
        <p className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-sky-400 hover:text-sky-300">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;