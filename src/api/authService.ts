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

export interface FindUsernamePayload {
  lastName: string;
  firstName: string;
  phone: string;
  email: string;
}

export interface PasswordResetSendCodePayload {
  username: string;
  email: string;
}

export interface PasswordResetVerifyCodePayload {
  email: string;
  code: string;
}

export interface PasswordResetConfirmPayload {
  username: string;
  email: string;
  code: string;
  newPassword: string;
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

// 3. [회원가입] 이메일 6자리 OTP 인증코드 발송 요청
export const sendEmailVerificationCode = async (email: string): Promise<EmailSendResponse> => {
  const response = await api.post<EmailSendResponse>('/api/members/email/send-code', { email });
  return response.data;
};

// 4. [회원가입] 이메일 6자리 OTP 인증코드 확인 요청
export const verifyEmailCode = async (email: string, code: string): Promise<EmailVerifyResponse> => {
  const response = await api.post<EmailVerifyResponse>('/api/members/email/verify-code', { email, code });
  return response.data;
};

// 5. 로그인 요청
export const loginMember = async (data: LoginRequestPayload): Promise<any> => {
  const response = await api.post('/api/members/login', data);
  return response.data;
};

// 6. 아이디 찾기 요청
export const findUsername = async (data: FindUsernamePayload): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>('/api/members/find-username', data);
  return response.data;
};

// 7. 비밀번호 재설정 1단계: 인증코드 발송 요청
export const sendPasswordResetCode = async (data: PasswordResetSendCodePayload): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>('/api/members/password/send-code', data);
  return response.data;
};

// 8. 비밀번호 재설정 2단계: 인증코드 일치 검증 요청
export const verifyPasswordResetCode = async (data: PasswordResetVerifyCodePayload): Promise<EmailVerifyResponse> => {
  const response = await api.post<EmailVerifyResponse>('/api/members/email/verify-code', data);
  return response.data;
};

// 9. 비밀번호 재설정 3단계: 최종 새 비밀번호 변경
export const resetPassword = async (data: PasswordResetConfirmPayload): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>('/api/members/password/reset', data);
  return response.data;
};

// 🌟 10. [개인정보 수정] 현재 비밀번호 확인 요청
export const verifyCurrentPassword = async (username: string, password: string): Promise<{ verified: boolean; message: string }> => {
  const response = await api.post('/api/members/verify-password', { username, password });
  return response.data;
};

// 🌟 11. [개인정보 수정] 본인 상세 프로필 데이터 로드
export const getMemberProfile = async (username: string): Promise<any> => {
  const response = await api.get(`/api/members/profile?username=${encodeURIComponent(username)}`);
  return response.data;
};

// 🌟 12. [개인정보 수정] 수정된 프로필 저장 요청
export const updateMemberProfile = async (username: string, payload: any): Promise<{ message: string; lastName: string; firstName: string }> => {
  const response = await api.put(`/api/members/profile?username=${encodeURIComponent(username)}`, payload);
  return response.data;
};
