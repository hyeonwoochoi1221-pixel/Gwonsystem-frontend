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

export interface EmailSendResponse {
  message: string;
}

export interface EmailVerifyResponse {
  verified: boolean;
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

// 3. 이메일 6자리 OTP 인증코드 발송 요청
export const sendEmailVerificationCode = async (email: string): Promise<EmailSendResponse> => {
  const response = await api.post<EmailSendResponse>('/api/members/email/send-code', { email });
  return response.data;
};

// 4. 이메일 6자리 OTP 인증코드 확인 요청
export const verifyEmailCode = async (email: string, code: string): Promise<EmailVerifyResponse> => {
  const response = await api.post<EmailVerifyResponse>('/api/members/email/verify-code', { email, code });
  return response.data;
};

// 5. 로그인 요청
export const loginMember = async (data: LoginRequestPayload): Promise<any> => {
  const response = await api.post('/api/members/login', data);
  return response.data;
};
