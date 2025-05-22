import axios from 'axios';

const token = localStorage.getItem('access_token');

const api = axios.create({
  baseURL: 'http://139.59.243.2:8000',
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export default api;
