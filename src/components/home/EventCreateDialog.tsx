import { FormEvent, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { isAxiosError } from 'axios';
import { CompanyEvent, createCompanyEvent, PlaceResult, searchEventPlaces } from '../../api/companyEventService';
const blank={title:'',category:'회의',startDate:'',endDate:'',location:'',locationDetail:'',placeId:'',description:''};
export default function EventCreateDialog({onClose,onCreated}:{onClose:()=>void;onCreated:(event:CompanyEvent)=>void}) {
 const dialog=useRef<HTMLDialogElement>(null);const lock=useRef(false);
 const [draft,setDraft]=useState(blank);const [noEnd,setNoEnd]=useState(false);
 const [saving,setSaving]=useState(false);const [error,setError]=useState('');
 const [query,setQuery]=useState('');const [results,setResults]=useState<PlaceResult[]>([]);
 const [searching,setSearching]=useState(false);const [searchError,setSearchError]=useState('');const [searched,setSearched]=useState(false);
 useEffect(()=>{const node=dialog.current;node?.showModal();const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{node?.close();document.body.style.overflow=previous;};},[]);
 const close=()=>{if(!saving)onClose();};
 const search=async()=>{if(searching)return;setSearching(true);setSearchError('');setResults([]);setSearched(false);try{setResults(await searchEventPlaces(query));setSearched(true);}catch(failure){const status=isAxiosError(failure)?failure.response?.status:undefined;setSearchError(status===503?'Google 장소 검색 연결이 필요합니다. 지금은 장소를 직접 입력할 수 있습니다.':status===401||status===403?'관리자 로그인을 확인해 주세요.':'장소를 검색하지 못했습니다. 다시 시도해 주세요.');}finally{setSearching(false);}};
 const pickCalendar=(input:HTMLInputElement)=>{try{input.showPicker();}catch{input.focus();}};
 const save=async(e:FormEvent)=>{e.preventDefault();if(lock.current)return;if(!noEnd&&draft.endDate<draft.startDate){setError('종료일은 시작일 이후여야 합니다.');return;}lock.current=true;setSaving(true);setError('');try{onCreated(await createCompanyEvent({...draft,title:draft.title.trim(),endDate:noEnd?null:draft.endDate}));}catch(failure){const status=isAxiosError(failure)?failure.response?.status:undefined;setError(status===401||status===403?'관리자 권한이 없거나 로그인이 만료되었습니다.':status===400?'제목과 일정 기간을 확인해 주세요.':'일정을 등록하지 못했습니다. 다시 시도해 주세요.');}finally{lock.current=false;setSaving(false);}};
 return createPortal(<dialog ref={dialog} className="event-create-dialog" aria-labelledby="event-dialog-title" onCancel={e=>{e.preventDefault();close();}}>
  <div className="event-dialog-heading"><h2 id="event-dialog-title">사내일정 추가</h2><button type="button" aria-label="창 닫기" disabled={saving} onClick={close}>×</button></div>
  <form className="event-add-form" onSubmit={save}><fieldset disabled={saving}>
   <label>일정 종류<select value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})}>{['회의','세미나','교육','행사','기타'].map(c=><option key={c}>{c}</option>)}</select></label>
   <label>제목<input autoFocus required maxLength={80} value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></label>
   <div className="event-form-dates"><label>시작일<input type="date" required value={draft.startDate} onClick={e=>pickCalendar(e.currentTarget)} onChange={e=>setDraft({...draft,startDate:e.target.value,endDate:draft.endDate||e.target.value})}/></label><label>종료일<input type="date" required={!noEnd} disabled={noEnd} min={draft.startDate} value={noEnd?'':draft.endDate} onClick={e=>pickCalendar(e.currentTarget)} onChange={e=>setDraft({...draft,endDate:e.target.value})}/></label></div>
   <label className="event-no-end"><input type="checkbox" checked={noEnd} onChange={e=>setNoEnd(e.target.checked)}/>종료일 설정 안 함</label>
   {noEnd&&<p className="event-date-help">시작일부터 지속되는 일정으로 표시됩니다.</p>}
   <div className="event-place-search"><label>Google 지도에서 장소 검색<input maxLength={120} value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();void search();}}} placeholder="장소명 또는 주소"/></label><button type="button" disabled={searching||query.trim().length<2} onClick={()=>void search()}>{searching?'검색 중…':'장소 검색'}</button></div>
   {searchError&&<p className="gallery-error" role="alert">{searchError}</p>}
   {searched&&!results.length&&<p role="status">검색 결과가 없습니다. 다른 검색어를 입력해 주세요.</p>}
   {!!results.length&&<div className="event-place-results"><ul>{results.map(place=><li key={place.id}><button type="button" onClick={()=>{setDraft({...draft,location:(place.name+' · '+place.address).slice(0,120),placeId:place.id,locationDetail:''});setResults([]);setSearched(false);}}><strong>{place.name}</strong><span>{place.address}</span></button></li>)}</ul><small>Google Maps</small></div>}
   <label>선택한 장소 / 직접 입력 (선택)<input maxLength={120} value={draft.location} onChange={e=>setDraft({...draft,location:e.target.value,placeId:'',locationDetail:e.target.value?draft.locationDetail:''})}/></label>
   {draft.location&&<><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(draft.location)}${draft.placeId?'&query_place_id='+encodeURIComponent(draft.placeId):''}`} target="_blank" rel="noreferrer">Google 지도에서 위치 확인 ↗</a><label>상세장소 (선택)<input maxLength={120} value={draft.locationDetail} onChange={e=>setDraft({...draft,locationDetail:e.target.value})} placeholder="예: 3층 대회의실, 202호"/></label></>}
   <label>설명 (선택)<textarea maxLength={1000} rows={3} value={draft.description} onChange={e=>setDraft({...draft,description:e.target.value})}/></label>
   <small>등록한 일정은 홈페이지 방문자에게 공개됩니다.</small>
   <div className="event-form-actions"><button type="submit">{saving?'등록 중…':'일정 등록'}</button><button type="button" onClick={close}>취소</button></div>
  </fieldset>{error&&<p className="gallery-error" role="alert">{error}</p>}</form>
 </dialog>,document.body);
}
