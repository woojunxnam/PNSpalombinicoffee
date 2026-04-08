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
    const href = this.getAttribute('href');
    if (href === '#top') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const headerEl = document.querySelector('.site-header');
      const headerH = headerEl ? headerEl.offsetHeight : 0;
      const quickJump = document.querySelector('.vr-quickjump');
      const quickJumpH = (quickJump && window.innerWidth <= 820) ? quickJump.offsetHeight : 0;
      const extraOffset = quickJumpH ? (quickJumpH + 10) : 16;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - headerH - extraOffset, behavior: 'smooth' });
    }
  });
});

/* ── 8.2. Volcano Ruby Quick Jump Active State ── */
(function () {
  const quickLinks = [...document.querySelectorAll('.vr-quickjump-link[href^="#"]')];
  if (!quickLinks.length) return;

  const sections = quickLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (!sections.length) return;

  const setActive = (id) => {
    quickLinks.forEach(link => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
    });
  };

  const quickObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible?.target?.id) setActive(visible.target.id);
  }, {
    rootMargin: '-24% 0px -60% 0px',
    threshold: [0.15, 0.35, 0.6]
  });

  sections.forEach(section => quickObserver.observe(section));
  setActive(sections[0].id);
})();

/* ── 8.5. Mobile Navigation ── */
(function () {
  const pathname = window.location.pathname.replace(/\\/g, '/');
  const nestedPage = /\/(products|machines)\//.test(pathname);
  const prefix = nestedPage ? '../' : '';

  const siteHeader = document.querySelector('.site-header');
  const headerInner = document.querySelector('.header-inner');
  if (!siteHeader || !headerInner) return;

  const headerActions = headerInner.querySelector('.header-actions') || headerInner;

  /* inject lang toggle if not already present */
  if (!headerActions.querySelector('.lang-toggle')) {
    const lt = document.createElement('div');
    lt.className = 'lang-toggle';
    lt.innerHTML = '<button class="lang-btn" data-lang="ko">KO</button><button class="lang-btn" data-lang="en">EN</button>';
    lt.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (typeof applyLang === 'function') applyLang(btn.dataset.lang);
      });
    });
    headerActions.insertBefore(lt, headerActions.firstChild);
  }

  const panelId = 'mobileNavPanel';

  const getActionInsertTarget = () =>
    headerActions.querySelector('[data-mobile-menu-toggle], .btn') || null;

  let instaLink = headerActions.querySelector('.insta-link');
  if (!instaLink) {
    instaLink = document.createElement('a');
    instaLink.className = 'insta-link';
    instaLink.href = 'https://www.instagram.com/palombini_eunhaeng';
    instaLink.target = '_blank';
    instaLink.rel = 'noopener';
    instaLink.setAttribute('aria-label', 'Instagram');
    instaLink.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>';
    const target = getActionInsertTarget();
    if (target) {
      target.insertAdjacentElement('beforebegin', instaLink);
    } else {
      headerActions.appendChild(instaLink);
    }
  }

  let storeLink = headerActions.querySelector('[data-store-link]');
  if (!storeLink) {
    storeLink = document.createElement('a');
    storeLink.className = 'store-link';
    storeLink.href = 'https://smartstore.naver.com/palombini';
    storeLink.target = '_blank';
    storeLink.rel = 'noopener';
    storeLink.setAttribute('aria-label', '네이버 스마트스토어');
    storeLink.setAttribute('data-store-link', '');
    storeLink.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 9h16"></path><path d="M6 9V7.8A2.8 2.8 0 0 1 8.8 5h6.4A2.8 2.8 0 0 1 18 7.8V9"></path><path d="M5.5 9h13l-.8 9.5a1.5 1.5 0 0 1-1.49 1.37H7.3a1.5 1.5 0 0 1-1.49-1.37L5.5 9Z"></path><path d="M9 13.5h6"></path><path d="M9 16.5h6"></path></svg>';
    instaLink.insertAdjacentElement('afterend', storeLink);
  }

  let toggle = headerInner.querySelector('[data-mobile-menu-toggle]');
  if (!toggle) {
    toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'menu-toggle';
    toggle.setAttribute('aria-controls', panelId);
    toggle.setAttribute('data-mobile-menu-toggle', '');
    headerActions.appendChild(toggle);
  }
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', '모바일 메뉴 열기');
  toggle.innerHTML = '<span class="menu-toggle-icon" aria-hidden="true"><span class="menu-toggle-bar"></span><span class="menu-toggle-bar"></span><span class="menu-toggle-bar"></span></span>';

  let backdrop = document.querySelector('.mobile-nav-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'mobile-nav-backdrop';
    backdrop.setAttribute('hidden', '');
    document.body.appendChild(backdrop);
  }

  let panel = document.getElementById(panelId);
  if (!panel) {
    panel = document.createElement('div');
    panel.className = 'mobile-nav';
    panel.id = panelId;
    panel.setAttribute('hidden', '');
    document.body.appendChild(panel);
  }

  const currentPath = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
  const menuItems = [
    { href: `${prefix}index.html`, label: '홈' },
    { type: 'label', label: '제품' },
    { href: `${prefix}products/`, label: 'PNS 상품 라인업' },
    { href: `${prefix}products/volcano-ruby.html`, label: '🌋 볼케이노 루비', volcano: true },
    { href: `${prefix}custom-edition.html`, label: '나만의 드립백 제작' },
    { href: `${prefix}lineup.html`, label: '계열사 라인업' },
    { href: `${prefix}film.html`, label: '커피 필름지', badge: '준비중' },
    { type: 'label', label: '자동화 장비' },
    { href: `${prefix}machines/`, label: '드립백·패키징 머신 라인업' },
    { type: 'label', label: 'B2B' },
    { href: `${prefix}b2b-lineup.html`, label: 'B2B 상품 라인업' },
    { href: `${prefix}b2b.html`, label: '드립백 생산 현장 보기' },
    { href: `${prefix}b2b-bean.html`, label: '생두 원두 대량 주문' },
    { href: `${prefix}film-custom.html`, label: '봉투 필름지 맞춤 주문' },
    { href: `${prefix}b2b-film.html`, label: '봉투 필름지 생산 현장 보기', badge: '준비중' },
    { type: 'label', label: '기타' },
    { href: `${prefix}flavor-guide.html`, label: 'Flavor Guide' },
    { href: `${prefix}contact.html`, label: '문의하기' },
    { href: '#', label: '고객·협력사', badge: '준비중' }
  ];

  panel.setAttribute('data-global-mobile-nav', '');
  panel.innerHTML = `
    <nav class="mobile-nav-inner" aria-label="모바일 메뉴">
      ${menuItems.map((item) => {
        if (item.type === 'label') {
          return `<div class="mobile-nav-label">${item.label}</div>`;
        }
        const itemPath = new URL(item.href, window.location.href).pathname.replace(/\/$/, '/index.html');
        const isCurrent = currentPath === itemPath;
        const badge = item.badge ? `<span class="mobile-nav-badge">${item.badge}</span>` : '';
        const cls = item.volcano ? ' class="mobile-nav-volcano"' : '';
        return `<a href="${item.href}"${cls}${isCurrent ? ' aria-current="page"' : ''}>${item.label}${badge}</a>`;
      }).join('')}
    </nav>
  `;

  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '모바일 메뉴 닫기' : '모바일 메뉴 열기');
    if (open) {
      backdrop.removeAttribute('hidden');
      panel.removeAttribute('hidden');
    } else {
      backdrop.setAttribute('hidden', '');
      panel.setAttribute('hidden', '');
    }
  };

  toggle.addEventListener('click', () => {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });

  backdrop.addEventListener('click', () => setMenu(false));
  panel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) setMenu(false);
  });

  if (!/\/contact\.html$/.test(pathname)) {
    const isMachinePage = /\/machines\//.test(pathname);
    const isProductPage = /\/products\//.test(pathname);
    const isListPage = /\/(?:products|machines)\/(?:index\.html)?$/.test(pathname);
    const isProductsListPage = /\/products\/(?:index\.html)?$/.test(pathname);

    let secondaryLabel = '제품 보기';
    let secondaryHref = `${prefix}products/`;

    if (isMachinePage) {
      secondaryLabel = isListPage ? '홈으로' : '머신 보기';
      secondaryHref = isListPage ? `${prefix}index.html` : `${prefix}machines/`;
    } else if (isProductPage) {
      secondaryLabel = '제품 보기';
      secondaryHref = isProductsListPage ? '#productsCatalog' : `${prefix}products/`;
    }

    let sticky = document.querySelector('[data-mobile-sticky-cta]');
    if (!sticky) {
      sticky = document.createElement('div');
      sticky.className = 'mobile-sticky-cta';
      sticky.setAttribute('data-mobile-sticky-cta', '');
      sticky.setAttribute('aria-label', '모바일 빠른 이동');
      sticky.innerHTML = `
        <a class="btn btn-primary" href="${prefix}contact.html">문의하기</a>
        <a class="btn btn-ghost" href="${secondaryHref}">${secondaryLabel}</a>
      `;
      document.body.appendChild(sticky);
    } else {
      sticky.classList.add('mobile-sticky-cta');
      sticky.setAttribute('data-mobile-sticky-cta', '');
    }
    document.body.classList.add('has-mobile-sticky-cta');
  }
})();

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
    'hero-eyebrow':  'Your Complete Coffee Partner',
    'hero-title':    '원두에서<br/>패키지까지,<br/>커피 브랜드를<br/>완성합니다.',
    'hero-sub':      '1946년 이탈리아 <strong>Caffè Palombini</strong>의 로스팅 헤리티지와 국내 자체 생산 인프라를 결합한 원스톱 커피 솔루션.<br><strong>베트남 화산토 볼케이노 루비 원두</strong> 수입부터 드립백 OEM, 봉투 필름지, 패키징 장비까지.',
    'hero-btn-buy':  '스마트스토어에서 바로 구매',
    'hero-btn-b2b':  'B2B 파트너십 문의',
    'badge-1':'이탈리아 원두','badge-2':'볼케이노 루비','badge-3':'커스텀 드립백','badge-4':'봉투 필름지','badge-5':'패키징 장비',
    'stat-1':'Caffè Palombini<br/>이탈리아 로마 창업','stat-2':'패키징 장비<br/>라인업','stat-3':'커스텀 드립백<br/>최소 주문 수량','stat-4':'원두 → 드립백 → 필름지 → 장비<br/>올인원 솔루션',
    'about-title':'About Us',
    'about-lead':'<p>PNS 팔롬비니는 단순한 커피 브랜드가 아닙니다.</p><p>이탈리아 로마 <strong>Caffè Palombini(1946)</strong>의 로스팅 헤리티지와 베트남 화산토에서 자란 <strong>볼케이노 루비 원두</strong>,</p><p>그리고 국내 자체 생산 인프라를 결합하여 <strong>원두 수입부터 드립백 OEM, 봉투 필름지, 패키징 장비</strong>까지 —</p><p>커피 브랜드가 필요로 하는 모든 것을 <strong>하나의 파트너</strong>로 제공합니다.</p>',
    'tech-title':'실버스킨을 99% 제거하는 기술',
    'tech-prob-title':'일반 로스팅의 한계','tech-sol-title':'Inside-Out: 센터 컷까지','tech-result-title':'결과: 컵에서 느껴지는 차이',
    'heritage-title':'Our Heritage &amp; Sourcing',
    'products-title':'Products — For You (B2C)',
    'products-lead':'당신의 하루가 어디에 있든, <strong>한 잔의 퀄리티는 타협하지 않도록</strong> 만들었습니다.',
    'product-badge':'PREMIUM','product-name':'프리미엄 드립백 커피','product-buy-btn':'스마트스토어에서 구매하기 →',
    'b2b-title':'For Partners — Business Solutions (B2B)',
    'b2b-lead':'<span class="desktop-line-break">커피 브랜드를 "제품"이 아니라 시스템으로 제공할 수 있어야 한다고 믿습니다.</span><span class="desktop-line-break">원두 선별부터 패키징, OEM 설계까지—전체 생태계를 함께 구축합니다.</span>',
    'b2b-cta-text':'B2B 파트너십, 대량구매, OEM 문의는 아래 연락처로 편하게 연락주세요.','b2b-cta-btn':'파트너십 문의하기',
    'reviews-title':'고객 후기','reviews-lead':'실제 구매하신 분들의 솔직한 이야기입니다.','reviews-note':'더 많은 후기가 궁금하신가요?','reviews-btn':'네이버 스토어에서 전체 리뷰 보기 →',
    'faq-title':'자주 묻는 질문','faq-lead':'구매 전 궁금하신 점을 미리 답해드립니다.',
    'purchase-title':'Purchase','purchase-lead':'결제는 네이버 스마트스토어에서 진행됩니다. 안전하고 빠른 구매가 가능합니다.','purchase-btn':'네이버 스마트스토어로 이동 →','purchase-btn2':'대량구매 / OEM 문의',
    'contact-title':'Contact','contact-inquiry':'문의','contact-email-btn':'이메일 보내기','contact-ref-title':'References',
    'footer-sub':'원두에서 패키지까지 · Caffè Palombini Heritage · Volcano Ruby · Custom Drip Bag · Packaging Machines',
    'faq-q1':'드립백은 어떻게 사용하나요?',
    'faq-q2':'99% 실버스킨 제거가 맛에 어떤 차이를 주나요?',
    'faq-q3':'Caffè Palombini는 어떤 브랜드인가요?',
    'faq-q4':'유통기한은 얼마나 되나요?',
    'faq-q5':'대량 구매 또는 B2B 문의는 어떻게 하나요?',
    'faq-q6':'화산 토양이 커피 맛에 어떤 영향을 주나요?',
  },
  en: {
    'nav-buy-btn':   'Buy on Naver Store',
    'hero-eyebrow':  'Your Complete Coffee Partner',
    'hero-title':    'From Bean<br/>to Package,<br/>We Complete<br/>Your Coffee Brand.',
    'hero-sub':      'A one-stop coffee solution combining the roasting heritage of Italy\'s <strong>Caffè Palombini (est. 1946)</strong> with domestic production infrastructure.<br>From <strong>Volcano Ruby bean</strong> import to drip bag OEM, coffee film, and packaging machines.',
    'hero-btn-buy':  'Buy on Naver Store',
    'hero-btn-b2b':  'B2B Partnership Inquiry',
    'badge-1':'Italian Beans','badge-2':'Volcano Ruby','badge-3':'Custom Drip Bag','badge-4':'Coffee Film','badge-5':'Packaging Machines',
    'stat-1':'Caffè Palombini<br/>Founded in Rome','stat-2':'Packaging Machine<br/>Lineup','stat-3':'Custom Drip Bag<br/>Min. Order Qty','stat-4':'Bean → Drip Bag → Film → Machine<br/>All-in-One Solution',
    'about-title':'About Us',
    'about-lead':'<p>PNS Palombini is more than a coffee brand.</p><p>Combining the roasting heritage of Rome\'s <strong>Caffè Palombini (1946)</strong> with <strong>Volcano Ruby beans</strong> grown in Vietnamese volcanic soil,</p><p>and domestic production infrastructure — from <strong>bean import to drip bag OEM, coffee film, and packaging machines</strong> —</p><p>we provide everything a coffee brand needs through <strong>a single partner</strong>.</p>',
    'tech-title':'99% Silverskin Removal Technology',
    'tech-prob-title':'The Limits of Standard Roasting','tech-sol-title':'Inside-Out: Down to the Center Cut','tech-result-title':'The Result: The Difference in Your Cup',
    'heritage-title':'Our Heritage &amp; Sourcing',
    'products-title':'Products — For You (B2C)',
    'products-lead':'Wherever your day takes you, <strong>never compromise on quality</strong>.',
    'product-badge':'PREMIUM','product-name':'Premium Drip Bag Coffee','product-buy-btn':'Buy on Naver Store →',
    'b2b-title':'For Partners — Business Solutions (B2B)',
    'b2b-lead':'<span class="desktop-line-break">We believe a coffee brand should be delivered as a system, not just a product.</span><span class="desktop-line-break">From bean sorting to packaging and OEM design?we build the full ecosystem with you.</span>',
    'b2b-cta-text':'For B2B partnerships, bulk orders, or OEM inquiries, please reach out anytime.','b2b-cta-btn':'Contact for Partnership',
    'reviews-title':'Customer Reviews','reviews-lead':'Honest words from real customers.','reviews-note':'Want to read more reviews?','reviews-btn':'View all reviews on Naver Store →',
    'faq-title':'Frequently Asked Questions','faq-lead':'Everything you need to know before your first cup.',
    'purchase-title':'Purchase','purchase-lead':'All purchases are processed securely through Naver Smart Store.','purchase-btn':'Go to Naver Smart Store →','purchase-btn2':'Bulk / OEM Inquiry',
    'contact-title':'Contact','contact-inquiry':'Get in Touch','contact-email-btn':'Send Email','contact-ref-title':'References',
    'footer-sub':'From Bean to Package · Caffè Palombini Heritage · Volcano Ruby · Custom Drip Bag · Packaging Machines',
    'faq-q1':'How do I brew the drip bag?',
    'faq-q2':'How does 99% silverskin removal affect the taste?',
    'faq-q3':'Who is Caffè Palombini?',
    'faq-q4':'What is the shelf life?',
    'faq-q5':'How can I place a bulk or B2B order?',
    'faq-q6':'How does volcanic soil affect coffee flavor?',
  }
};

function getLang() {
  /* Always start with Korean. EN is opt-in per session via sessionStorage. */
  const stored = sessionStorage.getItem('pns-lang');
  if (stored === 'ko' || stored === 'en') return stored;
  return 'ko';
}

function applyLang(lang) {
  sessionStorage.setItem('pns-lang', lang);

  /* ── Nav crossfade ── */
  const navLinks = document.querySelectorAll('.nav a[data-ko]');
  navLinks.forEach(a => {
    if (!a.dataset.en) a.dataset.en = a.textContent.trim();
    a.style.opacity = '0';
  });
  setTimeout(() => {
    navLinks.forEach(a => {
      a.textContent = lang === 'ko' ? a.dataset.ko : a.dataset.en;
      a.style.opacity = '';
    });
  }, 120);

  /* ── B2B nav dropdown (global, all pages) ── */
  const b2bDrop = document.querySelector('.nav-dropdown a[href$="b2b.html"]');
  if (b2bDrop) {
    if (!b2bDrop.dataset._k) b2bDrop.dataset._k = b2bDrop.innerHTML;
    b2bDrop.innerHTML = lang === 'en'
      ? '<span class="nav-dropdown-icon">\uD83C\uDFED</span> View Production Facility'
      : b2bDrop.dataset._k;
  }

  /* ── Page translations (window.T set by inline <script>) ── */
  if (window.T) {
    window.T.forEach(r => {
      const [sel, en, idx] = r;
      const els = document.querySelectorAll(sel);
      if (idx === 'all') {
        els.forEach(el => {
          if (!el.dataset._k) el.dataset._k = el.innerHTML;
          el.innerHTML = lang === 'en' ? en : el.dataset._k;
        });
      } else {
        const el = els[idx || 0];
        if (!el) return;
        if (!el.dataset._k) el.dataset._k = el.innerHTML;
        el.innerHTML = lang === 'en' ? en : el.dataset._k;
      }
    });
  }

  /* ── data-i18n system (index.html) ── */
  const t = translations[lang];
  if (t) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (t[key] !== undefined) el.innerHTML = t[key];
    });
  }

  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  document.documentElement.lang = lang === 'ko' ? 'ko' : 'en';
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });
  applyLang(getLang());
});

/* ── 11. 히어로 슬라이드쇼 ── */
(function () {
  const slides = [...document.querySelectorAll('.hero-slide')].filter(img => {
    // onerror로 숨겨진 이미지 제외
    return img.style.display !== 'none';
  });

  // 실제 로드된 이미지만 사용하도록 로드 후 필터링
  const dotsContainer = document.getElementById('heroDots');
  if (!dotsContainer || slides.length === 0) return;

  let visibleSlides = [];
  let current = 0;
  let timer;

  function buildSlideshow(activeSlides) {
    visibleSlides = activeSlides;
    if (visibleSlides.length <= 1) return; // 1장이면 슬라이드쇼 불필요

    // 도트 생성
    dotsContainer.innerHTML = '';
    visibleSlides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `슬라이드 ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });

    startTimer();
  }

  function goTo(idx) {
    visibleSlides[current].classList.remove('active');
    dotsContainer.children[current]?.classList.remove('active');
    current = (idx + visibleSlides.length) % visibleSlides.length;
    visibleSlides[current].classList.add('active');
    dotsContainer.children[current]?.classList.add('active');
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 4500);
  }

  // 이미지 로드 결과 수집 후 슬라이드쇼 구성
  let loaded = 0;
  const validSlides = [];

  slides.forEach(img => {
    if (img.complete) {
      if (img.naturalWidth > 0) validSlides.push(img);
      loaded++;
      if (loaded === slides.length) buildSlideshow(validSlides);
    } else {
      img.addEventListener('load', () => {
        validSlides.push(img);
        loaded++;
        if (loaded === slides.length) buildSlideshow(validSlides);
      });
      img.addEventListener('error', () => {
        loaded++;
        if (loaded === slides.length) buildSlideshow(validSlides);
      });
    }
  });
})();

/* ── 12. Flavor Bar 스크롤 애니메이션 ── */
(function () {
  // 각 .flavor-fill의 인라인 style="width:XX%" 값을 읽어 data-w에 저장
  // 그 후 width를 0으로 리셋 → 화면 진입 시 transition으로 채움
  function setupFlavorBars() {
    const bars = document.querySelectorAll('.flavor-fill');
    if (!bars.length) return;

    bars.forEach(bar => {
      const inlineW = bar.style.width;
      if (inlineW && inlineW !== '0' && inlineW !== '0px') {
        bar.dataset.w = inlineW;   // 목표값 저장 (예: "85%")
        bar.style.width = '0';     // 시작값 0으로 리셋
      }
    });

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const bar = entry.target;
        if (bar.dataset.w) {
          // 짧은 딜레이 후 목표값 주입 → CSS transition 발동
          requestAnimationFrame(() => {
            setTimeout(() => { bar.style.width = bar.dataset.w; }, 80);
          });
        }
        obs.unobserve(bar);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    bars.forEach(bar => {
      if (bar.dataset.w) obs.observe(bar);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupFlavorBars);
  } else {
    setupFlavorBars();
  }
})();

/* ── Scroll-to-top Button ── */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
