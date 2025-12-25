import axios from 'axios';

// Lightweight axios instance for public (no auth header) requests.
// Uses same baseURL as `api` but does not attach Authorization header.
const publicApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://opium-2-igrl.onrender.com/api',
  withCredentials: true
});

export default publicApi;
