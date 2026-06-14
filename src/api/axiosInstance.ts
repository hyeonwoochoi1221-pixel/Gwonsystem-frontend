import axios from 'axios';

const api = axios.create({
  // 💡 개발 환경과 배포 환경에 따라 주소가 자동으로 바뀌도록 설정
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
