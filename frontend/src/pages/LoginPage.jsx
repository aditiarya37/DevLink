import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, error: authError, clearErrors, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });
  const [formError, setFormError] = useState('');

  const { emailOrUsername, password } = formData;

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  useEffect(() => {
    return () => {
      clearErrors();
    };
  }, [clearErrors]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formError) setFormError('');
    if (authError) clearErrors();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (authError) clearErrors();

    if (!emailOrUsername || !password) {
      setFormError('Please fill in all fields.');
      return;
    }

    try {
      const userData = { emailOrUsername, password };
      await login(userData);
    } catch (err) {
      console.error('Login component error catcher:', err);
    } finally {
    }
  };

  return (
    <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-120px)]">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-sky-400 mb-8">Login to DevLink</h1>

        {formError && <p className="mb-4 text-center text-red-400 bg-red-900 border border-red-700 p-3 rounded">{formError}</p>}
        {!formError && authError && <p className="mb-4 text-center text-red-400 bg-red-900 border border-red-700 p-3 rounded">{authError}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-300">
              Email or Username <span className="text-red-500">*</span>
            </label>
            <input
              id="emailOrUsername" name="emailOrUsername" type="text" value={emailOrUsername} onChange={handleChange} required
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-gray-700 text-white"
              placeholder="you@example.com or your_username"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="password" name="password" type="password" value={password} onChange={handleChange} required
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
              {authLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        <p className="mt-8 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-sky-400 hover:text-sky-300">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;