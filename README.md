# PNS Palombini Coffee 웹사이트

정적(Static) HTML/CSS/JS로 구성된 PNS 팔롬비니 소개 및 제품 안내 사이트입니다.

## 프로젝트 개요
- 메인 소개 페이지와 제품/머신 상세 페이지로 구성됩니다.
- 별도 빌드 도구 없이 브라우저에서 바로 열 수 있는 구조입니다.
- GitHub Pages 또는 일반 정적 호스팅 환경에 배포할 수 있습니다.

## 빠른 확인 방법
### 1) 파일 직접 열기
- `index.html`을 브라우저에서 열어 기본 구성을 확인합니다.

### 2) 권장: 로컬 서버 실행
- 상대 경로와 자산 로딩 문제를 줄이기 위해 간단한 HTTP 서버 실행을 권장합니다.

```bash
python -m http.server 8000
```

- 실행 후 `http://localhost:8000` 에 접속합니다.

## 주요 진입 파일
- 메인 페이지: `index.html`
- 제품 목록: `products/index.html`
- 머신 목록: `machines/index.html`
- 문의 페이지: `contact.html`
- Flavor Guide: `flavor-guide.html`

## 디렉터리 구조
```text
.
├─ index.html
├─ contact.html
├─ film.html
├─ flavor-guide.html
├─ assets/
│  ├─ css/style.css
│  ├─ js/main.js
│  ├─ img/
│  └─ video/
├─ products/
│  ├─ index.html
│  └─ *.html
└─ machines/
   ├─ index.html
   └─ *.html
```

## GitHub 업로드/배포 체크포인트
- 파일명과 경로는 대소문자까지 정확히 일치해야 합니다.
- HTML 내부 링크는 상대 경로 기반이므로 디렉터리 구조를 바꾸면 링크가 깨질 수 있습니다.
- `assets/img`, `assets/css`, `assets/js`, `assets/video` 경로는 임의 변경을 피하세요.

## 유지보수 가이드
- 문구/레이아웃 수정 시 경로와 링크를 함께 확인합니다.
- 새 페이지를 추가하면 목록 페이지(`products/index.html`, `machines/index.html`)에서도 링크를 업데이트합니다.
- 변경 이력은 `CHANGELOG.md`에 기록합니다.

## 문서
- 기여/작업 규칙: `CONTRIBUTING.md`
- 변경 이력: `CHANGELOG.md`
- CSS 무결성 가드: `docs/css-integrity-guard.md`

## CSS 검사
전역 CSS 수정 후에는 최소 문법 무결성을 확인합니다.

```bash
python scripts/check_css.py
```

## 라이선스
- 현재 저장소에 별도 라이선스 파일이 없습니다. 필요 시 `LICENSE`를 추가하세요.

## Agent Handoff

### 현재 배포 기준
- GitHub Pages 라이브 URL: `https://woojunxnam.github.io/PNSpalombinicoffee/`
- 제품 목록: `https://woojunxnam.github.io/PNSpalombinicoffee/products/`
- Flavor Guide: `https://woojunxnam.github.io/PNSpalombinicoffee/flavor-guide.html`
- 배포 브랜치: `main`

### 이번 세션에서 확인된 핵심 원인
- `flavor-guide.html` 하단 퀴즈 스크립트가 끊겨 있어 결과 분기 로직이 깨져 있었습니다.
- `assets/img/flavor-guide/` 이미지 15개가 없어 결과 카드 이미지가 404였습니다.
- `/products/` 하단 CTA와 Flavor Guide 프로모는 HTML에는 있었지만 공통 reveal 애니메이션 초기값(`opacity: 0`) 때문에 실제 렌더에서 보이지 않았습니다.
- Flavor Guide 프로모 카드 버튼과 텍스트는 공통 카드 링크 색을 상속받아 다크 배경에서 대비가 부족했습니다.

### 이미 반영된 수정
- Flavor Guide 퀴즈 분기 로직 복구
  - `q1 -> q2a/q2b/q2c`
  - `q2a -> q3a/q3b`
  - `q2b`, `q2c`에서 결과 카드 연결
- 결과 카드 이미지 경로 15개 생성
  - `assets/img/flavor-guide/*.png`
- `/products/` 하단 CTA와 Flavor Guide 프로모를 항상 보이도록 수정
- `/products/` Flavor Guide 프로모 카드의 제목/설명/칩/버튼 대비 개선

### 최근 관련 커밋
- `9e524b5` Add Palombini flavor guide page
- `7b37fdb` Polish flavor guide entry and header
- `52afdcb` Fix flavor guide quiz flow and deploy image assets
- `3afa5ef` Preserve flavor guide UTF-8 text while fixing quiz flow
- `7e4fe5a` Ensure products flavor guide CTA is visible without reveal JS
- `efac532` Improve flavor guide promo contrast on products page

### 점검 우선순위
1. `/products/`에서 하단 CTA의 `취향 찾기 가이드` 버튼이 실제로 보이는지
2. `/products/` 하단 Flavor Guide 프로모 카드의 제목/설명/버튼 대비가 충분한지
3. `/flavor-guide.html`에서 질문 진행 후 결과 카드와 이미지가 정상 표시되는지

### 수정 시 주의
- 이 사이트는 공통 `assets/css/style.css`, `assets/js/main.js`의 전역 영향이 큽니다.
- 특정 페이지만 급히 살릴 때는 페이지 내부 스타일로 먼저 격리 수정하는 편이 안전합니다.
- reveal 애니메이션 대상(`.card`, `.callout`, `.section-title`, `.section-lead`)은 JS가 실패하면 안 보일 수 있습니다.
- Flavor Guide 관련 배포 확인은 “HTML 반영”과 “이미지 자산 반영”을 분리해서 확인하세요.

### 다음 에이전트 시작 체크
- `products/index.html`
- `flavor-guide.html`
- `assets/css/style.css`
- `assets/js/main.js`
- 라이브 기준 확인 경로
  - `/products/`
  - `/flavor-guide.html`
  - `/assets/img/flavor-guide/roma_img.png`
