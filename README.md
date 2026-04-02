# PNS Palombini Coffee 웹사이트

정적(Static) HTML/CSS/JS로 구성된 PNS 팔롬비니 소개/제품 안내 웹사이트입니다.

## 프로젝트 개요
- 메인 랜딩 페이지와 제품/머신 상세 페이지로 구성됩니다.
- 빌드 도구 없이 브라우저에서 바로 열 수 있는 구조입니다.
- GitHub Pages 또는 일반 정적 호스팅에 배포할 수 있습니다.

## 빠른 확인 방법
### 1) 로컬에서 바로 열기
- `index.html`을 브라우저로 열어 확인합니다.

### 2) 권장: 로컬 서버로 확인
상대경로/리소스 로딩 문제를 줄이기 위해 간단한 서버 실행을 권장합니다.

```bash
python -m http.server 8000
```

실행 후 브라우저에서 `http://localhost:8000` 접속.

## 엔트리 파일
- 기본 엔트리: `index.html`
- 제품 목록: `products/index.html`
- 머신 목록: `machines/index.html`
- 연락 페이지: `contact.html`

## 디렉터리 구조
```text
.
├── index.html
├── contact.html
├── film.html
├── assets/
│   ├── css/style.css
│   ├── js/main.js
│   ├── img/
│   └── video/
├── products/
│   ├── index.html
│   └── *.html
└── machines/
    ├── index.html
    └── *.html
```

## GitHub 업로드/배포 시 체크포인트
- 대소문자까지 정확히 일치하는 파일명/경로를 유지하세요.
- HTML 내부 링크는 상대경로 기반이므로 폴더 구조를 변경하면 링크가 깨질 수 있습니다.
- 에셋(`assets/img`, `assets/css`, `assets/js`, `assets/video`) 경로를 임의 변경하지 마세요.

## 유지보수 가이드(보수적 원칙)
- 디자인/문구/레이아웃 대수정 대신 링크·문서·경로 안정성 위주로 수정합니다.
- 새 페이지를 추가할 때는 목록 페이지(`products/index.html`, `machines/index.html`)에서 상호 링크를 함께 업데이트합니다.
- 변경 이력은 `CHANGELOG.md`에 기록합니다.

## 문서
- 기여/작업 규칙: `CONTRIBUTING.md`
- 변경 이력: `CHANGELOG.md`

## 라이선스
- 현재 저장소에 라이선스 파일이 없습니다. 권리자 확인 후 `LICENSE`를 추가하세요.
