import { Link, useLocation } from 'react-router-dom';
import HomeGallery from '../../components/home/HomeGallery';
import { useAuthRole } from '../../hooks/useAuthRole';
import { GalleryPhoto } from '../../api/galleryService';
import './GalleryPage.css';

export default function GalleryPage() {
  const { canManageContent, isLoading } = useAuthRole();
  const location = useLocation();
  const uploaded = (location.state as { uploaded?: GalleryPhoto } | null)?.uploaded;
  return <main className="gallery-page"><Link className="gallery-back" to="/">← 메인으로 돌아가기</Link>{uploaded && <div className="workspace-banner" role="status"><strong>사진이 등록되었습니다.</strong><p>등록한 사진을 갤러리에서 확인할 수 있습니다.</p></div>}<HomeGallery full canAdd={canManageContent && !isLoading} uploaded={uploaded} /></main>;
}
