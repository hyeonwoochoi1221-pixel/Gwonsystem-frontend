import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { prepareGalleryPhoto } from '../../utils/prepareGalleryPhoto';
import { uploadGalleryPhoto } from '../../api/galleryService';
import '../../components/home/HomeGallery.css';
import './GalleryPage.css';

export default function GalleryCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [optimization, setOptimization] = useState('');
  useEffect(() => () => { if (image) URL.revokeObjectURL(image); }, [image]);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  useEffect(() => {
    if (!file && !title && !description) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [file, title, description]);
  const choose = async (original?: File) => {
    setImage(''); setFile(null); setError(''); setOptimization('');
    if (!original) return;
    setBusy(true);
    try {
      const prepared = await prepareGalleryPhoto(original);
      setImage(URL.createObjectURL(prepared.file));
      setFile(prepared.file); setOptimization(prepared.message);
    } catch (failure) { setError(failure instanceof Error ? failure.message : '사진을 처리하지 못했습니다. 다른 파일을 선택해 주세요.'); }
    finally { setBusy(false); }
  };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting.current || busy || !title.trim() || !file) return;
    submitting.current = true;
    setBusy(true); setError('');
    try {
      const entry = await uploadGalleryPhoto(file, title.trim(), description.trim());
      navigate('/gallery', { replace: true, state: { uploaded: entry } });
    } catch (failure) {
      const status = isAxiosError(failure) ? failure.response?.status : undefined;
      setError(!status ? '백엔드에 연결하지 못했습니다. 서버 실행 상태를 확인하고 다시 시도해 주세요.' : status === 404 ? '사진 등록 API가 연결된 서버에 없습니다. 백엔드가 최신 버전인지 확인해 주세요.' : status === 500 ? '서버에서 사진 저장 중 오류가 발생했습니다. 관리자에게 문의해 주세요.' : status === 401 || status === 403 ? '사진 추가 권한이 없거나 로그인이 만료되었습니다.' : status === 503 ? '사진 저장소 설정이 필요합니다. 관리자에게 문의해 주세요.' : status === 502 ? '사진 저장소에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.' : status === 413 ? '사진이 너무 큽니다. 1MB 이하 사진을 선택해 주세요.' : status === 400 ? '사진 형식과 크기, 제목과 설명 길이를 확인해 주세요.' : '사진을 등록하지 못했습니다. 연결 상태를 확인하고 다시 시도해 주세요.');
    }
    finally { submitting.current = false; setBusy(false); }
  };
  return <main className="gallery-page">
    <Link className="gallery-back" to="/gallery">← 갤러리로 돌아가기</Link>
    <div className="home-section-heading"><div><span className="workspace-eyebrow">SHARE OUR MOMENTS</span><h1>사진 등록</h1><p>지원시스템의 활동과 소식을 사진으로 공유해 주세요.</p></div></div>
    <div className="gallery-create-layout">
      <form className="gallery-form" onSubmit={save}>
        <fieldset disabled={busy}>
          <label htmlFor="gallery-photo">사진 선택 <span aria-hidden="true">*</span></label>
          <p id="gallery-file-help">JPG 또는 PNG · 원본 최대 30MB / 6천만 화소 · 큰 사진은 1MB 이하로 자동 최적화합니다.</p>
          <input id="gallery-photo" type="file" accept="image/jpeg,image/png" aria-describedby="gallery-file-help" onChange={e => void choose(e.target.files?.[0])} />
          {file && <small>{file.name} · {Math.ceil(file.size / 1024)}KB</small>}
          {optimization && <p role="status">{optimization}</p>}
          <small>자동 변환 시 비율을 유지하며 JPG로 저장합니다. 투명 배경은 흰색으로 바뀝니다.</small>
          <label htmlFor="gallery-title">제목 <span aria-hidden="true">*</span></label>
          <input id="gallery-title" value={title} onChange={e => setTitle(e.target.value)} maxLength={80} required placeholder="예: 함께한 기술 세미나" />
          <small>{title.length}/80자</small>
          <label htmlFor="gallery-description">설명 (선택)</label>
          <textarea id="gallery-description" value={description} onChange={e => setDescription(e.target.value)} maxLength={300} rows={5} placeholder="사진에 담긴 활동과 이야기를 소개해 주세요." />
          <small>{description.length}/300자</small>
        </fieldset>
        {error && <p className="gallery-error" role="alert">{error}</p>}
        <div className="action-control-group"><button type="submit" className="btn-primary-action" disabled={busy || !file || !title.trim()}>{busy ? '사진 확인 및 업로드 중…' : '사진 등록'}</button><button type="button" className="btn-export-excel" disabled={busy} onClick={() => { if ((!title && !file && !description) || window.confirm('작성 중인 내용을 취소하고 갤러리로 돌아갈까요?')) navigate('/gallery'); }}>취소</button></div>
      </form>
      <aside className="gallery-create-preview"><span className="workspace-eyebrow">PREVIEW</span><h2>등록 미리보기</h2><article className="gallery-card">{image ? <img src={image} alt="등록할 사진 미리보기" /> : <div className="gallery-image-placeholder">사진을 선택하면 미리보기가 표시됩니다.</div>}<div><h3>{title.trim() || '사진 제목'}</h3><p>{description.trim() || '사진 설명이 여기에 표시됩니다.'}</p></div></article><p className="gallery-public-note">전체 공개 · 등록한 사진은 외부 방문자도 볼 수 있습니다.</p></aside>
    </div>
  </main>;
}
