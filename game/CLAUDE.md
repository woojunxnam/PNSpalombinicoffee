# CLAUDE.md — PNS Coffee 나무 키우기 게임

## 프로젝트 개요
PNS 팔롬비니 브랜드 연계 방치형 웹게임. 커피나무를 키우며 원두 포인트를 수집하는 소프트 픽셀 아트 스타일.
GitHub Pages에서 정적 호스팅. 프런트 정적 자산만, **Firebase(Auth + Firestore)로 로그인/클라우드 세이브만** 사용.

라이브 경로: `https://www.pnscoffee.com/game/`
메인 사이트와 독립 동작. 네비게이션 링크는 메인 사이트 헤더 "PNS Lab"에서 진입.

---

## 핵심 철학 (중요)
이 게임은 **cozy 방치형**이다. 다음 원칙을 깨면 안 된다.

1. **효율 게임 금지.** 수치 최적화·빌드 계산기처럼 느껴지면 실패.
2. **숙제화 금지.** 일일 퀘스트·출석 강박·체크리스트는 피함. 매일 "짧고 기분 좋게".
3. **화면을 바쁘게 만들지 말 것.** 동시 애니메이션 수 제한, 모션 속도 낮게.
4. **랜덤은 가속기, 축적은 확정.** 가챠 금지, 해금은 플레이 흔적 기반.
5. **브랜드 톤 유지.** 팔롬비니 커피의 따뜻한 cozy 이미지.

---

## 아키텍처: Phaser + DOM 하이브리드

- **Phaser 3 Canvas**: 중앙 "창문 + 배경 + 나무" 영역 담당 (배경, 하늘, 구름, 날씨, 화분, 나무, 장식, 탭 연출, 파티클)
- **HTML/CSS DOM**: HUD(상단), 액션 바(하단), 오버레이 패널, 팝업 알림
- 이유: 한국어 텍스트, 폼 입력, 스크롤 리스트, 접근성은 DOM이 압도적으로 유리

```
┌─ DOM: 상단 HUD (원두 포인트, Water 게이지, 계정, 설정)  ─┐
├─ Phaser Canvas: 창문/하늘/날씨 + 테이블/화분/나무         ─┤
├─ DOM: 하단 액션 바 (물주기, 수확, 가방, 컬렉션)           ─┤
└─ DOM: 오버레이 패널 + 팝업 알림 (showNotice)              ─┘
```

---

## 파일 구조

```
/game/
  index.html      ← 게임 진입점 (Phaser 로드 + DOM 레이아웃 + PWA manifest)
  style.css       ← 게임 전용 CSS (메인 사이트와 분리)
  game.js         ← 게임 로직 전체 (장기적으로 모듈 분리 예정)
  manifest.json   ← PWA manifest
  sw.js           ← Service Worker (cache-first 정적 / network-first HTML)
  icon-192.svg    ← PWA 아이콘 (SVG, maskable)
  icon-512.svg    ← PWA 아이콘 (SVG, maskable)
  CLAUDE.md       ← 이 파일
```

---

## 기술 제약

| 항목 | 결정 |
|------|------|
| 프레임워크 | Phaser 3 CDN (`pixelArt: true`, `roundPixels: true`) |
| FPS | **30fps 타겟** (모바일 배터리 절약, 60fps 금지) |
| 뷰포트 | `100dvh`, `viewport-fit=cover` |
| 방향 | 세로 전용, 가로 시 회전 안내 |
| 터치 | `touch-action: manipulation`, 최소 44px 타겟 |
| 저장 | localStorage + Firestore 클라우드 세이브 (둘 다, 마지막 저장 우선) |
| 인증 | Firebase Auth (Google 로그인만) |
| 폰트 | Noto Sans KR 400/700만 로드 |
| 빌드 | **없음. 번들러/트랜스파일러 사용 금지.** |
| 경로 | 상대경로만 사용 |
| PWA | manifest + service worker 있음 (오프라인 동작 가능) |

---

## Source of Truth — 게임 수치

### Water 시스템
- 최대: 100, 시작: 70
- 온라인 감소: 20초마다 -1
- 오프라인 감소: 경과 시간 기준, 상한 -35
- 물주기: +20, 쿨다운 12초
- 100 초과 불가
- 0일 때: 클릭 가능, 원두 포인트 획득 가능, 성장 XP 불가, 자동 성장 중지

### 클릭 시스템
- 탭 1회: 원두 포인트 +1 (항상)
- 탭 1회: 성장 XP +0.5 (Water > 0일 때만)
- 연출: squash & stretch, +1 플로팅 텍스트, 잎 반응

### 자동 성장
- Water > 0: 1분당 성장 XP +1
- Water = 0: 중지

### 오프라인 성장
- Water 남아있던 시간만큼만 반영
- 최대 반영 시간: 4시간
- 오프라인 원두 포인트: 없음

### 성장 단계 (fact는 showStageInfo()용 학습 텍스트)
| Stage | 이름 | XP 범위 | 비고 |
|-------|------|---------|----------|
| 0 | 새싹 | 0–14 | 튜토리얼 시작점 |
| 1 | 어린 묘목 | 15–49 | |
| 2 | 작은 커피나무 | 50–119 | |
| 3 | 꽃 단계 | 120–219 | 첫 꽃 이벤트 |
| 4 | 커피 체리 | 220+ | 수확 가능 |

### 수확 시스템
- Stage 4 (체리) 도달 시 수확 가능
- 황금 원두 지급: `3 + harvestCount`
- 수확 시 growthXp/stage/water 리셋, 황금 원두/해금/장비/통계 **유지**
- 무한 사이클 가능

### 일일 출석 보상 (DAILY_REWARDS 1~7)
- Day 1~6: 원두 +10~+35 계단형
- Day 7: 원두 +50 + 황금 원두 +1
- `lastDailyClaim` YYYYMMDD 정수 키로 중복 방지
- 1일 이상 끊기면 streak 리셋 → 재방문 팝업 표시

---

## Phase 구분 (현재까지)

### Phase 1 (완료) — 핵심 루프
하이브리드 레이아웃, 나무 Stage 0~2, 탭 연출, Water 시스템, HUD, localStorage, 오프라인 복귀

### Phase 2 (완료) — 수집/수확/배경
Stage 3~4(꽃·체리), 수확 시스템, 컬렉션 패널, 장착 시스템, 해금 조건

### Phase 3 (완료) — 보상/튜토리얼/폴리시
보상 코드 입력·URL 파라미터, 튜토리얼 4단계, 수확 보너스, 파티클

### Phase 4 (완료) — 계정/클라우드
Firebase Auth (Google 로그인), Firestore 클라우드 세이브, 오프라인→온라인 머지

### Phase A (완료) — 온보딩·리텐션
로딩 화면, Web Audio 사운드(5종 프로시저럴), 통계 패널, 일일 출석 보너스

### Phase B/C (완료) — PWA·공유·글로벌
PWA(manifest+sw), 가방(인벤토리), 단계 정보 ⓘ, Web Share 공유, Firestore 전역 누적 통계, 재방문 알림, 알림 권한, 수확 연출 강화(다층 파티클+플래시+카메라 흔들림)

### Phase D (진행 중) — 살아있는 환경 + 감정 UI
- [ ] **팝업 알림 시스템** (`showNotice`): 튜토리얼/단계 전환/이벤트용 — 탭으로 닫기
- [ ] **카페 창 + 창밖 뷰**: 실내 카페를 유지하면서 벽에 큰 창문을 뚫고 창 너머 하늘/구름/날씨 렌더
- [ ] **실시각 기반 하늘 그라디언트**: 새벽/낮/노을/밤 4단계 lerp (로컬 시각)
- [ ] **움직이는 구름**: Phaser tween loop 3~4개
- [ ] **날씨 시스템**: 맑음/흐림/비. 비 오는 날 첫 접속 시 Water +10 보너스
- [ ] **첫 꽃/첫 체리 기념 팝업**: `state.stats.firstFlowerTime` / `firstCherryTime` 기록

### Phase E (완료) — 애착 시스템
- 펫 2종(크레마=참새, 카푸치노=고양이) + 친밀도 0~5
- 펫이 수확 시 나무 주변에 모여 같이 기뻐함

### Phase F-1/F-2 (완료) — 수확 품질 + 펫 4종
- 7변수 수확 품질 (UI에는 숫자 X / 감성 문장 + 별 등급)
- 펫 4종 + 편지 시스템

### Phase J (완료) — 머리 위 클릭 팝업 시스템
- DOM 오버레이 레이어(`.popup-layer`)가 Phaser canvas 위에 얹힘
- 8종 팝업: 🍒/💧/🌸/✨ (나무 anchor) + 💗/🍃/🌰/💦 (펫 anchor)
- 새 영구 재화 추가 X — 기존 4가지(황금원두/원두증서/친밀도/Water)로만 보상
- 동시 최대 2개, 분 단위 쿨다운, 자동 만료/FOMO 없음
- 상태: `state.popupCooldowns`, `state.popupConsumedOnce`
- 핵심 함수: `initPopupLayer`, `tickClickPopups`, `spawnClickPopup`, `removeClickPopup`, `handlePopupClick`

### Phase K (완료) — 화분 1차 6종
- `POT_VISUAL` 팔레트 테이블 + TreeScene._drawPotAccent
- 6종: 기본 테라코타 / 꽃무늬 테라코타 / 크림 세라믹 / 비 온 뒤 세라믹 / 고양이 발자국 / 농장 마스터
- 해금 조건: 시작 / 첫 꽃 / 첫 수확 / 비 오는 날 5회 / 카푸치노 친밀도 5 / 농장 레벨 10
- 구 ID 마이그레이션: `migrateLegacyPotIds()` (loadState + loadFromFirestore 양쪽)
- 새 화분 해금 시 `showNotice` 1회

### Phase L (완료) — 5구역 폴리시
- 현 카페 indoor 뷰 유지 (world 방향 뒤집기 금지 — `next_session_direction.md` 원칙)
- `drawBackground()`에 추가: 좌측 허브 화분, 우측 물뿌리개, 테이블 풀잎, 선반 액자, 좌우 비네트, 중앙 스폿라이트 강화

### Phase M (완료) — 아바타 caretaker
- `TreeScene.showAvatar(situation, durationMs, opts)` / `hideAvatar()`
- 5상황: idle / watering / harvest / night / petting
- 트리거: `doWater` (watering 1.7s), `doHarvest` (harvest 2.4s), `petPet` (petting 2.2s, 펫 위치)
- 야간/idle 자동 등장: update() 60초 체크, 밤 19~5시는 ~5분에 1회, 낮은 ~10분에 1회
- 단순 픽셀 실루엣 (`_drawAvatar`), 페이드 인/아웃 320~420ms
- 조작 불가, 인벤토리/장비 없음 (caretaker presence 원칙)

### Phase F-3 ~ Phase I (계획) — 기록/계절/농장/쿠폰
- 기록장(이모지+날짜+단계+한 줄 메모, 이미지 저장 금지)
- 계절 테마 장식 드롭 (Phase G-2 일부 완료)
- 농장 레벨 / 카페 쿠폰 연동 (브랜드 결정 대기)

---

## 팝업 알림 시스템 (Phase D)

중요한 순간(튜토리얼, 단계 전환, 첫 꽃, 첫 체리, 재방문 등)에는 **휘발 토스트가 아니라 사용자가 읽고 탭해서 닫는 팝업**을 사용한다.

### 규칙
- 공통 함수 `showNotice({ icon, title, body, cta })` 사용
- 전면 오버레이 + 중앙 카드, **어디를 탭해도 닫힘**
- 큐잉: 여러 팝업이 동시 트리거되면 순차 표시
- 중복 방지: `state.stats.firstFlowerTime` 등으로 1회성 이벤트는 저장 후 재표시 금지

### 언제 쓰는가
- 튜토리얼 4단계 (기존 자동 토스트 힌트 대체)
- 단계 전환 (0→1, 1→2, 2→3, 3→4, 4 수확 가능)
- 첫 꽃 / 첫 체리 / 첫 수확 / 첫 컬렉션 해금
- (추후) 펫 해금, 편지 도착

### 언제 쓰지 말 것
- 탭/물주기 같은 초단위 반복 액션 (플로팅 텍스트로 충분)
- Water 감소 같은 수동적 변화
- 에러 (기존 `form-status` 스타일 유지)

---

## 배경 시스템 (Phase D)

### 구조
카페 실내 벽 + 벽에 큰 창문 → 창문 프레임 안쪽에 하늘/구름/날씨 렌더.
창문 아래 테이블 + 화분 + 나무는 그대로.

### 실시각 기반 하늘 색 (로컬 시각 기준)
| 시간대 | 색상 설명 |
|--------|----------|
| 05~07 | 새벽: 연분홍 → 살구 |
| 07~17 | 낮: 옅은 파랑 |
| 17~19 | 노을: 주황 → 보라 |
| 19~05 | 밤: 짙은 남색, 별 점 |

`new Date().getHours()` + `getMinutes()`로 두 스톱 사이 lerp. **시뮬레이션/가속 금지.**

### 날씨 결정
- 세션당 1회 롤, 상태는 localStorage에 저장(자정 리셋)
- 확률: 맑음 60% / 흐림 25% / 비 15%
- 비 오는 날 첫 방문 → Water +10 자동 충전 + 팝업 "오늘은 비가 와요 ☔ Water +10"

---

## 절대 하지 말 것
- ~~Firebase/서버 연동 금지~~ → **Firebase Auth + Firestore만 허용** (결제·푸시 백엔드 금지)
- 실제 카메라/바코드 스캔 금지
- 결제/광고/SDK 금지
- 메인 사이트 `assets/css/style.css` / `assets/js/main.js` 수정 금지
- **60fps 금지** (30fps 유지)
- **이미지 저장 금지** (localStorage 5MB 제한, Firestore 과금)
- **펫 배틀/경쟁/가챠 금지** (cozy 철학)
- **일일 숙제형 미션 금지** (현재 출석 보너스 수준 유지)
- **HTML 엔티티 치환 시 sed 금지** (메인 사이트 CLAUDE.md 참조 — 한글 깨짐)

---

## 개발 체크리스트 (PR 전)
1. `preview_eval`로 콘솔 에러 0건 확인
2. 새 상태 필드 추가 시 `defaultState()` + `loadState()` 머지 확인
3. `cloudSaveNow()` 호출 경로 확인 (장비/자원 변경 시)
4. 수치 밸런스 변경 시 Source of Truth 테이블 업데이트
5. 한글 텍스트는 HTML 직접 작성 (window.T는 메인 사이트만)
