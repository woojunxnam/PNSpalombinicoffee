/* ============================================================
   lineup.js — 계열사 상품 라인업 페이지 로직
   의존 파일: assets/data/pns-products.js, assets/data/bb-products.js
   ============================================================ */

/* ── 가격 포맷 ──────────────────────────────────────────────── */
function fmtPrice(n) {
  return '₩' + Number(n).toLocaleString('ko-KR');
}

/* ── 카드 HTML 생성 ─────────────────────────────────────────── */
function renderCard(p, company, companyClass) {
  const badge = p.badge
    ? `<span class="lc-badge ${p.badgeType || 'ready'}">${p.badge}</span>`
    : '';

  const priceType = p.priceType || 'ready';
  let priceHtml;
  if (priceType === 'custom') {
    priceHtml = `<div class="lc-price custom">${p.price}</div>`;
  } else if (priceType === 'soldout') {
    priceHtml = `<div class="lc-price soldout">품절</div>`;
  } else if (priceType === 'pending') {
    priceHtml = `<div class="lc-price pending">상품 준비중</div>`;
  } else {
    const orig = p.origPrice
      ? `<span class="lc-price-orig">${fmtPrice(p.origPrice)}</span>`
      : '';
    priceHtml = `<div class="lc-price ready">${fmtPrice(p.price)}${orig}</div>`;
  }

  const co = companyClass ? ` ${companyClass}` : '';

  return `<div class="lineup-card" data-url="${p.url}" data-sub="${p.sub}">
  <div class="lc-img">
    <img src="${p.img}" alt="${p.name}" loading="lazy"/>${badge}
  </div>
  <div class="lc-body">
    <div class="lc-company${co}">${company}</div>
    <div class="lc-name">${p.name}</div>
    ${priceHtml}
  </div>
</div>`;
}

/* ── 그리드에 상품 삽입 ──────────────────────────────────────── */
// opts: { url: 기본URL, sub: 기본설명 }
function renderProducts(products, company, companyClass, gridEl, opts) {
  if (!gridEl) return;
  const dUrl = (opts && opts.url) || '';
  gridEl.innerHTML = products.map(p => {
    const url = p.url || dUrl;
    const sub = p.sub ||
      (url.includes('naver.com')             ? '네이버 스마트스토어에서 구매하실 수 있습니다.'   :
       url.includes('blackbeans.kr')         ? '블랙빈스 스토어에서 구매하실 수 있습니다.'       :
       url.includes('beanspacecoffee.com')   ? '빈스페이스 스토어에서 구매하실 수 있습니다.'     :
       url.includes('klinternational.co.kr') ? 'KL인터내셔널 스토어에서 확인하실 수 있습니다.'   : '');
    return renderCard({ ...p, url, sub }, company, companyClass);
  }).join('\n');
}

/* ── 초기화 (DOM 준비 후 실행) ──────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  /* ▶ 1. 상품 카드 렌더링 */
  renderProducts(PNS_PRODUCTS, 'PNS 팔롬비니', null,
    document.getElementById('pns-grid'));

  renderProducts(BB_PRODUCTS, '블랙빈스', 'bb',
    document.getElementById('bb-grid'), { url: BB_STORE_URL });

  renderProducts(BS_PRODUCTS, '빈스페이스', 'bs',
    document.getElementById('bs-grid'));

  renderProducts(KL_PRODUCTS, 'KL인터내셔널', 'kl',
    document.getElementById('kl-grid'));

  /* ▶ 2. 연도 표시 */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ▶ 3. 필터 탭 ─────────────────────────────────────────── */
  const tabBtns = document.querySelectorAll('.tab-btn[data-filter]');
  const groups  = document.querySelectorAll('.lineup-group[data-group]');
  const countEl = document.getElementById('lineup-count');

  function updateCount(filter) {
    let n = 0;
    groups.forEach(g => {
      if (filter === 'all' || g.dataset.group === filter)
        n += g.querySelectorAll('.lineup-card').length;
    });
    if (countEl) countEl.textContent = '총 ' + n + '개 상품';
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      groups.forEach(g => {
        g.style.display = (filter === 'all' || g.dataset.group === filter) ? '' : 'none';
      });
      updateCount(filter);
    });
  });
  updateCount('all');

  /* ▶ 4. 팝업 모달 ────────────────────────────────────────── */
  const overlay   = document.getElementById('lcOverlay');
  const modalImg  = document.getElementById('lcModalImg');
  const modalCo   = document.getElementById('lcModalCompany');
  const modalName = document.getElementById('lcModalName');
  const modalSub  = document.getElementById('lcModalSub');
  const storeBtn  = document.getElementById('lcStoreBtn');
  const closeBtn  = document.getElementById('lcClose');

  function openModal(card) {
    const img     = card.querySelector('.lc-img img');
    const name    = card.querySelector('.lc-name').textContent.trim();
    const company = card.querySelector('.lc-company').textContent.trim();
    const url     = card.dataset.url || '';
    const sub     = card.dataset.sub || '';
    const isBB    = !!card.querySelector('.lc-company.bb');
    const isBS    = !!card.querySelector('.lc-company.bs');
    const isKL    = !!card.querySelector('.lc-company.kl');

    modalImg.src          = img ? img.src : '';
    modalImg.alt          = name;
    modalCo.textContent   = company;
    modalCo.className     = 'lc-modal-company' + (isBB ? ' bb' : isBS ? ' bs' : isKL ? ' kl' : '');
    modalName.textContent = name;
    modalSub.textContent  = sub;

    if (!url || url === '#') {
      storeBtn.textContent = '상품 페이지 준비중';
      storeBtn.disabled    = true;
      storeBtn._url        = '';
    } else {
      storeBtn.disabled    = false;
      storeBtn._url        = url;
      storeBtn.textContent =
        url.includes('naver.com')            ? '네이버 스토어 바로가기 →'       :
        url.includes('blackbeans.kr')        ? '블랙빈스 스토어 바로가기 →'     :
        url.includes('beanspacecoffee.com')  ? '빈스페이스 스토어 바로가기 →'   :
        url.includes('klinternational.co.kr') ? 'KL인터내셔널 스토어 바로가기 →' :
                                               '상품 페이지 바로가기 →';
    }

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // 이벤트 위임 — 동적 렌더링 후에도 작동
  document.querySelectorAll('.lineup-group').forEach(group => {
    group.addEventListener('click', e => {
      const card = e.target.closest('.lineup-card');
      if (card) { e.preventDefault(); openModal(card); }
    });
  });

  storeBtn.addEventListener('click', () => {
    const url = storeBtn._url;
    if (!url) return;
    url.startsWith('http')
      ? window.open(url, '_blank', 'noopener,noreferrer')
      : (window.location.href = url);
    closeModal();
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ▶ 5. 접기 / 펼치기 ────────────────────────────────────── */
  function initCollapseWrap(wrap) {
    const grid  = wrap.querySelector('.lineup-grid');
    const cards = Array.from(grid.querySelectorAll('.lineup-card'));
    if (cards.length < 2) return;

    // 3번째 행의 시작 카드 탐색
    let prevTop = cards[0].getBoundingClientRect().top;
    let rowCount = 1, row3Idx = -1;
    for (let i = 1; i < cards.length; i++) {
      const t = cards[i].getBoundingClientRect().top;
      if (t > prevTop + 10) {
        rowCount++;
        prevTop = t;
        if (rowCount === 3) { row3Idx = i; break; }
      }
    }

    const btn = document.querySelector(`.lineup-toggle-btn[data-wrap="${wrap.id}"]`);
    if (row3Idx === -1) { if (btn) btn.style.display = 'none'; return; }

    const twoH = cards[row3Idx].getBoundingClientRect().top - wrap.getBoundingClientRect().top;
    wrap.dataset.twoRowHeight = twoH;

    // 애니메이션 없이 즉시 접기
    wrap.style.transition = 'none';
    wrap.style.overflow   = 'hidden';
    wrap.style.maxHeight  = twoH + 'px';
    wrap.classList.add('collapsed');
    requestAnimationFrame(() => requestAnimationFrame(() => { wrap.style.transition = ''; }));
  }

  document.querySelectorAll('.lineup-toggle-btn').forEach(btn => {
    const wrap = document.getElementById(btn.dataset.wrap);
    if (!wrap) return;

    btn.addEventListener('click', () => {
      const isCollapsed = wrap.classList.contains('collapsed');
      if (isCollapsed) {
        // 펼치기
        wrap.style.maxHeight = wrap.scrollHeight + 'px';
        wrap.classList.remove('collapsed');
        btn.textContent = '접기 ∧';
        setTimeout(() => {
          if (!wrap.classList.contains('collapsed')) {
            wrap.style.maxHeight = 'none';
            wrap.style.overflow  = 'visible';
          }
        }, 460);
      } else {
        // 접기
        wrap.style.overflow  = 'hidden';
        wrap.style.maxHeight = wrap.scrollHeight + 'px';
        wrap.classList.add('collapsed');
        requestAnimationFrame(() => requestAnimationFrame(() => {
          wrap.style.maxHeight = wrap.dataset.twoRowHeight + 'px';
        }));
        btn.textContent = '더 보기 ∨';
        setTimeout(() => {
          wrap.closest('.lineup-group').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }
    });
  });

  document.querySelectorAll('.lineup-grid-wrap').forEach(initCollapseWrap);

}); // end DOMContentLoaded
