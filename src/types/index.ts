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
  { id: 1, title: '프론트엔드 테스트', date: '2026-06-22', dept: 'Test' },
];

export const MOCK_SCHEDULES: Schedule[] = [
  { id: 1, time: '10:00', content: '전력화 예정입니다.' },
];
