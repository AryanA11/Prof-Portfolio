const root = document.documentElement;
const links = Array.from(document.querySelectorAll('.link'));
const video = document.getElementById('heroVideo');

function clamp(v, a=0, b=1){ return Math.max(a, Math.min(b, v)); }
function smoothstep(x){ x = clamp(x,0,1); return x*x*(3 - 2*x); }

let duration = 1;
let targetProgress = 0;
let raf = null;

function update(progress){
  root.style.setProperty('--progress', progress);

  // map progress to video time when available
  if(video && duration > 0){
    const t = clamp(progress, 0, 1) * (duration - 0.001);
    try{ video.currentTime = t; } catch(e){}
  }

  // links: gradual, staggered reveal based on progress
  const baseStart = 0.6; // when the first link begins to fade in
  const step = 0.08;     // stagger between links
  const span = 0.3;      // how gradual the fade is
  links.forEach((a, i) => {
    const tStart = baseStart + i * step;
    const v = smoothstep(clamp((progress - tStart) / span, 0, 1));
    a.style.opacity = String(v);
    a.style.transform = `translateX(${(1 - v) * 28}px) translateY(${ -i * 10 }px)`;
  });
}

function scheduleUpdate(){
  if(raf) return;
  raf = requestAnimationFrame(function tick(){
    raf = null;
    update(targetProgress);
  });
}

function handlePointer(clientX){
  targetProgress = clamp(clientX / window.innerWidth, 0, 1);
  scheduleUpdate();
}

document.addEventListener('mousemove', e => handlePointer(e.clientX));
document.addEventListener('touchmove', e => { if(e.touches[0]) handlePointer(e.touches[0].clientX); }, {passive:true});

if(video){
  video.addEventListener('loadedmetadata', () => {
    duration = video.duration || 1;
    video.pause();
    video.currentTime = 0;
    // try to play muted video to allow seeking in some browsers
    const p = video.play();
    if(p && p.catch) p.catch(()=>{});
  });
}

// initialize
update(0);
