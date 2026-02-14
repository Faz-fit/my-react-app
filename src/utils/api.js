import axios from 'axios';

const token = localStorage.getItem('access_token');

const api = axios.create({
  baseURL: 'http://123.231.60.24:1605',
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export default api;
