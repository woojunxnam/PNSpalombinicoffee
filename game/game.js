/* ============================================
   PNS Coffee 나무 키우기 — Phase 2 + Firebase
   Phaser 3 + DOM Hybrid
   ============================================ */

// ── Firebase init ────────────────────────────
let db = null;
let auth = null;
let currentUser = null;
let firestoreSaveTimer = null;

function initFirebase() {
  try {
    const app = firebase.initializeApp({
      apiKey:            'AIzaSyC_m8ez_LbcnfoOVinMQbrPeJ-u5Ym8nUg',
      authDomain:        'pnspalombini.firebaseapp.com',
      projectId:         'pnspalombini',
      storageBucket:     'pnspalombini.firebasestorage.app',
      messagingSenderId: '273634072112',
      appId:             '1:273634072112:web:f0129f89f4277f97a07ff5',
    });
    db   = firebase.firestore();
    auth = firebase.auth();

    // 인증 상태 감지: 로그인/로그아웃 시 자동 처리
    auth.onAuthStateChanged(onAuthStateChanged);
  } catch (e) {
    console.warn('[Firebase] init failed:', e.message);
  }
}

async function onAuthStateChanged(user) {
  currentUser = user;
  if (user) {
    updateAccountUI(user);
    showCloudStatus('☁️ 데이터 불러오는 중...');
    await loadFromFirestore(user.uid);
    showCloudStatus('☁️ 동기화 완료', true);
  } else {
    updateAccountUI(null);
  }
}

// ── Google 로그인 / 로그아웃 ─────────────────
async function signInWithGoogle() {
  if (!auth) return;
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(provider);
    // onAuthStateChanged 가 자동으로 처리
  } catch (e) {
    if (e.code !== 'auth/popup-closed-by-user') {
      console.warn('[Firebase] signIn failed:', e.message);
    }
  }
}

async function signOutUser() {
  if (!auth) return;
  await auth.signOut();
  currentUser = null;
  updateAccountUI(null);
}

// ── Firestore 저장 (디바운스 60초) ───────────
function scheduleSaveToFirestore() {
  if (!currentUser || !db) return;
  if (firestoreSaveTimer) clearTimeout(firestoreSaveTimer);
  firestoreSaveTimer = setTimeout(() => saveToFirestore(currentUser.uid), 60000);
}

async function saveToFirestore(uid) {
  if (!db || !uid) return;
  try {
    const payload = {
      beanPoints:      state.beanPoints,
      goldenBeans:     state.goldenBeans,
      water:           state.water,
      growthXp:        state.growthXp,
      stage:           state.stage,
      harvestCount:    state.harvestCount,
      equippedPotId:   state.equippedPotId,
      equippedDecorId: state.equippedDecorId,
      unlocked:        state.unlocked,
      claimedRewards:  state.claimedRewards,
      stats:           state.stats,
      lastSaveTime:    state.lastSaveTime,
      savedAt:         firebase.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection('gameUsers').doc(uid).set(payload);
    showCloudStatus('☁️ 저장됨', true);
  } catch (e) {
    console.warn('[Firebase] save failed:', e.message);
  }
}

// ── Firestore 불러오기 ──────────────────────
async function loadFromFirestore(uid) {
  if (!db || !uid) return;
  try {
    const doc = await db.collection('gameUsers').doc(uid).get();
    if (!doc.exists) {
      // 첫 로그인 — 로컬 데이터를 클라우드에 올림
      await saveToFirestore(uid);
      return;
    }
    const cloud = doc.data();
    const local = state;

    // 더 진행된 데이터를 선택 (growthXp 기준)
    // 오프라인 계산은 이미 boot()에서 처리됐으므로 단순 비교
    if ((cloud.growthXp || 0) >= (local.growthXp || 0)) {
      // 클라우드 데이터 적용
      const def = defaultState();
      state = {
        ...def,
        ...cloud,
        stats: { ...def.stats, ...(cloud.stats || {}) },
        unlocked: cloud.unlocked || def.unlocked,
        claimedRewards: cloud.claimedRewards || [],
      };
      state.stage = getStage(state.growthXp);
      saveState(); // localStorage 동기화
    } else {
      // 로컬이 더 앞서 있음 — 클라우드에 업로드
      await saveToFirestore(uid);
    }
    updateHUD();
    const scene = window._phaserGame?.scene?.getScene('TreeScene');
    if (scene) { scene.currentStage = -1; scene.drawTree(true); }
  } catch (e) {
    console.warn('[Firebase] load failed:', e.message);
  }
}

// ── 클라우드 저장 즉시 실행 (중요 이벤트 시) ─
function cloudSaveNow() {
  if (!currentUser || !db) return;
  if (firestoreSaveTimer) clearTimeout(firestoreSaveTimer);
  saveToFirestore(currentUser.uid);
}

// ── 계정 UI 업데이트 ────────────────────────
function updateAccountUI(user) {
  const img         = $('hudAvatarImg');
  const placeholder = $('hudAvatarPlaceholder');
  if (user && user.photoURL) {
    img.src = user.photoURL;
    img.style.display = 'block';
    placeholder.style.display = 'none';
  } else {
    img.style.display = 'none';
    placeholder.style.display = 'block';
    placeholder.textContent = user ? '👤' : '🔑';
  }
}

function renderAccountPanel() {
  const body = $('accountPanelBody');
  if (currentUser) {
    body.innerHTML =
      '<div class="account-profile">' +
        (currentUser.photoURL ? '<img class="account-avatar" src="' + currentUser.photoURL + '" alt="">' : '<div class="account-avatar-placeholder">👤</div>') +
        '<div class="account-name">' + (currentUser.displayName || '플레이어') + '</div>' +
        '<div class="account-email">' + (currentUser.email || '') + '</div>' +
      '</div>' +
      '<p class="account-desc">✅ 구글 계정으로 연결됨<br>진행 데이터가 자동으로 클라우드에 저장됩니다.</p>' +
      '<button class="popup-btn popup-btn-danger" id="btnSignOut" style="margin-top:8px;">로그아웃</button>';
    $('btnSignOut').addEventListener('click', async () => {
      await signOutUser();
      renderAccountPanel();
    });
  } else {
    body.innerHTML =
      '<p class="account-desc">구글 계정으로 로그인하면<br>어느 기기에서도 이어서 플레이할 수 있어요.</p>' +
      '<button class="popup-btn google-signin-btn" id="btnGoogleSignIn">' +
        '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" height="18">' +
        'Google로 로그인' +
      '</button>' +
      '<p class="account-privacy-note">로그인 시 이메일·프로필 사진·게임 진행 데이터가 클라우드에 저장됩니다. ' +
      '<a href="../privacy.html" target="_blank" rel="noopener">개인정보처리방침</a></p>';
    $('btnGoogleSignIn').addEventListener('click', async () => {
      hideOverlay('accountPanel');
      await signInWithGoogle();
    });
  }
}

// ── 클라우드 상태 표시 ───────────────────────
let cloudStatusTimer = null;
function showCloudStatus(msg, autohide) {
  const el = $('cloudStatus');
  el.textContent = msg;
  el.classList.add('visible');
  if (cloudStatusTimer) clearTimeout(cloudStatusTimer);
  if (autohide) {
    cloudStatusTimer = setTimeout(() => el.classList.remove('visible'), 2000);
  }
}

// ── Constants (Source of Truth) ─────────────
const C = Object.freeze({
  WATER_MAX:        100,
  WATER_START:      70,
  WATER_DRAIN_SEC:  20,
  WATER_DRAIN_OFF_CAP: 35,
  WATER_REFILL:     20,
  WATER_COOLDOWN:   12000,

  TAP_BEANS:        1,
  TAP_XP:           0.5,
  AUTO_XP_PER_MIN:  1,

  OFFLINE_MAX_HOURS: 4,

  HARVEST_GOLDEN_BEANS: 3, // 수확 시 황금 원두 지급량

  // 일일 출석 보상 (1일차부터 7일차 순환)
  DAILY_REWARDS: [
    { beans: 10, golden: 0, label: '☕ 원두 +10' },
    { beans: 15, golden: 0, label: '☕ 원두 +15' },
    { beans: 20, golden: 0, label: '☕ 원두 +20' },
    { beans: 25, golden: 0, label: '☕ 원두 +25' },
    { beans: 30, golden: 0, label: '☕ 원두 +30' },
    { beans: 40, golden: 0, label: '☕ 원두 +40' },
    { beans: 50, golden: 1, label: '☕ 원두 +50, ✨ 황금 원두 +1' },
  ],

  STAGES: [
    { name: '새싹',        emoji: '🌱', minXp: 0,
      fact: '커피나무는 발아 후 약 8주가 지나면 떡잎이 펼쳐져요. 적정 온도는 22–28°C, 습도는 70% 이상이 좋습니다.' },
    { name: '어린 묘목',    emoji: '🌿', minXp: 15,
      fact: '묘목 단계에서는 직사광선보다 반그늘이 좋아요. 야생 커피는 본래 큰 나무 아래에서 자라는 그늘 식물이거든요.' },
    { name: '작은 커피나무', emoji: '🌳', minXp: 50,
      fact: '커피나무는 적도 부근의 "커피 벨트"에서 자라요. 고도 800m 이상에서 자란 원두는 산미가 풍부해진답니다.' },
    { name: '꽃 단계',      emoji: '🌸', minXp: 120,
      fact: '커피꽃은 자스민 향이 나는 흰 꽃이에요. 보통 우기 후 2–3일만 피었다 지는데, 한 번에 수천 송이가 동시에 핀답니다.' },
    { name: '커피 체리',    emoji: '🍒', minXp: 220,
      fact: '커피 체리는 꽃이 진 후 6–9개월에 걸쳐 익어요. 빨갛게 익은 체리 안에 두 알의 원두가 들어 있답니다. 손으로 따는 핸드피킹이 최고 품질로 꼽혀요.' },
  ],

  // 컬렉션 아이템 정의
  ITEMS: {
    pot_terracotta_basic: { name: '기본 테라코타 화분', type: 'pot', icon: '🪴', desc: '시작 화분' },
    pot_cafe_brown:       { name: '카페 브라운 화분', type: 'pot', icon: '☕', desc: 'Stage 2 도달 시 해금' },
    pot_drip_pattern:     { name: '드립 패턴 화분', type: 'pot', icon: '💧', desc: 'Stage 3 도달 시 해금' },
    decor_spoon_small:    { name: '작은 스푼 장식', type: 'decor', icon: '🥄', desc: '물주기 5회 달성' },
    decor_bean_sack_mini: { name: '원두 자루 장식', type: 'decor', icon: '🫘', desc: '탭 30회 달성' },
  },

  // 해금 조건
  UNLOCK_CONDITIONS: {
    pot_terracotta_basic: () => true,
    pot_cafe_brown:       (s) => s.stage >= 1,
    pot_drip_pattern:     (s) => s.stage >= 2,
    decor_spoon_small:    (s) => s.stats.totalWaterings >= 5,
    decor_bean_sack_mini: (s) => s.stats.totalTaps >= 30,
  },

  // 보상 코드 정의
  REWARDS: {
    DRIP2025:   { name: '드립백 보상', water: 30, beans: 10, unlock: 'pot_drip_pattern' },
    BEAN2025:   { name: '원두 보상', beans: 20, xp: 10 },
    GELATO2025: { name: '젤라또 보상', water: 50, beans: 15, unlock: 'decor_spoon_small' },
    PNSCOFFEE:  { name: 'PNS 웰컴 보상', water: 100, beans: 5 },
  },

  SAVE_KEY: 'pns_coffee_tree_save',
  FPS: 30,
});

// ── State ───────────────────────────────────
let state = null;

function defaultState() {
  return {
    beanPoints: 0,
    goldenBeans: 0,
    water: C.WATER_START,
    growthXp: 0,
    stage: 0,
    harvestCount: 0,
    lastSaveTime: Date.now(),
    lastWaterTime: 0,
    firstPlayTime: Date.now(),
    soundEnabled: true,
    notifyEnabled: false,     // 출석 알림 사용 여부
    lastDailyClaim: 0,        // 마지막 일일 보너스 받은 날 (날짜 키, YYYYMMDD 숫자)
    dailyStreak: 0,           // 연속 출석 일수
    lastVisitTime: Date.now(),
    todayWeather: null,       // 'sunny' | 'cloudy' | 'rainy'
    todayWeatherDate: 0,      // YYYYMMDD — 자정 리셋 기준
    rainyBonusClaimedDate: 0, // 비 오는 날 첫 방문 보너스 1일 1회
    equippedPotId: 'pot_terracotta_basic',
    equippedDecorId: null,
    unlocked: ['pot_terracotta_basic'],
    claimedRewards: [],
    tutorialDone: false,
    // Phase F-1 — 수확 품질 시스템 (내부 변수, 외부에 숫자 노출 없음)
    stage4EnterTime: 0,      // 현재 사이클에서 Stage 4(체리) 진입 시각
    stage4WaterOkSec: 0,     // Stage 4 진입 후 Water>0이었던 누적 초
    totalWaterOkSec: 0,      // 전체 플레이 Water>0 누적 초
    totalPlaySec: 0,         // 전체 플레이 누적 초 (online tick)
    coffeeCerts: 0,          // 원두 증서 (실제 카페 쿠폰 전환용 — UI는 Phase I)
    coffeeCertsEarned: 0,    // 누적 획득 증서
    lastHarvestQuality: null,// 마지막 수확 품질 (디버그/통계용 0~100)
    stats: {
      totalTaps: 0,
      totalWaterings: 0,
      totalHarvests: 0,
      totalBeansEarned: 0,
      firstFlowerTime: 0, // 첫 꽃 마일스톤 (Stage 3 도달 시각)
      firstCherryTime: 0, // 첫 체리 마일스톤 (Stage 4 도달 시각)
    },
    // Phase E/F-2 — 펫 시스템 (cozy, 배틀/가챠 금지)
    pets: {
      crema:     { unlocked: false, friendship: 0, lastPetDate: 0, unlockTime: 0 },
      cappu:     { unlocked: false, friendship: 0, lastPetDate: 0, unlockTime: 0 },
      americano: { unlocked: false, friendship: 0, lastPetDate: 0, unlockTime: 0 },
      espresso:  { unlocked: false, friendship: 0, lastPetDate: 0, unlockTime: 0 },
    },
    // Phase F-2 — 비 오는 날 누적 방문 (에스프레소 해금용, 날짜 문자열 배열)
    rainyVisitDates: [],
  };
}

// ── Save / Load ─────────────────────────────
function saveState() {
  try {
    state.lastSaveTime = Date.now();
    localStorage.setItem(C.SAVE_KEY, JSON.stringify(state));
  } catch (e) { /* private browsing 등 */ }
  scheduleSaveToFirestore();
}

function loadState() {
  try {
    const raw = localStorage.getItem(C.SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // 누락 필드 보완
      const def = defaultState();
      const mergedPets = { ...def.pets };
      if (parsed.pets) {
        for (const k of Object.keys(def.pets)) {
          mergedPets[k] = { ...def.pets[k], ...(parsed.pets[k] || {}) };
        }
      }
      return {
        ...def, ...parsed,
        stats: { ...def.stats, ...parsed.stats },
        pets: mergedPets,
      };
    }
  } catch (e) { /* corrupt data */ }
  return null;
}

function resetState() {
  try { localStorage.removeItem(C.SAVE_KEY); } catch (e) {}
  state = defaultState();
  updateHUD();
  saveState();
}

// ── Harvest (수확) ──────────────────────────
function canHarvest() {
  return state.stage >= 4; // Stage 5 (커피 체리)
}

// 0~1 범위로 클램프
function _clamp01(v) { return Math.max(0, Math.min(1, v)); }

// Stage 4에서의 숙성도 (0~1) — Water가 충분히 유지된 시간 / 2시간
function getRipeness() {
  if (state.stage < 4) return 0;
  const okSec = state.stage4WaterOkSec || 0;
  return _clamp01(okSec / (2 * 3600)); // 2시간이면 만숙
}

// 내부 품질 공식 — 7변수, 총 100점 만점
// UI에는 노출되지 않음. 등급/감성 문장으로만 외부화.
function computeHarvestQuality() {
  // 1) Ripeness 0~30
  const ripe = Math.round(getRipeness() * 30);
  // 2) Care 0~25 — 전체 플레이 중 Water>0이었던 비율
  const totalSec = Math.max(1, state.totalPlaySec || 0);
  const careRatio = (state.totalWaterOkSec || 0) / totalSec;
  const care = Math.round(_clamp01(careRatio) * 25);
  // 3) Weather 0~15
  let weather = 5;
  if (state.todayWeather === 'cloudy') weather = 10;
  else if (state.todayWeather === 'rainy') weather = 15;
  // 4) Pet 0~10 — 친밀도 합계
  let petSum = 0;
  if (state.pets) {
    for (const p of Object.values(state.pets)) {
      if (p && p.unlocked) petSum += (p.friendship || 0);
    }
  }
  const pet = Math.min(10, petSum);
  // 5) Time of day 0~5 — 오전 6~9시 수확 보너스
  const hr = new Date().getHours();
  const time = (hr >= 6 && hr < 9) ? 5 : 0;
  // 6) Streak 0~10 — 연속 출석일
  const streak = Math.min(10, state.dailyStreak || 0);
  // 7) Rarity Roll 0~5 — 진짜 랜덤
  const rarity = Math.floor(Math.random() * 6);

  const total = ripe + care + weather + pet + time + streak + rarity;
  return Math.max(0, Math.min(100, total));
}

// 등급 결정 — 점수 → 등급 라벨/별/지급량
const HARVEST_GRADES = [
  { min: 0,  max: 34,  key: 'plain',    label: '평범한 수확',  stars: 1, golden: 1, cert: 0 },
  { min: 35, max: 59,  key: 'good',     label: '양호한 수확',  stars: 2, golden: 2, cert: 0 },
  { min: 60, max: 84,  key: 'fine',     label: '훌륭한 수확',  stars: 3, golden: 3, cert: 0 },
  { min: 85, max: 100, key: 'special',  label: '특별 수확',    stars: 4, golden: 4, cert: 1 },
];
function getHarvestGrade(score) {
  for (const g of HARVEST_GRADES) {
    if (score >= g.min && score <= g.max) return g;
  }
  return HARVEST_GRADES[0];
}

// 감성 문장 빌더 — 어떤 변수가 두드러졌는지에 따라 짧은 문장 모음 반환.
// 절대 숫자 노출 금지.
function buildHarvestPhrases() {
  const phrases = [];
  // 날씨
  if (state.todayWeather === 'rainy') phrases.push('비 내린 날의 맛이 배어있어요');
  else if (state.todayWeather === 'cloudy') phrases.push('흐린 하늘 아래 차분히 익었어요');
  // 시간대
  const hr = new Date().getHours();
  if (hr >= 6 && hr < 9) phrases.push('아침 햇살을 머금은 향이 나요');
  else if (hr >= 18 && hr < 20) phrases.push('노을빛이 깃든 체리예요');
  else if (hr >= 20 || hr < 5) phrases.push('고요한 밤에 수확됐어요');
  // 펫
  if (state.pets?.crema?.unlocked && state.pets?.cappu?.unlocked) {
    phrases.push('크레마와 카푸치노가 지켜봤어요');
  } else if (state.pets?.crema?.unlocked) {
    phrases.push('크레마가 창가에서 지켜봤어요');
  } else if (state.pets?.cappu?.unlocked) {
    phrases.push('카푸치노가 곁에서 졸고 있었어요');
  }
  // Ripeness
  const ripe = getRipeness();
  if (ripe >= 0.95) phrases.push('완벽하게 무르익었어요');
  else if (ripe >= 0.6) phrases.push('잘 익은 향이 풍겨요');
  else if (ripe < 0.3) phrases.push('아직 풋내가 살짝 남아있어요');
  // Care
  const careRatio = (state.totalWaterOkSec || 0) / Math.max(1, state.totalPlaySec || 0);
  if (careRatio >= 0.8) phrases.push('한결같이 보살펴진 흔적이 보여요');
  else if (careRatio < 0.4) phrases.push('목마른 시간이 많았던 것 같아요');
  // Streak
  if ((state.dailyStreak || 0) >= 6) phrases.push('매일같이 들러주셔서 고마워요');

  // 너무 짧으면 기본 한 줄 보강
  if (phrases.length === 0) phrases.push('오늘도 한 알 한 알 정성껏 자랐어요');
  // 최대 4줄
  return phrases.slice(0, 4);
}

function doHarvest() {
  if (!canHarvest()) return null;

  const score = computeHarvestQuality();
  const grade = getHarvestGrade(score);
  const phrases = buildHarvestPhrases();

  state.goldenBeans += grade.golden;
  if (grade.cert > 0) {
    state.coffeeCerts = (state.coffeeCerts || 0) + grade.cert;
    state.coffeeCertsEarned = (state.coffeeCertsEarned || 0) + grade.cert;
  }
  state.harvestCount++;
  state.stats.totalHarvests++;
  state.lastHarvestQuality = score;

  checkPetUnlocks(); // 첫 수확 → 카푸치노(고양이) 해금 체크
  playSound('harvest');

  // Stage 리셋 + Stage 4 시계 초기화
  state.growthXp = 0;
  state.stage4EnterTime = 0;
  state.stage4WaterOkSec = 0;
  updateStage(0, { silent: true });
  state.water = C.WATER_START;

  updateHUD();
  saveState();
  cloudSaveNow();

  return { golden: grade.golden, cert: grade.cert, grade, phrases, score };
}

// ── Collection unlock check ─────────────────
function checkUnlocks() {
  let newUnlock = false;
  for (const [id, condFn] of Object.entries(C.UNLOCK_CONDITIONS)) {
    if (!state.unlocked.includes(id) && condFn(state)) {
      state.unlocked.push(id);
      newUnlock = true;
    }
  }
  return newUnlock;
}

// ── Stage helpers ───────────────────────────
function getStage(xp) {
  let s = 0;
  for (let i = C.STAGES.length - 1; i >= 0; i--) {
    if (xp >= C.STAGES[i].minXp) { s = i; break; }
  }
  return s;
}

function getNextStageXp(stage) {
  if (stage + 1 < C.STAGES.length) return C.STAGES[stage + 1].minXp;
  return null; // max stage
}

// ── Pet system (Phase E) ───────────────────
// 철학: 배틀/경쟁/가챠 금지. 해금은 플레이 흔적(첫 꽃, 첫 수확) 기반.
// 친밀도 0~5. 탭 한 번당 하루 1회만 +1. 숙제화 금지.
const PETS = {
  crema: {
    name: '크레마',
    species: '참새',
    icon: '🐦',
    description: '창가에 앉아 가끔 지저귀는 작은 참새.',
    unlockNotice: {
      icon: '🐦',
      title: '창가에 친구가 왔어요',
      body: '<strong>크레마</strong>라는 참새가 창문에 앉았어요.<br>가끔 쓰다듬어 주세요.',
    },
  },
  cappu: {
    name: '카푸치노',
    species: '고양이',
    icon: '🐱',
    description: '테이블 위에서 나른하게 낮잠 자는 고양이.',
    unlockNotice: {
      icon: '🐱',
      title: '고양이가 가게에 들렀어요',
      body: '<strong>카푸치노</strong>라는 고양이가 테이블에 올라왔어요.<br>조용히 곁에 있어요.',
    },
  },
  americano: {
    name: '아메리카노',
    species: '다람쥐',
    icon: '🐿',
    description: '창문턱 구석에서 도토리를 굴리는 다람쥐.',
    ability: '오프라인 성장 상한 +1시간',
    unlockNotice: {
      icon: '🐿',
      title: '창틀에 다람쥐가 나타났어요',
      body: '<strong>아메리카노</strong>라는 다람쥐가 찾아왔어요.<br>당신이 자리를 비운 사이에도 나무를 지켜봐줘요.<br><span style="color:var(--accent);font-size:0.8em;">✨ 오프라인 성장 상한 +1시간</span>',
    },
  },
  espresso: {
    name: '에스프레소',
    species: '개구리',
    icon: '🐸',
    description: '화분 옆에서 느긋하게 앉아있는 작은 개구리.',
    ability: '맑은 날 Water 감소 -5%',
    unlockNotice: {
      icon: '🐸',
      title: '비 온 뒤 친구가 찾아왔어요',
      body: '<strong>에스프레소</strong>라는 개구리가 화분 옆에 앉았어요.<br>비를 부르지는 못하지만, 나무를 시원하게 지켜줘요.<br><span style="color:var(--accent);font-size:0.8em;">✨ 맑은 날에도 Water 감소가 느려져요</span>',
    },
  },
};
const FRIENDSHIP_MESSAGES = {
  crema: [
    null,
    { icon: '🐦', title: '크레마가 당신을 알아봐요', body: '작은 참새가 이제 무서워하지 않아요.' },
    { icon: '🐦', title: '크레마가 가까이 와요', body: '창틀 가장 앞자리에 앉기 시작했어요.' },
    { icon: '🐦', title: '크레마가 지저귀어요', body: '작은 노랫소리가 창가에 번져요.' },
    { icon: '🐦', title: '크레마가 편안해 보여요', body: '깃털을 고르며 오래 머무르네요.' },
    { icon: '💕', title: '크레마는 당신의 친구예요', body: '어느새 가장 친한 친구가 됐어요.' },
  ],
  cappu: [
    null,
    { icon: '🐱', title: '카푸치노가 곁눈질을 해요', body: '모른 척하지만 사실 신경쓰고 있어요.' },
    { icon: '🐱', title: '카푸치노가 기지개를 켜요', body: '한결 편해진 모양이에요.' },
    { icon: '🐱', title: '카푸치노가 가르릉거려요', body: '가까이 다가오면 느낄 수 있어요.' },
    { icon: '🐱', title: '카푸치노가 배를 보여요', body: '이건 신뢰한다는 뜻이에요.' },
    { icon: '💕', title: '카푸치노는 당신을 신뢰해요', body: '가장 편한 자리는 당신 옆이에요.' },
  ],
  americano: [
    null,
    { icon: '🐿', title: '아메리카노가 빼꼼 내다봐요', body: '도토리를 손에 꼭 쥔 채 인사를 건네요.' },
    { icon: '🐿', title: '아메리카노가 자리를 잡았어요', body: '창틀 한 켠을 자기 자리로 정한 것 같아요.' },
    { icon: '🐿', title: '아메리카노가 도토리를 굴려요', body: '소리 없이 작은 놀이를 하고 있어요.' },
    { icon: '🐿', title: '아메리카노가 꼬리를 흔들어요', body: '당신을 보면 꼬리부터 인사를 해요.' },
    { icon: '💕', title: '아메리카노는 당신의 친구예요', body: '오래 자리를 비워도 나무를 지켜준대요.' },
  ],
  espresso: [
    null,
    { icon: '🐸', title: '에스프레소가 눈을 끔뻑여요', body: '말은 없지만 가만히 곁을 지켜요.' },
    { icon: '🐸', title: '에스프레소가 화분에 올라왔어요', body: '제일 좋아하는 자리를 찾았어요.' },
    { icon: '🐸', title: '에스프레소가 작게 운대요', body: '비 오는 날을 기억하는 노래래요.' },
    { icon: '🐸', title: '에스프레소가 폴짝 뛰어요', body: '기분이 좋을 때 보여주는 인사예요.' },
    { icon: '💕', title: '에스프레소는 당신의 친구예요', body: '맑은 날에도 나무가 시원하길 빌어줘요.' },
  ],
};
const MAX_FRIENDSHIP = 5;

function checkPetUnlocks() {
  let changed = false;
  if (!state.pets.crema.unlocked && state.stats.firstFlowerTime) {
    state.pets.crema.unlocked = true;
    state.pets.crema.unlockTime = Date.now();
    showNotice(PETS.crema.unlockNotice);
    changed = true;
  }
  if (!state.pets.cappu.unlocked && (state.stats.totalHarvests || 0) >= 1) {
    state.pets.cappu.unlocked = true;
    state.pets.cappu.unlockTime = Date.now();
    showNotice(PETS.cappu.unlockNotice);
    changed = true;
  }
  // Phase F-2: 아메리카노 — 누적 수확 10회
  if (!state.pets.americano.unlocked && (state.stats.totalHarvests || 0) >= 10) {
    state.pets.americano.unlocked = true;
    state.pets.americano.unlockTime = Date.now();
    showNotice(PETS.americano.unlockNotice);
    changed = true;
  }
  // Phase F-2: 에스프레소 — 비 오는 날 3회 접속
  if (!state.pets.espresso.unlocked && (state.rainyVisitDates || []).length >= 3) {
    state.pets.espresso.unlocked = true;
    state.pets.espresso.unlockTime = Date.now();
    showNotice(PETS.espresso.unlockNotice);
    changed = true;
  }
  if (changed) {
    saveState();
    // Phaser 씬에 펫 다시 그리기 요청
    const scene = window._phaserGame?.scene?.getScene('TreeScene');
    if (scene && typeof scene.refreshPets === 'function') scene.refreshPets();
  }
  return changed;
}

// 펫 쓰다듬기 — 탭 1회당 하루 1번만 친밀도 +1
function petPet(petId) {
  const pet = state.pets[petId];
  if (!pet || !pet.unlocked) return { fed: false, leveled: false };
  const today = todayKey();
  if (pet.lastPetDate === today) return { fed: false, leveled: false };
  pet.lastPetDate = today;
  const leveled = pet.friendship < MAX_FRIENDSHIP;
  if (leveled) pet.friendship++;
  saveState();
  return { fed: true, leveled };
}

// ── Stage transition detector (centralized) ─
// 어디서든 growthXp가 바뀐 뒤 호출. 단계가 올라갔으면 팝업을 띄우고
// 첫 꽃/첫 체리 같은 1회성 마일스톤은 저장 후 기념 연출.
const STAGE_TRANSITION_MESSAGES = [
  null, // 0 — 튜토리얼이 담당, 전환 팝업 없음
  { icon: '🌿', title: '어린 묘목으로 자랐어요',
    body: '떡잎이 본잎으로 바뀌었어요.<br>이 시기엔 반그늘과 따뜻한 온도가 좋답니다.' },
  { icon: '🌳', title: '작은 커피나무가 됐어요',
    body: '잎이 넓어지고 줄기가 단단해졌어요.<br>꽃이 피기까지 조금만 더 기다려요.' },
  { icon: '🌸', title: '첫 꽃이 폈어요!',
    body: '커피꽃은 자스민 향이 나요.<br>보통 <strong>2~3일만 피었다 지는데</strong>, 그 사이를 놓치지 마세요.',
    milestone: 'firstFlowerTime' },
  { icon: '🍒', title: '커피 체리가 맺혔어요!',
    body: '빨간 체리 안에 <strong>두 알의 원두</strong>가 들어 있어요.<br>이제 <strong>수확</strong>이 가능해요 — 하단 버튼을 눌러보세요.',
    milestone: 'firstCherryTime' },
];
function updateStage(newStage, opts) {
  // opts: { silent: true }  // 쿨다운 수확/로드에서는 팝업 억제
  const old = state.stage;
  if (newStage === old) { state.stage = newStage; return false; }
  state.stage = newStage;
  // Stage 4 진입 시점 기록 (Ripeness 계산 기준)
  if (newStage >= 4 && (!state.stage4EnterTime || state.stage4EnterTime === 0)) {
    state.stage4EnterTime = Date.now();
    state.stage4WaterOkSec = 0;
  }
  if (opts && opts.silent) return true;
  // 오른쪽으로 올라간 전환만 팝업 (리셋 수확은 silent로 호출)
  if (newStage > old) {
    const msg = STAGE_TRANSITION_MESSAGES[newStage];
    if (msg) {
      // 1회성 마일스톤은 저장 후 다시 띄우지 않음
      if (msg.milestone) {
        if (state.stats[msg.milestone]) return true;
        state.stats[msg.milestone] = Date.now();
      }
      playSound('levelup');
      showNotice({ icon: msg.icon, title: msg.title, body: msg.body });
      // 꽃 마일스톤 → 크레마(참새) 해금 체크
      if (msg.milestone) checkPetUnlocks();
    }
  }
  return true;
}

// ── Offline calculation ─────────────────────
function processOffline(savedState) {
  const now = Date.now();
  const elapsed = now - savedState.lastSaveTime;
  if (elapsed < 5000) return null; // 5초 미만이면 무시

  const elapsedSec = elapsed / 1000;
  const elapsedMin = elapsed / 60000;
  // Phase F-2: 아메리카노(다람쥐) 능력 — 오프라인 상한 +1시간
  const americanoBonus = (savedState.pets?.americano?.unlocked ? 1 : 0);
  const maxOfflineSec = (C.OFFLINE_MAX_HOURS + americanoBonus) * 3600;

  // Water 감소: 20초당 -1, 상한 -35
  const waterDrainRaw = Math.floor(elapsedSec / C.WATER_DRAIN_SEC);
  const waterDrain = Math.min(waterDrainRaw, C.WATER_DRAIN_OFF_CAP);
  const oldWater = savedState.water;
  const newWater = Math.max(0, oldWater - waterDrain);

  // 성장 XP: Water가 남아있던 시간만큼만
  // Water가 0이 되기까지 걸리는 시간 계산
  const secUntilDry = oldWater * C.WATER_DRAIN_SEC;
  const cappedElapsedSec = Math.min(elapsedSec, maxOfflineSec);
  const growthSec = Math.min(cappedElapsedSec, secUntilDry);
  const growthMin = growthSec / 60;
  const xpGained = Math.floor(growthMin * C.AUTO_XP_PER_MIN * 10) / 10;

  // 적용
  savedState.water = newWater;
  savedState.growthXp += xpGained;
  savedState.stage = getStage(savedState.growthXp);

  const stoppedDueToWater = secUntilDry < cappedElapsedSec;

  return {
    elapsedMin: Math.floor(elapsedMin),
    growthMin: Math.round(growthMin * 10) / 10,
    xpGained,
    waterDrain,
    stoppedDueToWater,
  };
}

// ── Sound system (Web Audio, no asset files) ─
let audioCtx = null;
function ensureAudio() {
  if (audioCtx) return audioCtx;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  } catch (e) { /* unsupported */ }
  return audioCtx;
}
function playSound(type) {
  if (!state || !state.soundEnabled) return;
  const ctx = ensureAudio();
  if (!ctx) return;
  if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === 'tap') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.12);
  } else if (type === 'water') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.18);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.start(now);
    osc.stop(now + 0.25);
  } else if (type === 'levelup') {
    // 3-note arpeggio
    [523.25, 659.25, 783.99].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = f;
      o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, now + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.12, now + i * 0.08 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.18);
      o.start(now + i * 0.08);
      o.stop(now + i * 0.08 + 0.2);
    });
    osc.disconnect();
    return;
  } else if (type === 'harvest') {
    // Cheerful 4-note jingle
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = f;
      o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, now + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.14, now + i * 0.1 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.22);
      o.start(now + i * 0.1);
      o.stop(now + i * 0.1 + 0.25);
    });
    osc.disconnect();
    return;
  } else if (type === 'reward') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.setValueAtTime(880, now + 0.1);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.32);
  }
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  saveState();
  updateSoundButton();
  if (state.soundEnabled) playSound('tap');
}
function updateSoundButton() {
  const btn = $('btnSoundToggle');
  if (!btn) return;
  btn.textContent = state.soundEnabled ? '🔊 사운드 켜짐' : '🔇 사운드 꺼짐';
}

// ── Daily bonus ─────────────────────────────
function todayKey() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}
function daysBetween(a, b) {
  // a, b are YYYYMMDD numbers — return integer day diff
  const pa = new Date(Math.floor(a / 10000), Math.floor((a % 10000) / 100) - 1, a % 100);
  const pb = new Date(Math.floor(b / 10000), Math.floor((b % 10000) / 100) - 1, b % 100);
  return Math.round((pb - pa) / 86400000);
}
function checkDailyBonus() {
  const today = todayKey();
  if (state.lastDailyClaim === today) return; // 이미 받음
  const diff = state.lastDailyClaim ? daysBetween(state.lastDailyClaim, today) : 999;
  if (diff === 1) {
    state.dailyStreak = Math.min(7, (state.dailyStreak || 0) + 1);
  } else {
    state.dailyStreak = 1; // 연속이 끊김 → 1일차부터 다시
  }
  showDailyBonusPopup();
}
function showDailyBonusPopup() {
  const day = state.dailyStreak || 1;
  const reward = C.DAILY_REWARDS[day - 1];
  const body = $('dailyBonusBody');
  body.innerHTML =
    '<div class="daily-bonus-day">' + day + '일차 출석</div>' +
    '<div class="daily-bonus-reward">' +
      '<span class="daily-bonus-reward-icon">🎁</span>' +
      '<div class="daily-bonus-reward-text">' + reward.label + '</div>' +
    '</div>' +
    '<div class="daily-bonus-streak">7일 연속 출석 시 황금 원두를 드려요!</div>';
  showOverlay('dailyBonusPopup');
}
function claimDailyBonus() {
  const day = state.dailyStreak || 1;
  const reward = C.DAILY_REWARDS[day - 1];
  state.beanPoints += reward.beans;
  state.goldenBeans += reward.golden;
  state.stats.totalBeansEarned += reward.beans;
  state.lastDailyClaim = todayKey();
  playSound('reward');
  updateHUD();
  saveState();
  cloudSaveNow();
  hideOverlay('dailyBonusPopup');
}

// ── Stats panel ─────────────────────────────
function renderStatsPanel() {
  const playedMs = Date.now() - (state.firstPlayTime || Date.now());
  const playedDays = Math.floor(playedMs / 86400000);
  const playedHours = Math.floor((playedMs % 86400000) / 3600000);
  let playedStr;
  if (playedDays > 0) playedStr = playedDays + '일 ' + playedHours + '시간';
  else if (playedHours > 0) playedStr = playedHours + '시간';
  else playedStr = Math.max(1, Math.floor(playedMs / 60000)) + '분';

  const body = $('statsBody');
  body.innerHTML =
    '<div class="stats-grid">' +
      '<div class="stats-card"><div class="stats-card-icon">👆</div><div class="stats-card-value">' + (state.stats.totalTaps || 0) + '</div><div class="stats-card-label">총 탭 수</div></div>' +
      '<div class="stats-card"><div class="stats-card-icon">💧</div><div class="stats-card-value">' + (state.stats.totalWaterings || 0) + '</div><div class="stats-card-label">물주기 횟수</div></div>' +
      '<div class="stats-card"><div class="stats-card-icon">☕</div><div class="stats-card-value">' + (state.stats.totalBeansEarned || state.beanPoints) + '</div><div class="stats-card-label">획득 원두</div></div>' +
      '<div class="stats-card"><div class="stats-card-icon">🍒</div><div class="stats-card-value">' + (state.stats.totalHarvests || state.harvestCount || 0) + '</div><div class="stats-card-label">수확 횟수</div></div>' +
      '<div class="stats-card"><div class="stats-card-icon">✨</div><div class="stats-card-value">' + (state.goldenBeans || 0) + '</div><div class="stats-card-label">보유 황금 원두</div></div>' +
      '<div class="stats-card"><div class="stats-card-icon">📖</div><div class="stats-card-value">' + (state.unlocked.length || 0) + '</div><div class="stats-card-label">컬렉션 해금</div></div>' +
    '</div>' +
    '<div class="stats-row-wide"><span class="stats-card-label">⏱ 총 플레이 기간</span><span class="stats-card-value">' + playedStr + '</span></div>' +
    '<div class="stats-row-wide"><span class="stats-card-label">🔥 연속 출석</span><span class="stats-card-value">' + (state.dailyStreak || 0) + '일</span></div>';

  // Phase F-1: 원두 증서 카드 (특별 수확에서만 드롭, 카페 쿠폰 전환은 Phase I)
  const certs = state.coffeeCerts || 0;
  const certsEarned = state.coffeeCertsEarned || 0;
  if (certsEarned > 0 || certs > 0) {
    body.innerHTML +=
      '<div class="stats-cert">' +
        '<div class="stats-cert-icon">🏅</div>' +
        '<div class="stats-cert-info">' +
          '<div class="stats-cert-title">원두 증서</div>' +
          '<div class="stats-cert-sub">보유 ' + certs + ' · 누적 ' + certsEarned + '</div>' +
          '<div class="stats-cert-note">특별 수확에서만 받을 수 있는 귀한 증서예요.</div>' +
        '</div>' +
      '</div>';
  }

  // 친구들 (해금된 펫만 표시)
  const unlockedPets = Object.entries(state.pets || {}).filter(([_, p]) => p.unlocked);
  if (unlockedPets.length > 0) {
    let petHtml = '<div class="stats-pets"><div class="stats-pets-title">🐾 카페 친구들</div>';
    unlockedPets.forEach(([id, p]) => {
      const meta = PETS[id];
      if (!meta) return;
      const hearts = '💕'.repeat(p.friendship) + '🤍'.repeat(MAX_FRIENDSHIP - p.friendship);
      petHtml +=
        '<div class="stats-pet-row">' +
          '<span class="stats-pet-icon">' + meta.icon + '</span>' +
          '<div class="stats-pet-info">' +
            '<div class="stats-pet-name">' + meta.name + ' <span class="stats-pet-species">(' + meta.species + ')</span></div>' +
            '<div class="stats-pet-hearts">' + hearts + '</div>' +
          '</div>' +
        '</div>';
    });
    petHtml += '</div>';
    body.innerHTML += petHtml;
  }

  // 전 세계 누적 (Firestore 집계, 캐시가 있을 때만)
  if (globalStatsCache) {
    const gh = globalStatsCache.totalHarvests || 0;
    const gg = globalStatsCache.totalGoldenBeans || 0;
    body.innerHTML +=
      '<div class="stats-global">' +
        '<div class="stats-global-title">🌍 전 세계 PNS 농부들</div>' +
        '<div class="stats-row-wide"><span class="stats-card-label">🍒 누적 수확</span><span class="stats-card-value">' + gh.toLocaleString() + '</span></div>' +
        '<div class="stats-row-wide"><span class="stats-card-label">✨ 누적 황금 원두</span><span class="stats-card-value">' + gg.toLocaleString() + '</span></div>' +
      '</div>';
  }
}

// ── Loading screen ──────────────────────────
function setLoadingProgress(pct, tip) {
  const fill = $('loadingBarFill');
  if (fill) fill.style.width = pct + '%';
  if (tip) {
    const tipEl = $('loadingTip');
    if (tipEl) tipEl.textContent = tip;
  }
}
function hideLoadingScreen() {
  const ls = $('loadingScreen');
  if (!ls) return;
  setLoadingProgress(100);
  setTimeout(() => ls.classList.add('hidden'), 200);
  setTimeout(() => { try { ls.remove(); } catch(e){} }, 1000);
}

// ── Inventory (가방) ────────────────────────
function renderInventoryPanel() {
  const body = $('inventoryBody');
  const pot = C.ITEMS[state.equippedPotId];
  const decor = state.equippedDecorId ? C.ITEMS[state.equippedDecorId] : null;

  let html = '';

  // 보유 자원
  html += '<div class="inv-section">';
  html += '<div class="inv-section-title">보유 자원</div>';
  html += '<div class="inv-resources">';
  html += '<div class="inv-resource"><span class="inv-resource-icon">☕</span><div class="inv-resource-info"><div class="inv-resource-value">' + state.beanPoints + '</div><div class="inv-resource-label">원두</div></div></div>';
  html += '<div class="inv-resource"><span class="inv-resource-icon">✨</span><div class="inv-resource-info"><div class="inv-resource-value">' + state.goldenBeans + '</div><div class="inv-resource-label">황금 원두</div></div></div>';
  html += '<div class="inv-resource"><span class="inv-resource-icon">💧</span><div class="inv-resource-info"><div class="inv-resource-value">' + Math.floor(state.water) + ' / ' + C.WATER_MAX + '</div><div class="inv-resource-label">물</div></div></div>';
  html += '<div class="inv-resource"><span class="inv-resource-icon">🍒</span><div class="inv-resource-info"><div class="inv-resource-value">' + (state.harvestCount || 0) + '</div><div class="inv-resource-label">총 수확</div></div></div>';
  html += '</div></div>';

  // 장착 중
  html += '<div class="inv-section">';
  html += '<div class="inv-section-title">장착 중</div>';
  if (pot) {
    html += '<div class="inv-equipped"><span class="inv-equipped-icon">' + pot.icon + '</span><div class="inv-equipped-text"><div class="inv-equipped-name">' + pot.name + '</div><div class="inv-equipped-sub">화분</div></div></div>';
  }
  if (decor) {
    html += '<div class="inv-equipped" style="margin-top:6px;"><span class="inv-equipped-icon">' + decor.icon + '</span><div class="inv-equipped-text"><div class="inv-equipped-name">' + decor.name + '</div><div class="inv-equipped-sub">장식</div></div></div>';
  } else {
    html += '<div class="inv-empty" style="margin-top:6px;">장식 미장착 — 컬렉션에서 장착하세요</div>';
  }
  html += '</div>';

  // 사용한 보상 코드
  html += '<div class="inv-section">';
  html += '<div class="inv-section-title">사용한 보상 코드 (' + state.claimedRewards.length + ')</div>';
  if (state.claimedRewards.length === 0) {
    html += '<div class="inv-empty">아직 사용한 코드가 없어요</div>';
  } else {
    state.claimedRewards.forEach((code) => {
      const r = C.REWARDS[code];
      html += '<div class="inv-history-row"><span>' + (r ? r.name : code) + '</span><span class="inv-history-label">' + code + '</span></div>';
    });
  }
  html += '</div>';

  body.innerHTML = html;
}

// ── Stage info popup ────────────────────────
function showStageInfo() {
  const stg = C.STAGES[state.stage];
  const nextXp = getNextStageXp(state.stage);
  $('stageInfoTitle').textContent = stg.emoji + ' ' + stg.name;
  let html = '<div class="stage-info-fact"><strong>알고 계셨나요?</strong><br>' + stg.fact + '</div>';
  html += '<div class="stage-info-stats">';
  html += '<span>현재 XP: <strong>' + Math.floor(state.growthXp) + '</strong></span>';
  if (nextXp !== null) {
    html += '<span>다음 단계까지: <strong>' + (nextXp - Math.floor(state.growthXp)) + ' XP</strong></span>';
  } else {
    html += '<span><strong>최종 단계 도달!</strong> 수확이 가능합니다.</span>';
  }
  html += '</div>';
  $('stageInfoBody').innerHTML = html;
  showOverlay('stageInfoPanel');
}

// ── Share (Web Share API + clipboard fallback) ─
async function shareGame() {
  const text = '🌱 PNS 커피나무 ' + (state.dailyStreak || 1) + '일차 키우는 중! ' +
    '☕ ' + state.beanPoints + '원두 · ✨ ' + state.goldenBeans + '황금 원두 · 🍒 ' + (state.harvestCount || 0) + '회 수확';
  const url = 'https://www.pnscoffee.com/game/';
  try {
    if (navigator.share) {
      await navigator.share({ title: 'PNS 커피나무 키우기', text: text, url: url });
      return;
    }
    await navigator.clipboard.writeText(text + '\n' + url);
    alert('자랑할 내용이 클립보드에 복사되었어요!\n\n' + text);
  } catch (e) {
    // 사용자가 취소하면 무시
  }
}

// ── Notification permission ──────────────────
async function toggleNotification() {
  if (!('Notification' in window)) {
    alert('이 브라우저는 알림을 지원하지 않아요.');
    return;
  }
  if (state.notifyEnabled) {
    state.notifyEnabled = false;
    saveState();
    updateNotifyButton();
    return;
  }
  let perm = Notification.permission;
  if (perm === 'default') {
    perm = await Notification.requestPermission();
  }
  if (perm === 'granted') {
    state.notifyEnabled = true;
    saveState();
    updateNotifyButton();
    // 환영 알림
    try {
      new Notification('🌱 PNS 커피나무', {
        body: '내일 잊지 않고 출석 도장 찍어 주세요!',
        icon: 'icon-192.svg',
        tag: 'pns-welcome',
      });
    } catch (e) {}
  } else {
    alert('브라우저에서 알림을 허용해 주세요.');
  }
}
function updateNotifyButton() {
  const btn = $('btnNotifyToggle');
  if (!btn) return;
  btn.textContent = state.notifyEnabled ? '🔔 출석 알림 켜짐' : '🔕 출석 알림 꺼짐';
}

// ── Re-visit reminder (연속 끊김) ────────────
function checkRevisit() {
  if (!state.lastDailyClaim) return; // 첫 방문이면 무시
  const today = todayKey();
  if (state.lastDailyClaim === today) return;
  const diff = daysBetween(state.lastDailyClaim, today);
  if (diff >= 2) {
    // 1일 이상 빠짐
    const body = $('revisitBody');
    body.innerHTML =
      '<p class="revisit-text">' + diff + '일 동안 못 보셨네요.<br>' +
      '연속 출석이 <strong>' + (state.dailyStreak || 0) + '일</strong>에서 끊겼어요.</p>' +
      '<p class="revisit-text" style="font-size:0.78rem;color:var(--text-dim);margin-top:8px;">' +
      '오늘부터 다시 1일차로 시작해요. 7일 연속 채우면 황금 원두를 드려요!</p>';
    showOverlay('revisitPopup');
  }
}

// ── Global stats (Firestore aggregate) ──────
let globalStatsCache = null;
async function loadGlobalStats() {
  if (!db) return null;
  try {
    const doc = await db.collection('gameGlobalStats').doc('summary').get();
    if (doc.exists) {
      globalStatsCache = doc.data();
      return globalStatsCache;
    }
  } catch (e) { /* offline or rules */ }
  return null;
}
async function incrementGlobalStat(field, amount) {
  if (!db) return;
  try {
    await db.collection('gameGlobalStats').doc('summary').set({
      [field]: firebase.firestore.FieldValue.increment(amount || 1),
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  } catch (e) { /* fail silently */ }
}

// ── DOM helpers ─────────────────────────────
const $ = (id) => document.getElementById(id);

function updateHUD() {
  $('hudBeans').textContent = state.beanPoints;
  $('hudGoldenBeans').textContent = state.goldenBeans;

  // Water bar
  const pct = Math.max(0, Math.min(100, state.water));
  $('waterBarFill').style.width = pct + '%';
  $('waterBarText').textContent = Math.floor(state.water);

  if (state.water <= 20) {
    $('waterBarFill').style.background = 'linear-gradient(90deg, #d45050, #d47050)';
  } else {
    $('waterBarFill').style.background = '';
  }

  // Stage
  const stg = C.STAGES[state.stage];
  const nextXp = getNextStageXp(state.stage);
  $('stageName').textContent = stg.emoji + ' ' + stg.name;
  $('stageXp').textContent = nextXp !== null
    ? Math.floor(state.growthXp) + ' / ' + nextXp + ' XP'
    : Math.floor(state.growthXp) + ' XP (MAX)';

  // 수확 버튼 표시/숨김
  const harvestBtn = $('btnHarvest');
  if (canHarvest()) {
    harvestBtn.classList.add('visible');
  } else {
    harvestBtn.classList.remove('visible');
  }
}

function showFloatingText(text, x, y) {
  const el = document.createElement('div');
  el.className = 'float-text';
  el.textContent = text;
  const area = $('gameCanvasArea');
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  area.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

function showOverlay(id) {
  $(id).classList.add('active');
}

function hideOverlay(id) {
  $(id).classList.remove('active');
}

// ── Notice popup (공용 알림) ────────────────
// 튜토리얼, 단계 전환, 첫 꽃/첫 체리 같은 중요한 순간을 사용자가
// 읽고 직접 탭해서 닫는 팝업. 여러 개가 몰리면 순차 큐잉.
const _noticeQueue = [];
let _noticeShowing = false;
function showNotice(opts) {
  // opts: { icon, title, body, cta, onClose }
  _noticeQueue.push(opts || {});
  _processNoticeQueue();
}
function _processNoticeQueue() {
  if (_noticeShowing) return;
  const next = _noticeQueue.shift();
  if (!next) return;
  _noticeShowing = true;

  $('noticeIcon').textContent = next.icon || '🌱';
  $('noticeTitle').textContent = next.title || '알림';
  $('noticeBody').innerHTML = next.body || '';
  $('noticeCta').textContent = next.cta || '확인';

  // 사운드
  try { playSound('reward'); } catch (e) {}

  showOverlay('noticePopup');

  const closeNotice = () => {
    if (!_noticeShowing) return;
    hideOverlay('noticePopup');
    _noticeShowing = false;
    if (typeof next.onClose === 'function') {
      try { next.onClose(); } catch (e) {}
    }
    // 다음 큐 처리 (트랜지션 여유)
    setTimeout(_processNoticeQueue, 260);
  };
  // 1회용 핸들러 — 버튼/카드/오버레이 아무 곳이나 탭하면 닫힘
  const btn = $('noticeCta');
  const card = document.querySelector('#noticePopup .popup-notice');
  const overlay = $('noticePopup');

  const onTap = (e) => {
    e.stopPropagation();
    btn.removeEventListener('click', onTap);
    card.removeEventListener('click', onCardTap);
    overlay.removeEventListener('click', onOverlayTap);
    closeNotice();
  };
  const onCardTap = (e) => {
    // 카드 내부 다른 인터랙션 없음 → 아무 탭이나 닫힘
    onTap(e);
  };
  const onOverlayTap = (e) => {
    if (e.target === overlay) onTap(e);
  };
  btn.addEventListener('click', onTap, { once: true });
  card.addEventListener('click', onCardTap, { once: true });
  overlay.addEventListener('click', onOverlayTap, { once: true });
}

function showOfflinePopup(report) {
  if (!report) return;
  const body = $('offlinePopupBody');

  let hours = Math.floor(report.elapsedMin / 60);
  let mins = report.elapsedMin % 60;
  let timeStr = hours > 0 ? hours + '시간 ' + mins + '분' : mins + '분';

  let html = '<div class="stat-row"><span class="stat-label">경과 시간</span><span class="stat-value">' + timeStr + '</span></div>';
  html += '<div class="stat-row"><span class="stat-label">성장 적용 시간</span><span class="stat-value">' + report.growthMin + '분</span></div>';
  html += '<div class="stat-row"><span class="stat-label">획득 성장 XP</span><span class="stat-value">+' + report.xpGained + '</span></div>';
  html += '<div class="stat-row"><span class="stat-label">소모된 물</span><span class="stat-value">-' + report.waterDrain + '</span></div>';

  if (report.stoppedDueToWater) {
    html += '<div class="stat-warning">💧 물이 부족해서 성장이 멈췄어요</div>';
  }

  body.innerHTML = html;
  showOverlay('offlinePopup');
}

// ── Water cooldown UI ───────────────────────
let waterCooldownInterval = null;

function updateWaterCooldown() {
  const btn = $('btnWater');
  const label = $('waterCooldown');
  const now = Date.now();
  const remaining = Math.max(0, (state.lastWaterTime + C.WATER_COOLDOWN) - now);

  if (remaining > 0) {
    btn.classList.add('on-cooldown');
    label.textContent = Math.ceil(remaining / 1000) + 's';
  } else {
    btn.classList.remove('on-cooldown');
    label.textContent = '';
    if (waterCooldownInterval) {
      clearInterval(waterCooldownInterval);
      waterCooldownInterval = null;
    }
  }
}

function startWaterCooldownTimer() {
  updateWaterCooldown();
  if (waterCooldownInterval) clearInterval(waterCooldownInterval);
  waterCooldownInterval = setInterval(updateWaterCooldown, 200);
}

// ── Water action ────────────────────────────
function doWater() {
  const now = Date.now();
  if (now - state.lastWaterTime < C.WATER_COOLDOWN) return;

  state.water = Math.min(C.WATER_MAX, state.water + C.WATER_REFILL);
  state.lastWaterTime = now;
  state.stats.totalWaterings++;
  playSound('water');
  checkUnlocks();
  updateHUD();
  saveState();
  startWaterCooldownTimer();

  // 시각 피드백: 버튼 반짝
  const btn = $('btnWater');
  btn.classList.add('watering');
  setTimeout(() => btn.classList.remove('watering'), 300);

  // 물 파티클
  const scene = window._phaserGame?.scene?.getScene('TreeScene');
  if (scene) {
    const cx = scene.scale.width / 2;
    const groundY = scene.scale.height * 0.72;
    spawnParticles(scene, cx, groundY - 60, 0x5ba4d9, 8, 30);
  }
}

// ── Sky / Weather helpers (Phase D) ─────────
// 실시각 기반 하늘 색 그라디언트 (시뮬레이션 없음)
function lerpHex(c1, c2, t) {
  const r1 = (c1 >> 16) & 0xff, g1 = (c1 >> 8) & 0xff, bl1 = c1 & 0xff;
  const r2 = (c2 >> 16) & 0xff, g2 = (c2 >> 8) & 0xff, bl2 = c2 & 0xff;
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(bl1 + (bl2 - bl1) * t);
  return (r << 16) | (g << 8) | b;
}
// 시간대별 하늘 [상단, 하단] 색상 스톱
const SKY_STOPS = [
  { h: 0,  top: 0x0a1224, bot: 0x1a2545 }, // 심야
  { h: 5,  top: 0x1a1b3a, bot: 0x3a2540 }, // 새벽 전
  { h: 6,  top: 0x4a3560, bot: 0xf5a085 }, // 새벽
  { h: 8,  top: 0x7ebae0, bot: 0xb8dcef }, // 아침
  { h: 12, top: 0x5fa3d8, bot: 0xa5d3ee }, // 정오
  { h: 16, top: 0x6fa8d8, bot: 0xc8dcea }, // 오후
  { h: 18, top: 0xe0874a, bot: 0xf5b580 }, // 노을
  { h: 19, top: 0x52356b, bot: 0xb06a5a }, // 해질녘
  { h: 21, top: 0x1a2048, bot: 0x2c2545 }, // 초저녁
  { h: 24, top: 0x0a1224, bot: 0x1a2545 }, // 심야 (루프)
];
function getSkyColors(hour) {
  const H = ((hour % 24) + 24) % 24;
  let a = SKY_STOPS[0], b = SKY_STOPS[SKY_STOPS.length - 1];
  for (let i = 0; i < SKY_STOPS.length - 1; i++) {
    if (H >= SKY_STOPS[i].h && H <= SKY_STOPS[i + 1].h) {
      a = SKY_STOPS[i]; b = SKY_STOPS[i + 1]; break;
    }
  }
  const span = b.h - a.h || 1;
  const t = (H - a.h) / span;
  return [lerpHex(a.top, b.top, t), lerpHex(a.bot, b.bot, t)];
}
function isNightHour(hour) {
  const H = ((hour % 24) + 24) % 24;
  return H >= 20 || H < 5;
}
function isDayHour(hour) {
  const H = ((hour % 24) + 24) % 24;
  return H >= 7 && H < 18;
}

// 날씨 — 하루 1회 결정, 자정 리셋
function rollWeatherIfNeeded() {
  const today = todayKey();
  if (state.todayWeatherDate === today && state.todayWeather) return state.todayWeather;
  const r = Math.random();
  let w = 'sunny';
  if (r < 0.15) w = 'rainy';
  else if (r < 0.40) w = 'cloudy';
  state.todayWeather = w;
  state.todayWeatherDate = today;
  saveState();
  return w;
}
// 비 오는 날 첫 방문 → Water +10 보너스 (1일 1회)
function applyRainyBonusIfNeeded() {
  if (state.todayWeather !== 'rainy') return false;
  if (state.rainyBonusClaimedDate === state.todayWeatherDate) return false;
  state.water = Math.min(C.WATER_MAX, state.water + 10);
  state.rainyBonusClaimedDate = state.todayWeatherDate;
  // Phase F-2: 비 오는 날 방문 기록 (에스프레소 해금용, 하루 1회만)
  if (!state.rainyVisitDates) state.rainyVisitDates = [];
  const todayW = state.todayWeatherDate;
  if (todayW && !state.rainyVisitDates.includes(todayW)) {
    state.rainyVisitDates.push(todayW);
    // 최근 30개만 유지 (저장 용량 절약)
    if (state.rainyVisitDates.length > 30) {
      state.rainyVisitDates = state.rainyVisitDates.slice(-30);
    }
  }
  saveState();
  return true;
}

// ── Phaser Scene ────────────────────────────
class TreeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TreeScene' });
    this.treeGroup = null;
    this.potGraphics = null;
    this.trunkGraphics = null;
    this.leavesGraphics = null;
    this.isSquashing = false;
    this.drainTimer = 0;       // Water 감소 타이머
    this.autoGrowTimer = 0;    // 자동 성장 타이머
    this.currentStage = -1;    // 현재 그려진 stage (다시 그리기 판단)
  }

  create() {
    // ── 배경 레이어 구조 (bottom → top) ──
    // 1. skyGraphics: 창문 안쪽 하늘 색 (시간대별 그라디언트)
    // 2. skyObjects:  구름/해/달/빗방울 (창문 주변 벽이 자연스럽게 클립)
    // 3. bgGraphics:  벽/창틀/선반/테이블 (창문 주변만 그림)
    this.skyGraphics = this.add.graphics();
    this.skyObjects = this.add.container(0, 0);
    this.bgGraphics = this.add.graphics();

    // 오늘의 날씨 결정
    rollWeatherIfNeeded();

    this.drawSky();
    this.drawBackground();
    this.spawnClouds();
    if (state.todayWeather === 'rainy') this.startRain();

    // 하늘 색 주기적 업데이트 (30초마다 — 실시각 반영)
    this.time.addEvent({
      delay: 30000, loop: true,
      callback: () => this.drawSky(),
    });

    this.treeGroup = this.add.container(0, 0);
    // Phase F-1: 나무 1.4× 스케일업 (존재감 강화)
    this.treeGroup.setScale(1.4, 1.4);

    this.potGraphics = this.add.graphics();
    this.trunkGraphics = this.add.graphics();
    this.leavesShadowGraphics = this.add.graphics(); // Phase F-1 음영
    this.leavesGraphics = this.add.graphics();
    this.leavesHighlightGraphics = this.add.graphics(); // Phase F-1 하이라이트
    this.detailGraphics = this.add.graphics(); // 꽃/체리용

    this.treeGroup.add([
      this.potGraphics,
      this.trunkGraphics,
      this.leavesShadowGraphics,
      this.leavesGraphics,
      this.leavesHighlightGraphics,
      this.detailGraphics,
    ]);

    this.drawTree(true);

    // 펫 (Phase E) — 나무보다 위 레이어
    this.petContainers = {};
    this.refreshPets();

    // 탭 이벤트 — 펫이 먼저 처리되면 나무 탭 억제
    this._petTapConsumed = false;
    this.input.on('pointerdown', (pointer) => {
      if (this._petTapConsumed) {
        this._petTapConsumed = false;
        return;
      }
      this.handleTap(pointer);
    });
  }

  // 창문 영역 (하늘이 보이는 사각형)
  getWindowBounds() {
    const w = this.scale.width;
    const h = this.scale.height;
    return {
      x: w * 0.08,
      y: h * 0.08,
      w: w * 0.84,
      h: h * 0.47,
    };
  }

  update(time, delta) {
    const dt = delta / 1000;

    // 전체 플레이 누적 (Phase F-1)
    state.totalPlaySec = (state.totalPlaySec || 0) + dt;
    if (state.water > 0) {
      state.totalWaterOkSec = (state.totalWaterOkSec || 0) + dt;
      if (state.stage >= 4) {
        state.stage4WaterOkSec = (state.stage4WaterOkSec || 0) + dt;
      }
    }

    // 체리 색 갱신 (Stage 4에서 Ripeness가 천천히 오르므로 가끔만 다시 그림)
    if (state.stage >= 4) {
      this._cherryRedrawTimer = (this._cherryRedrawTimer || 0) + dt;
      if (this._cherryRedrawTimer >= 4) {
        this._cherryRedrawTimer = 0;
        this.drawTree(true);
      }
    }

    // Water 감소 (온라인)
    // Phase F-2: 에스프레소(개구리) 능력 — 맑은 날 Water 감소 -5% (드레인 주기 +5%)
    if (state.water > 0) {
      this.drainTimer += dt;
      let drainInterval = C.WATER_DRAIN_SEC;
      if (state.todayWeather === 'sunny' && state.pets?.espresso?.unlocked) {
        drainInterval = C.WATER_DRAIN_SEC * 1.05;
      }
      if (this.drainTimer >= drainInterval) {
        this.drainTimer -= drainInterval;
        state.water = Math.max(0, state.water - 1);
        updateHUD();
      }
    }

    // 자동 성장
    if (state.water > 0) {
      this.autoGrowTimer += dt;
      if (this.autoGrowTimer >= 60) {
        this.autoGrowTimer -= 60;
        state.growthXp += C.AUTO_XP_PER_MIN;
        const newStage = getStage(state.growthXp);
        if (updateStage(newStage)) {
          this.drawTree(true);
        }
        updateHUD();
        saveState();
      }
    }

    // Stage 변화 확인 (탭으로 인한)
    if (state.stage !== this.currentStage) {
      this.drawTree(true);
    }

    // 자동 저장 (30초마다)
    if (!this._autoSaveTimer) this._autoSaveTimer = 0;
    this._autoSaveTimer += dt;
    if (this._autoSaveTimer >= 30) {
      this._autoSaveTimer = 0;
      saveState();
    }
  }

  handleTap(pointer) {
    // 원두 포인트 (항상)
    state.beanPoints += C.TAP_BEANS;
    state.stats.totalTaps++;
    state.stats.totalBeansEarned += C.TAP_BEANS;
    playSound('tap');

    // 성장 XP (Water > 0일 때만)
    if (state.water > 0) {
      state.growthXp += C.TAP_XP;
      const newStage = getStage(state.growthXp);
      updateStage(newStage); // 전환 시 팝업 + 사운드 담당
    }

    checkUnlocks();
    updateHUD();
    saveState();

    // Squash & stretch 연출
    this.squashTree();

    // 플로팅 텍스트
    const canvasRect = $('gameCanvasArea').getBoundingClientRect();
    const fx = pointer.x * (canvasRect.width / this.scale.width);
    const fy = pointer.y * (canvasRect.height / this.scale.height) - 20;
    const text = state.water > 0 ? '+1 ☕' : '+1 ☕';
    showFloatingText(text, fx, fy);

    // 잎 반응 (작은 흔들림)
    this.shakeLeavesEffect();

    // 탭 파티클
    const cx = this.scale.width / 2;
    const groundY = this.scale.height * 0.72;
    spawnParticles(this, cx, groundY - 80, 0xc8aa6e, 3, 20);
  }

  squashTree() {
    if (this.isSquashing) return;
    this.isSquashing = true;

    this.tweens.add({
      targets: this.treeGroup,
      scaleX: { from: 1, to: 0.9 },
      scaleY: { from: 1, to: 1.1 },
      duration: 80,
      yoyo: true,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.treeGroup.setScale(1, 1);
        this.isSquashing = false;
      }
    });
  }

  shakeLeavesEffect() {
    if (!this.leavesGraphics) return;
    this.tweens.add({
      targets: this.leavesGraphics,
      x: { from: -3, to: 3 },
      duration: 60,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.leavesGraphics.x = 0;
      }
    });
  }

  drawBackground() {
    const g = this.bgGraphics;
    const w = this.scale.width;
    const h = this.scale.height;
    const win = this.getWindowBounds();
    g.clear();

    // 벽은 창문을 "ㅁ자"로 둘러싸는 4개 스트립으로 그림
    // → 창문 바깥으로 나간 구름/빗방울이 자연스럽게 가려짐
    const wallColor = 0x2a1f16;
    const shelfY = h * 0.62;
    g.fillStyle(wallColor);
    g.fillRect(0, 0, win.x, h);                                     // 좌측 벽
    g.fillRect(win.x + win.w, 0, w - (win.x + win.w), h);           // 우측 벽
    g.fillRect(win.x, 0, win.w, win.y);                              // 창문 위 벽
    g.fillRect(win.x, win.y + win.h, win.w, shelfY - (win.y + win.h)); // 창문 아래 벽

    // 벽 질감 — 가로 패널 선 (창문 바깥 영역에만)
    g.lineStyle(1, 0x352a20, 0.3);
    for (let y = 0; y < shelfY; y += 24) {
      // 좌측
      g.lineBetween(0, y, win.x, y);
      // 우측
      g.lineBetween(win.x + win.w, y, w, y);
      // 창문 위
      if (y < win.y) g.lineBetween(win.x, y, win.x + win.w, y);
      // 창문 아래
      if (y > win.y + win.h && y < shelfY) g.lineBetween(win.x, y, win.x + win.w, y);
    }

    // 창틀 (나무 프레임)
    const frameColor = 0x3d2a1c;
    const frameLight = 0x5a4030;
    const ft = 5; // 프레임 두께
    g.fillStyle(frameColor);
    g.fillRect(win.x - ft, win.y - ft, win.w + ft * 2, ft);          // 상단
    g.fillRect(win.x - ft, win.y + win.h, win.w + ft * 2, ft);       // 하단
    g.fillRect(win.x - ft, win.y - ft, ft, win.h + ft * 2);          // 좌측
    g.fillRect(win.x + win.w, win.y - ft, ft, win.h + ft * 2);       // 우측
    // 상단 하이라이트 (빛 들어오는 방향)
    g.fillStyle(frameLight, 0.4);
    g.fillRect(win.x - ft, win.y - ft, win.w + ft * 2, 2);
    // 십자 창살
    g.fillStyle(frameColor);
    g.fillRect(win.x, win.y + win.h / 2 - 2, win.w, 4);
    g.fillRect(win.x + win.w / 2 - 2, win.y, 4, win.h);
    // 프레임 외곽 어두운 선
    g.lineStyle(1, 0x1a120a, 0.7);
    g.strokeRect(win.x - ft, win.y - ft, win.w + ft * 2, win.h + ft * 2);

    // 창문턱 (선반 위 좁은 턱)
    g.fillStyle(0x5a4030);
    g.fillRect(win.x - ft - 4, win.y + win.h + ft, win.w + ft * 2 + 8, 3);

    // 선반 (창문 아래 카페 선반)
    g.fillStyle(0x5a4030);
    g.fillRect(0, shelfY, w, 6);
    g.fillStyle(0x4a3525);
    g.fillRect(0, shelfY + 6, w, 3);

    // 선반 위 소품 — 커피잔
    const cupX = w * 0.18;
    g.fillStyle(0xd4c4a8);
    g.fillRect(cupX, shelfY - 12, 10, 12);
    g.fillStyle(0xc0a880);
    g.fillRect(cupX - 1, shelfY - 13, 12, 3);
    g.fillStyle(0x5a3a20);
    g.fillRect(cupX + 1, shelfY - 11, 8, 4);

    // 선반 위 소품 — 책
    const bookX = w * 0.78;
    g.fillStyle(0x8b4513);
    g.fillRect(bookX, shelfY - 16, 8, 16);
    g.fillStyle(0xa05520);
    g.fillRect(bookX + 10, shelfY - 14, 7, 14);

    // 테이블
    const floorY = h * 0.72;
    g.fillStyle(0x5a4535);
    g.fillRect(0, floorY, w, 8);
    g.fillStyle(0x4a3828);
    g.fillRect(0, floorY + 8, w, h - floorY - 8);

    // 테이블 나무 결
    g.lineStyle(1, 0x3d2d20, 0.25);
    for (let y = floorY + 14; y < h; y += 16) {
      g.lineBetween(0, y, w, y);
    }

    // 창문에서 흘러드는 은은한 빛 (테이블에 반사)
    g.fillStyle(0xffeedd, 0.04);
    g.fillCircle(w / 2, floorY, w * 0.45);
  }

  // ── Sky (창문 안쪽 하늘) ─────────────────
  drawSky() {
    const g = this.skyGraphics;
    const win = this.getWindowBounds();
    g.clear();

    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;
    const [topColor, bottomColor] = getSkyColors(hour);

    // 그라디언트 — 20개 가로 스트라이프로 흉내 (Graphics에는 gradient fill이 없음)
    const steps = 20;
    const stripH = Math.ceil(win.h / steps) + 1;
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const color = lerpHex(topColor, bottomColor, t);
      g.fillStyle(color);
      g.fillRect(win.x, win.y + (win.h * i) / steps, win.w, stripH);
    }

    // 별 (밤 시간만)
    if (isNightHour(hour)) {
      if (!this._stars) {
        this._stars = [];
        for (let i = 0; i < 14; i++) {
          this._stars.push({
            x: win.x + Phaser.Math.Between(10, win.w - 10),
            y: win.y + Phaser.Math.Between(8, win.h * 0.55),
            r: Phaser.Math.FloatBetween(0.8, 1.6),
          });
        }
      }
      g.fillStyle(0xffffff, 0.9);
      this._stars.forEach(s => g.fillCircle(s.x, s.y, s.r));
    }

    // 해 (낮) / 달 (밤)
    const sunX = win.x + win.w * 0.78;
    const sunY = win.y + win.h * 0.22;
    if (isDayHour(hour)) {
      // 햇무리 + 본체
      g.fillStyle(0xffe58a, 0.35);
      g.fillCircle(sunX, sunY, 26);
      g.fillStyle(0xfff0a0, 0.9);
      g.fillCircle(sunX, sunY, 16);
    } else if (hour >= 18 && hour < 20) {
      // 해질녘 — 지평선 근처 해
      g.fillStyle(0xffb070, 0.5);
      g.fillCircle(sunX, win.y + win.h * 0.55, 28);
      g.fillStyle(0xffd080, 0.85);
      g.fillCircle(sunX, win.y + win.h * 0.55, 18);
    } else {
      // 달
      g.fillStyle(0xffffff, 0.12);
      g.fillCircle(sunX, sunY, 22);
      g.fillStyle(0xfff8e0, 0.88);
      g.fillCircle(sunX, sunY, 13);
      // 초승달 느낌 — 반쪽 어둡게
      const [topC] = getSkyColors(hour);
      g.fillStyle(topC, 0.9);
      g.fillCircle(sunX + 5, sunY - 1, 12);
    }
  }

  // ── Clouds (구름) ───────────────────────
  _createCloudSprite(weather) {
    const c = this.add.container(0, 0);
    const alpha = weather === 'rainy' ? 0.55 : 0.85;
    const color = weather === 'rainy' ? 0xb8b8c0 : 0xffffff;
    const s = Phaser.Math.FloatBetween(0.75, 1.25);
    c.add(this.add.ellipse(-18 * s, 0, 38 * s, 20 * s, color, alpha));
    c.add(this.add.ellipse(0, -7 * s, 34 * s, 21 * s, color, alpha));
    c.add(this.add.ellipse(17 * s, 3 * s, 32 * s, 18 * s, color, alpha));
    return c;
  }

  spawnClouds() {
    // 기존 구름 정리
    if (this._clouds) this._clouds.forEach(c => { try { c.destroy(); } catch (e) {} });
    this._clouds = [];

    const win = this.getWindowBounds();
    const weather = state.todayWeather || 'sunny';
    const cloudCount = weather === 'sunny' ? 2 : (weather === 'cloudy' ? 5 : 4);

    for (let i = 0; i < cloudCount; i++) {
      const cloud = this._createCloudSprite(weather);
      const y = win.y + win.h * Phaser.Math.FloatBetween(0.08, 0.5);
      const startX = win.x - 70;
      const endX = win.x + win.w + 70;
      const duration = Phaser.Math.Between(45000, 75000);
      // 초기 위치는 경로 어딘가에서 시작
      const initialX = Phaser.Math.FloatBetween(startX, endX);
      cloud.setPosition(initialX, y);
      this.skyObjects.add(cloud);
      this._clouds.push(cloud);

      // 남은 거리만큼 첫 트윈, 끝나면 startX로 돌아가서 반복 루프
      const progress = (initialX - startX) / (endX - startX);
      const firstDur = Math.max(500, duration * (1 - progress));
      this.tweens.add({
        targets: cloud,
        x: endX,
        duration: firstDur,
        ease: 'Linear',
        onComplete: () => {
          cloud.x = startX;
          this.tweens.add({
            targets: cloud,
            x: endX,
            duration,
            ease: 'Linear',
            loop: -1,
          });
        },
      });
    }
  }

  // ── Rain (비) ───────────────────────────
  startRain() {
    if (this._rainTimer) return;
    const win = this.getWindowBounds();
    this._rainTimer = this.time.addEvent({
      delay: 70,
      loop: true,
      callback: () => {
        const x = Phaser.Math.Between(win.x, win.x + win.w);
        const drop = this.add.rectangle(x, win.y, 1, 9, 0x9ec0d8, 0.7);
        this.skyObjects.add(drop);
        this.tweens.add({
          targets: drop,
          y: win.y + win.h + 10,
          duration: 700,
          ease: 'Linear',
          onComplete: () => { try { drop.destroy(); } catch (e) {} },
        });
      },
    });
  }

  stopRain() {
    if (this._rainTimer) {
      this._rainTimer.remove();
      this._rainTimer = null;
    }
  }

  drawTree(force) {
    if (!force && this.currentStage === state.stage) return;
    this.currentStage = state.stage;

    const w = this.scale.width;
    const h = this.scale.height;
    const cx = w / 2;
    const groundY = h * 0.72; // 테이블 위에 화분

    this.treeGroup.setPosition(cx, groundY);

    this.potGraphics.clear();
    this.trunkGraphics.clear();
    this.leavesGraphics.clear();
    if (this.leavesShadowGraphics) this.leavesShadowGraphics.clear();
    if (this.leavesHighlightGraphics) this.leavesHighlightGraphics.clear();
    this.detailGraphics.clear();

    const isDry = state.water <= 0;
    const leafColor = isDry ? 0x7a8a60 : 0x5da35a;
    const leafColorLight = isDry ? 0x8a9a70 : 0x7bc478;
    const leafShadow = isDry ? 0x4a5a30 : 0x3d6b3a; // Phase F-1 음영
    const leafHi = isDry ? 0xa0b078 : 0x9bd88c;     // Phase F-1 하이라이트
    const trunkColor = isDry ? 0x6a5040 : 0x7a5c3a;
    const trunkShadow = isDry ? 0x4a3520 : 0x553a20;

    // 화분 색상 (장착 화분에 따라)
    let potColor = 0xb07040;
    let potDark = 0x8a5530;
    if (state.equippedPotId === 'pot_cafe_brown') {
      potColor = 0x6b4226;
      potDark = 0x4a2e1a;
    } else if (state.equippedPotId === 'pot_drip_pattern') {
      potColor = 0x8899aa;
      potDark = 0x667788;
    }
    const soilColor = 0x4a3520;

    // ── 화분 ──
    const potW = 56;
    const potH = 44;
    const potTopW = 60;
    const potRim = 6;

    this.potGraphics.fillStyle(potColor);
    this.potGraphics.fillRect(-potW / 2, -potH, potW, potH);
    // Phase F-1: 좌측 음영 + 우측 하이라이트
    this.potGraphics.fillStyle(potDark, 0.55);
    this.potGraphics.fillRect(-potW / 2, -potH, 4, potH);
    this.potGraphics.fillStyle(0xffffff, 0.10);
    this.potGraphics.fillRect(potW / 2 - 4, -potH + 2, 3, potH - 4);
    this.potGraphics.fillStyle(potDark);
    this.potGraphics.fillRect(-potTopW / 2, -potH - potRim, potTopW, potRim);
    // 림 윗면 하이라이트
    this.potGraphics.fillStyle(0xffffff, 0.18);
    this.potGraphics.fillRect(-potTopW / 2 + 1, -potH - potRim, potTopW - 2, 1);
    this.potGraphics.fillStyle(potDark);
    this.potGraphics.fillRect(-potW / 2 + 6, -2, potW - 12, 4);
    this.potGraphics.fillStyle(soilColor);
    this.potGraphics.fillRect(-potW / 2 + 3, -potH + 2, potW - 6, 10);
    // 흙 어두운 음영
    this.potGraphics.fillStyle(0x000000, 0.25);
    this.potGraphics.fillRect(-potW / 2 + 3, -potH + 2, potW - 6, 2);

    // 드립 패턴 화분 장식
    if (state.equippedPotId === 'pot_drip_pattern') {
      this.potGraphics.lineStyle(1, 0xaabbcc, 0.5);
      for (let i = -20; i <= 20; i += 10) {
        this.potGraphics.lineBetween(i, -potH + 14, i, -8);
      }
    }

    // 장착 장식 (화분 옆)
    if (state.equippedDecorId === 'decor_spoon_small') {
      this.detailGraphics.fillStyle(0xccbbaa);
      this.detailGraphics.fillRect(potW / 2 + 6, -potH + 4, 3, 28);
      this.detailGraphics.fillEllipse(potW / 2 + 7, -potH + 2, 6, 5);
    } else if (state.equippedDecorId === 'decor_bean_sack_mini') {
      this.detailGraphics.fillStyle(0x8b7355);
      this.detailGraphics.fillRect(-potW / 2 - 18, -20, 14, 18);
      this.detailGraphics.fillStyle(0x7a6348);
      this.detailGraphics.fillRect(-potW / 2 - 17, -22, 12, 4);
    }

    // ── Stage별 나무 ──
    const drawBigTree = (stemH) => {
      // 줄기 음영 (왼쪽)
      this.trunkGraphics.fillStyle(trunkShadow);
      this.trunkGraphics.fillRect(-4, -potH - stemH, 3, stemH);
      this.trunkGraphics.fillStyle(trunkColor);
      this.trunkGraphics.fillRect(-1, -potH - stemH, 5, stemH);
      // 가지
      this.trunkGraphics.fillRect(-26, -potH - stemH + 14, 24, 4);
      this.trunkGraphics.fillRect(4, -potH - stemH + 24, 26, 4);
      this.trunkGraphics.fillRect(-20, -potH - stemH + 38, 18, 3);
      this.trunkGraphics.fillRect(4, -potH - stemH + 46, 16, 3);
      // 가지 음영
      this.trunkGraphics.fillStyle(trunkShadow, 0.6);
      this.trunkGraphics.fillRect(-26, -potH - stemH + 14, 24, 1);
      this.trunkGraphics.fillRect(4, -potH - stemH + 24, 26, 1);

      // 잎 — 음영(아래) → 본체 → 하이라이트(위)
      const sg = this.leavesShadowGraphics;
      const lg = this.leavesGraphics;
      const hg = this.leavesHighlightGraphics;

      // Shadow layer (아래쪽으로 살짝 오프셋)
      sg.fillStyle(leafShadow, 0.55);
      sg.fillEllipse(2, -potH - stemH - 4, 52, 30);
      sg.fillEllipse(-14, -potH - stemH + 8, 36, 24);
      sg.fillEllipse(18, -potH - stemH + 6, 36, 24);
      sg.fillEllipse(-30, -potH - stemH + 14, 20, 12);
      sg.fillEllipse(32, -potH - stemH + 24, 20, 12);

      // Main leaves
      lg.fillStyle(leafColor);
      lg.fillEllipse(0, -potH - stemH - 6, 50, 30);
      lg.fillEllipse(-16, -potH - stemH + 6, 36, 24);
      lg.fillEllipse(16, -potH - stemH + 4, 36, 24);
      lg.fillStyle(leafColorLight);
      lg.fillEllipse(-6, -potH - stemH - 12, 32, 20);
      lg.fillEllipse(10, -potH - stemH - 2, 28, 18);
      lg.fillStyle(leafColor);
      lg.fillEllipse(-30, -potH - stemH + 12, 20, 12);
      lg.fillEllipse(32, -potH - stemH + 22, 20, 12);
      lg.fillEllipse(-22, -potH - stemH + 36, 16, 10);
      lg.fillEllipse(22, -potH - stemH + 44, 14, 10);

      // Highlight (위쪽 + 작은 광택)
      hg.fillStyle(leafHi, 0.55);
      hg.fillEllipse(-4, -potH - stemH - 14, 22, 10);
      hg.fillEllipse(8, -potH - stemH - 6, 18, 8);
      hg.fillEllipse(-12, -potH - stemH + 2, 12, 6);
      hg.fillEllipse(14, -potH - stemH + 1, 12, 6);
    };

    if (state.stage === 0) {
      // Stage 1: 새싹
      const stemH = 28;
      this.trunkGraphics.fillStyle(trunkColor);
      this.trunkGraphics.fillRect(-2, -potH - stemH, 4, stemH);
      this.leavesGraphics.fillStyle(leafColor);
      this.leavesGraphics.fillEllipse(-10, -potH - stemH + 4, 14, 8);
      this.leavesGraphics.fillStyle(leafColorLight);
      this.leavesGraphics.fillEllipse(10, -potH - stemH + 2, 14, 8);
      this.leavesGraphics.fillStyle(leafColor);
      this.leavesGraphics.fillEllipse(0, -potH - stemH - 4, 10, 8);
      if (isDry) this.leavesGraphics.setAngle(8);
      else this.leavesGraphics.setAngle(0);

    } else if (state.stage === 1) {
      // Stage 2: 어린 묘목
      const stemH = 50;
      this.trunkGraphics.fillStyle(trunkColor);
      this.trunkGraphics.fillRect(-3, -potH - stemH, 6, stemH);
      this.trunkGraphics.fillRect(-18, -potH - stemH + 14, 16, 3);
      this.trunkGraphics.fillRect(3, -potH - stemH + 22, 18, 3);
      this.leavesGraphics.fillStyle(leafColor);
      this.leavesGraphics.fillEllipse(-22, -potH - stemH + 10, 16, 10);
      this.leavesGraphics.fillEllipse(24, -potH - stemH + 18, 16, 10);
      this.leavesGraphics.fillStyle(leafColorLight);
      this.leavesGraphics.fillEllipse(-8, -potH - stemH - 4, 18, 12);
      this.leavesGraphics.fillEllipse(8, -potH - stemH - 2, 16, 10);
      this.leavesGraphics.fillStyle(leafColor);
      this.leavesGraphics.fillEllipse(0, -potH - stemH - 10, 14, 10);
      if (isDry) this.leavesGraphics.setAngle(6);
      else this.leavesGraphics.setAngle(0);

    } else if (state.stage === 2) {
      // Stage 3: 작은 커피나무
      drawBigTree(68);
      if (isDry) this.leavesGraphics.setAngle(5);
      else this.leavesGraphics.setAngle(0);

    } else if (state.stage === 3) {
      // Stage 4: 꽃 단계 — 나무 + 흰/분홍 꽃
      const stemH = 76;
      drawBigTree(stemH);

      // 꽃들 (수관 위에 분홍/흰 점)
      const flowerColor = 0xffc0cb;
      const flowerWhite = 0xfff0f5;
      const flowers = [
        [-14, -potH - stemH - 14], [12, -potH - stemH - 10],
        [-24, -potH - stemH],      [20, -potH - stemH + 2],
        [-6, -potH - stemH - 20],  [4, -potH - stemH + 8],
        [-18, -potH - stemH + 10], [28, -potH - stemH + 14],
      ];
      flowers.forEach(([fx, fy], i) => {
        this.detailGraphics.fillStyle(i % 2 === 0 ? flowerColor : flowerWhite);
        this.detailGraphics.fillCircle(fx, fy, 4);
        this.detailGraphics.fillStyle(0xffeb3b, 0.8); // 꽃 중심 (노란 점)
        this.detailGraphics.fillCircle(fx, fy, 1.5);
      });

      if (isDry) this.leavesGraphics.setAngle(4);
      else this.leavesGraphics.setAngle(0);

    } else if (state.stage >= 4) {
      // Stage 5: 커피 체리 — 나무 + 열매 (Ripeness에 따라 녹→노→빨강)
      const stemH = 80;
      drawBigTree(stemH);

      // Phase F-1: Ripeness에 따른 색상 lerp
      // 0    → 녹색 (덜 익음)
      // 0.5  → 노랑/주황
      // 1.0  → 빨강 (완숙)
      const ripe = getRipeness();
      const greenC = 0x4d8a3a;
      const yellowC = 0xd9b042;
      const redC = 0xcc3333;
      let cherryMain;
      if (ripe < 0.5) {
        cherryMain = lerpHex(greenC, yellowC, ripe / 0.5);
      } else {
        cherryMain = lerpHex(yellowC, redC, (ripe - 0.5) / 0.5);
      }
      // 어두운 음영 — 메인보다 약 30% 어둡게
      const r0 = (cherryMain >> 16) & 0xff;
      const g0 = (cherryMain >> 8) & 0xff;
      const b0 = cherryMain & 0xff;
      const cherryDark = (Math.floor(r0 * 0.7) << 16) | (Math.floor(g0 * 0.7) << 8) | Math.floor(b0 * 0.7);
      const cherryHi = lerpHex(cherryMain, 0xffffff, 0.4);

      const cherries = [
        [-12, -potH - stemH + 4],  [16, -potH - stemH + 8],
        [-22, -potH - stemH + 16], [26, -potH - stemH + 20],
        [-8, -potH - stemH + 26],  [10, -potH - stemH + 30],
        [-28, -potH - stemH + 32], [20, -potH - stemH + 38],
        [0, -potH - stemH - 4],    [-16, -potH - stemH + 42],
      ];
      cherries.forEach(([cx, cy], i) => {
        // 음영 (살짝 아래/우측)
        this.detailGraphics.fillStyle(cherryDark, 0.85);
        this.detailGraphics.fillEllipse(cx + 0.5, cy + 1, 6, 7);
        // 본체
        this.detailGraphics.fillStyle(cherryMain);
        this.detailGraphics.fillEllipse(cx, cy, 6, 7);
        // 하이라이트
        this.detailGraphics.fillStyle(cherryHi, 0.7);
        this.detailGraphics.fillCircle(cx - 1, cy - 2, 1.6);
      });

      if (isDry) this.leavesGraphics.setAngle(3);
      else this.leavesGraphics.setAngle(0);
    }
  }

  // ── Pets (Phase E) ──────────────────────
  // 해금된 펫을 씬에 그리거나 제거. 해금 시 / 리사이즈 시 호출.
  refreshPets() {
    if (!this.petContainers) this.petContainers = {};
    // 기존 펫 제거
    Object.values(this.petContainers).forEach(c => { try { c.destroy(); } catch (e) {} });
    this.petContainers = {};

    if (state.pets?.crema?.unlocked) {
      this.petContainers.crema = this._createSparrow();
      this._startBirdIdle(this.petContainers.crema);
    }
    if (state.pets?.cappu?.unlocked) {
      this.petContainers.cappu = this._createCat();
      this._startCatIdle(this.petContainers.cappu);
    }
    if (state.pets?.americano?.unlocked) {
      this.petContainers.americano = this._createSquirrel();
      this._startSquirrelIdle(this.petContainers.americano);
    }
    if (state.pets?.espresso?.unlocked) {
      this.petContainers.espresso = this._createFrog();
      this._startFrogIdle(this.petContainers.espresso);
    }
  }

  // 참새(크레마) — 창문턱 오른쪽에 앉음
  _createSparrow() {
    const win = this.getWindowBounds();
    const x = win.x + win.w * 0.82;
    const y = win.y + win.h + 3; // 창문턱 바로 위
    const c = this.add.container(x, y);

    const body = this.add.graphics();
    // 몸 음영 (Phase F-1)
    body.fillStyle(0x4a2a10, 0.55);
    body.fillEllipse(1, -3, 12, 8);
    // 몸 (갈색 타원)
    body.fillStyle(0x8b5a2b);
    body.fillEllipse(0, -4, 12, 8);
    // 머리
    body.fillStyle(0x6b3f1d);
    body.fillCircle(-5, -7, 4);
    // 머리 하이라이트
    body.fillStyle(0xa57040, 0.5);
    body.fillCircle(-5, -8, 2);
    // 배 (밝은 베이지)
    body.fillStyle(0xe8c99a);
    body.fillEllipse(1, -2, 7, 5);
    // 배 하이라이트
    body.fillStyle(0xfff0d0, 0.6);
    body.fillEllipse(1, -3, 4, 2);
    // 부리 (노랑)
    body.fillStyle(0xf5b02e);
    body.fillTriangle(-9, -7, -11, -6, -9, -5);
    // 눈
    body.fillStyle(0x000000);
    body.fillCircle(-6, -8, 0.8);
    // 꼬리
    body.fillStyle(0x5a331a);
    body.fillTriangle(4, -5, 8, -7, 8, -3);
    // 다리 (가는 선)
    body.lineStyle(1, 0x3a2210, 1);
    body.lineBetween(-3, 0, -3, 3);
    body.lineBetween(1, 0, 1, 3);

    c.add(body);
    // Phase F-1: 1.7× 스케일업
    c.setScale(1.7);
    c.setSize(22 * 1.7, 16 * 1.7);
    c.setInteractive(
      new Phaser.Geom.Rectangle(-11, -12, 22, 18),
      Phaser.Geom.Rectangle.Contains
    );
    c.on('pointerdown', () => {
      this._petTapConsumed = true;
      this.onPetTap('crema', c);
    });
    return c;
  }

  // 고양이(카푸치노) — 테이블 위 왼쪽에 앉음
  _createCat() {
    const w = this.scale.width;
    const h = this.scale.height;
    const floorY = h * 0.72;
    const x = w * 0.2;
    const y = floorY - 4; // 테이블 위
    const c = this.add.container(x, y);

    const body = this.add.graphics();
    // 몸 음영 (Phase F-1)
    body.fillStyle(0x6b4f30, 0.5);
    body.fillEllipse(1, -5, 22, 14);
    // 몸 (회갈색 타원, 앉은 자세)
    body.fillStyle(0xaa8866);
    body.fillEllipse(0, -6, 22, 14);
    // 등 하이라이트
    body.fillStyle(0xc8a382, 0.6);
    body.fillEllipse(0, -10, 16, 4);
    // 머리
    body.fillStyle(0xaa8866);
    body.fillCircle(-9, -13, 6);
    // 머리 하이라이트
    body.fillStyle(0xc8a382, 0.55);
    body.fillCircle(-10, -15, 3);
    // 귀 (삼각형 2개)
    body.fillTriangle(-13, -19, -10, -14, -14, -13);
    body.fillTriangle(-8, -19, -5, -14, -9, -13);
    // 귀 안쪽 (분홍)
    body.fillStyle(0xe8a998);
    body.fillTriangle(-12, -17, -10, -14, -13, -14);
    // 얼굴 줄무늬
    body.fillStyle(0x7a5a3a);
    body.fillRect(-11, -17, 1, 3);
    body.fillRect(-8, -17, 1, 3);
    // 눈 (감은 — 반달)
    body.lineStyle(1, 0x000000, 1);
    body.lineBetween(-11, -13, -9, -13);
    body.lineBetween(-8, -13, -6, -13);
    // 코
    body.fillStyle(0xe8a998);
    body.fillTriangle(-9, -11, -10, -10, -8, -10);
    // 앞발
    body.fillStyle(0xc0a080);
    body.fillRect(-5, -2, 3, 3);
    body.fillRect(0, -2, 3, 3);
    // 꼬리 (container 밖에서 sway 애니메이션하려고 별도)
    const tail = this.add.graphics();
    tail.fillStyle(0xaa8866);
    tail.fillEllipse(12, -5, 10, 3);
    tail.fillEllipse(16, -7, 6, 3);
    // 꼬리 끝 밝게
    tail.fillStyle(0xc0a080);
    tail.fillCircle(17, -7, 1.8);

    c.add(body);
    c.add(tail);
    c._tail = tail;
    // Phase F-1: 1.7× 스케일업
    c.setScale(1.7);
    c.setSize(30 * 1.7, 22 * 1.7);
    c.setInteractive(
      new Phaser.Geom.Rectangle(-15, -20, 30, 22),
      Phaser.Geom.Rectangle.Contains
    );
    c.on('pointerdown', () => {
      this._petTapConsumed = true;
      this.onPetTap('cappu', c);
    });
    return c;
  }

  // Phase F-2: 다람쥐(아메리카노) — 창문턱 왼쪽에 앉음 (크레마는 오른쪽)
  _createSquirrel() {
    const win = this.getWindowBounds();
    const x = win.x + win.w * 0.18;
    const y = win.y + win.h + 3; // 창문턱 바로 위
    const c = this.add.container(x, y);

    const body = this.add.graphics();
    // 몸 음영
    body.fillStyle(0x5a3010, 0.55);
    body.fillEllipse(1, -3, 14, 10);
    // 몸 (적갈색 타원)
    body.fillStyle(0xa9622a);
    body.fillEllipse(0, -4, 14, 10);
    // 등 하이라이트
    body.fillStyle(0xd08b48, 0.55);
    body.fillEllipse(0, -7, 9, 3);
    // 머리
    body.fillStyle(0x8c4a1c);
    body.fillCircle(-6, -8, 4.5);
    // 머리 하이라이트
    body.fillStyle(0xc28049, 0.6);
    body.fillCircle(-7, -9, 2);
    // 배 (밝은 베이지)
    body.fillStyle(0xf0d4a0);
    body.fillEllipse(2, -2, 8, 5);
    // 배 하이라이트
    body.fillStyle(0xfff0d0, 0.6);
    body.fillEllipse(2, -3, 4, 2);
    // 귀 (작은 둥근 귀)
    body.fillStyle(0x6b3914);
    body.fillCircle(-8, -12, 1.6);
    body.fillCircle(-4, -12, 1.6);
    // 귀 안쪽
    body.fillStyle(0xe8a998);
    body.fillCircle(-8, -12, 0.8);
    body.fillCircle(-4, -12, 0.8);
    // 눈
    body.fillStyle(0x000000);
    body.fillCircle(-7, -8, 0.9);
    // 코
    body.fillStyle(0x2a1810);
    body.fillCircle(-9, -7, 0.6);
    // 앞발 (작은 손) — 도토리를 쥔 자세
    body.fillStyle(0x8c4a1c);
    body.fillCircle(-3, -1, 1.4);
    // 도토리
    body.fillStyle(0x7a4a1a);
    body.fillCircle(-3, -3, 1.6);
    body.fillStyle(0x4a2a10);
    body.fillRect(-4, -5, 2, 1.2);
    // 다리
    body.lineStyle(1, 0x3a2008, 1);
    body.lineBetween(-3, 1, -3, 3);
    body.lineBetween(2, 1, 2, 3);
    // 꼬리 (별도 — 살랑살랑)
    const tail = this.add.graphics();
    tail.fillStyle(0xa9622a);
    tail.fillEllipse(8, -8, 8, 12);
    tail.fillStyle(0xd08b48, 0.6);
    tail.fillEllipse(8, -10, 5, 6);
    tail.fillStyle(0x6b3914);
    tail.fillEllipse(8, -4, 6, 4);

    c.add(tail);
    c.add(body);
    c._tail = tail;
    // Phase F-2: 1.7× 스케일업
    c.setScale(1.7);
    c.setSize(24 * 1.7, 22 * 1.7);
    c.setInteractive(
      new Phaser.Geom.Rectangle(-12, -16, 24, 22),
      Phaser.Geom.Rectangle.Contains
    );
    c.on('pointerdown', () => {
      this._petTapConsumed = true;
      this.onPetTap('americano', c);
    });
    return c;
  }

  // Phase F-2: 개구리(에스프레소) — 화분 오른쪽에 앉음
  _createFrog() {
    const w = this.scale.width;
    const h = this.scale.height;
    const floorY = h * 0.72;
    const x = w * 0.78;
    const y = floorY + 4; // 화분 옆 바닥
    const c = this.add.container(x, y);

    const body = this.add.graphics();
    // 몸 음영
    body.fillStyle(0x2a4a20, 0.55);
    body.fillEllipse(0, 0, 18, 10);
    // 몸 (녹색 타원)
    body.fillStyle(0x5aa040);
    body.fillEllipse(0, -1, 18, 10);
    // 등 하이라이트
    body.fillStyle(0x8fd060, 0.6);
    body.fillEllipse(0, -3, 12, 4);
    // 배 (옅은 노랑)
    body.fillStyle(0xe0e89a);
    body.fillEllipse(0, 1, 12, 4);
    // 머리 (몸 위에 살짝 솟은 둥근 형태)
    body.fillStyle(0x5aa040);
    body.fillEllipse(0, -6, 14, 8);
    // 머리 하이라이트
    body.fillStyle(0x8fd060, 0.6);
    body.fillEllipse(0, -8, 9, 3);
    // 눈 (튀어나온 두 개)
    body.fillStyle(0x5aa040);
    body.fillCircle(-4, -10, 2.8);
    body.fillCircle(4, -10, 2.8);
    // 눈 흰자
    body.fillStyle(0xfafff0);
    body.fillCircle(-4, -10, 2);
    body.fillCircle(4, -10, 2);
    // 눈동자
    body.fillStyle(0x000000);
    body.fillCircle(-4, -10, 1);
    body.fillCircle(4, -10, 1);
    // 입 (살짝 미소)
    body.lineStyle(1, 0x2a1810, 1);
    body.beginPath();
    body.arc(0, -5, 4, 0.2, Math.PI - 0.2, false);
    body.strokePath();
    // 앞다리
    body.fillStyle(0x4a8830);
    body.fillEllipse(-7, 2, 5, 3);
    body.fillEllipse(7, 2, 5, 3);
    // 발가락 (작은 점 3개씩)
    body.fillStyle(0x3a6820);
    body.fillCircle(-9, 3, 0.6);
    body.fillCircle(-7, 3.5, 0.6);
    body.fillCircle(-5, 3, 0.6);
    body.fillCircle(9, 3, 0.6);
    body.fillCircle(7, 3.5, 0.6);
    body.fillCircle(5, 3, 0.6);

    c.add(body);
    // Phase F-2: 1.7× 스케일업
    c.setScale(1.7);
    c.setSize(20 * 1.7, 18 * 1.7);
    c.setInteractive(
      new Phaser.Geom.Rectangle(-10, -14, 20, 18),
      Phaser.Geom.Rectangle.Contains
    );
    c.on('pointerdown', () => {
      this._petTapConsumed = true;
      this.onPetTap('espresso', c);
    });
    return c;
  }

  _startSquirrelIdle(container) {
    // 작은 호흡
    const baseY = container.y;
    this.tweens.add({
      targets: container,
      y: baseY - 1.2,
      duration: 1600,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
    // 꼬리 살랑 — y 위치
    if (container._tail) {
      this.tweens.add({
        targets: container._tail,
        y: { from: 0, to: -1.5 },
        duration: 1500,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });
    }
    // 가끔 깡충
    const hop = () => {
      if (!container.active) return;
      this.tweens.add({
        targets: container,
        y: baseY - 4,
        duration: 180,
        ease: 'Quad.easeOut',
        yoyo: true,
        onComplete: () => {
          this.time.delayedCall(Phaser.Math.Between(7000, 14000), hop);
        },
      });
    };
    this.time.delayedCall(Phaser.Math.Between(5000, 9000), hop);
  }

  _startFrogIdle(container) {
    // 호흡 — 배가 부풀어 오르는 느낌 (scaleY)
    const baseScaleY = container.scaleY;
    this.tweens.add({
      targets: container,
      scaleY: baseScaleY * 1.04,
      duration: 1800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
    // 가끔 폴짝 (작은 점프)
    const baseY = container.y;
    const jump = () => {
      if (!container.active) return;
      this.tweens.add({
        targets: container,
        y: baseY - 6,
        duration: 220,
        ease: 'Quad.easeOut',
        yoyo: true,
        onComplete: () => {
          this.time.delayedCall(Phaser.Math.Between(8000, 16000), jump);
        },
      });
    };
    this.time.delayedCall(Phaser.Math.Between(6000, 10000), jump);
  }

  _startBirdIdle(container) {
    // 작은 호흡 — 위아래 1px
    const baseY = container.y;
    this.tweens.add({
      targets: container,
      y: baseY - 1.5,
      duration: 1400,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
    // 가끔 살짝 깡충 뛰기
    const hop = () => {
      if (!container.active) return;
      this.tweens.add({
        targets: container,
        y: baseY - 5,
        duration: 150,
        ease: 'Quad.easeOut',
        yoyo: true,
        onComplete: () => {
          this.time.delayedCall(Phaser.Math.Between(6000, 12000), hop);
        },
      });
    };
    this.time.delayedCall(Phaser.Math.Between(4000, 8000), hop);
  }

  _startCatIdle(container) {
    // 호흡 (몸 미세하게 부풀기) — 베이스 스케일 기준으로 yoyo
    const baseScaleY = container.scaleY;
    this.tweens.add({
      targets: container,
      scaleY: baseScaleY * 1.03,
      duration: 2500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
    // 꼬리 살랑 — angle이 아니라 x 위치 살짝 흔들기
    if (container._tail) {
      this.tweens.add({
        targets: container._tail,
        x: { from: -1, to: 2 },
        duration: 1800,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });
    }
  }

  onPetTap(petId, container) {
    playSound('tap');
    // 탭 반응 — 베이스 스케일 기준으로 작은 바운스
    const baseSx = container.scaleX;
    const baseSy = container.scaleY;
    this.tweens.add({
      targets: container,
      scaleX: baseSx * 1.15,
      scaleY: baseSy * 1.15,
      duration: 120,
      yoyo: true,
      ease: 'Quad.easeOut',
      onComplete: () => { container.setScale(baseSx, baseSy); },
    });

    // 친밀도 증가 (하루 1회)
    const result = petPet(petId);
    const pet = state.pets[petId];

    // 하트 파티클
    const heartColor = 0xff6688;
    spawnParticles(this, container.x, container.y - 10, heartColor, 4, 12);

    // 플로팅 텍스트
    const canvasRect = $('gameCanvasArea').getBoundingClientRect();
    const fx = container.x * (canvasRect.width / this.scale.width);
    const fy = container.y * (canvasRect.height / this.scale.height) - 20;
    if (result.fed && result.leveled) {
      showFloatingText('+1 💕', fx, fy);
      // 친밀도 레벨 업 팝업 (큐로 들어감)
      const msg = FRIENDSHIP_MESSAGES[petId]?.[pet.friendship];
      if (msg) {
        playSound('levelup');
        showNotice(msg);
      }
    } else if (result.fed) {
      // 이미 만렙
      showFloatingText('💕', fx, fy);
    } else {
      // 오늘은 이미 쓰다듬음
      showFloatingText('🤍', fx, fy);
    }
  }

  resize(gameSize) {
    this.currentStage = -1;
    // 별 좌표는 화면 크기에 따라 다시 계산
    this._stars = null;
    this.drawSky();
    this.drawBackground();
    // 구름/비 재생성 (크기 변화 시 위치가 어긋나지 않게)
    this.spawnClouds();
    if (state.todayWeather === 'rainy') {
      this.stopRain();
      this.startRain();
    }
    this.drawTree(true);
    // 펫은 좌표가 화면 비율 기반이므로 재생성
    this.refreshPets();
  }
}

// ── Phaser Game Init ────────────────────────
function initPhaser() {
  const parent = $('gameCanvasArea');
  const rect = parent.getBoundingClientRect();
  // 실제 크기가 없으면 fallback 사용
  const w = Math.max(rect.width, 320);
  const h = Math.max(rect.height, 400);

  const config = {
    type: Phaser.AUTO,
    parent: 'gameCanvasArea',
    width: w,
    height: h,
    transparent: true,
    pixelArt: true,
    roundPixels: true,
    fps: {
      target: C.FPS,
      forceSetTimeOut: false,
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [TreeScene],
    input: {
      activePointers: 2,
    },
    banner: false,
  };

  const game = new Phaser.Game(config);
  window._phaserGame = game; // collection/harvest에서 씬 접근용

  game.scale.on('resize', (gameSize) => {
    const scene = game.scene.getScene('TreeScene');
    if (scene && scene.resize) scene.resize(gameSize);
  });

  return game;
}

// ── Collection panel ────────────────────────
// Phase F-1: 펫 도감 그룹 + 잠긴 항목은 실루엣/수수께끼 힌트
const PET_CATALOG = [
  {
    id: 'crema',
    icon: '🐦',
    silhouette: '👤',
    name: '크레마',
    species: '참새',
    desc: '창가에 앉아 가끔 지저귀는 작은 참새.',
    hint: '첫 꽃이 피는 날에 찾아올 거예요.',
  },
  {
    id: 'cappu',
    icon: '🐱',
    silhouette: '👤',
    name: '카푸치노',
    species: '고양이',
    desc: '테이블 위에서 나른하게 낮잠 자는 고양이.',
    hint: '첫 수확의 향기를 따라 올 거예요.',
  },
  {
    id: 'americano',
    icon: '🐿',
    silhouette: '👤',
    name: '아메리카노',
    species: '다람쥐',
    desc: '창문턱 구석에서 도토리를 굴리는 다람쥐.',
    hint: '나무를 여러 번 수확하면 찾아올 거예요.',
  },
  {
    id: 'espresso',
    icon: '🐸',
    silhouette: '👤',
    name: '에스프레소',
    species: '개구리',
    desc: '화분 옆에서 느긋하게 앉아있는 작은 개구리.',
    hint: '비 오는 날을 좋아한다고 들었어요.',
  },
];

function renderCollectionPanel() {
  const body = $('collectionBody');
  let html = '';
  const types = { pot: '화분', decor: '장식' };

  // Phase F-1: 펫 친구들 (도감) — 가장 위에 표시
  html += '<div class="collection-group"><div class="collection-group-title">🐾 카페 친구들</div>';
  PET_CATALOG.forEach((pet) => {
    const petState = state.pets?.[pet.id];
    const unlocked = !pet.future && petState && petState.unlocked;
    html += '<div class="collection-item ' + (unlocked ? 'unlocked pet-item' : 'locked pet-item') + '" data-pet-id="' + pet.id + '">';
    html += '<span class="collection-icon">' + (unlocked ? pet.icon : pet.silhouette) + '</span>';
    html += '<span class="collection-name">' + (unlocked ? pet.name + ' <small style="font-weight:400;color:var(--text-dim);">(' + pet.species + ')</small>' : '???') + '</span>';
    if (unlocked) {
      const friendship = petState.friendship || 0;
      const hearts = '💕'.repeat(friendship) + '🤍'.repeat(MAX_FRIENDSHIP - friendship);
      html += '<span class="collection-desc">' + pet.desc + '<br><span class="pet-hearts-mini">' + hearts + '</span></span>';
    } else {
      html += '<span class="collection-desc">🔒 ' + pet.hint + '</span>';
    }
    html += '</div>';
  });
  html += '</div>';

  for (const type of ['pot', 'decor']) {
    html += '<div class="collection-group"><div class="collection-group-title">' + types[type] + '</div>';
    for (const [id, item] of Object.entries(C.ITEMS)) {
      if (item.type !== type) continue;
      const unlocked = state.unlocked.includes(id);
      const equipped = (type === 'pot' && state.equippedPotId === id) ||
                       (type === 'decor' && state.equippedDecorId === id);
      html += '<div class="collection-item ' + (unlocked ? 'unlocked' : 'locked') + (equipped ? ' equipped' : '') + '" data-id="' + id + '">';
      // Phase F-1: 잠금 시 실루엣 느낌 (회색 사각형 + ?)
      const iconHtml = unlocked ? item.icon : '<span class="locked-silhouette">?</span>';
      html += '<span class="collection-icon">' + iconHtml + '</span>';
      html += '<span class="collection-name">' + (unlocked ? item.name : '???') + '</span>';
      if (unlocked) {
        html += '<span class="collection-desc">' + item.desc + '</span>';
        if (equipped) {
          html += '<span class="collection-badge">장착중</span>';
        } else {
          html += '<button class="collection-equip-btn" data-id="' + id + '" data-type="' + type + '">장착</button>';
        }
      } else {
        html += '<span class="collection-desc">🔒 ' + item.desc + '</span>';
      }
      html += '</div>';
    }
    html += '</div>';
  }
  body.innerHTML = html;

  // 장착 버튼 이벤트
  body.querySelectorAll('.collection-equip-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const type = e.target.dataset.type;
      if (type === 'pot') state.equippedPotId = id;
      else if (type === 'decor') state.equippedDecorId = id;
      saveState();
      renderCollectionPanel();
      // 나무 다시 그리기
      const scene = window._phaserGame?.scene?.getScene('TreeScene');
      if (scene) { scene.currentStage = -1; scene.drawTree(true); }
    });
  });
}

// ── Harvest popup ───────────────────────────
// Phase F-1: 감성 문장 + 별 등급. 숫자 점수/공식은 노출 금지.
function showHarvestPopup(result) {
  const body = $('harvestPopupBody');
  if (!result) { hideOverlay('harvestPopup'); return; }
  const { grade, phrases, golden, cert } = result;
  const stars = '★'.repeat(grade.stars) + '☆'.repeat(4 - grade.stars);
  let html = '<div class="harvest-celebration">🍒 → ✨</div>';
  html += '<div class="harvest-grade harvest-grade-' + grade.key + '">' +
            '<div class="harvest-grade-stars">' + stars + '</div>' +
            '<div class="harvest-grade-label">' + grade.label + '</div>' +
          '</div>';
  html += '<ul class="harvest-phrases">';
  phrases.forEach(p => { html += '<li>' + p + '</li>'; });
  html += '</ul>';
  html += '<div class="harvest-rewards">';
  html += '<div class="harvest-reward-line">✨ 황금 원두를 얻었어요</div>';
  if (cert > 0) {
    html += '<div class="harvest-reward-line cert">🏅 원두 증서를 받았어요!</div>';
  }
  html += '</div>';
  html += '<p class="harvest-footer">나무는 다시 새싹으로 돌아가요.<br>다음 수확도 천천히 즐겨주세요.</p>';
  body.innerHTML = html;
  showOverlay('harvestPopup');
}

// ── DOM Event Setup ─────────────────────────
function setupDOMEvents() {
  // 물주기
  $('btnWater').addEventListener('click', (e) => {
    e.stopPropagation();
    doWater();
  });

  // 수확
  $('btnHarvest').addEventListener('click', (e) => {
    e.stopPropagation();
    if (!canHarvest()) return;
    // 강화된 수확 파티클 (다층 색상 + 화면 플래시)
    const scene = window._phaserGame?.scene?.getScene('TreeScene');
    if (scene) {
      const cx = scene.scale.width / 2;
      const groundY = scene.scale.height * 0.72;
      // 1차: 황금 폭발
      spawnParticles(scene, cx, groundY - 110, 0xffd700, 28, 70);
      spawnParticles(scene, cx, groundY - 110, 0xfff3a8, 18, 55);
      // 2차: 빨간 체리
      spawnParticles(scene, cx, groundY - 90, 0xcc3333, 18, 60);
      spawnParticles(scene, cx, groundY - 80, 0xff6b6b, 12, 45);
      // 3차: 잔잔한 잎
      setTimeout(() => spawnParticles(scene, cx, groundY - 130, 0x6abf69, 14, 80), 200);
      setTimeout(() => spawnParticles(scene, cx, groundY - 100, 0xffd700, 16, 90), 350);
      // 화면 플래시 오버레이
      const flash = scene.add.rectangle(scene.scale.width / 2, scene.scale.height / 2, scene.scale.width, scene.scale.height, 0xffffff, 0.55);
      flash.setDepth(9999);
      scene.tweens.add({ targets: flash, alpha: 0, duration: 450, ease: 'Quad.easeOut', onComplete: () => flash.destroy() });
      // 카메라 흔들림
      try { scene.cameras.main.shake(200, 0.006); } catch (err) {}
    }
    const result = doHarvest();
    if (result) {
      incrementGlobalStat('totalHarvests', 1);
      incrementGlobalStat('totalGoldenBeans', result.golden);
    }
    showHarvestPopup(result);
    if (scene) { scene.currentStage = -1; scene.drawTree(true); }
  });

  // 컬렉션
  $('btnCollection').addEventListener('click', (e) => {
    e.stopPropagation();
    renderCollectionPanel();
    showOverlay('collectionPanel');
  });

  // 보상 코드 패널 (설정 안에서 열기)
  $('btnRewardCode').addEventListener('click', () => {
    renderRewardPanel();
    showOverlay('rewardPanel');
  });
  $('rewardPanelClose').addEventListener('click', () => hideOverlay('rewardPanel'));
  $('rewardSubmitBtn').addEventListener('click', () => {
    const code = $('rewardCodeInput').value;
    if (!code.trim()) return;
    const result = grantReward(code);
    hideOverlay('rewardPanel');
    showRewardResult(result);
    // 나무 다시 그리기
    const scene = window._phaserGame?.scene?.getScene('TreeScene');
    if (scene) { scene.currentStage = -1; scene.drawTree(true); }
  });
  $('rewardResultClose').addEventListener('click', () => hideOverlay('rewardResultPopup'));

  // 계정 (HUD 아바타 버튼)
  $('hudAvatarBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    renderAccountPanel();
    showOverlay('accountPanel');
  });
  $('accountPanelClose').addEventListener('click', () => hideOverlay('accountPanel'));

  // 설정
  $('btnSettings').addEventListener('click', () => {
    updateSoundButton();
    updateNotifyButton();
    showOverlay('settingsPanel');
  });
  $('settingsClose').addEventListener('click', () => hideOverlay('settingsPanel'));
  $('collectionClose').addEventListener('click', () => hideOverlay('collectionPanel'));
  $('harvestPopupClose').addEventListener('click', () => hideOverlay('harvestPopup'));

  // 사운드 토글
  $('btnSoundToggle').addEventListener('click', toggleSound);

  // 가방 (인벤토리)
  $('btnInventory').addEventListener('click', (e) => {
    e.stopPropagation();
    renderInventoryPanel();
    showOverlay('inventoryPanel');
  });
  $('inventoryClose').addEventListener('click', () => hideOverlay('inventoryPanel'));

  // 단계 정보 (ⓘ)
  $('btnStageInfo').addEventListener('click', (e) => {
    e.stopPropagation();
    showStageInfo();
  });
  $('stageInfoClose').addEventListener('click', () => hideOverlay('stageInfoPanel'));

  // 공유
  $('btnShare').addEventListener('click', shareGame);

  // 출석 알림 토글
  $('btnNotifyToggle').addEventListener('click', toggleNotification);

  // 재방문 팝업 닫기
  $('revisitClose').addEventListener('click', () => hideOverlay('revisitPopup'));

  // 통계 패널
  $('btnStats').addEventListener('click', () => {
    renderStatsPanel();
    loadGlobalStats().then(() => renderStatsPanel());
    hideOverlay('settingsPanel');
    showOverlay('statsPanel');
  });
  $('statsClose').addEventListener('click', () => hideOverlay('statsPanel'));

  // 일일 보너스 받기
  $('dailyBonusClose').addEventListener('click', claimDailyBonus);

  // 데이터 초기화
  $('btnResetData').addEventListener('click', () => {
    if (confirm('정말 모든 데이터를 초기화하시겠습니까?')) {
      resetState();
      hideOverlay('settingsPanel');
      location.reload();
    }
  });

  // 오프라인 팝업 닫기
  $('offlinePopupClose').addEventListener('click', () => hideOverlay('offlinePopup'));

  // 오버레이 바깥 클릭으로 닫기
  document.querySelectorAll('.overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  // 페이지 나갈 때 저장 (로컬 + 클라우드 즉시)
  window.addEventListener('beforeunload', () => {
    saveState();
    cloudSaveNow();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      saveState();
      cloudSaveNow();
    }
  });
}

// ── Reward code system ──────────────────────
function grantReward(code) {
  const upper = code.trim().toUpperCase();
  const reward = C.REWARDS[upper];
  if (!reward) return { success: false, msg: '유효하지 않은 코드입니다.' };
  if (state.claimedRewards.includes(upper)) return { success: false, msg: '이미 사용한 코드입니다.' };

  // 보상 적용
  if (reward.water) state.water = Math.min(C.WATER_MAX, state.water + reward.water);
  if (reward.beans) {
    state.beanPoints += reward.beans;
    state.stats.totalBeansEarned = (state.stats.totalBeansEarned || 0) + reward.beans;
  }
  if (reward.xp && state.water > 0) state.growthXp += reward.xp;
  if (reward.unlock && !state.unlocked.includes(reward.unlock)) {
    state.unlocked.push(reward.unlock);
  }
  state.stage = getStage(state.growthXp);
  state.claimedRewards.push(upper);
  updateHUD();
  saveState();
  cloudSaveNow();

  let details = [];
  if (reward.water) details.push('💧 물 +' + reward.water);
  if (reward.beans) details.push('☕ 원두 +' + reward.beans);
  if (reward.xp) details.push('✨ XP +' + reward.xp);
  if (reward.unlock) {
    const item = C.ITEMS[reward.unlock];
    if (item) details.push('🎁 ' + item.name + ' 해금');
  }
  return { success: true, msg: reward.name, details };
}

function applyRewardFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('reward') || params.get('code');
  if (!code) return;
  // URL에서 코드 제거 (히스토리 정리)
  const clean = window.location.pathname;
  window.history.replaceState({}, '', clean);
  // 약간의 딜레이 후 보상 적용 (부팅 완료 대기)
  setTimeout(() => {
    const result = grantReward(code);
    showRewardResult(result);
  }, 500);
}

function showRewardResult(result) {
  const body = $('rewardResultBody');
  if (result.success) {
    let html = '<div class="harvest-celebration">🎁</div>';
    html += '<p style="font-weight:700;color:var(--accent);margin-bottom:12px;">' + result.msg + '</p>';
    result.details.forEach(d => {
      html += '<div class="stat-row"><span class="stat-value">' + d + '</span></div>';
    });
    body.innerHTML = html;
  } else {
    body.innerHTML = '<p>' + result.msg + '</p>';
  }
  showOverlay('rewardResultPopup');
}

function renderRewardPanel() {
  const input = $('rewardCodeInput');
  const resultArea = $('rewardInlineResult');
  if (input) input.value = '';
  if (resultArea) resultArea.textContent = '';
}

// ── Tutorial system (popup-based) ───────────
// 이전의 자동 사라지는 토스트 → 사용자가 읽고 탭해서 닫는 팝업으로 교체.
// 4장 카드로 순차 진행, 큐잉 시스템을 재활용.
const TUTORIAL_CARDS = [
  { icon: '🌱', title: '어서오세요!',
    body: '<strong>PNS 커피나무</strong>를 함께 키워봐요.<br>천천히, 그리고 편안하게.' },
  { icon: '👆', title: '나무를 톡 눌러보세요',
    body: '나무를 탭하면 <strong>원두 포인트</strong>를 얻어요.<br>탭할 때마다 조금씩 자라기도 해요.' },
  { icon: '💧', title: '물을 잊지 마세요',
    body: '물이 있어야 나무가 잘 자라요.<br>하단 <strong>물주기</strong> 버튼으로 Water를 채워주세요.' },
  { icon: '📖', title: '자라면 열려요',
    body: '단계가 오를수록 새로운 <strong>컬렉션</strong>이 해금돼요.<br>꽃이 피고, 체리가 맺히고, 수확까지 — 천천히 즐겨주세요.' },
];

function startTutorial() {
  if (state.tutorialDone) return;
  TUTORIAL_CARDS.forEach((card, idx) => {
    const isLast = idx === TUTORIAL_CARDS.length - 1;
    showNotice({
      icon: card.icon,
      title: card.title,
      body: card.body,
      cta: isLast ? '시작하기' : '다음',
      onClose: isLast ? () => { state.tutorialDone = true; saveState(); } : null,
    });
  });
}

// (레거시) 이전 토스트 힌트 DOM이 남아있으면 안전하게 숨김
function showTutorialStep(_step) {
  const hint = $('tutorialHint');
  if (hint) hint.classList.remove('visible');
}

// ── Particle effects (Phaser 씬 내) ─────────
// 물주기, 탭, 수확 시 파티클을 Phaser Graphics로 간단히 구현
function spawnParticles(scene, x, y, color, count, spread) {
  for (let i = 0; i < count; i++) {
    const p = scene.add.circle(
      x + Phaser.Math.Between(-spread, spread),
      y + Phaser.Math.Between(-spread, spread),
      Phaser.Math.Between(2, 4),
      color, 0.8
    );
    scene.tweens.add({
      targets: p,
      y: p.y - Phaser.Math.Between(20, 60),
      x: p.x + Phaser.Math.Between(-15, 15),
      alpha: 0,
      scale: 0.3,
      duration: Phaser.Math.Between(400, 800),
      ease: 'Quad.easeOut',
      onComplete: () => p.destroy(),
    });
  }
}

// ── Boot ────────────────────────────────────
function boot() {
  setLoadingProgress(20, '데이터를 불러오는 중...');

  // 저장 데이터 불러오기
  const saved = loadState();

  if (saved) {
    // 오프라인 보상 계산
    const report = processOffline(saved);
    state = saved;
    state.stage = getStage(state.growthXp);
    updateHUD();

    if (report && report.elapsedMin >= 1) {
      showOfflinePopup(report);
    }
    saveState();
  } else {
    state = defaultState();
    updateHUD();
    saveState();
  }

  // 물주기 쿨다운 복원
  if (state.lastWaterTime) {
    startWaterCooldownTimer();
  }

  setLoadingProgress(50, '게임 준비 중...');
  setupDOMEvents();
  initPhaser();
  setLoadingProgress(80, '클라우드 연결 중...');
  initFirebase();

  // URL 보상 파라미터 처리
  applyRewardFromUrl();

  // 로딩 화면 숨김 (Phaser 첫 프레임 렌더링 대기)
  setTimeout(hideLoadingScreen, 500);

  // 일일 출석 확인 (로딩 화면 숨긴 후 약간 늦게)
  setTimeout(() => {
    checkRevisit();
    checkDailyBonus();
    // 비 오는 날 첫 방문 보너스
    if (applyRainyBonusIfNeeded()) {
      updateHUD();
      showNotice({
        icon: '☔',
        title: '오늘은 비가 와요',
        body: '창밖에 비가 내리네요.<br>나무가 <strong>Water +10</strong>을 머금었어요.',
      });
    }
    // 저장된 상태에서 이미 조건을 만족하면 펫 해금 (마이그레이션)
    checkPetUnlocks();
  }, 1200);

  // 첫 방문 튜토리얼
  if (!state.tutorialDone) {
    setTimeout(startTutorial, 1800);
  }

  // 서비스 워커 등록 (PWA 오프라인 지원)
  // 새 sw.js 가 발견되면 자동으로 SKIP_WAITING → 한 번 새로고침해서 최신 자산 적용
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then((reg) => {
        // 새 SW 설치 감지
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener('statechange', () => {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              // 기존 컨트롤러가 있는 상태에서 새 SW가 대기 중 → 즉시 활성화 요청
              nw.postMessage('SKIP_WAITING');
            }
          });
        });
        // 페이지 로드마다 업데이트 체크 강제
        try { reg.update(); } catch (e) {}
      }).catch(() => { /* fail silently */ });

      // controller 가 바뀌면 (= 새 SW가 활성화됨) 한 번만 새로고침
      let reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloaded) return;
        reloaded = true;
        window.location.reload();
      });
    });
  }

  // 글로벌 통계 미리 로드 (백그라운드)
  setTimeout(() => { loadGlobalStats(); }, 2000);

  // 마지막 방문 시각 업데이트
  state.lastVisitTime = Date.now();
  saveState();
}

// DOM Ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
