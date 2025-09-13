/* v3.0 — cinematic interactions + animations
   Requires: GSAP (3.12.x) + ScrollTrigger
*/

// small helpers
const q = s => document.querySelector(s);
const qa = s => Array.from(document.querySelectorAll(s));

/* ---------- THEME (persist) ---------- */
const themeToggle = q('#theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.dataset.theme = savedTheme;
document.body.className = savedTheme;
themeToggle.addEventListener('click', () => {
  const next = document.body.classList.contains('dark') ? 'light' : 'dark';
  document.body.className = next;
  localStorage.setItem('theme', next);
  themeToggle.setAttribute('aria-pressed', next === 'dark');
});

/* ---------- CURSOR GLOW ---------- */
const cursor = q('#cursor-glow');
let mouse = {x: window.innerWidth/2, y: window.innerHeight/2};
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX; mouse.y = e.clientY;
  gsap.to(cursor, {duration: 0.12, x: mouse.x, y: mouse.y, ease: "power2.out"});
});
window.addEventListener('mousedown', () => gsap.to(cursor,{duration:.12,scale:0.6}));
window.addEventListener('mouseup', () => gsap.to(cursor,{duration:.18,scale:.95}));

/* enlarge cursor near interactive elements */
const hovers = qa('button, a, .magnetic, .btn');
hovers.forEach(el=>{
  el.addEventListener('mouseenter', ()=> gsap.to(cursor, {duration:.18, scale:1.2, opacity:1}));
  el.addEventListener('mouseleave', ()=> gsap.to(cursor, {duration:.18, scale:.8, opacity:1}));
});

/* ---------- MAGNETIC BUTTONS ---------- */
function magneticize(el){
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width/2);
    const dy = e.clientY - (rect.top + rect.height/2);
    const strength = Math.min(rect.width, rect.height)/4;
    const tx = (dx/strength) * 10;
    const ty = (dy/strength) * 8;
    gsap.to(el, {duration:0.25, x:tx, y:ty, scale:1.03, ease:'power3.out'});
  });
  el.addEventListener('mouseleave', ()=> gsap.to(el, {duration:0.4, x:0, y:0, scale:1, ease:'elastic.out(1,0.6)'}));
}
qa('.magnetic').forEach(magneticize);

/* ---------- 3D TILT ON CARDS ---------- */
function attachTilt(card){
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (py - 0.5) * -8; // rotation x
    const ry = (px - 0.5) * 10; // rotation y
    const tz = 12;
    gsap.to(card, {duration:0.36, rotateX: rx, rotateY: ry, transformPerspective:800, z:tz, boxShadow:'0 18px 40px rgba(2,6,23,0.6)'});
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, {duration:.6, rotateX:0, rotateY:0, z:0, boxShadow:'0 6px 18px rgba(2,6,23,0.38)', ease:'elastic.out(1,0.6)'});
  });
}
qa('.tilt-card').forEach(attachTilt);

/* ---------- SCROLL TRIGGERS (entry animations) ---------- */
gsap.registerPlugin(ScrollTrigger);

/* hero reveal */
gsap.from('.hero-inner .eyebrow',{y:12, opacity:0, duration:.9, delay:0.2});
gsap.from('.hero-title .big',{y:28, opacity:0, duration:1, delay:0.3, ease:"power3.out"});
gsap.from('.hero-title .accent',{y:8, opacity:0, duration:1, delay:0.45});
gsap.from('.hero-sub',{y:14, opacity:0, duration:1, delay:0.55});
gsap.from('.hero-ctas .btn',{y:18, opacity:0, duration:0.9, stagger:0.08, delay:0.7});

/* cards & projects on scroll */
qa('.glass, .project-card, .card, .showcase').forEach(el=>{
  gsap.from(el, {
    scrollTrigger: {trigger: el, start: "top 85%"},
    y: 30, opacity:0, duration:0.9, ease: "power3.out", stagger:0.06
  });
});

/* subtle parallax for hero card */
const heroCard = q('.hero-card');
window.addEventListener('mousemove', e => {
  const cx = (e.clientX - window.innerWidth/2)/window.innerWidth;
  const cy = (e.clientY - window.innerHeight/2)/window.innerHeight;
  gsap.to(heroCard, {duration:0.9, x: cx * -18, y: cy * -10, rotation: cx * -3, ease: "power3.out"});
});

/* ---------- BACKGROUND PARTICLES (canvas) ---------- */
const canvas = q('#bg-particles');
const ctx = canvas.getContext('2d');
let DPR = Math.max(1, window.devicePixelRatio || 1);
function resizeCanvas(){
  DPR = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = innerWidth * DPR;
  canvas.height = innerHeight * DPR;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.scale(DPR, DPR);
}
resizeCanvas();
window.addEventListener('resize', ()=> { resizeCanvas(); initParticles(); });

let particles = [];
function rand(min,max){ return Math.random()*(max-min)+min; }
function initParticles(){
  particles = [];
  const count = Math.floor((innerWidth*innerHeight)/70000);
  for(let i=0;i<count;i++){
    particles.push({
      x: rand(0, innerWidth),
      y: rand(0, innerHeight),
      r: rand(1.8,5.5),
      vx: rand(-0.3,0.3),
      vy: rand(-0.12,0.12),
      alpha: rand(0.06,0.24)
    });
  }
}
function drawParticles(){
  ctx.clearRect(0,0, canvas.width, canvas.height);
  // draw subtle bubbles
  for(let p of particles){
    p.x += p.vx;
    p.y += p.vy;
    if(p.x < -10) p.x = innerWidth + 10;
    if(p.x > innerWidth + 10) p.x = -10;
    if(p.y < -10) p.y = innerHeight + 10;
    if(p.y > innerHeight + 10) p.y = -10;
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fill();
  }
}
function loop(){
  drawParticles();
  requestAnimationFrame(loop);
}
initParticles(); loop();

/* ---------- BLOB ANIMATION (SVG path morph) ---------- */
const blob = q('#blob-path');
let t = 0;
function blobPath(w,h,seed=0){
  // Simple procedural blob using sinus waves - small but performant
  const cx = 400, cy = 300;
  const rx = 260 + Math.sin(seed + t*0.6) * 22;
  const ry = 190 + Math.cos(seed + t*0.45) * 22;
  const d = `
    M ${cx - rx}, ${cy}
    C ${cx - rx}, ${cy - ry*0.45} ${cx - rx*0.6}, ${cy - ry} ${cx}, ${cy - ry}
    C ${cx + rx*0.6}, ${cy - ry} ${cx + rx}, ${cy - ry*0.45} ${cx + rx}, ${cy}
    C ${cx + rx}, ${cy + ry*0.45} ${cx + rx*0.6}, ${cy + ry} ${cx}, ${cy + ry}
    C ${cx - rx*0.6}, ${cy + ry} ${cx - rx}, ${cy + ry*0.45} ${cx - rx}, ${cy}
    Z`;
  return d;
}
function animateBlob(){
  t += 0.016;
  blob.setAttribute('d', blobPath());
  requestAnimationFrame(animateBlob);
}
animateBlob();

/* ---------- NAV LINK active on scroll ---------- */
const sections = qa('section, header');
const navLinks = qa('.nav-links a');
function onScrollActive(){
  let current = null;
  for(let s of sections){
    const rect = s.getBoundingClientRect();
    if(rect.top <= window.innerHeight * 0.32) current = s;
  }
  if(current){
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${current.id}`));
  }
}
window.addEventListener('scroll', onScrollActive);
onScrollActive();

/* ---------- Accessibility: reduce motion respect ---------- */
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  gsap.globalTimeline.timeScale(0.001);
}
