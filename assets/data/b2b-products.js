/* ============================================================
 * B2B 상품 라인업 데이터
 * ──────────────────────────────────────────────────────────
 * 상품 추가/수정/삭제 시 이 파일만 편집하세요.
 *
 * 필드 설명
 *   name      : 상품명 (필수)
 *   img       : 이미지 경로 (필수)
 *   url       : 스토어 링크 (필수, '#'이면 준비중)
 *   sub       : 모달 설명 (생략 시 URL에서 자동 감지)
 *   price     : 판매가 — 숫자: ₩X,XXX 자동 포맷 / 문자열: 그대로 표시
 *   origPrice : 정가 (숫자, 취소선) — 할인 없으면 생략
 *   badge     : 배지 텍스트 (생략 가능)
 *   badgeType : "ready" | "pending" | "soldout"  (기본: "ready")
 *   priceType : "ready" | "pending" | "soldout" | "custom"  (기본: "ready")
 * ============================================================ */

/* ── 드립백 커피 ──────────────────────────────────────────── */
const B2B_DRIP = [
  {
    name: "팔롬비니 드립백 커피 10입",
    img:  "assets/img/product-drip-10.png",
    url:  "#",
    sub:  "B2B 대량 구매 문의를 통해 견적을 받아보세요.",
    priceType: "custom",
    price: "견적 문의"
  },
  {
    name: "팔롬비니 드립백 10입 선물세트",
    img:  "assets/img/product-drip-10-gift.jpg",
    url:  "#",
    sub:  "B2B 대량 구매 문의를 통해 견적을 받아보세요.",
    priceType: "custom",
    price: "견적 문의"
  },
  {
    name: "팔롬비니 드립백 30입 선물세트",
    img:  "assets/img/product-drip-30-gift.jpg",
    url:  "#",
    sub:  "B2B 대량 구매 문의를 통해 견적을 받아보세요.",
    priceType: "custom",
    price: "견적 문의"
  },
  {
    name: "팔롬비니 드립백 35입 명절선물세트",
    img:  "assets/img/product-drip-35-gift.jpg",
    url:  "#",
    sub:  "B2B 대량 구매 문의를 통해 견적을 받아보세요.",
    priceType: "custom",
    price: "견적 문의"
  },
  {
    name: "팔롬비니 드립백 가방세트 32개입",
    img:  "assets/img/product-drip-bag32-gift.jpg",
    url:  "#",
    sub:  "B2B 대량 구매 문의를 통해 견적을 받아보세요.",
    priceType: "custom",
    price: "견적 문의"
  }
];

/* ── 원두 ─────────────────────────────────────────────────── */
const B2B_BEAN = [
  {
    name: "이탈리아 로스팅 로마 원두 1kg",
    img:  "assets/img/blend-roma.png",
    url:  "#",
    sub:  "B2B 대량 구매 문의를 통해 견적을 받아보세요.",
    priceType: "custom",
    price: "견적 문의"
  },
  {
    name: "이탈리아 로스팅 그란바 원두 1kg",
    img:  "assets/img/blend-gran-bar.png",
    url:  "#",
    sub:  "B2B 대량 구매 문의를 통해 견적을 받아보세요.",
    priceType: "custom",
    price: "견적 문의"
  },
  {
    name: "이탈리아 로스팅 돌체 원두 1kg",
    img:  "assets/img/blend-dolce-italia.png",
    url:  "#",
    sub:  "B2B 대량 구매 문의를 통해 견적을 받아보세요.",
    priceType: "custom",
    price: "견적 문의"
  },
  {
    name: "볼케이노 루비 G1 내추럴 500g",
    img:  "assets/img/vol_ruby_bag.png",
    url:  "#",
    sub:  "B2B 대량 구매 문의를 통해 견적을 받아보세요.",
    priceType: "custom",
    price: "견적 문의"
  },
  {
    name: "볼케이노 루비 G1 내추럴 1kg",
    img:  "assets/img/vol_ruby_bag.png",
    url:  "#",
    sub:  "B2B 대량 구매 문의를 통해 견적을 받아보세요.",
    priceType: "custom",
    price: "견적 문의"
  }
];

/* ── 필름지 ───────────────────────────────────────────────── */
const B2B_FILM = [
  {
    name: "커피 필름지 — 디자인 A",
    img:  "assets/img/film-01.jpg",
    url:  "#",
    sub:  "B2B 대량 구매 문의를 통해 견적을 받아보세요.",
    priceType: "custom",
    price: "견적 문의"
  },
  {
    name: "커피 필름지 — 디자인 B",
    img:  "assets/img/film-02.jpg",
    url:  "#",
    sub:  "B2B 대량 구매 문의를 통해 견적을 받아보세요.",
    priceType: "custom",
    price: "견적 문의"
  },
  {
    name: "커피 필름지 — 디자인 C",
    img:  "assets/img/film-03.jpg",
    url:  "#",
    sub:  "B2B 대량 구매 문의를 통해 견적을 받아보세요.",
    priceType: "custom",
    price: "견적 문의"
  },
  {
    name: "커피 필름지 — 디자인 D",
    img:  "assets/img/film-04.jpg",
    url:  "#",
    sub:  "B2B 대량 구매 문의를 통해 견적을 받아보세요.",
    priceType: "custom",
    price: "견적 문의"
  },
  {
    name: "커피 필름지 — 디자인 E",
    img:  "assets/img/film-05.jpg",
    url:  "#",
    sub:  "B2B 대량 구매 문의를 통해 견적을 받아보세요.",
    priceType: "custom",
    price: "견적 문의"
  }
];

/* ── 원두 봉투 ────────────────────────────────────────────── */
const B2B_POUCH = [
  {
    name: "원두 봉투 — 디자인 A",
    img:  "assets/img/film-06.jpg",
    url:  "#",
    sub:  "B2B 대량 구매 문의를 통해 견적을 받아보세요.",
    priceType: "custom",
    price: "견적 문의"
  },
  {
    name: "원두 봉투 — 디자인 B",
    img:  "assets/img/film-07.jpg",
    url:  "#",
    sub:  "B2B 대량 구매 문의를 통해 견적을 받아보세요.",
    priceType: "custom",
    price: "견적 문의"
  },
  {
    name: "원두 봉투 — 디자인 C",
    img:  "assets/img/film-08.jpg",
    url:  "#",
    sub:  "B2B 대량 구매 문의를 통해 견적을 받아보세요.",
    priceType: "custom",
    price: "견적 문의"
  },
  {
    name: "원두 봉투 — 디자인 D",
    img:  "assets/img/film-09.jpg",
    url:  "#",
    sub:  "B2B 대량 구매 문의를 통해 견적을 받아보세요.",
    priceType: "custom",
    price: "견적 문의"
  },
  {
    name: "원두 봉투 — 커스텀 제작",
    img:  "assets/img/custom/bag-blank.png",
    url:  "#",
    sub:  "B2B 대량 구매 문의를 통해 견적을 받아보세요.",
    badge: "커스텀",
    badgeType: "ready",
    priceType: "custom",
    price: "견적 문의"
  }
];
