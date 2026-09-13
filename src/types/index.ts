// src/types/index.ts

// 백엔드 NoticeResponseDto 규격과 일치
export interface Notice {
  id: number;
  category: string;
  title: string;
  content: string;
  viewCount: number;
  isPinned: boolean;
  date: string; // YYYY-MM-DD 포맷
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
