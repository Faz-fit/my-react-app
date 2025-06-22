import axios from 'axios';

const token = localStorage.getItem('access_token');

const api2 = axios.create({
    baseURL: 'http://127.0.0.1:8000/',
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

export default api2;