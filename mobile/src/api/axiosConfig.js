// mobile/src/api/axiosConfig.js
import axios from "axios";
import * as SecureStore from "expo-secure-store";

// REPLACE THIS WITH YOUR COMPUTER'S LOCAL IP
const API_BASE_URL = "http://172.25.9.55:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically add token to requests
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
