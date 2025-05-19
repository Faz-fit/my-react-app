import axios from 'axios';

const token = localStorage.getItem('access_token');

const api = axios.create({
  baseURL: 'http://arunalusupermarket.shop:3000',
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export default api;
