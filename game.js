/**
 * GAME 5: GRID ISLAND — AREA & PERIMETER RETRO ARCADE ENGINE
 * Cambridge Year 4 Unit Square Grids (cm² and cm) Direct Manipulation
 * StuCent Sandboxed Runtime Compatible
 */

(() => {
  'use strict';

  const doc = typeof root !== 'undefined' ? root : document;
  const gameCtx = typeof game !== 'undefined' ? game : (window.game || null);

  // ==========================================================================
  // 1. SOUND SYNTHESIZER & PROCEDURAL PIRATE BGM
  // ==========================================================================
  let audioCtx = null;
  let isMuted = localStorage.getItem('math_games_sound') === 'false';
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

  function playTileClickSound() {
    beep(520, 50, 'triangle', 0.15);
  }

  function playChestOpenSound() {
    [523.25, 659.25, 783.99, 1046.50, 1318.5].forEach((f, i) => {
      beep(f, 180, 'sine', 0.18, i * 0.08);
    });
    triggerScreenShake(8);
  }

  function playWrongSound() {
    beep(180, 250, 'sawtooth', 0.2);
    beep(130, 250, 'square', 0.15, 0.08);
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
      tip: 'Click grid squares directly on the island to plant 6 unit tiles (1 cm² each)!',
      targetVal: 6,
      unit: 'cm²',
      explain: 'Click 6 unit squares on the plot so total area equals 6 cm².'
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
      prompt: 'PLACE FENCE POSTS FOR 10 cm PERIMETER',
      tip: 'A 3cm by 2cm rectangle has perimeter 3 + 2 + 3 + 2 = 10 cm!',
      targetVal: 10,
      unit: 'cm',
      explain: 'Perimeter is the total boundary length around the outside (10 cm).'
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
      badge: 'ISLAND 06 • L-SHAPE PERIMETER (12 cm)',
      prompt: 'ENCLOSE A SHAPE WITH 12 cm PERIMETER',
      tip: 'Count every outer 1cm boundary edge around your shape!',
      targetVal: 12,
      unit: 'cm',
      explain: 'Make a shape whose outer boundary equals 12 cm.'
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
      badge: 'ISLAND 08 • T-SHAPE PERIMETER (14 cm)',
      prompt: 'BUILD A SHAPE WITH 14 cm PERIMETER',
      tip: 'A 4cm by 3cm rectangle has perimeter 2(4+3) = 14 cm!',
      targetVal: 14,
      unit: 'cm',
      explain: 'Create a shape with an outer perimeter of 14 cm.'
    },
    {
      roundNum: 9,
      type: 'area',
      badge: 'ISLAND 09 • ARCHIPELAGO PLOT (10 cm²)',
      prompt: 'BUILD A 10 cm² TEMPLE TERRACE',
      tip: 'Fill 10 unit squares (5×2 or custom shape)!',
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

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (gridTiles[r][c]) {
          currentArea++;

          if (r === 0 || !gridTiles[r - 1][c]) currentPerimeter++;
          if (r === GRID_ROWS - 1 || !gridTiles[r + 1][c]) currentPerimeter++;
          if (c === 0 || !gridTiles[r][c - 1]) currentPerimeter++;
          if (c === GRID_COLS - 1 || !gridTiles[r][c + 1]) currentPerimeter++;
        }
      }
    }

    return { area: currentArea, perimeter: currentPerimeter };
  }

  let particles = [];
  let floatingTexts = [];
  let chestOpenAnimTimer = 0;

  const canvas = doc.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  let animationFrameId = null;

  // ==========================================================================
  // 4. SCREEN & HUD MANAGEMENT
  // ==========================================================================
  function setScreen(screenId) {
    const screens = ['start-screen', 'countdown-screen', 'instructions-modal', 'game-over-screen'];
    screens.forEach(id => {
      const el = doc.getElementById(id);
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
    const scoreEl = doc.getElementById('score-display');
    const timerEl = doc.getElementById('timer-display');
    const roundEl = doc.getElementById('round-display');
    const comboEl = doc.getElementById('combo-display');
    const quotaEl = doc.getElementById('plot-counter');

    if (scoreEl) scoreEl.textContent = String(score).padStart(6, '0');
    if (timerEl) timerEl.textContent = String(Math.max(0, timeRemaining)).padStart(3, '0');
    if (roundEl) roundEl.textContent = `${String(currentRoundIdx + 1).padStart(2, '0')} / 10`;
    if (comboEl) comboEl.textContent = `${combo}x`;

    const qData = ISLAND_QUESTS[currentRoundIdx];
    const metrics = calculateCurrentMetrics();

    if (quotaEl && qData) {
      if (qData.type === 'area') {
        quotaEl.textContent = `AREA: ${metrics.area} / ${qData.targetVal} cm²`;
      } else {
        quotaEl.textContent = `PERIMETER: ${metrics.perimeter} / ${qData.targetVal} cm`;
      }
    }

    const heartsContainer = doc.getElementById('lives-container');
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

    const badgeEl = doc.getElementById('question-badge');
    const promptEl = doc.getElementById('question-prompt');
    const tipEl = doc.getElementById('question-tip');

    if (badgeEl) badgeEl.textContent = qData.badge;
    if (promptEl) promptEl.textContent = qData.prompt;
    if (tipEl) tipEl.textContent = qData.tip;

    updateHUD();
  }

  function showHint(text) {
    const hintBanner = doc.getElementById('hint-banner');
    const hintText = doc.getElementById('hint-text');
    if (hintBanner && hintText) {
      hintText.textContent = text;
      hintBanner.classList.remove('hidden');
      setTimeout(() => {
        hintBanner.classList.add('hidden');
      }, 3800);
    }
  }

  // ==========================================================================
  // 5. UNLOCK CHEST EVALUATION
  // ==========================================================================
  function unlockChest() {
    if (!isPlaying || isGameOver) return;
    totalAttempts++;

    const qData = ISLAND_QUESTS[currentRoundIdx];
    const metrics = calculateCurrentMetrics();
    const currentVal = (qData.type === 'area') ? metrics.area : metrics.perimeter;

    if (currentVal === qData.targetVal) {
      // CORRECT PLOT BUILT & CHEST UNLOCKED!
      playChestOpenSound();
      totalChestsOpened++;
      chestOpenAnimTimer = 40;

      const pts = 70 * combo;
      score += pts;
      combo = Math.min(8, combo + 1);
      if (combo > bestCombo) bestCombo = combo;

      floatingTexts.push({
        x: canvas.width / 2,
        y: canvas.height * 0.28,
        text: `+${pts} PTS! CHEST UNLOCKED!`,
        color: '#fbbf24',
        alpha: 1,
        life: 50
      });

      for (let i = 0; i < 26; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 3 + Math.random() * 7;
        particles.push({
          x: canvas.width / 2,
          y: canvas.height * 0.25,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - 3,
          radius: 4 + Math.random() * 4,
          color: ['#f59e0b', '#fbbf24', '#fde047', '#10b981'][Math.floor(Math.random() * 4)],
          alpha: 1,
          life: 40
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
        y: canvas.height * 0.28,
        text: `NOT MATCHING ${qData.targetVal} ${qData.unit}! (Current: ${currentVal}) -1 LIFE`,
        color: '#ef4444',
        alpha: 1,
        life: 55
      });

      showHint(qData.explain);
      updateHUD();

      if (lives <= 0) {
        endGame(false);
      }
    }
  }

  // ==========================================================================
  // 6. GRID CANVAS RENDERING & INTERACTION
  // ==========================================================================
  function getGridBox() {
    const size = Math.min(canvas.width * 0.68, canvas.height * 0.52);
    const cellSize = size / GRID_COLS;
    const startX = (canvas.width - size) / 2;
    const startY = canvas.height * 0.40;
    return { startX, startY, size, cellSize };
  }

  function handleCanvasClick(clientX, clientY) {
    if (!isPlaying || isGameOver) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const { startX, startY, size, cellSize } = getGridBox();

    if (x >= startX && x <= startX + size && y >= startY && y <= startY + size) {
      const col = Math.floor((x - startX) / cellSize);
      const row = Math.floor((y - startY) / cellSize);

      if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
        gridTiles[row][col] = !gridTiles[row][col];
        playTileClickSound();
        updateHUD();
      }
    }
  }

  function update() {
    if (chestOpenAnimTimer > 0) chestOpenAnimTimer--;

    if (screenShakeIntensity > 0.1) {
      screenShakeIntensity *= 0.88;
    } else {
      screenShakeIntensity = 0;
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.16;
      p.alpha -= 0.022;
      p.life--;
      if (p.life <= 0 || p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y -= 1;
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

    // 1. Tropical Night Island Ocean Background
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    oceanGrad.addColorStop(0, '#091326');
    oceanGrad.addColorStop(0.5, '#0f244a');
    oceanGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Island Sand Atoll
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height * 0.62, canvas.width * 0.44, canvas.height * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Island Green Grass Soil Center
    ctx.fillStyle = '#065f46';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height * 0.62, canvas.width * 0.38, canvas.height * 0.30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Palm Trees at Left & Right
    ctx.fillStyle = '#78350f';
    ctx.fillRect(50, canvas.height * 0.38, 14, 80);
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.ellipse(57, canvas.height * 0.38, 40, 24, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#78350f';
    ctx.fillRect(canvas.width - 64, canvas.height * 0.38, 14, 80);
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.ellipse(canvas.width - 57, canvas.height * 0.38, 40, 24, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // 2. Pirate Treasure Chest at Top of Island
    const chestX = canvas.width / 2;
    const chestY = canvas.height * 0.22;
    const currentMetrics = calculateCurrentMetrics();
    const qData = ISLAND_QUESTS[currentRoundIdx];
    const target = qData ? qData.targetVal : 1;
    const currentValue = qData && qData.type === 'perimeter' ? currentMetrics.perimeter : currentMetrics.area;
    const progress = Math.max(0, Math.min(1, currentValue / target));

    ctx.save();
    ctx.translate(chestX, chestY);

    // Treasure progress ring
    ctx.beginPath();
    ctx.arc(0, 0, 55, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 55, -Math.PI / 2 + Math.PI * 2 * progress, Math.PI * 1.5);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, 24, 40, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    // Chest Body
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(-35, -5, 70, 32, 6);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Chest Lid
    if (chestOpenAnimTimer > 0) {
      ctx.fillStyle = '#9a3412';
      ctx.beginPath();
      ctx.roundRect(-35, -34, 70, 24, 6);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#9a3412';
      ctx.beginPath();
      ctx.roundRect(-36, -24, 72, 22, 6);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Golden Keyhole Lock
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, 4, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-2, 4, 4, 6);
    }

    ctx.restore();

    // 3. Ancient Interactive Grid Plot (6x6)
    const { startX, startY, size, cellSize } = getGridBox();

    // Grid Base Stone Plate
    ctx.fillStyle = '#0f1d38';
    ctx.beginPath();
    ctx.roundRect(startX - 8, startY - 8, size + 16, size + 16, 12);
    ctx.fill();
    ctx.strokeStyle = '#1e3a6a';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw Grid Cells & Filled Planted Squares
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const cx = startX + c * cellSize;
        const cy = startY + r * cellSize;
        const isFilled = gridTiles[r][c];

        if (isFilled) {
          ctx.fillStyle = '#10b981';
          ctx.fillRect(cx + 2, cy + 2, cellSize - 4, cellSize - 4);
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 2;
          ctx.strokeRect(cx + 2, cy + 2, cellSize - 4, cellSize - 4);

          ctx.fillStyle = '#ffffff';
          ctx.font = `900 ${Math.max(10, Math.round(cellSize * 0.22))}px 'Fredoka', cursive, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('1 cm²', cx + cellSize / 2, cy + cellSize / 2);
        } else {
          ctx.fillStyle = '#132448';
          ctx.fillRect(cx + 1, cy + 1, cellSize - 2, cellSize - 2);
          ctx.strokeStyle = '#1e3a6a';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(cx, cy, cellSize, cellSize);
        }
      }
    }

    // 4. Render Particles
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 5. Render Floating Texts
    floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = ft.color;
      ctx.font = "900 20px 'Fredoka', cursive, sans-serif";
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 6;
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
  // 7. START & END GAME
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
    const numEl = doc.getElementById('countdown-number');
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

    localStorage.setItem('math_treasure_stars', stars);

    if (isVictory) {
      playChestOpenSound();
    } else {
      playWrongSound();
    }

    const badgeEl = doc.getElementById('game-over-badge');
    const titleEl = doc.getElementById('game-over-title');
    const scoreEl = doc.getElementById('final-score');
    const roundsEl = doc.getElementById('final-rounds');
    const accuracyEl = doc.getElementById('final-accuracy');
    const comboEl = doc.getElementById('final-combo');
    const timeEl = doc.getElementById('final-time');
    const starsContainer = doc.getElementById('stars-container');

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
  // 8. CONTROLS & RESIZING
  // ==========================================================================
  function resizeCanvas() {
    const container = doc.getElementById('canvas-viewport');
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width || window.innerWidth;
    canvas.height = rect.height || (window.innerHeight - 180);
  }

  function setupControls() {
    window.addEventListener('resize', resizeCanvas);

    // Canvas Grid Click / Tap
    if (canvas) {
      canvas.addEventListener('pointerdown', (e) => {
        handleCanvasClick(e.clientX, e.clientY);
      });
    }

    // Action Bar Buttons
    const btnClear = doc.getElementById('btn-clear-plot');
    const btnUnlock = doc.getElementById('btn-unlock-chest');

    if (btnClear) {
      btnClear.addEventListener('click', () => {
        resetGrid();
        playTileClickSound();
        updateHUD();
      });
    }

    if (btnUnlock) {
      btnUnlock.addEventListener('click', () => {
        unlockChest();
      });
    }

    // Modal Buttons
    const startBtn = doc.getElementById('start-game-btn');
    const howToBtn = doc.getElementById('how-to-play-btn');
    const hudRulesBtn = doc.getElementById('hud-how-to-play-btn');
    const closeInstBtn = doc.getElementById('close-instructions-btn');
    const startFromInstBtn = doc.getElementById('start-from-instructions-btn');
    const playAgainBtn = doc.getElementById('play-again-btn');
    const soundBtn = doc.getElementById('sound-toggle-btn');

    if (startBtn) startBtn.addEventListener('click', startCountdown);
    if (howToBtn) howToBtn.addEventListener('click', () => setScreen('instructions-modal'));
    if (hudRulesBtn) hudRulesBtn.addEventListener('click', () => setScreen('instructions-modal'));
    if (closeInstBtn) closeInstBtn.addEventListener('click', () => setScreen('start-screen'));
    if (startFromInstBtn) startFromInstBtn.addEventListener('click', startCountdown);
    if (playAgainBtn) playAgainBtn.addEventListener('click', startCountdown);

    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        localStorage.setItem('math_games_sound', isMuted ? 'false' : 'true');
        if (isMuted) {
          stopPirateBGM();
        } else if (isPlaying && !isGameOver) {
          startPirateBGM();
        }
      });
    }
  }

  // ==========================================================================
  // 9. STUCENT INIT & BOOTSTRAP
  // ==========================================================================
  window.game = window.game || {};
  window.game.init = function (config) {
    window.game.config = config || {};
  };

  function init() {
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
