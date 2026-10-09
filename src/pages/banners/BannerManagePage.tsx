import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Banner, getBanners, bannerImageUrl, deleteBanner } from '../../api/bannerService';
import '../gallery/GalleryPage.css';
export default function BannerManagePage() {
 const [banners,setBanners]=useState<Banner[]>([]); const [error,setError]=useState(''); const [loading,setLoading]=useState(true); const [busy,setBusy]=useState<number|null>(null);
 const load=()=>{setLoading(true);setError('');getBanners().then(setBanners).catch(()=>setError('배너 목록을 불러오지 못했습니다.')).finally(()=>setLoading(false));};
 useEffect(load,[]);
 const remove=async(banner:Banner)=>{if(!window.confirm('이 배너를 삭제할까요?'))return;setBusy(banner.id);try{await deleteBanner(banner.id);setBanners(items=>items.filter(item=>item.id!==banner.id));}catch{setError('삭제하지 못했습니다. 로그인과 연결 상태를 확인해 주세요.');}finally{setBusy(null);}};
 return <main className="gallery-page"><Link to="/">← 메인으로 돌아가기</Link><div className="home-section-heading"><div><h1>메인 배너 관리</h1><p>배너는 최대 5개까지 등록할 수 있으며, 최신 등록 순으로 12초마다 전환됩니다.</p><p>등록된 배너가 없으면 기본 소개 배너가 표시됩니다.</p></div>{!loading && banners.length < 5 ? <Link className="btn-primary-action" to="/banners/new">+ 배너 추가</Link> : !loading && <span>5개 등록 완료 · 기존 배너를 삭제하면 추가할 수 있습니다.</span>}</div>{error&&<p role="alert">{error}<button type="button" onClick={load}>다시 불러오기</button></p>}{loading?<p role="status">불러오는 중…</p>:<div className="gallery-grid">{banners.map(banner=><article className="gallery-card" key={banner.id}><img src={bannerImageUrl(banner.id)} alt={banner.title}/><div><h2>{banner.title}</h2><p>{banner.description}</p><button type="button" className="btn-export-excel" disabled={busy!==null} onClick={()=>void remove(banner)}>{busy===banner.id?'삭제 중…':'삭제'}</button></div></article>)}</div>}{!loading&&!error&&!banners.length&&<p>등록된 배너가 없습니다. 배너를 추가해 주세요.</p>}</main>;
}
