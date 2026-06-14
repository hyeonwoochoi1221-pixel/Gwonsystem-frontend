// src/api/userService.ts
import api from './axiosInstance';

// 1. DB 테이블 구조에 맞춘 유저 타입 정의 (외부에서 쓸 수 있게 export)
export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

// 2. 백엔드로부터 유저 목록을 받아오는 함수 (export)
export const getUsers = async (): Promise<User[]> => {
  try {
    // 💡 원래 '/users' 였던 것을 '/api/users' 로 수정합니다.
    const response = await api.get<User[]>('/api/users');
    return response.data;
  } catch (error) {
    console.error('getUsers API 호출 에러:', error);
    throw error;
  }
};
