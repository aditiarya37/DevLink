import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: null,
  user: null,
  loading: true,
  error: null,
};

const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGIN_FAIL = 'LOGIN_FAIL';
const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
const REGISTER_FAIL = 'REGISTER_FAIL';
const LOGOUT = 'LOGOUT';
const USER_LOADED = 'USER_LOADED';
const AUTH_ERROR = 'AUTH_ERROR';
const CLEAR_ERRORS = 'CLEAR_ERRORS';
const SET_LOADING = 'SET_LOADING';

const authReducer = (state, action) => {
  switch (action.type) {
    case SET_LOADING:
      return { ...state, loading: true };
    case USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null,
      };
    case LOGIN_SUCCESS:
    case REGISTER_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      const { token, ...userData } = action.payload;
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
      return {
        ...state,
        token: action.payload.token,
        user: userData, 
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case LOGIN_FAIL:
    case REGISTER_FAIL:
    case AUTH_ERROR:
    case LOGOUT:
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      axios.defaults.headers.common['Authorization'] = null;
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload, 
      };
    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        dispatch({ type: USER_LOADED, payload: user });
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        dispatch({ type: LOGOUT, payload: "Invalid user data in storage" });
      }
    } else {
      dispatch({ type: LOGOUT, payload: null });
    }
  }, []); 

  const register = useCallback(async (formData) => {
    dispatch({ type: SET_LOADING });
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, formData);
      dispatch({ type: REGISTER_SUCCESS, payload: response.data });
      return response.data;
    } catch (err) {
      dispatch({
        type: REGISTER_FAIL,
        payload: err.response?.data?.message || 'Registration failed',
      });
      throw err;
    }
  }, [API_BASE_URL]);

  const login = useCallback(async (formData) => {
    dispatch({ type: SET_LOADING });
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, formData);
      dispatch({ type: LOGIN_SUCCESS, payload: response.data });
      return response.data;
    } catch (err) {
      dispatch({
        type: LOGIN_FAIL,
        payload: err.response?.data?.message || 'Login failed',
      });
      throw err;
    }
  }, [API_BASE_URL]); 

  const logout = useCallback(() => {
    dispatch({ type: LOGOUT, payload: null }); 
  }, []); 

  const clearErrors = useCallback(() => {
    dispatch({ type: CLEAR_ERRORS });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        loading: state.loading,
        error: state.error,
        register,
        login,
        logout,
        clearErrors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;