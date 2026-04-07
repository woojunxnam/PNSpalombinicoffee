/* ============================================================
 * 블랙빈스 상품 데이터
 * ──────────────────────────────────────────────────────────
 * 상품 추가/수정/삭제 시 이 파일만 편집하세요.
 * 모든 상품은 BB_STORE_URL로 연결됩니다.
 * 개별 URL이 필요하면 해당 객체에 url 필드를 추가하세요.
 *
 * 필드 설명 (pns-products.js 참고)
 * ============================================================ */

const BB_STORE_URL = 'https://blackbeans.kr/product/list.html?cate_no=59';

const BB_PRODUCTS = [

  /* ── 1kg 원두 모음 ────────────────────────────────────── */
  { name: "블랙빈스 원두커피 1kg 모음",                              img: "assets/img/blackbeans/bb_01.jpg", price: 13700, origPrice: 14100 },
  { name: "[라떼추천] 에스프레소 블렌드",                             img: "assets/img/blackbeans/bb_02.jpg", price: 20600 },
  { name: "문 블렌드",                                               img: "assets/img/blackbeans/bb_03.jpg", price: 23900 },
  { name: "[묵직한 바디감 밝은 산미] 케냐 AA",                        img: "assets/img/blackbeans/bb_04.jpg", price: 24200 },
  { name: "[부드럽고 달콤한] 엘살바도르 팬시 SHB",                    img: "assets/img/blackbeans/bb_05.jpg", price: 25100 },
  { name: "[진한 초콜릿 깔끔한 뒷맛] 콜롬비아 슈프리모 메델린",        img: "assets/img/blackbeans/bb_06.jpg", price: 22600 },
  { name: "베트남 아라비카 G1",                                       img: "assets/img/blackbeans/bb_07.jpg", price: 20600 },
  { name: "[인기 블렌드] 시그니처 블렌드",                             img: "assets/img/blackbeans/bb_08.jpg", price: 23900 },
  { name: "모카 블렌드",                                              img: "assets/img/blackbeans/bb_09.jpg", price: 19600 },
  { name: "[사업자추천] 마일드 블렌드",                                img: "assets/img/blackbeans/bb_10.jpg", price: 18200 },
  { name: "[헤이즐넛 맛집] 헤이즐넛 향 커피",                         img: "assets/img/blackbeans/bb_11.jpg", price: 21500 },
  { name: "[크리미한 바디감] 인도네시아 발리",                         img: "assets/img/blackbeans/bb_12.jpg", price: 24100 },
  { name: "[산미/단맛/바디감 균형잡힌] 파프아뉴기니아 PSCA",           img: "assets/img/blackbeans/bb_13.jpg", price: 25100 },
  { name: "[고소하고 부드러운 산미] 탄자니아 AA",                      img: "assets/img/blackbeans/bb_14.jpg", price: 23200 },
  { name: "[은은한 단맛 진한 바디감] 인도 몬순 말라바 AA",             img: "assets/img/blackbeans/bb_15.jpg", price: 23600 },
  { name: "[부드럽고 균형잡힌 바디감] 과테말라 제네릭 SHB",            img: "assets/img/blackbeans/bb_16.jpg", price: 24300 },
  { name: "[고급 스페셜티] 파나마 게이샤 프리미엄 커피",               img: "assets/img/blackbeans/bb_17.jpg", price: 35000 },
  { name: "[묵직한 고소함] 인도네시아 만델링",                         img: "assets/img/blackbeans/bb_18.jpg", price: 25400 },

  /* ── 드립백 세트 ──────────────────────────────────────── */
  { name: "7데이즈 드립백 커피 선물세트 10g×42P",                     img: "assets/img/blackbeans/bb_19.jpg", price: 28900 },
  { name: "7데이즈 드립백 커피 5종 100개 벌크",                        img: "assets/img/blackbeans/bb_20.jpg", price: 71200, origPrice: 74300 },

  /* ── 업소용 대량 ──────────────────────────────────────── */
  { name: "원두커피 대량 구매 10kg 업소용",                            img: "assets/img/blackbeans/bb_21.jpg", price: 180000 },

  /* ── 블렌드 라인업 ────────────────────────────────────── */
  { name: "빈스 블렌드",                                              img: "assets/img/blackbeans/bb_22.jpg", price: 20600 },
  { name: "로얄 블렌드",                                              img: "assets/img/blackbeans/bb_23.jpg", price: 29900 },
  { name: "[잔잔한 고소함] 프리미엄 블렌드",                           img: "assets/img/blackbeans/bb_24.jpg", price: 23900 },
  { name: "[인기 블렌드] 블루 마운틴 블렌드",                          img: "assets/img/blackbeans/bb_25.jpg", price: 20600 },
  { name: "[아이스 아메리카노 추천] 아이스 블렌드",                    img: "assets/img/blackbeans/bb_26.jpg", price: 19600 },
  { name: "[사업자추천] 카페 블렌드",                                  img: "assets/img/blackbeans/bb_27.jpg", price: 20200 },
  { name: "[사업자추천] 모닝 블렌드",                                  img: "assets/img/blackbeans/bb_28.jpg", price: 20600 },
  { name: "[사업자추천] 하우스 블렌드",                                img: "assets/img/blackbeans/bb_29.jpg", price: 19200 },

  /* ── 단품 원산지 ──────────────────────────────────────── */
  { name: "[부드럽고 깔끔한] 니카라과 SHG",                           img: "assets/img/blackbeans/bb_30.jpg", price: 25300 },
  { name: "[부드러운 바디감 밝은 산미] 코스타리카 SHB",                img: "assets/img/blackbeans/bb_31.jpg", price: 23900 },
  { name: "[화사한 산미 부드러운 바디감] 에디오피아 예가체프 G4",       img: "assets/img/blackbeans/bb_32.jpg", price: 20500 },
  { name: "[밝은산미 가벼운 바디감] 에디오피아 예가체프 G2",            img: "assets/img/blackbeans/bb_33.jpg", price: 23500 },
  { name: "멕시코 알투라 SHB",                                        img: "assets/img/blackbeans/bb_34.jpg", badge: "품절", badgeType: "soldout", priceType: "soldout" },
  { name: "[부드럽고 깨끗한 산미] 에디오피아 모카 시다모 G4",           img: "assets/img/blackbeans/bb_35.jpg", price: 20500 },
  { name: "[모닝커피추천] 브라질 산토스",                              img: "assets/img/blackbeans/bb_36.jpg", price: 21500 },
  { name: "베트남 로부스타 워시드 G1",                                 img: "assets/img/blackbeans/bb_37.jpg", price: 13700, origPrice: 14100 }

];
