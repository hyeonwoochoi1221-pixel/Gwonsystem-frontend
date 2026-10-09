import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getGalleryPhotos, galleryImageUrl, deleteGalleryPhoto, GalleryPhoto } from '../../api/galleryService';
import './HomeGallery.css';
interface Photo { id: string; title: string; description: string; image: string; date: string; }
const toPhoto = (p: GalleryPhoto): Photo => ({ id: String(p.id), title: p.title, description: p.description, image: p.imageUrl || galleryImageUrl(p.id), date: new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date(p.createdAt)) });
export default function HomeGallery({ canAdd, full = false, compact = false, uploaded }: { canAdd: boolean; full?: boolean; compact?: boolean; uploaded?: GalleryPhoto }) {
  const [photos, setPhotos] = useState<Photo[]>(uploaded ? [toPhoto(uploaded)] : []);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reload, setReload] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const deleteLock = useRef(false);
  const remove = async (photo: Photo) => {
    if (deleteLock.current || !window.confirm(`"${photo.title}" 사진을 삭제할까요? 삭제한 사진은 복구할 수 없습니다.`)) return;
    deleteLock.current = true; setDeleting(photo.id); setDeleteError('');
    try { await deleteGalleryPhoto(Number(photo.id)); setPhotos(items => items.filter(item => item.id !== photo.id)); }
    catch { setDeleteError('사진을 삭제하지 못했습니다. 로그인과 연결 상태를 확인하고 다시 시도해 주세요.'); }
    finally { deleteLock.current = false; setDeleting(null); }
  };
  const [query, setQuery] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true); setLoadFailed(false);
    getGalleryPhotos().then(data => {
      if (!active) return;
      setPhotos(data.map(toPhoto));
    }).catch(() => { if (active) setLoadFailed(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload, uploaded]);
  const filtered = photos.filter(p => `${p.title} ${p.description}`.toLowerCase().includes(query.toLowerCase()));
  return <section className={`home-gallery${compact ? " home-overview-card home-gallery-compact" : ""}`} id="gallery" aria-labelledby="gallery-heading">
    <div className="home-section-heading"><div>{!compact && <span className="workspace-eyebrow">OUR MOMENTS</span>}{full ? <h1 id="gallery-heading">갤러리</h1> : <h2 id="gallery-heading">{compact ? '포토갤러리' : '지원시스템의 순간들'}</h2>}{!compact && <p>함께하는 사람과 활동을 사진으로 만나보세요.</p>}</div><div className="action-control-group">{!full && <Link to="/gallery">전체 보기 →</Link>}{full && canAdd && <Link className="btn-primary-action gallery-add-link" to="/gallery/new">+ 사진 등록</Link>}</div></div>
    {full && <div className="workspace-toolbar"><label>사진 검색<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="제목이나 설명으로 검색" /></label><span>최근 사진 최대 24개</span></div>}
    {loading && <p role="status">갤러리를 불러오고 있습니다…</p>}
    {loadFailed && <p className="gallery-error" role="alert">갤러리를 불러오지 못했습니다. <button type="button" className="btn-export-excel" onClick={() => setReload(v => v + 1)}>다시 시도</button></p>}
    {deleteError && <p className="gallery-error" role="alert">{deleteError}</p>}
    <div className="gallery-grid">{(full ? filtered : filtered.slice(0, compact ? 2 : 3)).map(p => <article className="gallery-card" key={p.id}><img src={p.image} alt={p.title} loading="lazy" /><div><span className="gallery-date">{p.date}</span><h3>{p.title}</h3>{p.description && <p>{p.description}</p>}<a href={p.image} target="_blank" rel="noreferrer">사진 크게 보기 ↗</a>{full && canAdd && <button type="button" className="gallery-delete-button" disabled={deleting !== null} aria-label={`${p.title} 사진 삭제`} onClick={() => void remove(p)}>{deleting === p.id ? '삭제 중…' : '사진 삭제'}</button>}</div></article>)}</div>
    {!loading && !loadFailed && !filtered.length && <p className="empty-text">{query.trim() ? '검색 조건에 맞는 사진이 없습니다.' : '등록된 사진이 없습니다.'}</p>}
  </section>;
}
