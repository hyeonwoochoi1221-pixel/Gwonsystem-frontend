import api from './axiosInstance';

export interface GalleryPhoto { id: number; title: string; description: string; createdAt: string; imageUrl?: string | null; }
export const getGalleryPhotos = async () => (await api.get<GalleryPhoto[]>('/api/gallery', { timeout: 30000 })).data;
export const galleryImageUrl = (id: number) => `${(api.defaults.baseURL || '').replace(/\/$/, '')}/api/gallery/${id}/image`;
export const uploadGalleryPhoto = async (photo: File, title: string, description: string) => {
  const body = new FormData();
  body.append('photo', photo); body.append('title', title); body.append('description', description);
  return (await api.post<GalleryPhoto>('/api/gallery', body, { headers: { 'Content-Type': undefined }, timeout: 60000 })).data;
};

export const deleteGalleryPhoto = async (id: number) => { await api.delete('/api/gallery/' + id, { timeout: 30000 }); };
