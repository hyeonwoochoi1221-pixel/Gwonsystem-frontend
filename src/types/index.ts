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
