import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';

const getInitialState = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  return {
    token: token,
    isAuthenticated: !!token, 
    user: user ? JSON.parse(user) : null,
    loading: !!token,
    error: null,
    unreadNotificationCount: 0,
  };
};

const initialState = getInitialState();

const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGIN_FAIL = 'LOGIN_FAIL';
const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
const REGISTER_FAIL = 'REGISTER_FAIL';
const LOGOUT = 'LOGOUT';
const USER_LOADED = 'USER_LOADED';
const UPDATE_USER_PROFILE = 'UPDATE_USER_PROFILE'; 
const AUTH_ERROR = 'AUTH_ERROR';
const CLEAR_ERRORS = 'CLEAR_ERRORS';
const SET_LOADING = 'SET_LOADING';
const SET_UNREAD_NOTIFICATION_COUNT = 'SET_UNREAD_NOTIFICATION_COUNT';
const DECREMENT_UNREAD_NOTIFICATION_COUNT = 'DECREMENT_UNREAD_NOTIFICATION_COUNT';

const authReducer = (state, action) => {
  switch (action.type) {
    case SET_LOADING:
      return { ...state, loading: true };
    case USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
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
        unreadNotificationCount: 0, 
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
        unreadNotificationCount: 0,
      };
    case CLEAR_ERRORS:
      return { ...state, error: null };
    case SET_UNREAD_NOTIFICATION_COUNT:
      return { ...state, unreadNotificationCount: action.payload };
    case DECREMENT_UNREAD_NOTIFICATION_COUNT:
      return { ...state, unreadNotificationCount: Math.max(0, state.unreadNotificationCount - action.payload) };
    case UPDATE_USER_PROFILE:
      const updatedUser = action.payload; 
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return {
        ...state,
        user: updatedUser,
        loading: false,
      };
    default:
      return state;
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchUnreadNotificationCount = useCallback(async (authTokenForRequest) => {
    if (!authTokenForRequest) return;
    try {
      const config = { headers: { Authorization: `Bearer ${authTokenForRequest}` } };
      const res = await axios.get(`${API_BASE_URL}/notifications?limit=1&page=1`, config);
      dispatch({ type: SET_UNREAD_NOTIFICATION_COUNT, payload: res.data.unreadCount || 0 });
    } catch (err) {
      console.error('Failed to fetch unread notification count:', err.response ? err.response.data : err.message);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    const loadUserAndNotifications = async () => {
      const tokenFromStorage = localStorage.getItem('token');
      if (tokenFromStorage) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokenFromStorage}`;
        try {
          const userRes = await axios.get(`${API_BASE_URL}/users/me`);
          dispatch({ type: USER_LOADED, payload: { user: userRes.data } });
          localStorage.setItem('user', JSON.stringify(userRes.data));
          await fetchUnreadNotificationCount(tokenFromStorage);
        } catch (err) {
          console.error('Failed to load user or notifications on mount:', err.response ? err.response.data : err.message);
          dispatch({ type: AUTH_ERROR, payload: err.response?.data?.message || "Session error" });
        }
      } else {
        dispatch({ type: LOGOUT, payload: null });
      }
    };
    loadUserAndNotifications();
  }, [API_BASE_URL, fetchUnreadNotificationCount]); 

  const register = useCallback(async (formData) => {
    dispatch({ type: SET_LOADING });
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, formData);
      dispatch({ type: REGISTER_SUCCESS, payload: response.data });
      await fetchUnreadNotificationCount(response.data.token); 
      return response.data;
    } catch (err) {
      dispatch({ type: REGISTER_FAIL, payload: err.response?.data?.message || 'Registration failed' });
      throw err;
    }
  }, [API_BASE_URL, fetchUnreadNotificationCount]);

  const login = useCallback(async (formData) => {
    dispatch({ type: SET_LOADING });
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, formData);
      dispatch({ type: LOGIN_SUCCESS, payload: response.data });
      await fetchUnreadNotificationCount(response.data.token);
      return response.data;
    } catch (err) {
      dispatch({ type: LOGIN_FAIL, payload: err.response?.data?.message || 'Login failed' });
      throw err;
    }
  }, [API_BASE_URL, fetchUnreadNotificationCount]);

  const logout = useCallback(() => {
    dispatch({ type: LOGOUT, payload: null });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: CLEAR_ERRORS });
  }, []);

  const updateUnreadCount = useCallback((newCount) => {
    dispatch({ type: SET_UNREAD_NOTIFICATION_COUNT, payload: newCount });
  }, []);

  const decrementUnreadCount = useCallback((count = 1) => {
    dispatch({ type: DECREMENT_UNREAD_NOTIFICATION_COUNT, payload: count });
  }, []);

  const updateProfile = useCallback((newUserData) => {
    dispatch({ type: UPDATE_USER_PROFILE, payload: newUserData });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        loading: state.loading,
        error: state.error,
        unreadNotificationCount: state.unreadNotificationCount,
        register,
        login,
        logout,
        updateProfile,
        clearErrors,
        fetchUnreadNotificationCount,
        updateUnreadCount,
        decrementUnreadCount,
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