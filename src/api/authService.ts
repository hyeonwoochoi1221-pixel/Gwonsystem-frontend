// src/api/authService.ts
import api from './axiosInstance';
import { RegisterRequestPayload, LoginRequestPayload } from '../types';

// 일반회원 회원가입 요청
export const registerMember = async (data: RegisterRequestPayload): Promise<string> => {
  const response = await api.post<string>('/api/members/register', data);
  return response.data;
};

// 로그인 요청 (백엔드 토큰 발급 연동용)
export const loginMember = async (data: LoginRequestPayload): Promise<any> => {
  const response = await api.post('/api/members/login', data);
  return response.data;
};
