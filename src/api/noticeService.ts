// src/api/noticeService.ts
import api from './axiosInstance';
import { Notice, NoticeCreateRequest } from '../types';

/**
 * 공지사항 전체 목록 조회 (GET /api/notices)
 */
export const getNotices = async (): Promise<Notice[]> => {
  try {
    const response = await api.get<Notice[]>('/api/notices');
    return response.data;
  } catch (error) {
    console.error('공지사항 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 공지사항 단건 상세 조회 (GET /api/notices/{id})
 */
export const getNoticeById = async (id: number): Promise<Notice> => {
  try {
    const response = await api.get<Notice>(`/api/notices/${id}`);
    return response.data;
  } catch (error) {
    console.error(`공지사항 상세 조회 실패 (ID: ${id}):`, error);
    throw error;
  }
};

/**
 * 공지사항 등록 (POST /api/notices)
 */
export const createNotice = async (noticeData: NoticeCreateRequest): Promise<number> => {
  try {
    const response = await api.post<number>('/api/notices', noticeData);
    return response.data;
  } catch (error) {
    console.error('공지사항 등록 실패:', error);
    throw error;
  }
};

/**
 * 공지사항 삭제 (DELETE /api/notices/{id})
 */
export const deleteNotice = async (id: number): Promise<void> => {
  try {
    await api.delete(`/api/notices/${id}`);
  } catch (error) {
    console.error(`공지사항 삭제 실패 (ID: ${id}):`, error);
    throw error;
  }
};
