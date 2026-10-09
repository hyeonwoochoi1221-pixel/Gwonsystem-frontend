import { useEffect, useRef, useState } from 'react';
import EventCreateDialog from './EventCreateDialog';
import { CompanyEvent, getCompanyEvents } from '../../api/companyEventService';
import './HomeEvents.css';
export default function HomeEvents({canAdd}:{canAdd:boolean}) {
 const [events,setEvents]=useState<CompanyEvent[]>([]);
 const [loading,setLoading]=useState(true); const [error,setError]=useState('');
 const [page,setPage]=useState(0); const [adding,setAdding]=useState(false);
 const addButton=useRef<HTMLButtonElement>(null);
 const load=()=>{setLoading(true);setError('');getCompanyEvents().then(setEvents).catch(()=>setError('일정을 불러오지 못했습니다.')).finally(()=>setLoading(false));};
 useEffect(load,[]);
 const close=()=>{setAdding(false);addButton.current?.focus();};
 const created=(event:CompanyEvent)=>{setEvents(items=>[event,...items].sort((a,b)=>b.startDate.localeCompare(a.startDate)||b.id-a.id));setPage(0);setError('');close();};
 const pages=Math.ceil(events.length/4);
 return <section className="home-overview-card home-events" aria-labelledby="events-heading">
  <div className="home-section-heading"><h2 id="events-heading">사내일정</h2>{canAdd&&<button ref={addButton} type="button" className="event-add-button" aria-expanded={adding} aria-haspopup="dialog" onClick={()=>adding?close():setAdding(true)}>+ 일정 추가</button>}</div>
  {canAdd&&adding&&<EventCreateDialog onClose={close} onCreated={created} />}
  {loading?<p className="empty-text" role="status">일정을 불러오고 있습니다…</p>:error?<div className="empty-text"><p role="alert">{error}</p><button type="button" onClick={load}>다시 시도</button></div>:!events.length?<p className="empty-text">등록된 사내일정이 없습니다.</p>:<>
   <div className="home-event-grid">{events.slice(page*4,page*4+4).map(event=><article className="home-event-card" key={event.id}><span className="home-event-category">{event.category}</span><h3>{event.title}</h3><p className="home-event-period"><time dateTime={event.startDate}>{event.startDate}</time>{event.endDate===null ? '부터 지속' : event.endDate!==event.startDate&&<> ~ <time dateTime={event.endDate}>{event.endDate}</time></>}</p>{event.location&&<p className="home-event-location">{event.location}{event.locationDetail && <> · {event.locationDetail}</>}</p>}{event.description&&<details><summary>자세히 보기</summary><p className="home-event-description">{event.description}</p></details>}</article>)}</div>
   {pages>1&&<nav className="event-page-dots" aria-label="사내일정 페이지">{Array.from({length:pages},(_,i)=><button type="button" key={i} aria-label={`${i+1}페이지`} aria-current={page===i?'page':undefined} className={page===i?'active':''} onClick={()=>setPage(i)}><span/></button>)}</nav>}
  </>}
 </section>;
}
