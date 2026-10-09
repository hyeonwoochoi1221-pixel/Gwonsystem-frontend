import api from './axiosInstance';
export interface CompanyEvent { id: number; title: string; category: string; startDate: string; endDate: string | null; locationDetail?: string; placeId?: string; location: string; description: string; }
export const getCompanyEvents = async () => (await api.get<CompanyEvent[]>('/api/company-events', {timeout:30000})).data;
export const createCompanyEvent = async (data: Omit<CompanyEvent,'id'>) => (await api.post<CompanyEvent>('/api/company-events',data)).data;

export interface PlaceResult { id: string; name: string; address: string; }
export const searchEventPlaces = async(query:string) => (await api.get<PlaceResult[]>('/api/company-events/places',{params:{query},timeout:20000})).data;
