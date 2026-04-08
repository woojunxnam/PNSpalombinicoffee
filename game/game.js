/* ============================================
   PNS Coffee 나무 키우기 — Phase 2
   Phaser 3 + DOM Hybrid
   ============================================ */

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

  STAGES: [
    { name: '새싹',        emoji: '🌱', minXp: 0   },
    { name: '어린 묘목',    emoji: '🌿', minXp: 15  },
    { name: '작은 커피나무', emoji: '🌳', minXp: 50  },
    { name: '꽃 단계',      emoji: '🌸', minXp: 120 },
    { name: '커피 체리',    emoji: '🍒', minXp: 220 },
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
    equippedPotId: 'pot_terracotta_basic',
    equippedDecorId: null,
    unlocked: ['pot_terracotta_basic'],
    claimedRewards: [],
    tutorialDone: false,
    stats: {
      totalTaps: 0,
      totalWaterings: 0,
    },
  };
}

// ── Save / Load ─────────────────────────────
function saveState() {
  try {
    state.lastSaveTime = Date.now();
    localStorage.setItem(C.SAVE_KEY, JSON.stringify(state));
  } catch (e) { /* private browsing 등 */ }
}

function loadState() {
  try {
    const raw = localStorage.getItem(C.SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // 누락 필드 보완
      const def = defaultState();
      return { ...def, ...parsed, stats: { ...def.stats, ...parsed.stats } };
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

function doHarvest() {
  if (!canHarvest()) return;
  const golden = C.HARVEST_GOLDEN_BEANS + state.harvestCount; // 수확할수록 보너스
  state.goldenBeans += golden;
  state.harvestCount++;
  // 리셋 (황금 원두/해금/장비/통계는 유지)
  state.growthXp = 0;
  state.stage = 0;
  state.water = C.WATER_START;
  updateHUD();
  saveState();
  return golden;
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

// ── Offline calculation ─────────────────────
function processOffline(savedState) {
  const now = Date.now();
  const elapsed = now - savedState.lastSaveTime;
  if (elapsed < 5000) return null; // 5초 미만이면 무시

  const elapsedSec = elapsed / 1000;
  const elapsedMin = elapsed / 60000;
  const maxOfflineSec = C.OFFLINE_MAX_HOURS * 3600;

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
    // 배경 레이어 (나무 뒤)
    this.bgGraphics = this.add.graphics();
    this.drawBackground();

    this.treeGroup = this.add.container(0, 0);

    this.potGraphics = this.add.graphics();
    this.trunkGraphics = this.add.graphics();
    this.leavesGraphics = this.add.graphics();
    this.detailGraphics = this.add.graphics(); // 꽃/체리용

    this.treeGroup.add([this.potGraphics, this.trunkGraphics, this.leavesGraphics, this.detailGraphics]);

    this.drawTree(true);

    // 탭 이벤트
    this.input.on('pointerdown', (pointer) => {
      this.handleTap(pointer);
    });
  }

  update(time, delta) {
    const dt = delta / 1000;

    // Water 감소 (온라인)
    if (state.water > 0) {
      this.drainTimer += dt;
      if (this.drainTimer >= C.WATER_DRAIN_SEC) {
        this.drainTimer -= C.WATER_DRAIN_SEC;
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
        if (newStage !== state.stage) {
          state.stage = newStage;
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

    // 성장 XP (Water > 0일 때만)
    if (state.water > 0) {
      state.growthXp += C.TAP_XP;
      const newStage = getStage(state.growthXp);
      if (newStage !== state.stage) {
        state.stage = newStage;
      }
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
    g.clear();

    // 벽 배경 (따뜻한 카페 벽)
    g.fillStyle(0x2a1f16);
    g.fillRect(0, 0, w, h);

    // 벽 질감 — 수평 나무 패널 선
    g.lineStyle(1, 0x352a20, 0.3);
    for (let y = 0; y < h * 0.6; y += 24) {
      g.lineBetween(0, y, w, y);
    }

    // 선반 (나무 위 공간)
    const shelfY = h * 0.12;
    g.fillStyle(0x5a4030);
    g.fillRect(0, shelfY, w, 6);
    g.fillStyle(0x4a3525);
    g.fillRect(0, shelfY + 6, w, 3);

    // 선반 위 소품 — 작은 커피잔
    const cupX = w * 0.15;
    g.fillStyle(0xd4c4a8);
    g.fillRect(cupX, shelfY - 12, 10, 12);
    g.fillStyle(0xc0a880);
    g.fillRect(cupX - 1, shelfY - 13, 12, 3);
    // 커피 색
    g.fillStyle(0x5a3a20);
    g.fillRect(cupX + 1, shelfY - 11, 8, 4);

    // 선반 위 소품 — 작은 책
    const bookX = w * 0.75;
    g.fillStyle(0x8b4513);
    g.fillRect(bookX, shelfY - 16, 8, 16);
    g.fillStyle(0xa05520);
    g.fillRect(bookX + 10, shelfY - 14, 7, 14);

    // 하단 테이블/바닥 영역
    const floorY = h * 0.72;
    // 테이블 상판
    g.fillStyle(0x5a4535);
    g.fillRect(0, floorY, w, 8);
    g.fillStyle(0x4a3828);
    g.fillRect(0, floorY + 8, w, h - floorY - 8);

    // 테이블 나무 결
    g.lineStyle(1, 0x3d2d20, 0.25);
    for (let y = floorY + 14; y < h; y += 16) {
      g.lineBetween(0, y, w, y);
    }

    // 은은한 빛 (상단 중앙)
    g.fillStyle(0xffeedd, 0.03);
    g.fillCircle(w / 2, 0, w * 0.5);
    g.fillStyle(0xffeedd, 0.02);
    g.fillCircle(w / 2, h * 0.3, w * 0.4);
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
    this.detailGraphics.clear();

    const isDry = state.water <= 0;
    const leafColor = isDry ? 0x7a8a60 : 0x5da35a;
    const leafColorLight = isDry ? 0x8a9a70 : 0x7bc478;
    const trunkColor = isDry ? 0x6a5040 : 0x7a5c3a;

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
    this.potGraphics.fillStyle(potDark);
    this.potGraphics.fillRect(-potTopW / 2, -potH - potRim, potTopW, potRim);
    this.potGraphics.fillStyle(potDark);
    this.potGraphics.fillRect(-potW / 2 + 6, -2, potW - 12, 4);
    this.potGraphics.fillStyle(soilColor);
    this.potGraphics.fillRect(-potW / 2 + 3, -potH + 2, potW - 6, 10);

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
      this.trunkGraphics.fillStyle(trunkColor);
      this.trunkGraphics.fillRect(-4, -potH - stemH, 8, stemH);
      this.trunkGraphics.fillRect(-26, -potH - stemH + 14, 24, 4);
      this.trunkGraphics.fillRect(4, -potH - stemH + 24, 26, 4);
      this.trunkGraphics.fillRect(-20, -potH - stemH + 38, 18, 3);
      this.trunkGraphics.fillRect(4, -potH - stemH + 46, 16, 3);

      this.leavesGraphics.fillStyle(leafColor);
      this.leavesGraphics.fillEllipse(0, -potH - stemH - 6, 50, 30);
      this.leavesGraphics.fillEllipse(-16, -potH - stemH + 6, 36, 24);
      this.leavesGraphics.fillEllipse(16, -potH - stemH + 4, 36, 24);
      this.leavesGraphics.fillStyle(leafColorLight);
      this.leavesGraphics.fillEllipse(-6, -potH - stemH - 12, 32, 20);
      this.leavesGraphics.fillEllipse(10, -potH - stemH - 2, 28, 18);
      this.leavesGraphics.fillStyle(leafColor);
      this.leavesGraphics.fillEllipse(-30, -potH - stemH + 12, 20, 12);
      this.leavesGraphics.fillEllipse(32, -potH - stemH + 22, 20, 12);
      this.leavesGraphics.fillEllipse(-22, -potH - stemH + 36, 16, 10);
      this.leavesGraphics.fillEllipse(22, -potH - stemH + 44, 14, 10);
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
      // Stage 5: 커피 체리 — 나무 + 빨간 열매
      const stemH = 80;
      drawBigTree(stemH);

      // 커피 체리 (빨간 타원)
      const cherryRed = 0xcc3333;
      const cherryDark = 0x992222;
      const cherries = [
        [-12, -potH - stemH + 4],  [16, -potH - stemH + 8],
        [-22, -potH - stemH + 16], [26, -potH - stemH + 20],
        [-8, -potH - stemH + 26],  [10, -potH - stemH + 30],
        [-28, -potH - stemH + 32], [20, -potH - stemH + 38],
        [0, -potH - stemH - 4],    [-16, -potH - stemH + 42],
      ];
      cherries.forEach(([cx, cy], i) => {
        this.detailGraphics.fillStyle(i % 3 === 0 ? cherryDark : cherryRed);
        this.detailGraphics.fillEllipse(cx, cy, 6, 7);
        // 하이라이트
        this.detailGraphics.fillStyle(0xff6666, 0.5);
        this.detailGraphics.fillCircle(cx - 1, cy - 2, 2);
      });

      if (isDry) this.leavesGraphics.setAngle(3);
      else this.leavesGraphics.setAngle(0);
    }
  }

  resize(gameSize) {
    this.currentStage = -1;
    this.drawBackground();
    this.drawTree(true);
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
function renderCollectionPanel() {
  const body = $('collectionBody');
  let html = '';
  const types = { pot: '화분', decor: '장식' };

  for (const type of ['pot', 'decor']) {
    html += '<div class="collection-group"><div class="collection-group-title">' + types[type] + '</div>';
    for (const [id, item] of Object.entries(C.ITEMS)) {
      if (item.type !== type) continue;
      const unlocked = state.unlocked.includes(id);
      const equipped = (type === 'pot' && state.equippedPotId === id) ||
                       (type === 'decor' && state.equippedDecorId === id);
      html += '<div class="collection-item ' + (unlocked ? 'unlocked' : 'locked') + (equipped ? ' equipped' : '') + '" data-id="' + id + '">';
      html += '<span class="collection-icon">' + (unlocked ? item.icon : '🔒') + '</span>';
      html += '<span class="collection-name">' + (unlocked ? item.name : '???') + '</span>';
      if (unlocked) {
        html += '<span class="collection-desc">' + item.desc + '</span>';
        if (equipped) {
          html += '<span class="collection-badge">장착중</span>';
        } else {
          html += '<button class="collection-equip-btn" data-id="' + id + '" data-type="' + type + '">장착</button>';
        }
      } else {
        html += '<span class="collection-desc">' + item.desc + '</span>';
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
function showHarvestPopup(goldenEarned) {
  const body = $('harvestPopupBody');
  body.innerHTML =
    '<div class="harvest-celebration">🍒 → ✨</div>' +
    '<div class="stat-row"><span class="stat-label">획득 황금 원두</span><span class="stat-value golden">+' + goldenEarned + '</span></div>' +
    '<div class="stat-row"><span class="stat-label">총 수확 횟수</span><span class="stat-value">' + state.harvestCount + '회</span></div>' +
    '<p style="margin-top:12px;font-size:0.8rem;">나무가 새싹으로 돌아갑니다.<br>황금 원두와 컬렉션은 유지됩니다.</p>';
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
    // 수확 파티클 (수확 전에)
    const scene = window._phaserGame?.scene?.getScene('TreeScene');
    if (scene) {
      const cx = scene.scale.width / 2;
      const groundY = scene.scale.height * 0.72;
      spawnParticles(scene, cx, groundY - 100, 0xffd700, 15, 40);
      spawnParticles(scene, cx, groundY - 80, 0xcc3333, 10, 35);
    }
    const golden = doHarvest();
    showHarvestPopup(golden);
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

  // 설정
  $('btnSettings').addEventListener('click', () => showOverlay('settingsPanel'));
  $('settingsClose').addEventListener('click', () => hideOverlay('settingsPanel'));
  $('collectionClose').addEventListener('click', () => hideOverlay('collectionPanel'));
  $('harvestPopupClose').addEventListener('click', () => hideOverlay('harvestPopup'));

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

  // 페이지 나갈 때 저장
  window.addEventListener('beforeunload', () => saveState());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) saveState();
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
  if (reward.beans) state.beanPoints += reward.beans;
  if (reward.xp && state.water > 0) state.growthXp += reward.xp;
  if (reward.unlock && !state.unlocked.includes(reward.unlock)) {
    state.unlocked.push(reward.unlock);
  }
  state.stage = getStage(state.growthXp);
  state.claimedRewards.push(upper);
  updateHUD();
  saveState();

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

// ── Tutorial system ─────────────────────────
const TUTORIAL_STEPS = [
  '나무를 톡 눌러보세요 👆',
  '원두 포인트를 얻었어요 ☕',
  '물이 있어야 더 잘 자라요 💧',
  '자라면 새로운 컬렉션이 열려요 📖',
];

function startTutorial() {
  if (state.tutorialDone) return;
  showTutorialStep(0);
}

function showTutorialStep(step) {
  if (step >= TUTORIAL_STEPS.length) {
    state.tutorialDone = true;
    saveState();
    const hint = $('tutorialHint');
    if (hint) {
      hint.classList.remove('visible');
      setTimeout(() => hint.remove(), 300);
    }
    return;
  }

  const hint = $('tutorialHint');
  hint.textContent = TUTORIAL_STEPS[step];
  hint.classList.add('visible');

  // Step 0: 첫 탭 대기
  if (step === 0) {
    const handler = () => {
      document.removeEventListener('pointerdown', handler);
      setTimeout(() => showTutorialStep(1), 300);
    };
    // 캔버스 탭 시 다음
    setTimeout(() => document.addEventListener('pointerdown', handler, { once: true }), 800);
  }
  // Step 1~3: 자동 진행
  else {
    setTimeout(() => showTutorialStep(step + 1), 2500);
  }
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

  setupDOMEvents();
  initPhaser();

  // URL 보상 파라미터 처리
  applyRewardFromUrl();

  // 첫 방문 튜토리얼
  if (!state.tutorialDone) {
    setTimeout(startTutorial, 1000);
  }
}

// DOM Ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
