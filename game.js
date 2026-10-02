/**
 * GAME 5: GRID ISLAND — AREA & PERIMETER RETRO ARCADE ENGINE
 * Cambridge Year 4 Unit Square Grids (cm² and cm) Direct Manipulation
 * StuCent Sandboxed Runtime Compatible (Allow-Scripts / ShadowRoot Safe)
 */

(() => {
  'use strict';

  const doc = typeof root !== 'undefined' ? root : document;
  const gameCtx = typeof game !== 'undefined' ? game : (window.game || null);

  const safeStorage = {
    getItem(key) {
      try { return (typeof window !== 'undefined' && window.localStorage) ? window.localStorage.getItem(key) : null; } catch (e) { return null; }
    },
    setItem(key, val) {
      try { if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem(key, val); } catch (e) {}
    }
  };

  function getEl(id) {
    try {
      if (doc && typeof doc.getElementById === 'function') {
        const el = doc.getElementById(id);
        if (el) return el;
      }
      if (doc && typeof doc.querySelector === 'function') {
        const el = doc.querySelector('#' + id);
        if (el) return el;
      }
    } catch (e) {}
    try {
      if (typeof document !== 'undefined' && typeof document.getElementById === 'function') {
        return document.getElementById(id);
      }
    } catch (e) {}
    return null;
  }

  function queryAll(sel) {
    try {
      if (doc && typeof doc.querySelectorAll === 'function') {
        const res = doc.querySelectorAll(sel);
        if (res && res.length > 0) return res;
      }
    } catch (e) {}
    try {
      if (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function') {
        return document.querySelectorAll(sel);
      }
    } catch (e) {}
    return [];
  }

  // ==========================================================================
  // 1. SOUND SYNTHESIZER & PROCEDURAL PIRATE BGM
  // ==========================================================================
  let audioCtx = null;
  let isMuted = safeStorage.getItem('math_games_sound') === 'false';
  let bgmMasterGain = null;
  let bgmInterval = null;
  let bgmStep = 0;
  let screenShakeIntensity = 0;

  function triggerScreenShake(intensity = 10) {
    screenShakeIntensity = intensity;
  }

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
        bgmMasterGain = audioCtx.createGain();
        bgmMasterGain.gain.setValueAtTime(isMuted ? 0 : 0.05, audioCtx.currentTime);
        bgmMasterGain.connect(audioCtx.destination);
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function startPirateBGM() {
    initAudio();
    if (!audioCtx || bgmInterval) return;

    // Adventure Sea Island / Pirate Groove in D Minor (112 BPM)
    const bassline = [
      146.83, 0, 220.00, 0,  174.61, 0, 220.00, 0,
      130.81, 0, 196.00, 0,  164.81, 0, 196.00, 0,
      116.54, 0, 174.61, 0,  146.83, 0, 174.61, 0,
      110.00, 0, 164.81, 0,  220.00, 0, 0, 0
    ];

    const leadMelody = [
      293.66, 0, 349.23, 0,  440.00, 0, 349.23, 0,
      261.63, 0, 329.63, 0,  392.00, 0, 329.63, 0,
      233.08, 0, 293.66, 0,  349.23, 0, 293.66, 0,
      220.00, 0, 329.63, 0,  440.00, 0, 0, 0
    ];

    const stepDuration = (60 / 112) / 4;
    bgmStep = 0;

    bgmInterval = setInterval(() => {
      if (isMuted || !audioCtx || !isPlaying || isGameOver) return;
      const t = audioCtx.currentTime;
      const idx = bgmStep % 32;

      const bFreq = bassline[idx];
      if (bFreq > 0) {
        try {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(bFreq, t);
          gain.gain.setValueAtTime(0.065, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 1.5);
          osc.connect(gain);
          gain.connect(bgmMasterGain);
          osc.start(t);
          osc.stop(t + stepDuration * 1.6);
        } catch (e) {}
      }

      const lFreq = leadMelody[idx];
      if (lFreq > 0) {
        try {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(lFreq, t);
          gain.gain.setValueAtTime(0.035, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 1.3);
          osc.connect(gain);
          gain.connect(bgmMasterGain);
          osc.start(t);
          osc.stop(t + stepDuration * 1.4);
        } catch (e) {}
      }

      bgmStep++;
    }, stepDuration * 1000);
  }

  function stopPirateBGM() {
    if (bgmInterval) {
      clearInterval(bgmInterval);
      bgmInterval = null;
    }
  }

  function beep(freq, durationMs, type = 'sine', vol = 0.15, delaySec = 0) {
    if (isMuted) return;
    initAudio();
    if (!audioCtx) return;

    try {
      const t = audioCtx.currentTime + delaySec;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + durationMs / 1000);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + durationMs / 1000);
    } catch (e) {}
  }

  function playTilePlaceSound() {
    beep(520, 60, 'triangle', 0.18);
  }

  function playTileEraseSound() {
    beep(340, 50, 'sine', 0.12);
  }

  function playKeyTurnSound() {
    beep(750, 80, 'sine', 0.15);
    beep(950, 100, 'triangle', 0.2, 0.08);
  }

  function playChestOpenSound() {
    [523.25, 659.25, 783.99, 1046.50, 1318.5, 1567.98].forEach((f, i) => {
      beep(f, 220, 'triangle', 0.22, i * 0.07);
    });
    triggerScreenShake(12);
  }

  function playWrongSound() {
    beep(180, 250, 'sawtooth', 0.22);
    beep(130, 280, 'square', 0.16, 0.08);
    triggerScreenShake(14);
  }

  // ==========================================================================
  // 2. CAMBRIDGE YEAR 4 GRID ISLAND QUESTS (10 ISLANDS)
  // ==========================================================================
  const ISLAND_QUESTS = [
    {
      roundNum: 1,
      type: 'area',
      badge: 'ISLAND 01 • AREA PLOT (6 cm²)',
      prompt: 'BUILD A 6 cm² GARDEN PLOT',
      tip: 'Drag or click grid squares to plant 6 unit tiles (e.g. 3×2 or 2×3 rectangle)!',
      targetVal: 6,
      unit: 'cm²',
      explain: 'Fill 6 unit squares on the plot so total area equals 6 cm².'
    },
    {
      roundNum: 2,
      type: 'area',
      badge: 'ISLAND 02 • L-SHAPED AREA (5 cm²)',
      prompt: 'BUILD AN L-SHAPED PLOT WITH 5 cm² AREA',
      tip: 'Fill exactly 5 unit squares in an L-shape!',
      targetVal: 5,
      unit: 'cm²',
      explain: 'Fill 5 unit squares to match the ancient 5 cm² inscription.'
    },
    {
      roundNum: 3,
      type: 'perimeter',
      badge: 'ISLAND 03 • PERIMETER (10 cm)',
      prompt: 'BUILD A PLOT WITH 10 cm PERIMETER',
      tip: 'A 3cm by 2cm rectangle has perimeter 3 + 2 + 3 + 2 = 10 cm!',
      targetVal: 10,
      unit: 'cm',
      explain: 'Perimeter is the total boundary edge length around the outside (10 cm).'
    },
    {
      roundNum: 4,
      type: 'area',
      badge: 'ISLAND 04 • SQUARE AREA (9 cm²)',
      prompt: 'BUILD A 3×3 SQUARE PLOT (9 cm²)',
      tip: '3 columns × 3 rows = 9 cm² unit squares',
      targetVal: 9,
      unit: 'cm²',
      explain: 'Fill a 3 by 3 block of squares to get 9 cm².'
    },
    {
      roundNum: 5,
      type: 'area',
      badge: 'ISLAND 05 • STEPPED SHAPE (7 cm²)',
      prompt: 'BUILD A STEPPED GARDEN PLOT (7 cm²)',
      tip: 'Fill 7 unit squares on the grid!',
      targetVal: 7,
      unit: 'cm²',
      explain: 'Fill any shape containing exactly 7 unit squares (7 cm²).'
    },
    {
      roundNum: 6,
      type: 'perimeter',
      badge: 'ISLAND 06 • PERIMETER (12 cm)',
      prompt: 'ENCLOSE A SHAPE WITH 12 cm PERIMETER',
      tip: 'Try a 4×2 or 5×1 rectangle: 2×(4+2) = 12 cm!',
      targetVal: 12,
      unit: 'cm',
      explain: 'Make a shape whose outer boundary length equals 12 cm.'
    },
    {
      roundNum: 7,
      type: 'area',
      badge: 'ISLAND 07 • LARGE GARDEN (8 cm²)',
      prompt: 'BUILD AN 8 cm² GARDEN (e.g. 4×2 or 2×4)',
      tip: '4 × 2 = 8 cm² unit tiles',
      targetVal: 8,
      unit: 'cm²',
      explain: 'Fill exactly 8 unit squares (8 cm²).'
    },
    {
      roundNum: 8,
      type: 'perimeter',
      badge: 'ISLAND 08 • PERIMETER (14 cm)',
      prompt: 'BUILD A SHAPE WITH 14 cm PERIMETER',
      tip: 'A 4cm by 3cm rectangle has perimeter 2×(4+3) = 14 cm!',
      targetVal: 14,
      unit: 'cm',
      explain: 'Create a shape with an outer perimeter of 14 cm.'
    },
    {
      roundNum: 9,
      type: 'area',
      badge: 'ISLAND 09 • ARCHIPELAGO PLOT (10 cm²)',
      prompt: 'BUILD A 10 cm² TEMPLE TERRACE',
      tip: 'Fill 10 unit squares (e.g. 5×2 or custom shape)!',
      targetVal: 10,
      unit: 'cm²',
      explain: 'Terrace requires exactly 10 cm² of unit squares.'
    },
    {
      roundNum: 10,
      badge: 'ISLAND 10 • PIRATE KING VAULT FINALE (12 cm²)',
      prompt: 'UNLOCK PIRATE KING VAULT: BUILD 12 cm² PLOT',
      tip: 'Fill 12 unit squares (e.g. 4×3 or 6×2) to open the legendary golden chest!',
      targetVal: 12,
      unit: 'cm²',
      explain: 'Fill 12 unit squares to unlock the Pirate King’s grand treasure chest!'
    }
  ];

  // ==========================================================================
  // 3. GAME STATE & GRID VARIABLES
  // ==========================================================================
  let currentRoundIdx = 0;
  let score = 0;
  let lives = 3;
  let combo = 1;
  let bestCombo = 1;
  let totalChestsOpened = 0;
  let totalAttempts = 0;
  let timeRemaining = 90;
  let gameTimerInterval = null;
  let gameStartTime = 0;
  let isPlaying = false;
  let isGameOver = false;

  const GRID_COLS = 6;
  const GRID_ROWS = 6;
  let gridTiles = [];

  // Interaction Tool & Drag State
  let currentTool = 'brush'; // 'brush' or 'box'
  let isPointerDragging = false;
  let dragModePaint = true; // true = paint, false = erase
  let dragStartCell = null; // { r, c }
  let dragCurrentCell = null; // { r, c }
  let hoveredCell = null; // { r, c }

  // Key & Chest Unlock Animation
  let isUnlockingSequence = false;
  let keyAnimProgress = 0; // 0 to 1
  let chestOpenAnimTimer = 0;

  // Visual Effects
  let oceanWavePhase = 0;
  let particles = [];
  let floatingTexts = [];

  let canvas = null;
  let ctx = null;
  let animationFrameId = null;

  function resetGrid() {
    gridTiles = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      gridTiles[r] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        gridTiles[r][c] = false;
      }
    }
  }

  function calculateCurrentMetrics() {
    let currentArea = 0;
    let currentPerimeter = 0;
    let minR = 999, maxR = -1, minC = 999, maxC = -1;

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (gridTiles[r][c]) {
          currentArea++;
          if (r < minR) minR = r;
          if (r > maxR) maxR = r;
          if (c < minC) minC = c;
          if (c > maxC) maxC = c;

          if (r === 0 || !gridTiles[r - 1][c]) currentPerimeter++;
          if (r === GRID_ROWS - 1 || !gridTiles[r + 1][c]) currentPerimeter++;
          if (c === 0 || !gridTiles[r][c - 1]) currentPerimeter++;
          if (c === GRID_COLS - 1 || !gridTiles[r][c + 1]) currentPerimeter++;
        }
      }
    }

    const bbox = currentArea > 0 ? {
      minR, maxR, minC, maxC,
      widthCm: maxC - minC + 1,
      heightCm: maxR - minR + 1
    } : null;

    return { area: currentArea, perimeter: currentPerimeter, bbox };
  }

  // ==========================================================================
  // 4. SCREEN & HUD MANAGEMENT
  // ==========================================================================
  function setScreen(screenId) {
    const screens = ['start-screen', 'countdown-screen', 'instructions-modal', 'game-over-screen'];
    screens.forEach(id => {
      const el = getEl(id);
      if (el) {
        if (id === screenId) {
          el.classList.remove('hidden');
          el.classList.add('active');
        } else {
          el.classList.add('hidden');
          el.classList.remove('active');
        }
      }
    });
  }

  function updateHUD() {
    const scoreEl = getEl('score-display');
    const timerEl = getEl('timer-display');
    const roundEl = getEl('round-display');
    const comboEl = getEl('combo-display');
    const quotaEl = getEl('plot-counter');

    if (scoreEl) scoreEl.textContent = String(score).padStart(6, '0');
    if (timerEl) timerEl.textContent = String(Math.max(0, timeRemaining)).padStart(3, '0');
    if (roundEl) roundEl.textContent = `${String(currentRoundIdx + 1).padStart(2, '0')} / 10`;
    if (comboEl) comboEl.textContent = `${combo}x`;

    const qData = ISLAND_QUESTS[currentRoundIdx];
    const metrics = calculateCurrentMetrics();

    if (quotaEl && qData) {
      if (qData.type === 'area') {
        const isMatched = metrics.area === qData.targetVal;
        quotaEl.textContent = `AREA: ${metrics.area} / ${qData.targetVal} cm²` + (isMatched ? ' ✓' : '');
      } else {
        const isMatched = metrics.perimeter === qData.targetVal;
        quotaEl.textContent = `PERIMETER: ${metrics.perimeter} / ${qData.targetVal} cm` + (isMatched ? ' ✓' : '');
      }
    }

    const heartsContainer = getEl('lives-container');
    if (heartsContainer) {
      let heartsHtml = '';
      for (let i = 0; i < 3; i++) {
        const isFull = i < lives;
        heartsHtml += `<span class="arcade-heart ${isFull ? 'heart-full' : 'heart-empty'}" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></span>`;
      }
      heartsContainer.innerHTML = heartsHtml;
    }
  }

  function updateObjectiveBanner() {
    const qData = ISLAND_QUESTS[currentRoundIdx];
    if (!qData) return;

    const badgeEl = getEl('question-badge');
    const promptEl = getEl('question-prompt');
    const tipEl = getEl('question-tip');

    if (badgeEl) badgeEl.textContent = qData.badge;
    if (promptEl) promptEl.textContent = qData.prompt;
    if (tipEl) tipEl.textContent = qData.tip;

    updateHUD();
  }

  function showHint(text) {
    const hintBanner = getEl('hint-banner');
    const hintText = getEl('hint-text');
    if (hintBanner && hintText) {
      hintText.textContent = text;
      hintBanner.classList.remove('hidden');
      setTimeout(() => {
        hintBanner.classList.add('hidden');
      }, 3800);
    }
  }

  // ==========================================================================
  // 5. UNLOCK CHEST EVALUATION & SEQUENCE
  // ==========================================================================
  function unlockChest() {
    if (!isPlaying || isGameOver || isUnlockingSequence) return;
    totalAttempts++;

    const qData = ISLAND_QUESTS[currentRoundIdx];
    const metrics = calculateCurrentMetrics();
    const currentVal = (qData.type === 'area') ? metrics.area : metrics.perimeter;

    isUnlockingSequence = true;
    keyAnimProgress = 0;
    playKeyTurnSound();

    // Key animation timeline
    const keyInterval = setInterval(() => {
      keyAnimProgress += 0.08;
      if (keyAnimProgress >= 1) {
        clearInterval(keyInterval);
        isUnlockingSequence = false;
        evaluateUnlock(currentVal, qData);
      }
    }, 25);
  }

  function evaluateUnlock(currentVal, qData) {
    if (currentVal === qData.targetVal) {
      // CORRECT PLOT BUILT & CHEST UNLOCKED!
      playChestOpenSound();
      totalChestsOpened++;
      chestOpenAnimTimer = 45;

      const pts = 70 * combo;
      score += pts;
      combo = Math.min(8, combo + 1);
      if (combo > bestCombo) bestCombo = combo;

      floatingTexts.push({
        x: canvas.width / 2,
        y: canvas.height * 0.22,
        text: `+${pts} PTS! CHEST UNLOCKED! 🏆`,
        color: '#fbbf24',
        alpha: 1,
        life: 55,
        scale: 1.4
      });

      // Erupting Golden Doubloons & Gems
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 3 + Math.random() * 8;
        particles.push({
          x: canvas.width / 2,
          y: canvas.height * 0.22,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - 4,
          radius: 4 + Math.random() * 5,
          color: ['#f59e0b', '#fbbf24', '#fde047', '#ef4444', '#3b82f6', '#10b981'][Math.floor(Math.random() * 6)],
          isCoin: Math.random() < 0.6,
          rot: Math.random() * Math.PI,
          vrot: (Math.random() - 0.5) * 0.3,
          alpha: 1,
          life: 45 + Math.random() * 25
        });
      }

      if (currentRoundIdx + 1 < ISLAND_QUESTS.length) {
        currentRoundIdx++;
        resetGrid();
        updateObjectiveBanner();
      } else {
        endGame(true);
      }

    } else {
      // INCORRECT DIMENSIONS
      playWrongSound();
      lives--;
      combo = 1;

      floatingTexts.push({
        x: canvas.width / 2,
        y: canvas.height * 0.24,
        text: `NOT MATCHING ${qData.targetVal} ${qData.unit}! (Current: ${currentVal}) -1 LIFE`,
        color: '#ef4444',
        alpha: 1,
        life: 60,
        scale: 1.2
      });

      showHint(qData.explain);
      updateHUD();

      if (lives <= 0) {
        endGame(false);
      }
    }
  }

  // ==========================================================================
  // 6. GRID CANVAS GEOMETRY & DRAG MANIPULATION
  // ==========================================================================
  function getGridBox() {
    const size = Math.min(canvas.width * 0.64, canvas.height * 0.50);
    const cellSize = size / GRID_COLS;
    const startX = (canvas.width - size) / 2 + 15;
    const startY = canvas.height * 0.42;
    return { startX, startY, size, cellSize };
  }

  function getCellAt(clientX, clientY) {
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const { startX, startY, size, cellSize } = getGridBox();

    if (x >= startX && x <= startX + size && y >= startY && y <= startY + size) {
      const col = Math.floor((x - startX) / cellSize);
      const row = Math.floor((y - startY) / cellSize);
      if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
        return { r: row, c: col };
      }
    }
    return null;
  }

  function handlePointerDown(clientX, clientY) {
    if (!isPlaying || isGameOver || isUnlockingSequence) return;
    const cell = getCellAt(clientX, clientY);
    if (!cell) return;

    isPointerDragging = true;
    dragStartCell = { ...cell };
    dragCurrentCell = { ...cell };

    if (currentTool === 'brush') {
      dragModePaint = !gridTiles[cell.r][cell.c];
      gridTiles[cell.r][cell.c] = dragModePaint;
      if (dragModePaint) playTilePlaceSound();
      else playTileEraseSound();
      updateHUD();
    }
  }

  function handlePointerMove(clientX, clientY) {
    if (!isPlaying || isGameOver || !canvas) return;
    const cell = getCellAt(clientX, clientY);
    hoveredCell = cell;

    if (!isPointerDragging || !cell) return;

    if (currentTool === 'brush') {
      if (gridTiles[cell.r][cell.c] !== dragModePaint) {
        gridTiles[cell.r][cell.c] = dragModePaint;
        if (dragModePaint) playTilePlaceSound();
        else playTileEraseSound();
        updateHUD();
      }
    } else if (currentTool === 'box') {
      dragCurrentCell = { ...cell };
    }
  }

  function handlePointerUp() {
    if (!isPointerDragging) return;

    if (currentTool === 'box' && dragStartCell && dragCurrentCell) {
      const r1 = Math.min(dragStartCell.r, dragCurrentCell.r);
      const r2 = Math.max(dragStartCell.r, dragCurrentCell.r);
      const c1 = Math.min(dragStartCell.c, dragCurrentCell.c);
      const c2 = Math.max(dragStartCell.c, dragCurrentCell.c);

      // Fill rectangular box area
      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
          gridTiles[r][c] = true;
        }
      }
      playTilePlaceSound();
      updateHUD();
    }

    isPointerDragging = false;
    dragStartCell = null;
    dragCurrentCell = null;
  }

  // ==========================================================================
  // 7. GAME LOOP & RENDERING
  // ==========================================================================
  function update() {
    if (chestOpenAnimTimer > 0) chestOpenAnimTimer--;
    oceanWavePhase += 0.03;

    if (screenShakeIntensity > 0.1) {
      screenShakeIntensity *= 0.88;
    } else {
      screenShakeIntensity = 0;
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18;
      p.alpha -= 0.022;
      p.life--;
      if (p.isCoin) p.rot += p.vrot;

      if (p.life <= 0 || p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y -= 1.2;
      ft.alpha -= 0.02;
      ft.life--;
      if (ft.life <= 0 || ft.alpha <= 0) {
        floatingTexts.splice(i, 1);
      }
    }
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    if (screenShakeIntensity > 0) {
      const sx = (Math.random() - 0.5) * screenShakeIntensity;
      const sy = (Math.random() - 0.5) * screenShakeIntensity;
      ctx.translate(sx, sy);
    }

    // 1. TROPICAL OCEAN BACKGROUND WITH ROLLING SINE WAVES
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    oceanGrad.addColorStop(0, '#06132b');
    oceanGrad.addColorStop(0.4, '#093a68');
    oceanGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sine Wave Ocean Ripples
    for (let layer = 0; layer < 4; layer++) {
      ctx.beginPath();
      const waveY = canvas.height * (0.28 + layer * 0.18);
      ctx.moveTo(0, waveY);
      for (let x = 0; x <= canvas.width; x += 30) {
        const yOffset = Math.sin(x * 0.015 + oceanWavePhase + layer * 1.5) * 6;
        ctx.lineTo(x, waveY + yOffset);
      }
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.15)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // 2. PIRATE ISLAND SAND ATOLL & SHORELINE SURF
    const islandCenterX = canvas.width / 2;
    const islandCenterY = canvas.height * 0.65;
    const islandRadiusX = canvas.width * 0.46;
    const islandRadiusY = canvas.height * 0.35;

    // Foaming Shoreline Surf
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.ellipse(islandCenterX, islandCenterY, islandRadiusX + 12 + Math.sin(oceanWavePhase * 2) * 4, islandRadiusY + 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Golden Sand Atoll
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(islandCenterX, islandCenterY, islandRadiusX, islandRadiusY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Lush Island Grass Meadow
    ctx.fillStyle = '#065f46';
    ctx.beginPath();
    ctx.ellipse(islandCenterX, islandCenterY, islandRadiusX * 0.86, islandRadiusY * 0.84, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. TROPICAL PALM TREES WITH SWAYING FRONDS
    const sway = Math.sin(oceanWavePhase * 1.5) * 4;

    // Left Palm
    ctx.fillStyle = '#78350f';
    ctx.fillRect(40, canvas.height * 0.36, 16, 90);
    // Fronds
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.ellipse(48 + sway, canvas.height * 0.36, 45, 24, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.ellipse(44 - sway, canvas.height * 0.34, 38, 20, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Right Palm
    ctx.fillStyle = '#78350f';
    ctx.fillRect(canvas.width - 56, canvas.height * 0.36, 16, 90);
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.ellipse(canvas.width - 48 - sway, canvas.height * 0.36, 45, 24, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.ellipse(canvas.width - 44 + sway, canvas.height * 0.34, 38, 20, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // 4. PIRATE TREASURE CHEST AT TOP OF ISLAND
    const chestX = canvas.width / 2;
    const chestY = canvas.height * 0.21;
    const currentMetrics = calculateCurrentMetrics();
    const qData = ISLAND_QUESTS[currentRoundIdx];
    const target = qData ? qData.targetVal : 1;
    const currentVal = qData && qData.type === 'perimeter' ? currentMetrics.perimeter : currentMetrics.area;
    const progress = Math.max(0, Math.min(1, currentVal / target));

    ctx.save();
    ctx.translate(chestX, chestY);

    // Glowing Golden Progress Ring
    ctx.beginPath();
    ctx.arc(0, 0, 56, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
    ctx.strokeStyle = currentVal === target ? '#10b981' : '#fbbf24';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 56, -Math.PI / 2 + Math.PI * 2 * progress, Math.PI * 1.5);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, 24, 44, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // Chest Body
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(-36, -6, 72, 34, 6);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Metal Straps
    ctx.fillStyle = '#92400e';
    ctx.fillRect(-22, -6, 8, 34);
    ctx.fillRect(14, -6, 8, 34);

    // Chest Lid
    if (chestOpenAnimTimer > 0) {
      // Open Lid
      ctx.fillStyle = '#9a3412';
      ctx.beginPath();
      ctx.roundRect(-36, -36, 72, 26, 6);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Golden Treasure Glow Beam
      const rayGrad = ctx.createLinearGradient(0, 0, 0, -80);
      rayGrad.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
      rayGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(-24, 0);
      ctx.lineTo(24, 0);
      ctx.lineTo(50, -90);
      ctx.lineTo(-50, -90);
      ctx.closePath();
      ctx.fill();
    } else {
      // Closed Lid
      ctx.fillStyle = '#9a3412';
      ctx.beginPath();
      ctx.roundRect(-38, -26, 76, 24, 6);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Golden Keyhole Lock
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, 4, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-2.5, 4, 5, 7);
    }

    // Animated Flying / Turning Key during Unlock
    if (isUnlockingSequence) {
      const keyY = 4 - (1 - keyAnimProgress) * 40;
      const keyRot = keyAnimProgress * Math.PI * 0.5;

      ctx.save();
      ctx.translate(0, keyY);
      ctx.rotate(keyRot);

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, -8, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-2, -8, 4, 16);
      ctx.fillRect(-2, 4, 6, 3);
      ctx.fillRect(-2, 0, 5, 3);

      ctx.restore();
    }

    ctx.restore();

    // 5. ANCIENT STONE COORDINATE GRID TABLET
    const { startX, startY, size, cellSize } = getGridBox();

    // Stone Foundation Plate
    ctx.fillStyle = '#0f1d38';
    ctx.beginPath();
    ctx.roundRect(startX - 28, startY - 28, size + 44, size + 44, 14);
    ctx.fill();
    ctx.strokeStyle = '#1e3a6a';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Coordinate Rulers: Top & Left (cm Labels & Tick Marks)
    ctx.fillStyle = '#94a3b8';
    ctx.font = "900 11px 'Fredoka', cursive, sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Top Ruler (1cm to 6cm)
    for (let c = 0; c < GRID_COLS; c++) {
      const rx = startX + c * cellSize + cellSize / 2;
      ctx.fillText(`${c + 1}cm`, rx, startY - 14);

      // Graduation ticks
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(startX + c * cellSize, startY - 6);
      ctx.lineTo(startX + c * cellSize, startY);
      ctx.stroke();
    }

    // Left Ruler (1cm to 6cm)
    ctx.textAlign = 'right';
    for (let r = 0; r < GRID_ROWS; r++) {
      const ry = startY + r * cellSize + cellSize / 2;
      ctx.fillText(`${r + 1}cm`, startX - 10, ry);

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(startX - 6, startY + r * cellSize);
      ctx.lineTo(startX, startY + r * cellSize);
      ctx.stroke();
    }

    // Draw Grid Cells & Sprouting Flora / Rune Tiles
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const cx = startX + c * cellSize;
        const cy = startY + r * cellSize;
        const isFilled = gridTiles[r][c];

        if (isFilled) {
          // Planted Rich Garden Tile
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.roundRect(cx + 2, cy + 2, cellSize - 4, cellSize - 4, 4);
          ctx.fill();
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Sprouting Plant / Flower Center Icon
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(cx + cellSize / 2, cy + cellSize / 2 - 4, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = `900 ${Math.max(9, Math.round(cellSize * 0.20))}px 'Fredoka', cursive, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('1 cm²', cx + cellSize / 2, cy + cellSize / 2 + 8);
        } else {
          // Empty Ancient Soil Grid Slot
          ctx.fillStyle = '#132448';
          ctx.fillRect(cx + 1, cy + 1, cellSize - 2, cellSize - 2);
          ctx.strokeStyle = '#1e3a6a';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(cx, cy, cellSize, cellSize);
        }

        // Hover Highlight
        if (hoveredCell && hoveredCell.r === r && hoveredCell.c === c && !isPointerDragging) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
          ctx.fillRect(cx + 1, cy + 1, cellSize - 2, cellSize - 2);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.strokeRect(cx + 1, cy + 1, cellSize - 2, cellSize - 2);
        }
      }
    }

    // Box Drag Preview Rectangle
    if (isPointerDragging && currentTool === 'box' && dragStartCell && dragCurrentCell) {
      const r1 = Math.min(dragStartCell.r, dragCurrentCell.r);
      const r2 = Math.max(dragStartCell.r, dragCurrentCell.r);
      const c1 = Math.min(dragStartCell.c, dragCurrentCell.c);
      const c2 = Math.max(dragStartCell.c, dragCurrentCell.c);

      const bx = startX + c1 * cellSize;
      const by = startY + r1 * cellSize;
      const bw = (c2 - c1 + 1) * cellSize;
      const bh = (r2 - r1 + 1) * cellSize;

      ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(bx, by, bw, bh);
      ctx.setLineDash([]);

      // Dimensions tag
      const boxW = c2 - c1 + 1;
      const boxH = r2 - r1 + 1;
      ctx.fillStyle = '#fbbf24';
      ctx.font = "900 13px 'Fredoka', cursive, sans-serif";
      ctx.textAlign = 'center';
      ctx.fillText(`${boxW}cm × ${boxH}cm (${boxW * boxH} cm²)`, bx + bw / 2, by + bh / 2);
    }

    // 6. DYNAMIC DIMENSION BRACKETS & GLOWING PERIMETER BOUNDARIES
    if (currentMetrics.bbox) {
      const { minR, maxR, minC, maxC, widthCm, heightCm } = currentMetrics.bbox;
      const px = startX + minC * cellSize;
      const py = startY + minR * cellSize;
      const pw = (maxC - minC + 1) * cellSize;
      const ph = (maxR - minR + 1) * cellSize;

      // Outer Perimeter Neon Glow
      const isTargetMatched = currentVal === target;
      ctx.strokeStyle = isTargetMatched ? '#fbbf24' : '#38bdf8';
      ctx.lineWidth = isTargetMatched ? 3.5 : 2;

      // Draw boundary edges
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          if (gridTiles[r][c]) {
            const x = startX + c * cellSize;
            const y = startY + r * cellSize;

            ctx.beginPath();
            if (r === 0 || !gridTiles[r - 1][c]) { ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y); }
            if (r === GRID_ROWS - 1 || !gridTiles[r + 1][c]) { ctx.moveTo(x, y + cellSize); ctx.lineTo(x + cellSize, y + cellSize); }
            if (c === 0 || !gridTiles[r][c - 1]) { ctx.moveTo(x, y); ctx.lineTo(x, y + cellSize); }
            if (c === GRID_COLS - 1 || !gridTiles[r][c + 1]) { ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize); }
            ctx.stroke();
          }
        }
      }

      // Width & Height Brackets
      ctx.fillStyle = '#fbbf24';
      ctx.font = "900 12px 'Fredoka', cursive, sans-serif";
      ctx.textAlign = 'center';
      ctx.fillText(`W: ${widthCm} cm`, px + pw / 2, py - 8);

      ctx.textAlign = 'left';
      ctx.fillText(`H: ${heightCm} cm`, px + pw + 6, py + ph / 2);
    }

    // 7. RENDER PARTICLES & COINS
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);

      if (p.isCoin) {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.radius, p.radius * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // 8. RENDER FLOATING TEXTS
    floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = ft.color;
      const size = Math.round(18 * (ft.scale || 1.0));
      ctx.font = `900 ${size}px 'Fredoka', cursive, sans-serif`;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 8;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    ctx.restore();
  }

  function gameLoop() {
    update();
    render();
    if (isPlaying) {
      animationFrameId = requestAnimationFrame(gameLoop);
    }
  }

  // ==========================================================================
  // 8. START, COUNTDOWN & END GAME
  // ==========================================================================
  function startGame() {
    currentRoundIdx = 0;
    score = 0;
    lives = 3;
    combo = 1;
    bestCombo = 1;
    totalChestsOpened = 0;
    totalAttempts = 0;
    timeRemaining = 90;
    chestOpenAnimTimer = 0;
    isUnlockingSequence = false;
    particles = [];
    floatingTexts = [];
    isPlaying = true;
    isGameOver = false;
    gameStartTime = Date.now();

    resetGrid();
    setScreen(null);
    updateObjectiveBanner();
    startPirateBGM();

    if (gameTimerInterval) clearInterval(gameTimerInterval);
    gameTimerInterval = setInterval(() => {
      if (!isPlaying || isGameOver) return;
      timeRemaining--;
      updateHUD();
      if (timeRemaining <= 0) {
        endGame(totalChestsOpened >= 6);
      }
    }, 1000);

    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function startCountdown() {
    initAudio();
    setScreen('countdown-screen');
    let count = 3;
    const numEl = getEl('countdown-number');
    if (numEl) numEl.textContent = count;
    beep(440, 100, 'sine', 0.15);

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        if (numEl) numEl.textContent = count;
        beep(440, 100, 'sine', 0.15);
      } else {
        clearInterval(interval);
        beep(880, 250, 'sine', 0.2);
        startGame();
      }
    }, 750);
  }

  function endGame(isVictory) {
    isPlaying = false;
    isGameOver = true;
    stopPirateBGM();
    if (gameTimerInterval) clearInterval(gameTimerInterval);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    const totalTimeTaken = Math.round((Date.now() - gameStartTime) / 1000);
    const accuracy = totalAttempts > 0 ? Math.round((totalChestsOpened / totalAttempts) * 100) : 100;

    let stars = 1;
    if (score >= 480 && lives >= 2) stars = 3;
    else if (score >= 260) stars = 2;

    safeStorage.setItem('math_treasure_stars', stars);

    if (isVictory) {
      playChestOpenSound();
    } else {
      playWrongSound();
    }

    const badgeEl = getEl('game-over-badge');
    const titleEl = getEl('game-over-title');
    const scoreEl = getEl('final-score');
    const roundsEl = getEl('final-rounds');
    const accuracyEl = getEl('final-accuracy');
    const comboEl = getEl('final-combo');
    const timeEl = getEl('final-time');
    const starsContainer = getEl('stars-container');

    if (badgeEl) badgeEl.textContent = isVictory ? 'VAULT UNLOCKED!' : 'ISLAND QUEST FINISHED';
    if (titleEl) titleEl.textContent = isVictory ? 'TREASURE MASTER!' : 'NICE EXPLORATION!';
    if (scoreEl) scoreEl.textContent = String(score).padStart(6, '0');
    if (roundsEl) roundsEl.textContent = `${Math.min(10, currentRoundIdx + (isVictory ? 1 : 0))} / 10`;
    if (accuracyEl) accuracyEl.textContent = `${accuracy}%`;
    if (comboEl) comboEl.textContent = `${bestCombo}x`;
    if (timeEl) timeEl.textContent = `${totalTimeTaken}s`;

    if (starsContainer) {
      let starsHtml = '';
      for (let s = 1; s <= 3; s++) {
        const active = s <= stars ? 'star-active' : '';
        starsHtml += `<span class="arcade-star ${active}"><svg viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg></span>`;
      }
      starsContainer.innerHTML = starsHtml;
    }

    setScreen('game-over-screen');

    // StuCent Reporting Contract
    if (gameCtx && typeof gameCtx.end === 'function') {
      const targetMax = (gameCtx.config && gameCtx.config.maxPoints) || 100;
      const normalizedScore = Math.min(targetMax, Math.round((score / 800) * targetMax));
      gameCtx.end({
        score: normalizedScore,
        maxScore: targetMax,
        timeTaken: totalTimeTaken,
        success: isVictory || normalizedScore >= 50
      });
    }
  }

  // ==========================================================================
  // 9. CONTROLS & RESIZING
  // ==========================================================================
  function resizeCanvas() {
    if (!canvas) {
      canvas = getEl('game-canvas');
      if (canvas) ctx = canvas.getContext('2d');
    }
    const container = getEl('canvas-viewport');
    if (!container || !canvas || !ctx) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width || 800;
    const h = rect.height || 600;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function setupControls() {
    window.addEventListener('resize', resizeCanvas);

    // Canvas Pointer Manipulation (Paint / Drag)
    if (canvas) {
      canvas.addEventListener('pointerdown', (e) => {
        handlePointerDown(e.clientX, e.clientY);
      });

      canvas.addEventListener('pointermove', (e) => {
        handlePointerMove(e.clientX, e.clientY);
      });

      window.addEventListener('pointerup', () => {
        handlePointerUp();
      });

      canvas.addEventListener('pointercancel', () => {
        handlePointerUp();
      });
    }

    // Tool Selector Buttons
    const brushBtn = getEl('tool-brush-btn');
    const boxBtn = getEl('tool-box-btn');

    if (brushBtn) {
      brushBtn.addEventListener('click', () => {
        currentTool = 'brush';
        brushBtn.classList.add('active');
        if (boxBtn) boxBtn.classList.remove('active');
      });
    }

    if (boxBtn) {
      boxBtn.addEventListener('click', () => {
        currentTool = 'box';
        boxBtn.classList.add('active');
        if (brushBtn) brushBtn.classList.remove('active');
      });
    }

    // Action Bar Buttons
    const btnClear = getEl('btn-clear-plot');
    const btnUnlock = getEl('btn-unlock-chest');

    if (btnClear) {
      btnClear.addEventListener('click', () => {
        resetGrid();
        playTileEraseSound();
        updateHUD();
      });
    }

    if (btnUnlock) {
      btnUnlock.addEventListener('click', () => {
        unlockChest();
      });
    }

    // Modal Buttons
    const startBtn = getEl('start-game-btn');
    const howToBtn = getEl('how-to-play-btn');
    const hudRulesBtn = getEl('hud-how-to-play-btn');
    const closeInstBtn = getEl('close-instructions-btn');
    const startFromInstBtn = getEl('start-from-instructions-btn');
    const playAgainBtn = getEl('play-again-btn');
    const soundBtn = getEl('sound-toggle-btn');

    if (startBtn) startBtn.addEventListener('click', startCountdown);
    if (howToBtn) howToBtn.addEventListener('click', () => setScreen('instructions-modal'));
    if (hudRulesBtn) hudRulesBtn.addEventListener('click', () => setScreen('instructions-modal'));
    if (closeInstBtn) closeInstBtn.addEventListener('click', () => setScreen('start-screen'));
    if (startFromInstBtn) startFromInstBtn.addEventListener('click', startCountdown);
    if (playAgainBtn) playAgainBtn.addEventListener('click', startCountdown);

    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        safeStorage.setItem('math_games_sound', isMuted ? 'false' : 'true');
        if (isMuted) {
          stopPirateBGM();
        } else if (isPlaying && !isGameOver) {
          startPirateBGM();
        }
      });
    }
  }

  // ==========================================================================
  // 10. STUCENT INIT & BOOTSTRAP
  // ==========================================================================
  window.game = window.game || {};
  window.game.init = function (config) {
    window.game.config = config || {};
  };

  function init() {
    canvas = getEl('game-canvas');
    if (canvas) ctx = canvas.getContext('2d');
    resetGrid();
    resizeCanvas();
    setupControls();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
