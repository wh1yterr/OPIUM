import axios from 'axios';

const publicApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://opium-2-igrl.onrender.com/api',
  withCredentials: true
});

export default publicApi;
