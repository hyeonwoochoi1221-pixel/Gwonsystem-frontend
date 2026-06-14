// src/api/axiosInstance.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // 백엔드 서버 주소
  timeout: 5000,                    // 5초 지나면 요청 취소
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
