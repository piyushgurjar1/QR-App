import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://qr-app-w9yr.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;