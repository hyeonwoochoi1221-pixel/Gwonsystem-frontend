// src/types/index.ts

// 백엔드 NoticeResponseDto 규격과 일치

export interface Notice {
  id: number;
  title: string;
  date: string;
  dept?: string;       // 💡 dept 속성 추가 (선택적 프로퍼티)
  category?: string;   // 카테고리 필드도 함께 유지
  content?: string;
  viewCount?: number;
  isPinned?: boolean;
}

// 신규 공지 등록 시 백엔드로 보낼 요청 DTO 규격
export interface NoticeCreateRequest {
  authorId?: number;
  category: string;
  title: string;
  content: string;
  isPinned?: boolean;
}

// 기존 유저 및 일정 타입 유지
export interface User {
  id: number;
  username: string;
  email: string;
  created_at?: string;
}

export interface Schedule {
  id: number;
  time: string;
  content: string;
}

export interface RegisterRequestPayload {
  // 필수 항목
  username: string;
  password: string;
  email: string;
  lastName: string;
  firstName: string;
  phone: string;
  zipcode: string;
  address: string;

  // 선택 항목
  detailAddress?: string;
  gender?: string;
  birthDate?: string;
  workplaceName?: string;
  departmentName?: string;
  position?: string;
  workplacePhone?: string;

  // 개인정보보호법 동의 항목
  termsAgreed: boolean;
  privacyAgreed: boolean;
  marketingAgreed: boolean;
}

export interface LoginRequestPayload {
  username: string;
  password: string;
}
