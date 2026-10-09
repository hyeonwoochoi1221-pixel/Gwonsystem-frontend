import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { uploadBanner } from '../../api/bannerService';
import '../../components/home/HomeGallery.css';
import '../gallery/GalleryPage.css';
import '../../components/home/SemiconductorHero.css';

export default function BannerCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  useEffect(() => {
    if (!file && !title && !description) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [file, title, description]);
  const choose = async (file?: File) => {
    setImage(''); setFile(null); setError('');
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) { setError('JPG 또는 PNG 배너를 선택해 주세요.'); return; }
    if (file.size > 1024 * 1024) { setError('1MB 이하 배너를 추가할 수 있습니다.'); return; }
    setBusy(true);
    try {
      const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
      await new Promise<void>((resolve, reject) => { const picture = new Image(); picture.onload = () => picture.naturalWidth * picture.naturalHeight <= 20_000_000 ? resolve() : reject(); picture.onerror = reject; picture.src = data; });
      setImage(data); setFile(file);
    } catch { setError('배너를 읽지 못했거나 2천만 화소를 초과했습니다. 다른 파일을 선택해 주세요.'); }
    finally { setBusy(false); }
  };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting.current || busy || !title.trim() || !file) return;
    submitting.current = true;
    setBusy(true); setError('');
    try {
      const entry = await uploadBanner(file, title.trim(), description.trim());
      navigate('/banners', { replace: true, state: { uploaded: entry } });
    } catch (failure) {
      const status = isAxiosError(failure) ? failure.response?.status : undefined;
      setError(status === 401 || status === 403 ? '배너 추가 권한이 없거나 로그인이 만료되었습니다.' : status === 409 ? '배너는 최대 5개까지 등록할 수 있습니다. 기존 배너를 삭제한 후 다시 시도해 주세요.' : status === 413 ? '배너이 너무 큽니다. 1MB 이하 배너를 선택해 주세요.' : status === 400 ? '배너 형식과 크기, 제목과 설명 길이를 확인해 주세요.' : '배너를 등록하지 못했습니다. 연결 상태를 확인하고 다시 시도해 주세요.');
    }
    finally { submitting.current = false; setBusy(false); }
  };
  return <main className="gallery-page">
    <Link className="gallery-back" to="/banners">← 배너 관리로 돌아가기</Link>
    <div className="home-section-heading"><div><span className="workspace-eyebrow">MAIN BANNER</span><h1>배너 등록</h1><p>메인에 표시할 배너 이미지와 문구를 등록해 주세요.</p></div></div>
    <div className="gallery-create-layout">
      <form className="gallery-form" onSubmit={save}>
        <fieldset disabled={busy}>
          <label htmlFor="gallery-photo">배경 이미지 선택 <span aria-hidden="true">*</span></label>
          <p id="gallery-file-help">JPG 또는 PNG · 최대 1MB · 권장 비율 3:1 · 문구는 왼쪽에 표시됩니다.</p>
          <input id="gallery-photo" type="file" accept="image/jpeg,image/png" aria-describedby="gallery-file-help" onChange={e => void choose(e.target.files?.[0])} />
          {file && <small>{file.name} · {Math.ceil(file.size / 1024)}KB</small>}
          <label htmlFor="gallery-title">배너 제목 문구 <span aria-hidden="true">*</span></label>
          <textarea id="gallery-title" value={title} onChange={e => setTitle(e.target.value)} maxLength={80} rows={3} required placeholder="예: 연구로 연결하는 기술의 다음 단계 (줄바꿈 가능)" />
          <small>{title.length}/80자</small>
          <label htmlFor="gallery-description">배너 설명 문구 (선택)</label>
          <textarea id="gallery-description" value={description} onChange={e => setDescription(e.target.value)} maxLength={300} rows={5} placeholder="배너에 담긴 활동과 이야기를 소개해 주세요." />
          <small>{description.length}/300자</small>
        </fieldset>
        {error && <p className="gallery-error" role="alert">{error}</p>}
        <div className="action-control-group"><button type="submit" className="btn-primary-action" disabled={busy || !file || !title.trim()}>{busy ? '배너 확인 및 업로드 중…' : '배너 등록'}</button><button type="button" className="btn-export-excel" disabled={busy} onClick={() => { if ((!title && !file && !description) || window.confirm('작성 중인 내용을 취소하고 배너 관리로 돌아갈까요?')) navigate('/banners'); }}>취소</button></div>
      </form>
      <aside className="gallery-create-preview"><span className="workspace-eyebrow">PREVIEW</span><h2>등록 미리보기</h2><article className="banner-upload-preview">{image && <img src={image} alt="등록할 배너 배경" />}<div><span>G-WON SYSTEM · RESEARCH &amp; INNOVATION</span><h3>{title.trim() || '메인 배너 제목'}</h3><p>{description.trim() || '배너 설명이 여기에 표시됩니다.'}</p></div></article><p className="gallery-public-note">전체 공개 · 등록한 배너는 외부 방문자도 볼 수 있습니다.</p></aside>
    </div>
  </main>;
}
