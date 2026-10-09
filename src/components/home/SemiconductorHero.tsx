import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBanners, bannerImageUrl } from '../../api/bannerService';
import { useAuthRole } from '../../hooks/useAuthRole';
import TypewriterText from './TypewriterText';
import Logo from '../../assets/logo.svg?react';
import './SemiconductorHero.css';

const defaults = [
 { id: -1, image: '', title: '작은 기술에서,\n더 큰 가능성으로.', description: '반도체와 시스템 기술을 연결해\n비즈니스의 다음 가능성을 함께 만듭니다.', eyebrow: 'SEMICONDUCTOR & SYSTEM TECHNOLOGY' },
 { id: -2, image: '/banners/research.svg', title: '연구로 연결하는\n기술의 다음 단계.', description: '기업부설연구소의 연구 분야와\n주요 보유 기술을 만나보세요.', eyebrow: 'RESEARCH & DEVELOPMENT' },
 { id: -3, image: '/banners/moments.svg', title: '함께 나누는 소식,\n함께 만드는 내일.', description: '지원시스템의 새로운 소식과\n함께하는 순간들을 확인하세요.', eyebrow: 'NEWS & MOMENTS' },
];
const traces = Array.from({ length: 18 }, (_, i) => {
  const y = 130 + i * 22;
  return `M 1280 ${y} H ${1060 + (i % 4) * 22} L ${990 + (i % 4) * 22} ${y + 70} H ${800 - (i % 3) * 25}`;
});

export default function SemiconductorHero() {
  const [slides, setSlides] = useState(defaults);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const { isSupervisor } = useAuthRole();
  const slide = slides[index] || slides[0];
  useEffect(() => { let active = true; getBanners().then(data => { if(active && data.length) { setSlides(data.slice(0, 5).map(b => ({ ...b, image: bannerImageUrl(b.id), eyebrow: 'G-WON SYSTEM · RESEARCH & INNOVATION' }))); setIndex(0); } }).catch(() => {}); return () => { active = false; }; }, []);
  useEffect(() => { const update = () => setHidden(document.hidden); document.addEventListener('visibilitychange',update); return () => document.removeEventListener('visibilitychange',update); }, []);
  useEffect(() => { if (!playing || hovered || focused || hidden || slides.length < 2) return; const timer = window.setInterval(() => setIndex(i => (i + 1) % slides.length), 12000); return () => window.clearInterval(timer); }, [playing, hovered, focused, hidden, slides.length, index]);
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!section || !canvas || !ctx) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = { x: -1000, y: -1000, active: false };
    let width = 0, height = 0, frame = 0, visible = true, last = 0;
    const resize = () => {
      width = section.clientWidth; height = section.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * ratio; canvas.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || motion.matches) return;
      const rect = section.getBoundingClientRect();
      pointer.x = event.clientX - rect.left; pointer.y = event.clientY - rect.top; pointer.active = true;
      section.style.setProperty('--pointer-x', `${pointer.x}px`);
      section.style.setProperty('--pointer-y', `${pointer.y}px`);
      section.classList.add('is-interacting');
    };
    const leave = () => { pointer.active = false; section.classList.remove('is-interacting'); };
    const paint = (time: number) => {
      frame = 0;
      if (motion.matches) return;
      frame = requestAnimationFrame(paint);
      if (time - last < 33 || !visible || document.hidden) return;
      last = time;
      ctx.clearRect(0, 0, width, height);
      if (motion.matches) return;
      const step = width < 600 ? 42 : 35;
      for (let row = 0; row < height / step; row++) {
        for (let column = 0; column < width / step; column++) {
          const x = column * step + (row % 2) * 12;
          const y = row * step;
          const distance = Math.hypot(x - pointer.x, y - pointer.y);
          const reaction = pointer.active ? Math.max(0, 1 - distance / 170) : 0;
          const shimmer = .5 + .5 * Math.sin(time * .00065 + column * .8 + row * .35);
          const alpha = .055 + shimmer * .025 + reaction * .48;
          const displacement = reaction * Math.sin(time * .0015 + row) * 3;
          ctx.fillStyle = `rgba(144, 205, 216, ${alpha})`;
          ctx.beginPath(); ctx.arc(x + displacement, y, .7 + reaction * 1.5, 0, Math.PI * 2); ctx.fill();
          if (reaction > .15) {
            ctx.strokeStyle = `rgba(131, 205, 219, ${reaction * .16})`;
            ctx.beginPath();ctx.moveTo(x, y);ctx.lineTo(x + step, y);ctx.stroke();
          }
        }
      }
    };
    const updateScroll = () => {
      const progress = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / section.clientHeight));
      section.style.setProperty('--hero-lift', motion.matches ? '0px' : `${progress * -65}px`);
      section.style.setProperty('--hero-fade', `${motion.matches ? 1 : 1 - progress * .65}`);
    };
    const handleMotionChange = () => {
      leave(); cancelAnimationFrame(frame); ctx.clearRect(0, 0, width, height);
      updateScroll(); frame = requestAnimationFrame(paint);
    };
    const observer = new ResizeObserver(resize); observer.observe(section);
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }); intersection.observe(section);
    section.addEventListener('pointermove', move); section.addEventListener('pointerleave', leave);
    window.addEventListener('scroll', updateScroll, { passive: true });
    motion.addEventListener('change', handleMotionChange);
    document.documentElement.classList.add('home-scroll-snap');
    resize(); updateScroll(); frame = requestAnimationFrame(paint);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect();
      section.removeEventListener('pointermove', move); section.removeEventListener('pointerleave', leave);
      window.removeEventListener('scroll', updateScroll); motion.removeEventListener('change', handleMotionChange);
      document.documentElement.classList.remove('home-scroll-snap');
    };
  }, []);


  return (
    <section ref={sectionRef} className="silicon-hero" aria-labelledby="silicon-title" aria-roledescription="캐러셀">
      <svg className={`silicon-scene hero-chip-background ${slide.id === -1 ? 'is-active' : ''}`} viewBox="0 0 1280 620" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="silicon-metal" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#657780"/><stop offset=".35" stopColor="#283841"/><stop offset=".7" stopColor="#0a141b"/><stop offset="1" stopColor="#52646c"/></linearGradient>
          <linearGradient id="silicon-die"><stop stopColor="#243c49"/><stop offset=".6" stopColor="#101d26"/><stop offset="1" stopColor="#3a4c51"/></linearGradient>
          <linearGradient id="silicon-trace"><stop stopColor="#447c90" stopOpacity="0"/><stop offset=".6" stopColor="#668e96" stopOpacity=".5"/><stop offset="1" stopColor="#d0b884" stopOpacity=".65"/></linearGradient>
          <pattern id="silicon-cells" width="13" height="13" patternUnits="userSpaceOnUse"><rect width="10" height="10" x="1" y="1" fill="none" stroke="#77a2b0" strokeWidth=".45" opacity=".4"/></pattern>
          <radialGradient id="silicon-aura"><stop stopColor="#4f9aab" stopOpacity=".16"/><stop offset="1" stopColor="#10171d" stopOpacity="0"/></radialGradient>
        </defs>
        <ellipse cx="915" cy="330" rx="460" ry="320" fill="url(#silicon-aura)"/>
        <g stroke="url(#silicon-trace)" strokeWidth="1" fill="none">
          {traces.map((d, i) => <path key={i} d={d}/>)}
          {traces.map((d, i) => <path key={`mirror-${i}`} d={d} transform="translate(1760 650) rotate(180)"/>)}
        </g>
        <g className="silicon-chip" transform="translate(890 310) rotate(-24) skewX(10)">
          <rect x="-149" y="-139" width="306" height="306" rx="10" fill="#020609" stroke="#1d343f" strokeWidth="3"/>
          <rect x="-150" y="-150" width="300" height="300" rx="8" fill="url(#silicon-metal)" stroke="#6e858d" strokeWidth="1.5"/>
          {Array.from({length: 22}, (_, i) => <g key={i} fill="#b2a17b" opacity=".65">
            <rect x={-126 + i * 12} y="-145" width="5" height="16"/><rect x={-126 + i * 12} y="129" width="5" height="16"/>
            <rect x="-145" y={-126 + i * 12} width="16" height="5"/><rect x="129" y={-126 + i * 12} width="16" height="5"/>
          </g>)}
          <rect x="-111" y="-111" width="222" height="222" rx="3" fill="url(#silicon-die)" stroke="#83a1a6" strokeOpacity=".5"/>
          <rect x="-101" y="-101" width="202" height="202" fill="url(#silicon-cells)"/>
          <path d="M-88 -65 H-12 V-88 H85 V-20 H38 V72 H-75 V18 H-88 Z" fill="none" stroke="#b8c5b3" strokeOpacity=".35"/>
          <rect x="-54" y="-44" width="108" height="88" fill="#111d25" stroke="#829e9f" strokeOpacity=".55"/>
          <text x="0" y="-4" textAnchor="middle" fill="#b7c7cb" fontSize="13" letterSpacing="3" fontFamily="monospace">SYSTEM</text>
          <text x="0" y="16" textAnchor="middle" fill="#647e88" fontSize="8" letterSpacing="2" fontFamily="monospace">ON CHIP</text>
        </g>
      </svg>
      <div className="hero-backgrounds" aria-hidden="true">{slides.map((item, position) => <div key={item.id} className={`hero-background-layer ${position === index ? 'is-active' : ''}`}>{item.image && <img src={item.image} alt="" />}</div>)}</div>
      <canvas ref={canvasRef} className="silicon-particles" aria-hidden="true"/>
      <div className="silicon-response" aria-hidden="true"/>
      {isSupervisor && <Link className="hero-manage-link" to="/banners">배너 관리 ↗</Link>}
      <div className="silicon-content">
        <div className="silicon-signature"><Logo aria-hidden="true"/><span>지원시스템 <small>G-WON SYSTEM</small></span></div>
        <div className="silicon-copy" key={slide.id}>
          <p className="silicon-eyebrow">{slide.eyebrow}</p>
          <h1 id="silicon-title"><TypewriterText text={slide.title} /></h1>
          <p className="silicon-description"><TypewriterText text={slide.description} speed={28} delay={Array.from(slide.title).length * 60 + 400} /></p>
        </div>
        <div className="hero-carousel-controls hero-dot-controls" aria-label="배너 선택" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={e => setFocused(e.target.matches(':focus-visible'))} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}>
          <div className="hero-dots">{slides.map((item, position) => <button type="button" key={item.id} className={position === index ? 'is-active' : ''} aria-label={`${position + 1}번 배너: ${item.title}`} aria-current={position === index ? 'true' : undefined} onClick={() => setIndex(position)}><span /></button>)}</div>
          <button type="button" className="hero-play-toggle" onClick={() => setPlaying(value => !value)} aria-label={playing ? '배너 자동 재생 정지' : '배너 자동 재생 시작'}>{playing ? 'Ⅱ' : '▶'}</button>
        </div>
      </div>
    </section>
  );
}
