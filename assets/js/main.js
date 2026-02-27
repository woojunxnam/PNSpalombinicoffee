/* ============================================================
   PNS 팔롬비니 — main.js
   스크롤 애니메이션 + 카운터 + 패럴랙스 + 마이크로인터랙션
   ============================================================ */

/* ── 1. 연도 자동 업데이트 ── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── 2. Intersection Observer: 스크롤 등장 애니메이션 ── */
const revealElements = document.querySelectorAll(
  '.reveal, .reveal-left, .reveal-right, .reveal-up, .card, .tech-step, .result-card, .b2b-card, .stat, .product-main-card, .callout, .section-title, .section-lead, .hero-copy, .hero-media'
);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      // 한 번 보이면 다시 숨기지 않음
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

revealElements.forEach((el, i) => {
  // 카드·그리드 아이템은 순서대로 지연(stagger) 등장
  const parent = el.closest('.grid-2, .grid-3, .stats-inner, .product-features');
  if (parent) {
    const siblings = [...parent.children];
    const idx = siblings.indexOf(el);
    el.style.transitionDelay = `${idx * 80}ms`;
  }
  revealObserver.observe(el);
});

/* ── 3. 숫자 카운터 애니메이션 (Stats Bar) ── */
function animateCounter(el) {
  const target = el.dataset.target;
  const isPercent = target.includes('%');
  const isPlus   = target.includes('+');
  const suffix   = isPercent ? '%' : isPlus ? '+' : '';
  const prefix   = target.includes('s') ? '' : ''; // "1940s" 처리
  const raw      = parseFloat(target.replace(/[^0-9.]/g, ''));

  if (target.includes('s')) {
    // "1940s" 같은 연도는 그냥 올라오기만 함
    let start = raw - 30;
    const duration = 1200;
    const startTime = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(start + (raw - start) * ease) + 's';
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return;
  }

  const duration = 1400;
  const startTime = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const current = Math.floor(raw * ease);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target; // 정확한 최종값으로 고정
  };
  requestAnimationFrame(tick);
}

const statNums = document.querySelectorAll('.stat-num[data-target]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statNums.forEach(el => counterObserver.observe(el));

/* ── 4. 히어로 패럴랙스 (마우스 따라 살짝 기울기) ── */
const heroImage = document.querySelector('.hero-image');
const heroSection = document.querySelector('.hero');

if (heroImage && heroSection) {
  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;
    heroImage.style.transform = `perspective(800px) rotateY(${dx * 4}deg) rotateX(${-dy * 3}deg) scale(1.02)`;
  });
  heroSection.addEventListener('mouseleave', () => {
    heroImage.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)';
  });
}

/* ── 5. 스크롤 시 헤더 그림자 강조 ── */
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}, { passive: true });

/* ── 6. 네비게이션 활성 섹션 하이라이트 ── */
const navLinks = document.querySelectorAll('.nav a');
const sections = document.querySelectorAll('section[id]');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.classList.add('active');
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => navObserver.observe(s));

/* ── 7. 버튼 클릭 리플 효과 ── */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const circle = document.createElement('span');
    const diameter = Math.max(this.clientWidth, this.clientHeight);
    const radius = diameter / 2;
    const rect = this.getBoundingClientRect();
    circle.style.cssText = `
      width: ${diameter}px; height: ${diameter}px;
      left: ${e.clientX - rect.left - radius}px;
      top: ${e.clientY - rect.top - radius}px;
      position: absolute; border-radius: 50%;
      background: rgba(255,255,255,0.35);
      transform: scale(0); animation: ripple 0.5s linear;
      pointer-events: none;
    `;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(circle);
    setTimeout(() => circle.remove(), 500);
  });
});

/* ── 8. 부드러운 스크롤 (앵커 링크) ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const headerH = document.querySelector('.site-header').offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
