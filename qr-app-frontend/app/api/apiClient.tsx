import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://qr-app-u8nn.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;