import api from './axiosInstance';

export interface Banner { id: number; title: string; description: string; createdAt: string; }
export const getBanners = async () => (await api.get<Banner[]>('/api/banners', { timeout: 30000 })).data;
export const bannerImageUrl = (id: number) => `${(api.defaults.baseURL || '').replace(/\/$/, '')}/api/banners/${id}/image`;
export const uploadBanner = async (photo: File, title: string, description: string) => {
  const body = new FormData();
  body.append('photo', photo); body.append('title', title); body.append('description', description);
  return (await api.post<Banner>('/api/banners', body, { headers: { 'Content-Type': undefined }, timeout: 60000 })).data;
};

export const deleteBanner = async (id: number) => { await api.delete('/api/banners/' + id); };
