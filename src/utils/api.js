import axios from 'axios';

const token = localStorage.getItem('access_token');

const api = axios.create({
  baseURL: 'http://64.227.183.23',
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export default api;
