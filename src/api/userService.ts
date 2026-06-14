// src/api/userService.ts
import api from './axiosInstance';
import { User } from '../types'; // index.ts에서 가져옴

// 백엔드로부터 유저 목록을 받아오는 함수
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get<User[]>('/api/users');
    return response.data;
  } catch (error) {
    console.error('getUsers API 호출 에러:', error);
    throw error;
  }
};
