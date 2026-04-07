/* ============================================================
 * PNS 팔롬비니 상품 데이터
 * ──────────────────────────────────────────────────────────
 * 상품 추가/수정/삭제 시 이 파일만 편집하세요.
 *
 * 필드 설명
 *   name      : 상품명 (필수)
 *   img       : 이미지 경로 (필수)
 *   url       : 스토어 링크 (필수)
 *   sub       : 모달 설명 (생략 시 URL에서 자동 감지)
 *   price     : 판매가 — 숫자: ₩X,XXX 자동 포맷 / 문자열: 그대로 표시
 *   origPrice : 정가 (숫자, 취소선) — 할인 없으면 생략
 *   badge     : 배지 텍스트 (생략 가능)
 *   badgeType : "ready" | "pending" | "soldout"  (기본: "ready")
 *   priceType : "ready" | "pending" | "soldout" | "custom"  (기본: "ready")
 * ============================================================ */

const PNS_PRODUCTS = [

  /* ── 드립백 기본 ─────────────────────────────────────── */
  {
    name: "팔롬비니 드립백 커피 10입",
    img:  "assets/img/product-drip-10.png",
    url:  "https://smartstore.naver.com/palombini/products/11747117894",
    price: 22000
  },
  {
    name: "팔롬비니 드립백 10입 선물세트",
    img:  "assets/img/product-drip-10-gift.jpg",
    url:  "https://smartstore.naver.com/palombini/products/11391087286",
    price: 22000
  },
  {
    name: "팔롬비니 드립백 30입 선물세트",
    img:  "assets/img/product-drip-30-gift.jpg",
    url:  "https://smartstore.naver.com/palombini/products/11401011043",
    price: 60000
  },

  /* ── 이탈리아 원두 1kg ────────────────────────────────── */
  {
    name: "이탈리아 로스팅 로마 원두 1kg",
    img:  "assets/img/blend-roma.png",
    url:  "https://smartstore.naver.com/palombini/products/12048742583",
    price: 69000
  },
  {
    name: "이탈리아 로스팅 그란바 원두 1kg",
    img:  "assets/img/blend-gran-bar.png",
    url:  "https://smartstore.naver.com/palombini/products/12048729052",
    price: 69000
  },
  {
    name: "이탈리아 로스팅 돌체 원두 1kg",
    img:  "assets/img/blend-dolce-italia.png",
    url:  "https://smartstore.naver.com/palombini/products/12048748602",
    price: 69000
  },

  /* ── 커스텀 드립백 ──────────────────────────────────── */
  {
    name:      "나만의 커스텀 드립백",
    img:       "assets/img/custom/bag-blank.png",
    url:       "custom-edition.html",
    sub:       "디자인 시안 준비 후 최소 50개부터 주문 가능합니다.",
    badge:     "주문 가능",
    badgeType: "ready",
    priceType: "custom",
    price:     "최소주문 50개"
  },

  /* ── 볼케이노 루비 드립백 ─────────────────────────────── */
  {
    name:      "[볼케이노 루비] 오늘의 일상 드립백 — 밤 10시 15개입",
    img:       "products/volcano-ruby/오늘의_일상-밤_10시.jpg",
    url:       "https://smartstore.naver.com/palombini/products/13361995108",
    price:     20000,
    origPrice: 30000
  },
  {
    name:  "[볼케이노 루비] 오늘의 일상 드립백 — 저녁 6시 10개입",
    img:   "products/volcano-ruby/오늘의_일상-저녁_6시.jpg",
    url:   "https://smartstore.naver.com/palombini/products/13361987919",
    price: 20000
  },
  {
    name:  "[볼케이노 루비] 오늘의 일상 드립백 — 낮 2시 10개입",
    img:   "products/volcano-ruby/오늘의_일상-낮_2시.jpg",
    url:   "https://smartstore.naver.com/palombini/products/13361974983",
    price: 20000
  },
  {
    name:  "[볼케이노 루비] 오늘의 일상 드립백 — 아침 10시 10개입",
    img:   "products/volcano-ruby/오늘의_일상-아침_10시.jpg",
    url:   "https://smartstore.naver.com/palombini/products/13361967850",
    price: 20000
  },
  {
    name:  "[볼케이노 루비] 오늘의 일상 드립백 — 새벽 6시 10개입",
    img:   "products/volcano-ruby/오늘의_일상-새벽_6시.jpg",
    url:   "https://smartstore.naver.com/palombini/products/13361948982",
    price: 20000
  },

  /* ── 볼케이노 루비 원두 ───────────────────────────────── */
  {
    name:  "피앤에스 볼케이노 루비 G1 내추럴 500g",
    img:   "assets/img/vol_ruby_bag.png",
    url:   "https://smartstore.naver.com/palombini/products/13281122385",
    price: 13000
  },
  {
    name:  "피앤에스 볼케이노 루비 G1 내추럴 1kg",
    img:   "assets/img/vol_ruby_bag.png",
    url:   "https://smartstore.naver.com/palombini/products/13270525319",
    price: 25000
  },

  /* ── 명절·선물 세트 ──────────────────────────────────── */
  {
    name:      "[팔롬비니] 드립백 30개 + 5개 명절선물세트",
    img:       "assets/img/product-drip-35-gift.jpg",
    url:       "https://smartstore.naver.com/palombini/products/12954926851",
    price:     55000,
    origPrice: 80000
  },
  {
    name:  "[팔롬비니] 고급 커피 드립백 가방세트 32개입",
    img:   "assets/img/product-drip-bag32-gift.jpg",
    url:   "https://smartstore.naver.com/palombini/products/12909852073",
    price: 80000
  }

];
