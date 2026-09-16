// src/api/authService.ts
import api from './axiosInstance';
import { RegisterRequestPayload, LoginRequestPayload } from '../types';

export interface RegisterResponse {
  message: string;
  memberId?: number;
  username?: string;
}

export interface CheckUsernameResponse {
  exists: boolean;
  message: string;
}

// 1. 일반회원 회원가입 요청
export const registerMember = async (data: RegisterRequestPayload): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>('/api/members/register', data);
  return response.data;
};

// 2. 아이디 중복 확인 요청
export const checkUsernameDuplicate = async (username: string): Promise<CheckUsernameResponse> => {
  const response = await api.get<CheckUsernameResponse>(
    `/api/members/check-username?username=${encodeURIComponent(username)}`
  );
  return response.data;
};

// 3. 로그인 요청 (백엔드 토큰 발급 연동용)
export const loginMember = async (data: LoginRequestPayload): Promise<any> => {
  const response = await api.post('/api/members/login', data);
  return response.data;
};
