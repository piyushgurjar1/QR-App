import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',  
  // baseURL: 'https://qr-app-w9yr.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;