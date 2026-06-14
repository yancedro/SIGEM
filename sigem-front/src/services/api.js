import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Endereço do seu Java
});

export default api;