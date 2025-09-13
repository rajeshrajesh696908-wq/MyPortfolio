// small helpers
const q = s => document.querySelector(s);
const qa = s => Array.from(document.querySelectorAll(s));

console.log("Portfolio Loaded Successfully! (fixed buttons + icons)");

// ---------- THEME (persist) ----------
const themeToggle = q('#theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'dark';
document.body.className = savedTheme;
themeToggle.setAttribute('aria-pressed', savedTheme === 'dark');
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
themeToggle.addEventListener('click', () => {
    const next = document.body.classList.contains('dark') ? 'light' : 'dark';
    document.body.className = next;
    localStorage.setItem('theme', next);
    themeToggle.setAttribute('aria-pressed', next === 'dark');
    themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
});

// ---------- SMOOTH ANCHOR SCROLL ----------
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
        // allow normal behavior if href is just '#' (handled elsewhere)
        const href = a.getAttribute('href');
        if (!href || href === '#') { e.preventDefault(); return; }
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: "smooth" });
    });
});

// ---------- BUTTONS that open external links (data-href) ----------
qa('.btn[data-href]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const href = btn.getAttribute('data-href') || '#';
        if (!href || href === '#') {
            // friendly feedback for placeholders
            // small, non-blocking UI: use alert for now
            alert('Demo / preview coming soon — will add a working link here.');
            return;
        }
        window.open(href, '_blank', 'noopener,noreferrer');
    });
});

// ---------- CONTACT FORM (mailto) ----------
const contactForm = q('#contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = contactForm.name.value.trim();
        const email = contactForm.email.value.trim();
        const message = contactForm.message.value.trim();
        if (!name || !email || !message) {
            alert('Please fill all fields before sending.');
            return;
        }
        const subject = encodeURIComponent(`Website Contact from ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
        // opens user's mail client
        window.location.href = `mailto:your@email.com?subject=${subject}&body=${body}`;
    });
}

// ---------- Cursor Glow (simple) ----------
const cursor = q('#cursor-glow');
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    cursor.style.transform = `translate(${mouse.x}px, ${mouse.y}px) translate(-50%, -50%) scale(.85)`;
});
window.addEventListener('mousedown', () => cursor.style.transform += ' scale(.6)');
window.addEventListener('mouseup', () => cursor.style.transform = `translate(${mouse.x}px, ${mouse.y}px) translate(-50%, -50%) scale(.95)`);

// ---------- Magnetic button hover (lightweight) ----------
function magneticize(el) {
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        const strength = Math.min(rect.width, rect.height) / 3;
        const tx = (dx / strength) * 8;
        const ty = (dy / strength) * 6;
        el.style.transform = `translate(${tx}px, ${ty}px) scale(1.03)`;
    });
    el.addEventListener('mouseleave', () => {
        el.style.transform = '';
    });
}
qa('.magnetic').forEach(magneticize);

// ---------- Small GSAP / ScrollTrigger reveals (kept subtle) ----------
if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.hero-inner .eyebrow', { y: 12, opacity: 0, duration: .9, delay: 0.2 });
    gsap.from('.hero-title .big', { y: 28, opacity: 0, duration: 1, delay: 0.3, ease: "power3.out" });
    gsap.from('.hero-title .accent', { y: 8, opacity: 0, duration: 1, delay: 0.45 });
    gsap.from('.hero-sub', { y: 14, opacity: 0, duration: 1, delay: 0.55 });
    gsap.from('.hero-ctas .btn', { y: 18, opacity: 0, duration: 0.9, stagger: 0.08, delay: 0.7 });
    qa('.glass, .project-card, .card, .showcase').forEach(el => {
        gsap.from(el, {
            scrollTrigger: { trigger: el, start: "top 85%" },
            y: 30,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.06
        });
    });
}

// ---------- Simple canvas particles (kept small) ----------
const canvas = q('#bg-particles');
if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let DPR = Math.max(1, window.devicePixelRatio || 1);

    function resizeCanvas() {
        DPR = Math.max(1, window.devicePixelRatio || 1);
        canvas.width = innerWidth * DPR;
        canvas.height = innerHeight * DPR;
        canvas.style.width = innerWidth + 'px';
        canvas.style.height = innerHeight + 'px';
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resizeCanvas();
    window.addEventListener('resize', () => { resizeCanvas();
        initParticles(); });

    let particles = [];

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function initParticles() {
        particles = [];
        const count = Math.max(30, Math.floor((innerWidth * innerHeight) / 90000));
        for (let i = 0; i < count; i++) {
            particles.push({
                x: rand(0, innerWidth),
                y: rand(0, innerHeight),
                r: rand(1.2, 4.2),
                vx: rand(-0.25, 0.25),
                vy: rand(-0.08, 0.08),
                alpha: rand(0.05, 0.18)
            });
        }
    }

    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < -10) p.x = innerWidth + 10;
            if (p.x > innerWidth + 10) p.x = -10;
            if (p.y < -10) p.y = innerHeight + 10;
            if (p.y > innerHeight + 10) p.y = -10;
            ctx.beginPath();
            ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function loop() { drawParticles();
        requestAnimationFrame(loop); }
    initParticles();
    loop();
}
