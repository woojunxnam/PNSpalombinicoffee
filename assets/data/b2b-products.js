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
  { name: "드립백 디자인 01", img: "assets/img/custom/samples2/smpl_img_01.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 02", img: "assets/img/custom/samples2/smpl_img_02.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 03", img: "assets/img/custom/samples2/smpl_img_03.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 04", img: "assets/img/custom/samples2/smpl_img_04.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 05", img: "assets/img/custom/samples2/smpl_img_05.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 06", img: "assets/img/custom/samples2/smpl_img_06.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 07", img: "assets/img/custom/samples2/smpl_img_07.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 08", img: "assets/img/custom/samples2/smpl_img_08.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 09", img: "assets/img/custom/samples2/smpl_img_09.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 10", img: "assets/img/custom/samples2/smpl_img_10.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 11", img: "assets/img/custom/samples2/smpl_img_11.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 12", img: "assets/img/custom/samples2/smpl_img_12.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 13", img: "assets/img/custom/samples2/smpl_img_13.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 14", img: "assets/img/custom/samples2/smpl_img_14.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 15", img: "assets/img/custom/samples2/smpl_img_15.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 16", img: "assets/img/custom/samples2/smpl_img_16.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 17", img: "assets/img/custom/samples2/smpl_img_17.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 18", img: "assets/img/custom/samples2/smpl_img_18.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 19", img: "assets/img/custom/samples2/smpl_img_19.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 20", img: "assets/img/custom/samples2/smpl_img_20.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 21", img: "assets/img/custom/samples2/smpl_img_21.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 22", img: "assets/img/custom/samples2/smpl_img_22.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 23", img: "assets/img/custom/samples2/smpl_img_23.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 24", img: "assets/img/custom/samples2/smpl_img_24.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 25", img: "assets/img/custom/samples2/smpl_img_25.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 26", img: "assets/img/custom/samples2/smpl_img_26.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 27", img: "assets/img/custom/samples2/smpl_img_27.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 28", img: "assets/img/custom/samples2/smpl_img_28.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 29", img: "assets/img/custom/samples2/smpl_img_29.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 30", img: "assets/img/custom/samples2/smpl_img_30.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 31", img: "assets/img/custom/samples2/smpl_img_31.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 32", img: "assets/img/custom/samples2/smpl_img_32.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 33", img: "assets/img/custom/samples2/smpl_img_33.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 34", img: "assets/img/custom/samples2/smpl_img_34.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 35", img: "assets/img/custom/samples2/smpl_img_35.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 36", img: "assets/img/custom/samples2/smpl_img_36.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 37", img: "assets/img/custom/samples2/smpl_img_37.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 38", img: "assets/img/custom/samples2/smpl_img_38.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 39", img: "assets/img/custom/samples2/smpl_img_39.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 40", img: "assets/img/custom/samples2/smpl_img_40.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 41", img: "assets/img/custom/samples2/smpl_img_41.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 42", img: "assets/img/custom/samples2/smpl_img_42.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 43", img: "assets/img/custom/samples2/smpl_img_43.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 44", img: "assets/img/custom/samples2/smpl_img_44.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 45", img: "assets/img/custom/samples2/smpl_img_45.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 46", img: "assets/img/custom/samples2/smpl_img_46.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 47", img: "assets/img/custom/samples2/smpl_img_47.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 48", img: "assets/img/custom/samples2/smpl_img_48.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 49", img: "assets/img/custom/samples2/smpl_img_49.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 50", img: "assets/img/custom/samples2/smpl_img_50.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 51", img: "assets/img/custom/samples2/smpl_img_51.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 52", img: "assets/img/custom/samples2/smpl_img_52.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 53", img: "assets/img/custom/samples2/smpl_img_53.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 54", img: "assets/img/custom/samples2/smpl_img_54.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 55", img: "assets/img/custom/samples2/smpl_img_55.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 56", img: "assets/img/custom/samples2/smpl_img_56.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 57", img: "assets/img/custom/samples2/smpl_img_57.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 58", img: "assets/img/custom/samples2/smpl_img_58.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 59", img: "assets/img/custom/samples2/smpl_img_59.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 60", img: "assets/img/custom/samples2/smpl_img_60.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 61", img: "assets/img/custom/samples2/smpl_img_61.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 62", img: "assets/img/custom/samples2/smpl_img_62.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 63", img: "assets/img/custom/samples2/smpl_img_63.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 64", img: "assets/img/custom/samples2/smpl_img_64.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 65", img: "assets/img/custom/samples2/smpl_img_65.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 66", img: "assets/img/custom/samples2/smpl_img_66.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 67", img: "assets/img/custom/samples2/smpl_img_67.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "드립백 디자인 68", img: "assets/img/custom/samples2/smpl_img_68.jpg", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" }
];

/* ── 원두 ─────────────────────────────────────────────────── */
const B2B_BEAN = [
  { name: "원두 디자인 01", img: "assets/img/custom/beans-transparent/bean_01.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 02", img: "assets/img/custom/beans-transparent/bean_02.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 03", img: "assets/img/custom/beans-transparent/bean_03.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 04", img: "assets/img/custom/beans-transparent/bean_04.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 05", img: "assets/img/custom/beans-transparent/bean_05.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 06", img: "assets/img/custom/beans-transparent/bean_06.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 07", img: "assets/img/custom/beans-transparent/bean_07.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 08", img: "assets/img/custom/beans-transparent/bean_08.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 09", img: "assets/img/custom/beans-transparent/bean_09.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 10", img: "assets/img/custom/beans-transparent/bean_10.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 11", img: "assets/img/custom/beans-transparent/bean_11.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 12", img: "assets/img/custom/beans-transparent/bean_12.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 13", img: "assets/img/custom/beans-transparent/bean_13.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 14", img: "assets/img/custom/beans-transparent/bean_14.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 15", img: "assets/img/custom/beans-transparent/bean_15.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 16", img: "assets/img/custom/beans-transparent/bean_16.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 17", img: "assets/img/custom/beans-transparent/bean_17.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 18", img: "assets/img/custom/beans-transparent/bean_18.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 19", img: "assets/img/custom/beans-transparent/bean_19.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 20", img: "assets/img/custom/beans-transparent/bean_20.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 21", img: "assets/img/custom/beans-transparent/bean_21.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 22", img: "assets/img/custom/beans-transparent/bean_22.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 23", img: "assets/img/custom/beans-transparent/bean_23.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 24", img: "assets/img/custom/beans-transparent/bean_24.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 25", img: "assets/img/custom/beans-transparent/bean_25.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 26", img: "assets/img/custom/beans-transparent/bean_26.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 27", img: "assets/img/custom/beans-transparent/bean_27.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 28", img: "assets/img/custom/beans-transparent/bean_28.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 29", img: "assets/img/custom/beans-transparent/bean_29.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 30", img: "assets/img/custom/beans-transparent/bean_30.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 31", img: "assets/img/custom/beans-transparent/bean_31.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 32", img: "assets/img/custom/beans-transparent/bean_32.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 33", img: "assets/img/custom/beans-transparent/bean_33.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 34", img: "assets/img/custom/beans-transparent/bean_34.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 35", img: "assets/img/custom/beans-transparent/bean_35.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 36", img: "assets/img/custom/beans-transparent/bean_36.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 37", img: "assets/img/custom/beans-transparent/bean_37.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 38", img: "assets/img/custom/beans-transparent/bean_38.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" },
  { name: "원두 디자인 39", img: "assets/img/custom/beans-transparent/bean_39.png", url: "#", sub: "B2B 대량 구매 문의를 통해 견적을 받아보세요.", priceType: "custom", price: "견적 문의" }
];

/* ── 필름지 ───────────────────────────────────────────────── */
const B2B_FILM = [
  { name: "필름지 01", img: "assets/img/pns-logo-upscaled.png", url: "#", sub: "상품 준비 중입니다. 문의 주시면 안내드립니다.", badge: "준비중", badgeType: "pending", priceType: "pending" },
  { name: "필름지 02", img: "assets/img/pns-logo-upscaled.png", url: "#", sub: "상품 준비 중입니다. 문의 주시면 안내드립니다.", badge: "준비중", badgeType: "pending", priceType: "pending" },
  { name: "필름지 03", img: "assets/img/pns-logo-upscaled.png", url: "#", sub: "상품 준비 중입니다. 문의 주시면 안내드립니다.", badge: "준비중", badgeType: "pending", priceType: "pending" },
  { name: "필름지 04", img: "assets/img/pns-logo-upscaled.png", url: "#", sub: "상품 준비 중입니다. 문의 주시면 안내드립니다.", badge: "준비중", badgeType: "pending", priceType: "pending" },
  { name: "필름지 05", img: "assets/img/pns-logo-upscaled.png", url: "#", sub: "상품 준비 중입니다. 문의 주시면 안내드립니다.", badge: "준비중", badgeType: "pending", priceType: "pending" }
];

/* ── 원두 봉투 ────────────────────────────────────────────── */
const B2B_POUCH = [
  { name: "원두 봉투 01", img: "assets/img/pns-logo-upscaled.png", url: "#", sub: "상품 준비 중입니다. 문의 주시면 안내드립니다.", badge: "준비중", badgeType: "pending", priceType: "pending" },
  { name: "원두 봉투 02", img: "assets/img/pns-logo-upscaled.png", url: "#", sub: "상품 준비 중입니다. 문의 주시면 안내드립니다.", badge: "준비중", badgeType: "pending", priceType: "pending" },
  { name: "원두 봉투 03", img: "assets/img/pns-logo-upscaled.png", url: "#", sub: "상품 준비 중입니다. 문의 주시면 안내드립니다.", badge: "준비중", badgeType: "pending", priceType: "pending" },
  { name: "원두 봉투 04", img: "assets/img/pns-logo-upscaled.png", url: "#", sub: "상품 준비 중입니다. 문의 주시면 안내드립니다.", badge: "준비중", badgeType: "pending", priceType: "pending" },
  { name: "원두 봉투 05", img: "assets/img/pns-logo-upscaled.png", url: "#", sub: "상품 준비 중입니다. 문의 주시면 안내드립니다.", badge: "준비중", badgeType: "pending", priceType: "pending" }
];
