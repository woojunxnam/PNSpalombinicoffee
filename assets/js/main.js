/* ============================================================
   PNS 팔롬비니 — main.js
   ============================================================ */

/* ── 1. 연도 자동 업데이트 ── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── 2. 스크롤 등장 애니메이션 ── */
const revealElements = document.querySelectorAll(
  '.card, .tech-step, .result-card, .b2b-card, .stat, .product-main-card, .callout, .section-title, .section-lead, .hero-copy, .hero-media, .review-card'
);
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

revealElements.forEach((el) => {
  const parent = el.closest('.grid-2, .grid-3, .stats-inner, .product-features, .reviews-grid');
  if (parent) {
    const idx = [...parent.children].indexOf(el);
    el.style.transitionDelay = `${idx * 80}ms`;
  }
  revealObserver.observe(el);
});

/* ── 3. 숫자 카운터 애니메이션 ── */
function animateCounter(el) {
  const target   = el.dataset.target;
  const raw      = parseFloat(target.replace(/[^0-9.]/g, ''));
  const suffix   = target.replace(/[0-9.]/g, '');
  const startVal = target.includes('s') ? raw - 30 : 0;
  const duration = 1400;
  const startTime = performance.now();
  const tick = (now) => {
    const p = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(startVal + (raw - startVal) * ease) + suffix;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  requestAnimationFrame(tick);
}
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) { animateCounter(entry.target); counterObserver.unobserve(entry.target); }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num[data-target]').forEach(el => counterObserver.observe(el));

/* ── 4. 히어로 마우스 패럴랙스 ── */
const heroImage   = document.querySelector('.hero-image');
const heroSection = document.querySelector('.hero');
if (heroImage && heroSection) {
  heroSection.addEventListener('mousemove', (e) => {
    const r = heroSection.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width  / 2) / r.width;
    const dy = (e.clientY - r.top  - r.height / 2) / r.height;
    heroImage.style.transform = `perspective(800px) rotateY(${dx*4}deg) rotateX(${-dy*3}deg) scale(1.02)`;
  });
  heroSection.addEventListener('mouseleave', () => {
    heroImage.style.transform = 'perspective(800px) rotateY(0) rotateX(0) scale(1)';
  });
}

/* ── 5. 헤더 스크롤 그림자 ── */
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ── 6. 네비게이션 활성 섹션 하이라이트 ── */
const navLinks = document.querySelectorAll('.nav a');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, { threshold: 0.35 });
document.querySelectorAll('section[id]').forEach(s => navObserver.observe(s));

/* ── 7. 버튼 리플 효과 ── */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const circle = document.createElement('span');
    const d = Math.max(this.clientWidth, this.clientHeight);
    const rect = this.getBoundingClientRect();
    circle.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX-rect.left-d/2}px;top:${e.clientY-rect.top-d/2}px;position:absolute;border-radius:50%;background:rgba(255,255,255,.32);transform:scale(0);animation:ripple .5s linear;pointer-events:none;`;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(circle);
    setTimeout(() => circle.remove(), 500);
  });
});

/* ── 8. 부드러운 스크롤 ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const headerH = document.querySelector('.site-header').offsetHeight;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - headerH - 16, behavior: 'smooth' });
    }
  });
});

/* ── 9. FAQ 아코디언 ── */
/* scrollHeight 계산 버그 수정: overflow:hidden 상태에서도 안정적으로 작동하는 고정값 방식 사용 */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', function () {
    const item   = this.closest('.faq-item');
    const answer = item.querySelector('.faq-answer');
    const icon   = this.querySelector('.faq-icon');
    const isOpen = item.classList.contains('open');

    // 다른 열린 항목 닫기
    document.querySelectorAll('.faq-item.open').forEach(openItem => {
      if (openItem !== item) {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        openItem.querySelector('.faq-icon').textContent = '+';
        openItem.querySelector('.faq-answer').style.maxHeight = '0px';
      }
    });

    if (isOpen) {
      item.classList.remove('open');
      this.setAttribute('aria-expanded', 'false');
      icon.textContent = '+';
      answer.style.maxHeight = '0px';
    } else {
      item.classList.add('open');
      this.setAttribute('aria-expanded', 'true');
      icon.textContent = '×';
      answer.style.maxHeight = '800px'; // 충분히 큰 고정값 — scrollHeight 버그 방지
    }
  });
});

/* ── 10. KO / EN 언어 토글 ── */
const translations = {
  ko: {
    'nav-buy-btn':   '네이버 스마트스토어 구매',
    'hero-eyebrow':  'Premium Drip Bag Coffee',
    'hero-title':    '99% 실버스킨 제거.<br/>원두를 \'안쪽부터\' 맑게.',
    'hero-sub':      '로마의 유서 깊은 로스터리 <strong>Caffè Palombini(1940년대 시작)</strong>의 장인정신과, 베트남 중부고원의 <strong>현무암(화산) 토양 테루아</strong>가 만든 깊은 바디감을 한 잔에 담았습니다.',
    'hero-btn-buy':  '스마트스토어에서 바로 구매',
    'hero-btn-story':'브랜드 스토리 보기',
    'badge-1':'클린 피니시','badge-2':'향의 선명도','badge-3':'휴대·간편','badge-4':'질소 충전 패키징',
    'stat-1':'실버스킨 제거율<br/><small>(자체 공정 기준)</small>','stat-2':'Palombini<br/>창립 연도','stat-3':'공급 바(bar)<br/>이탈리아','stat-4':'화산 토양<br/>베트남 원두',
    'about-title':'About Us',
    'about-lead':'우리는 "편한 커피"를 만들고 싶지 않았습니다. <strong>편하지만, 프리미엄</strong>이어야 했습니다. 그래서 원두가 가진 본연의 단맛과 향을 흐리는 미세 잔여물을 끝까지 다루는 방식으로 접근했습니다— 그 출발점이 <strong>99% 실버스킨 제거(자체 공정 기준)</strong>입니다.',
    'tech-title':'Our Technology: The "Inside-Out" Difference',
    'tech-prob-title':'문제: 대부분이 놓치는 지점','tech-sol-title':'해결: Inside-Out, 센터 컷까지','tech-result-title':'결과: 컵에서 느껴지는 차이',
    'heritage-title':'Our Heritage &amp; Sourcing',
    'products-title':'Products — For You (B2C)',
    'products-lead':'당신의 하루가 어디에 있든, <strong>한 잔의 퀄리티는 타협하지 않도록</strong> 만들었습니다.',
    'product-badge':'PREMIUM','product-name':'프리미엄 드립백 커피','product-buy-btn':'스마트스토어에서 구매하기 →',
    'b2b-title':'For Partners — Business Solutions (B2B)',
    'b2b-lead':'커피 브랜드를 "제품"이 아니라 <strong>시스템</strong>으로 제공할 수 있어야 한다고 믿습니다. 원두 선별부터 패키징, OEM 설계까지—전체 생태계를 함께 구축합니다.',
    'b2b-cta-text':'B2B 파트너십, 대량구매, OEM 문의는 아래 연락처로 편하게 연락주세요.','b2b-cta-btn':'파트너십 문의하기',
    'reviews-title':'고객 후기','reviews-lead':'실제 구매하신 분들의 솔직한 이야기입니다.','reviews-note':'더 많은 후기가 궁금하신가요?','reviews-btn':'네이버 스토어에서 전체 리뷰 보기 →',
    'faq-title':'자주 묻는 질문','faq-lead':'구매 전 궁금하신 점을 미리 답해드립니다.',
    'purchase-title':'Purchase','purchase-lead':'결제는 네이버 스마트스토어에서 진행됩니다. 안전하고 빠른 구매가 가능합니다.','purchase-btn':'네이버 스마트스토어로 이동 →','purchase-btn2':'대량구매 / OEM 문의',
    'contact-title':'Contact','contact-inquiry':'문의','contact-email-btn':'이메일 보내기','contact-ref-title':'References',
    'footer-sub':'99% 실버스킨 제거(자체 공정 기준) · Caffè Palombini Heritage · Vietnamese Volcanic Terroir',
    'faq-q1':'드립백은 어떻게 사용하나요?',
    'faq-q2':'99% 실버스킨 제거가 맛에 어떤 차이를 주나요?',
    'faq-q3':'Caffè Palombini는 어떤 브랜드인가요?',
    'faq-q4':'유통기한은 얼마나 되나요?',
    'faq-q5':'대량 구매 또는 B2B 문의는 어떻게 하나요?',
    'faq-q6':'화산 토양이 커피 맛에 어떤 영향을 주나요?',
  },
  en: {
    'nav-buy-btn':   'Buy on Naver Store',
    'hero-eyebrow':  'Premium Drip Bag Coffee',
    'hero-title':    '99% Silverskin Removed.<br/>Clarity from the Inside Out.',
    'hero-sub':      'The craftsmanship of <strong>Caffè Palombini (est. 1940s)</strong>, Rome\'s heritage roastery, combined with the volcanic terroir of <strong>Vietnam\'s Central Highlands</strong> — in every cup.',
    'hero-btn-buy':  'Buy Now on Naver Store',
    'hero-btn-story':'Our Brand Story',
    'badge-1':'Clean Finish','badge-2':'Aroma Clarity','badge-3':'Portable','badge-4':'Nitrogen Flushed',
    'stat-1':'Silverskin Removed<br/><small>(in-house standard)</small>','stat-2':'Palombini<br/>Founded','stat-3':'Bars Supplied<br/>in Italy','stat-4':'Volcanic Soil<br/>Vietnamese Beans',
    'about-title':'About Us',
    'about-lead':'We didn\'t want to make "convenient coffee." It had to be <strong>convenient AND premium</strong>. So we tackled the micro-residues that cloud a bean\'s true character — starting with <strong>99% silverskin removal (in-house process standard)</strong>.',
    'tech-title':'Our Technology: The "Inside-Out" Difference',
    'tech-prob-title':'The Problem: What Most Roasters Miss','tech-sol-title':'The Solution: Inside-Out, Down to the Center Cut','tech-result-title':'The Result: The Difference in Your Cup',
    'heritage-title':'Our Heritage &amp; Sourcing',
    'products-title':'Products — For You (B2C)',
    'products-lead':'Wherever your day takes you, <strong>never compromise on quality</strong>.',
    'product-badge':'PREMIUM','product-name':'Premium Drip Bag Coffee','product-buy-btn':'Buy on Naver Store →',
    'b2b-title':'For Partners — Business Solutions (B2B)',
    'b2b-lead':'We believe a coffee brand should be delivered as a <strong>system</strong>, not just a product. From bean sorting to packaging and OEM design — we build the full ecosystem with you.',
    'b2b-cta-text':'For B2B partnerships, bulk orders, or OEM inquiries, please reach out anytime.','b2b-cta-btn':'Contact for Partnership',
    'reviews-title':'Customer Reviews','reviews-lead':'Honest words from real customers.','reviews-note':'Want to read more reviews?','reviews-btn':'View all reviews on Naver Store →',
    'faq-title':'Frequently Asked Questions','faq-lead':'Everything you need to know before your first cup.',
    'purchase-title':'Purchase','purchase-lead':'All purchases are processed securely through Naver Smart Store.','purchase-btn':'Go to Naver Smart Store →','purchase-btn2':'Bulk / OEM Inquiry',
    'contact-title':'Contact','contact-inquiry':'Get in Touch','contact-email-btn':'Send Email','contact-ref-title':'References',
    'footer-sub':'99% Silverskin Removal (in-house standard) · Caffè Palombini Heritage · Vietnamese Volcanic Terroir',
    'faq-q1':'How do I brew the drip bag?',
    'faq-q2':'How does 99% silverskin removal affect the taste?',
    'faq-q3':'Who is Caffè Palombini?',
    'faq-q4':'What is the shelf life?',
    'faq-q5':'How can I place a bulk or B2B order?',
    'faq-q6':'How does volcanic soil affect coffee flavor?',
  }
};

function applyLang(lang) {
  const t = translations[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.innerHTML = t[key];
  });
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  document.documentElement.lang = lang === 'ko' ? 'ko' : 'en';
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });
  applyLang('ko');
});
