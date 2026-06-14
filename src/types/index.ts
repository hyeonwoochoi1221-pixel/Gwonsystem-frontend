export interface User {
  id: number;
  username: string;
  email: string;
  created_at?: string;
}

export interface Notice {
  id: number;
  title: string;
  date: string;
  dept: string;
}

export interface Schedule {
  id: number;
  time: string;
  content: string;
}

export const MOCK_NOTICES: Notice[] = [
  { id: 1, title: '2026년 하반기 보안 정기 점검 안내', date: '2026-06-14', dept: '보안팀' },
  { id: 2, title: '서버 인프라 마이그레이션 작업으로 인한 시스템 단절 안내', date: '2026-06-12', dept: '인프라팀' },
  { id: 3, title: '6월 전사 타운홀 미팅 일정 공유', date: '2026-06-10', dept: '인사팀' },
];

export const MOCK_SCHEDULES: Schedule[] = [
  { id: 1, time: '10:00', content: '주간 부서 외근 및 업무 보고 회의' },
  { id: 2, time: '14:00', content: '프론트엔드 - 백엔드 API 명세서 검토' },
];
