# CLAUDE.md — PNS 팔롬비니 웹사이트

## 프로젝트 개요
PNS 팔롬비니(팔롬비니 커피) 공식 웹사이트. 정적 HTML/CSS/JS 사이트로, GitHub Pages에서 호스팅.
라이브 URL: https://www.pnscoffee.com
GitHub: https://github.com/woojunxnam/PNSpalombinicoffee

한국어/영어 이중 언어 지원. KO/EN 토글은 `window.T` 배열로 처리.

---

## 파일 구조
```
/                   ← 메인 랜딩 (index.html)
/machines/          ← 패키징 머신 라인업 (index.html + 26개 상세 페이지)
/products/          ← PNS 자사 상품 (index.html + 개별 상품 페이지)
/b2b.html           ← B2B 생산 현장 페이지 (다크 테마)
/contact.html       ← 문의 페이지
/lineup.html        ← 계열사 상품 라인업
/custom-edition.html← 나만의 드립백 제작
/film.html          ← 커피 필름지 (준비중)
/assets/css/style.css ← 전체 공통 CSS
/assets/js/main.js  ← 언어 토글(applyLang), 네비게이션, 기타
/assets/img/        ← 이미지 (machine-*.jpg, pns-logo-upscaled.png 등)
/assets/video/      ← 머신 데모 영상 (machine-demo.mp4, machine-fm100.mp4, machine-fm200.mp4)
```

---

## 언어 토글 시스템 (window.T)
각 페이지 하단 `<script>` 안에 `window.T` 배열 정의. `main.js`의 `applyLang()`이 이를 읽어 DOM 조작.

### window.T 배열 형식
```js
window.T = [
  ['.css-selector', '영어 텍스트'],          // 단일 요소
  ['.css-selector', '영어 텍스트', 0],        // nth 요소 (0-indexed)
  ['.css-selector', '영어 텍스트', 'all'],    // 모든 일치 요소
];
```

- 한국어 텍스트는 HTML에 직접 작성
- 영어 텍스트는 window.T에 정의
- `applyLang('en')`: T 배열 대로 DOM 변경
- `applyLang('ko')`: 페이지 새로고침하여 원래 HTML 복원
- `html[lang="ko"]` / `html[lang="en"]` CSS 클래스로 언어별 표시 제어 가능

---

## 머신 페이지 구조 (`/machines/`)

### 카테고리 (6개, 총 26종)
| id | 한국어 | 영어 | 머신 수 |
|----|--------|------|--------|
| `#drip-bag` | 드립백 머신 | Drip Bag | 4종: MD-181, FG-60, FG-70, MD-F11 |
| `#tea-bag` | 피라미드 티백 머신 | Tea Bag | 5종: MD-160-06, MD-160-06S, MD-160S-06, MD-LX12, MD-FT100 |
| `#powder-granule` | 파우더·과립 백 머신 | Powder & Granule | 7종: MD-DC16-06, MD-50F, MD-300F, MD-420K, MD-300K, MD-420F, MD-60F |
| `#liquid` | 액체 패키징 머신 | Liquid | 3종: MD-60Y, MD-300Y, MD-420Y |
| `#premade-pouch` | 프리메이드 파우치 머신 | Premade Pouch | 4종: MD-200J, MD-200F, MD-200K, MD-FM200 |
| `#capsule` | 캡슐 머신 | Capsule | 3종: MD-JL60-2, MD-JL60, MD-JL60X |

### 카테고리 ID 활용 (AI 에이전트 친화적 선택자)
```css
/* 이렇게 쓰세요 (명확) */
#drip-bag .machine-card:nth-child(1)
#tea-bag .machine-card:nth-child(2)

/* 이렇게 쓰지 마세요 (위치 의존, 깨지기 쉬움) */
.machines-category:nth-child(1) .machine-card:nth-child(1)
```

### 비교표 행 번호 매핑 (window.T 작업 시)
그룹 헤더 행이 포함되므로 아래 번호 사용:
- 드립백: tbody tr:nth-child(2~5)
- 티백: tbody tr:nth-child(7~11)
- 파우더·과립: tbody tr:nth-child(13~19)
- 액체: tbody tr:nth-child(21~23)
- 프리메이드 파우치: tbody tr:nth-child(25~28)
- 캡슐: tbody tr:nth-child(30~32)

### 개별 머신 상세 페이지 템플릿
`/machines/md-200j.html` 참고. 모든 상세 페이지는 동일한 구조:
- 헤더/푸터는 `../` 기준 경로
- breadcrumb: `홈 › 패키징 머신 › [모델명]`
- `.machine-detail-grid` 안에 카탈로그 이미지 + specs-table + CTA

---

## 네비게이션 (헤더)
모든 46개+ HTML 파일에 동일한 헤더가 있음. **헤더/네비 변경 시 반드시 전체 파일에 적용 필요.**

### 헤더 변경 시 필수 체크리스트
1. Python `pathlib.Path('.').rglob('*.html')` 스크립트로 **전체 파일 일괄 수정** (수동 편집 금지)
2. 루트 파일 (`href="page.html"`)과 서브디렉토리 파일 (`href="../page.html"`) 경로 차이 처리
3. 변경 후 `nav-volcano`, `고객·협력사` 등 핵심 키워드로 전체 파일 검증
4. 모바일 메뉴 (`main.js`의 `menuItems` 배열)도 함께 업데이트

### 현재 네비 구조 (탑 레벨)
`브랜드 → 제품 → 🌋 볼케이노 루비 → 자동화 장비 → B2B → 문의 → 고객·협력사(준비중)`

- About (브랜드) → Technology, Heritage, Reviews, FAQ
- Products (제품) → PNS 팔롬비니 상품 라인업, 계열사 상품 라인업
- 🌋 볼케이노 루비 (단독 링크, .nav-volcano 클래스)
- Machines (자동화 장비) → 드립백·패키징 머신 라인업
- B2B → B2B 상품 라인업, 드립백 맞춤 주문, 드립백 생산 현장 보기, 생두 원두 대량 주문, 봉투 필름지 맞춤 주문, 봉투 필름지 생산 현장 보기(준비중)
- Contact (문의)
- Partners (고객·협력사, 준비중, opacity:0.5)

---

## CSS 주요 변수 (`style.css`)
```css
--accent:  #C07A3D   /* 골드 브라운 (버튼, 강조) */
--accent2: #1F1A16   /* 다크 브라운 (헤딩) */
--muted:   #6B5E55   /* 회색 갈색 (보조 텍스트) */
--card:    (카드 배경)
--line:    (구분선)
--shadow2: (카드 그림자)
--serif:   'Noto Serif KR', Georgia, serif
```

---

## 절대 하지 말 것 (중요)

### HTML 엔티티 치환 시 절대 sed 사용 금지
```bash
# 이렇게 하면 HTML 엔티티가 완전히 망가짐
sed -i 's/&#xB4DC;&#xB9BD;.../새텍스트/' *.html  # 절대 금지!
```
대신 Python 사용:
```python
import re, pathlib
for f in pathlib.Path('.').rglob('*.html'):
    content = f.read_text(encoding='utf-8')
    if '찾을텍스트' in content:
        f.write_text(content.replace('찾을텍스트', '바꿀텍스트'), encoding='utf-8')
```

### window.T 중복 항목 금지
같은 CSS 셀렉터를 여러 항목에 쓰면 마지막 항목만 적용됨. 기존 항목 확인 후 수정.

### 스크린샷 도구 (machines/index.html)
머신 페이지는 26개 이미지 + 동영상으로 무거워 `preview_screenshot`이 타임아웃됨.
대신 `preview_inspect`와 `preview_snapshot`으로 검증할 것.

---

## 영상 파일
| 파일 | 설명 |
|------|------|
| `assets/video/machine-demo.mp4` | 메인 히어로 배경 영상 (세로형, B2B/머신 페이지) |
| `assets/video/machine-fm100.mp4` | FM100 드립백 라인 데모 |
| `assets/video/machine-fm200.mp4` | FM200 프리메이드 파우치 데모 |

모든 자동재생 영상: `autoplay muted loop playsinline` (controls 없음)

---

## 이미지 파일명 규칙
머신 이미지: `assets/img/machine-[모델명소문자].jpg`
예: `machine-md-181.jpg`, `machine-fg-60.jpg`, `machine-md-jl60x.jpg`
