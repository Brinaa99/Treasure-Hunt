/**
 * TREASURE HUNT — TROPICAL ISLAND ADVENTURE MAP ENGINE
 * Standard 3 Mathematics: Addition, Subtraction, Multiplication, Division,
 * 2D/3D Geometry, Clocks & Measurement Conversions.
 */

(() => {
  'use strict';

  // ==========================================================================
  // 1. 10 STANDARD 3 MATHEMATICS CHALLENGES (CURRICULUM ALIGNED)
  // ==========================================================================
  const ISLAND_CHALLENGES = [
    {
      id: 1,
      type: 'star',
      title: 'STAR REEF 1',
      question: '240 + 180 = ?',
      answer: '420',
      options: ['420', '410', '520'],
      hint: 'Add the hundreds and tens together!'
    },
    {
      id: 2,
      type: 'chest',
      title: 'SUNKEN CHEST 2',
      question: '650 − 230 = ?',
      answer: '420',
      options: ['420', '320', '430'],
      hint: 'Subtract 200 from 600, then 30 from 50!'
    },
    {
      id: 3,
      type: 'star',
      title: 'CRAB ATOLL 3',
      question: '7 × 8 = ?',
      answer: '56',
      options: ['56', '54', '64'],
      hint: 'Think of 7 multiplied by 8!'
    },
    {
      id: 4,
      type: 'chest',
      title: 'LAGOON CHEST 4',
      question: '45 ÷ 5 = ?',
      answer: '9',
      options: ['9', '8', '7'],
      hint: 'How many groups of 5 are in 45?'
    },
    {
      id: 5,
      type: 'star',
      title: 'CORAL ISLE 5',
      question: 'Which 3D shape has 6 flat square faces and 8 vertices?',
      answer: 'Cube',
      options: ['Cube', 'Cylinder', 'Cone'],
      hint: 'Think of a 6-sided playing dice!'
    },
    {
      id: 6,
      type: 'chest',
      title: 'PALM HAVEN CHEST 6',
      question: 'Clock shows: Hour hand at 3, Minute hand at 6. What time is it?',
      answer: '3:30 (Half past 3)',
      options: ['3:30 (Half past 3)', '3:15 (Quarter past 3)', '3:45 (Quarter to 4)'],
      hint: 'When minute hand points to 6, it is half past the hour!'
    },
    {
      id: 7,
      type: 'star',
      title: 'SHELL SHALLOWS 7',
      question: 'Convert: 3 kilograms (kg) = ? grams (g)',
      answer: '3,000 g',
      options: ['3,000 g', '300 g', '30,000 g'],
      hint: '1 kilogram equals 1,000 grams!'
    },
    {
      id: 8,
      type: 'chest',
      title: 'OCTOPUS GROTTO CHEST 8',
      question: 'Convert: 4 metres (m) = ? centimetres (cm)',
      answer: '400 cm',
      options: ['400 cm', '40 cm', '4,000 cm'],
      hint: '1 metre equals 100 centimetres!'
    },
    {
      id: 9,
      type: 'star',
      title: 'SAPPHIRE COVE 9',
      question: 'Convert: 2 Litres (L) = ? millilitres (mL)',
      answer: '2,000 mL',
      options: ['2,000 mL', '200 mL', '20,000 mL'],
      hint: '1 Litre equals 1,000 millilitres!'
    },
    {
      id: 10,
      type: 'crown',
      title: 'GRAND PIRATE VAULT 10',
      question: 'A box weighs 450g and another weighs 350g. What is the total mass?',
      answer: '800 grams',
      options: ['800 grams', '700 grams', '900 grams'],
      hint: 'Add 450 + 350!'
    }
  ];

  // Stepping Stones Path Curve Coordinates on 800 x 900 map
  const PATH_POINTS = [
    // Bottom beach start
    { x: 400, y: 840 },
    { x: 440, y: 810 },
    { x: 490, y: 785 },
    { x: 530, y: 760 },
    // Node 1 (Star Reef 1)
    { x: 570, y: 740, isNode: true, nodeIdx: 0 },
    { x: 530, y: 705 },
    { x: 470, y: 680 },
    { x: 410, y: 670 },
    { x: 350, y: 680 },
    // Node 2 (Sunken Chest 2)
    { x: 280, y: 690, isNode: true, nodeIdx: 1 },
    { x: 230, y: 670 },
    { x: 180, y: 630 },
    { x: 150, y: 580 },
    // Node 3 (Crab Atoll 3)
    { x: 170, y: 530, isNode: true, nodeIdx: 2 },
    { x: 220, y: 500 },
    { x: 280, y: 480 },
    { x: 340, y: 470 },
    // Node 4 (Lagoon Chest 4)
    { x: 410, y: 460, isNode: true, nodeIdx: 3 },
    { x: 480, y: 450 },
    { x: 550, y: 450 },
    { x: 620, y: 470 },
    // Node 5 (Coral Isle 5)
    { x: 670, y: 510, isNode: true, nodeIdx: 4 },
    { x: 710, y: 460 },
    { x: 700, y: 400 },
    { x: 650, y: 350 },
    // Node 6 (Palm Haven Chest 6)
    { x: 580, y: 320, isNode: true, nodeIdx: 5 },
    { x: 510, y: 300 },
    { x: 440, y: 280 },
    { x: 370, y: 270 },
    // Node 7 (Shell Shallows 7)
    { x: 300, y: 260, isNode: true, nodeIdx: 6 },
    { x: 230, y: 240 },
    { x: 180, y: 200 },
    { x: 170, y: 150 },
    // Node 8 (Octopus Grotto Chest 8)
    { x: 220, y: 110, isNode: true, nodeIdx: 7 },
    { x: 290, y: 100 },
    { x: 360, y: 110 },
    { x: 430, y: 120 },
    // Node 9 (Sapphire Cove 9)
    { x: 500, y: 120, isNode: true, nodeIdx: 8 },
    { x: 570, y: 110 },
    { x: 630, y: 90 },
    // Node 10 (Grand Pirate Vault 10)
    { x: 680, y: 80, isNode: true, nodeIdx: 9 }
  ];

  // ==========================================================================
  // 2. TROPICAL ISLAND GAME ENGINE CLASS
  // ==========================================================================
  class TropicalTreasureGame {
    constructor() {
      this.canvas = document.getElementById('game-canvas');
      this.ctx = this.canvas.getContext('2d');

      this.score = 0;
      this.lives = 3;
      this.timeLeft = 60;
      this.completedNodes = 0; // 0 to 10
      this.currentNodeIdx = 0;
      this.isPlaying = false;
      this.isModalOpen = false;

      // Explorer Movement Animation
      this.pathIndex = 0;
      this.targetPathIndex = 0;
      this.playerPos = { x: PATH_POINTS[0].x, y: PATH_POINTS[0].y };
      this.isHopping = false;
      this.facingRight = true;
      this.idleTimer = 0;

      // Timer Interval
      this.timerInterval = null;
      this.startTime = 0;

      // Ambient Animation Counters
      this.wavePhase = 0;
      this.creaturePhase = 0;

      this.initDOM();
      this.initCanvasSize();
      this.render();

      requestAnimationFrame((t) => this.gameLoop(t));
    }

    initDOM() {
      const startBtn = document.getElementById('start-game-btn');
      const startHowToPlayBtn = document.getElementById('start-how-to-play-btn');
      const hudHowToPlayBtn = document.getElementById('hud-how-to-play-btn');
      const instructionsModal = document.getElementById('instructions-modal');
      const closeInstructionsBtn = document.getElementById('close-instructions-btn');
      const startFromInstructionsBtn = document.getElementById('start-from-instructions-btn');
      const playAgainBtn = document.getElementById('play-again-btn');

      if (startBtn) {
        startBtn.addEventListener('click', () => this.startGame());
      }
      if (startHowToPlayBtn && instructionsModal) {
        startHowToPlayBtn.addEventListener('click', () => {
          instructionsModal.classList.remove('hidden');
        });
      }
      if (hudHowToPlayBtn && instructionsModal) {
        hudHowToPlayBtn.addEventListener('click', () => {
          instructionsModal.classList.remove('hidden');
        });
      }
      if (closeInstructionsBtn && instructionsModal) {
        closeInstructionsBtn.addEventListener('click', () => {
          instructionsModal.classList.add('hidden');
        });
      }
      if (startFromInstructionsBtn && instructionsModal) {
        startFromInstructionsBtn.addEventListener('click', () => {
          instructionsModal.classList.add('hidden');
          this.startGame();
        });
      }
      if (playAgainBtn) {
        playAgainBtn.addEventListener('click', () => this.restartGame());
      }

      // Canvas click / touch support to trigger challenge
      this.canvas.addEventListener('click', () => {
        if (this.isPlaying && !this.isModalOpen && !this.isHopping) {
          this.triggerChallenge(this.currentNodeIdx);
        }
      });

      window.addEventListener('resize', () => this.initCanvasSize());
    }

    initCanvasSize() {
      const container = document.getElementById('canvas-viewport') || this.canvas.parentElement;
      if (!container) return;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Fixed virtual 800 x 900 resolution
      this.canvas.width = 800 * this.dpr;
      this.canvas.height = 900 * this.dpr;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    startGame() {
      document.getElementById('start-screen').classList.add('hidden');
      this.isPlaying = true;
      this.score = 0;
      this.lives = 3;
      this.timeLeft = 60;
      this.completedNodes = 0;
      this.currentNodeIdx = 0;
      this.startTime = Date.now();

      this.pathIndex = 0;
      this.targetPathIndex = this.findPathIndexForNode(0);
      this.playerPos = { x: PATH_POINTS[0].x, y: PATH_POINTS[0].y };

      this.updateHUD();
      this.startTimer();

      if (window.NumberlandFeedback) {
        window.NumberlandFeedback.playGameSound('victory');
      }

      // Move player to first challenge node
      setTimeout(() => {
        this.moveToNode(0, () => {
          this.triggerChallenge(0);
        });
      }, 500);
    }

    restartGame() {
      document.getElementById('end-screen').classList.add('hidden');
      this.startGame();
    }

    startTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        if (!this.isPlaying) return;
        this.timeLeft--;
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
          timerDisplay.textContent = `${this.timeLeft}s`;
          if (window.NumberlandFeedback) {
            window.NumberlandFeedback.updateTimerWarning(timerDisplay, this.timeLeft, { playSound: true });
          }
        }

        if (this.timeLeft <= 0) {
          this.gameOver(false);
        }
      }, 1000);
    }

    findPathIndexForNode(nodeIdx) {
      for (let i = 0; i < PATH_POINTS.length; i++) {
        if (PATH_POINTS[i].isNode && PATH_POINTS[i].nodeIdx === nodeIdx) {
          return i;
        }
      }
      return 0;
    }

    moveToNode(nodeIdx, callback) {
      const targetIdx = this.findPathIndexForNode(nodeIdx);
      this.isHopping = true;
      let curStep = this.pathIndex;

      const hopStep = () => {
        if (curStep < targetIdx) {
          curStep++;
          this.pathIndex = curStep;
          const nextPt = PATH_POINTS[curStep];
          if (nextPt.x > this.playerPos.x) this.facingRight = true;
          if (nextPt.x < this.playerPos.x) this.facingRight = false;
          this.playerPos = { x: nextPt.x, y: nextPt.y };
          
          if (window.NumberlandFeedback) {
            window.NumberlandFeedback.playGameSound('click', { pitch: 1.4 });
          }

          setTimeout(hopStep, 130);
        } else {
          this.isHopping = false;
          if (callback) callback();
        }
      };

      hopStep();
    }

    triggerChallenge(nodeIdx) {
      if (nodeIdx >= ISLAND_CHALLENGES.length) return;
      this.isModalOpen = true;

      const challenge = ISLAND_CHALLENGES[nodeIdx];
      const modal = document.getElementById('challenge-modal');
      const tag = document.getElementById('challenge-location-tag');
      const qText = document.getElementById('challenge-question');
      const hint = document.getElementById('challenge-hint');
      const choicesContainer = document.getElementById('challenge-choices-container');
      const chestSprite = document.getElementById('chest-sprite');

      tag.textContent = `📍 ${challenge.title} (${nodeIdx + 1} OF 10)`;
      qText.textContent = challenge.question;
      hint.textContent = challenge.hint || 'Choose the correct answer!';

      // Shake closed chest then pop
      chestSprite.className = 'chest-sprite closed shaking';
      chestSprite.textContent = challenge.type === 'crown' ? '👑 🔒' : (challenge.type === 'star' ? '⭐ 🔒' : '📦 🔒');

      // Shuffle choices
      const shuffled = [...challenge.options].sort(() => Math.random() - 0.5);

      choicesContainer.innerHTML = '';
      shuffled.forEach((optText) => {
        const btn = document.createElement('button');
        btn.className = 'btn-challenge-choice';
        btn.textContent = optText;

        btn.addEventListener('click', () => {
          this.handleAnswer(optText, challenge.answer, btn);
        });

        choicesContainer.appendChild(btn);
      });

      modal.classList.remove('hidden');

      if (window.NumberlandFeedback) {
        window.NumberlandFeedback.playGameSound('chest-open');
      }
    }

    handleAnswer(selected, correct, btnEl) {
      const modal = document.getElementById('challenge-modal');
      const chestSprite = document.getElementById('chest-sprite');
      const allBtns = modal.querySelectorAll('.btn-challenge-choice');
      allBtns.forEach(b => b.style.pointerEvents = 'none');

      if (selected === correct) {
        // CORRECT!
        btnEl.classList.add('choice-correct');
        chestSprite.className = 'chest-sprite opened';
        chestSprite.textContent = this.currentNodeIdx === 9 ? '👑 💎 ✨' : (ISLAND_CHALLENGES[this.currentNodeIdx].type === 'star' ? '🌟 ✨' : '📦 🗝️ ✨');

        this.score += 100;
        this.completedNodes++;

        if (window.NumberlandFeedback) {
          window.NumberlandFeedback.showCorrectFeedback(btnEl, {
            points: 100,
            message: 'TREASURE UNLOCKED!'
          });
          window.NumberlandFeedback.playGameSound('star-reward');
        }

        this.updateHUD();

        setTimeout(() => {
          modal.classList.add('hidden');
          this.isModalOpen = false;

          // Check if all 10 completed
          if (this.completedNodes >= 10) {
            this.gameOver(true);
          } else {
            this.currentNodeIdx++;
            this.moveToNode(this.currentNodeIdx, () => {
              setTimeout(() => {
                this.triggerChallenge(this.currentNodeIdx);
              }, 400);
            });
          }
        }, 1100);

      } else {
        // WRONG!
        btnEl.classList.add('choice-wrong');
        this.lives--;

        if (window.NumberlandFeedback) {
          window.NumberlandFeedback.showWrongFeedback(btnEl, {
            message: '-1 LIFE 💔'
          });
        }

        this.updateHUD();

        if (this.lives <= 0) {
          setTimeout(() => {
            modal.classList.add('hidden');
            this.isModalOpen = false;
            this.gameOver(false);
          }, 800);
        } else {
          setTimeout(() => {
            allBtns.forEach(b => b.style.pointerEvents = 'auto');
            btnEl.classList.remove('choice-wrong');
          }, 700);
        }
      }
    }

    updateHUD() {
      const scoreEl = document.getElementById('score-display');
      const chestEl = document.getElementById('chest-display');
      const livesContainer = document.getElementById('lives-container');

      if (scoreEl) scoreEl.textContent = this.score;
      if (chestEl) chestEl.textContent = `${this.completedNodes} / 10`;

      if (livesContainer) {
        const hearts = livesContainer.querySelectorAll('.heart');
        hearts.forEach((h, idx) => {
          if (idx < this.lives) {
            h.className = 'heart active';
          } else {
            h.className = 'heart lost';
          }
        });
      }
    }

    gameOver(isVictory = false) {
      this.isPlaying = false;
      this.isModalOpen = false;
      document.getElementById('challenge-modal').classList.add('hidden');
      if (this.timerInterval) clearInterval(this.timerInterval);

      let stars = 1;
      if (this.score >= 700) stars = 2;
      if (this.score >= 900 && this.lives >= 2) stars = 3;
      if (!isVictory && this.completedNodes < 4) stars = 0;

      if (window.NumberlandFeedback) {
        window.NumberlandFeedback.playGameSound(isVictory || stars >= 1 ? 'victory' : 'gameover');
      }

      const elapsed = Math.max(0, 60 - this.timeLeft);

      // Record in Global Profile
      if (window.NumberlandProfile) {
        window.NumberlandProfile.recordGameResult('treasure', this.score, stars, elapsed);
      } else {
        localStorage.setItem('math_treasure_highscore', Math.max(this.score, parseInt(localStorage.getItem('math_treasure_highscore') || '0', 10)));
        localStorage.setItem('math_treasure_stars', Math.max(stars, parseInt(localStorage.getItem('math_treasure_stars') || '0', 10)));
      }

      // Populate End Screen
      const badge = document.getElementById('end-header-badge');
      const title = document.getElementById('end-title');
      const subtitle = document.getElementById('end-subtitle');

      if (badge) {
        badge.textContent = isVictory ? 'ISLAND CONQUERED!' : 'EXPEDITION ENDED';
        badge.className = `result-badge ${isVictory ? 'victory' : 'gameover'}`;
      }
      if (title) {
        title.textContent = isVictory ? 'TREASURE UNLOCKED!' : 'TRY AGAIN, EXPLORER!';
      }
      if (subtitle) {
        subtitle.textContent = isVictory 
          ? 'You solved all 10 island math challenges and found the Grand Pirate Treasure!' 
          : `You unlocked ${this.completedNodes} of 10 island challenges. Great hustle!`;
      }

      const scoreVal = document.getElementById('final-score-val');
      const chestsVal = document.getElementById('final-chests-val');
      const livesVal = document.getElementById('final-lives-val');
      const timeVal = document.getElementById('final-time-val');

      if (scoreVal) scoreVal.textContent = this.score;
      if (chestsVal) chestsVal.textContent = `${this.completedNodes} / 10`;
      if (livesVal) livesVal.textContent = '❤️'.repeat(Math.max(0, this.lives)) || '💔';
      if (timeVal) timeVal.textContent = `${Math.max(0, this.timeLeft)}s`;

      const slots = document.querySelectorAll('#end-screen .star-slot');
      slots.forEach((slot, i) => {
        slot.classList.remove('earned');
        if (i < stars) {
          setTimeout(() => slot.classList.add('earned'), 300 + i * 250);
        }
      });

      document.getElementById('end-screen').classList.remove('hidden');
    }

    render() {
      const { ctx } = this;
      const dpr = this.dpr || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, 800, 900);

      // 1. Tropical Turquoise Ocean Background Gradient
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, 900);
      oceanGrad.addColorStop(0, '#0284c7');
      oceanGrad.addColorStop(0.5, '#0ea5e9');
      oceanGrad.addColorStop(1, '#38bdf8');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, 800, 900);

      // 2. Translucent Animated Ocean Wave Ripples & Foam
      this.wavePhase += 0.02;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 2.5;

      for (let y = 60; y < 900; y += 90) {
        ctx.beginPath();
        const offset = Math.sin(this.wavePhase + y * 0.05) * 12;
        ctx.moveTo(30, y + offset);
        ctx.bezierCurveTo(200, y - 15 + offset, 400, y + 15 + offset, 600, y - 10 + offset);
        ctx.bezierCurveTo(680, y - 20 + offset, 750, y + 10 + offset, 780, y + offset);
        ctx.stroke();
      }

      // 3. Draw Archipelago Tropical Islands
      this.drawIsland(400, 860, 240, 90, '#fde047', '#10b981'); // Bottom starting beach
      this.drawIsland(200, 560, 160, 110, '#fef08a', '#34d399'); // Crab atoll
      this.drawIsland(380, 500, 110, 70, '#fde68a', '#10b981'); // Sandbank
      this.drawIsland(650, 420, 180, 130, '#fef08a', '#059669'); // Palm sanctuary & egg nest
      this.drawIsland(280, 160, 200, 110, '#fde68a', '#10b981'); // Pirate cove
      this.drawIsland(660, 90, 150, 90, '#fef08a', '#047857'); // Grand Vault Island

      // 4. Draw Stepping Stones Path
      this.drawSteppingStones();

      // 5. Draw Island Scenery Elements (Crab, Octopus, Palm Trees, Boat, Egg Nest)
      this.drawSceneryDecorations();

      // 6. Draw 10 Challenge Nodes (Stars & Chests)
      this.drawChallengeNodes();

      // 7. Draw Player Character Mascot
      this.drawExplorer();
    }

    drawIsland(cx, cy, rx, ry, sandColor, grassColor) {
      const { ctx } = this;
      ctx.save();

      // Shallow Lagoon Water Halo
      ctx.fillStyle = 'rgba(125, 211, 252, 0.45)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx + 24, ry + 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sand Island Base
      ctx.fillStyle = sandColor;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Lush Green Center
      ctx.fillStyle = grassColor;
      ctx.beginPath();
      ctx.ellipse(cx, cy - 4, rx * 0.65, ry * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    drawSteppingStones() {
      const { ctx } = this;
      ctx.save();

      for (let i = 0; i < PATH_POINTS.length; i++) {
        const pt = PATH_POINTS[i];
        const isPassed = i <= this.pathIndex;

        // Shadow
        ctx.fillStyle = 'rgba(3, 105, 161, 0.6)';
        ctx.beginPath();
        ctx.ellipse(pt.x + 2, pt.y + 4, 18, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stone Top
        ctx.fillStyle = isPassed ? '#fed7aa' : '#e2e8f0';
        ctx.strokeStyle = isPassed ? '#f97316' : '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(pt.x, pt.y, 16, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }

    drawSceneryDecorations() {
      const { ctx } = this;
      ctx.save();
      this.creaturePhase += 0.03;

      // Starting Boat on Bottom Beach
      ctx.font = '36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⛵', 320, 830);

      // Palm Trees on Bottom Beach
      ctx.fillText('🌴', 580, 830);
      ctx.fillText('🌴', 250, 850);

      // Cute Tropical Crab on Crab Atoll (animated claw bob)
      const crabWiggle = Math.sin(this.creaturePhase) * 4;
      ctx.font = '40px sans-serif';
      ctx.fillText('🦀', 200, 560 + crabWiggle);
      ctx.fillText('🌴', 140, 530);

      // Paper Boat on Sandbank
      ctx.font = '32px sans-serif';
      ctx.fillText('⛵', 380, 500);

      // Giant Palm Sanctuary & Egg Nest
      ctx.font = '44px sans-serif';
      ctx.fillText('🌴', 670, 410);
      ctx.font = '28px sans-serif';
      ctx.fillText('🥚', 630, 440);
      ctx.fillText('🌸', 690, 440);

      // Pirate Octopus at North Cove (wiggling)
      const octoWiggle = Math.sin(this.creaturePhase * 1.5) * 5;
      ctx.font = '52px sans-serif';
      ctx.fillText('🐙', 260, 160 + octoWiggle);
      ctx.font = '26px sans-serif';
      ctx.fillText('🏴‍☠️', 260, 125 + octoWiggle);

      // Final Grand Island Palm & Gems
      ctx.font = '40px sans-serif';
      ctx.fillText('🌴', 730, 90);
      ctx.fillText('✨', 640, 70);

      ctx.restore();
    }

    drawChallengeNodes() {
      const { ctx } = this;
      ctx.save();

      ISLAND_CHALLENGES.forEach((ch, idx) => {
        const ptIdx = this.findPathIndexForNode(idx);
        const pt = PATH_POINTS[ptIdx];
        if (!pt) return;

        const isCompleted = idx < this.completedNodes;
        const isActive = idx === this.completedNodes;

        ctx.save();
        ctx.translate(pt.x, pt.y);

        if (isActive) {
          // Pulsing Beacon Halo
          const pulseSize = 26 + Math.sin(this.creaturePhase * 2) * 5;
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
          ctx.stroke();

          // Active Bouncing Arrow
          const arrowBounce = Math.sin(this.creaturePhase * 3) * 6;
          ctx.font = '20px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⬇', 0, -32 + arrowBounce);
        }

        // Node Icon
        ctx.font = '32px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (isCompleted) {
          ctx.fillText('✨', 0, -18);
          ctx.fillText(ch.type === 'crown' ? '👑' : (ch.type === 'star' ? '⭐' : '🗝️'), 0, 0);
        } else {
          if (ch.type === 'crown') {
            ctx.fillText('👑', 0, 0);
          } else if (ch.type === 'star') {
            ctx.fillText('⭐', 0, 0);
          } else {
            ctx.fillText('📦', 0, 0);
          }
        }

        ctx.restore();
      });

      ctx.restore();
    }

    drawExplorer() {
      const { ctx } = this;
      ctx.save();
      this.idleTimer += 0.04;
      const idleBob = this.isHopping ? 0 : Math.sin(this.idleTimer * 2) * 3;

      ctx.translate(this.playerPos.x, this.playerPos.y + idleBob);

      // Contact Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 16, 18, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Flip explorer sprite based on facing direction
      if (!this.facingRight) {
        ctx.scale(-1, 1);
      }

      ctx.font = '40px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const avatar = (window.NumberlandProfile && window.NumberlandProfile.getProfile().avatar) || '🤠';
      ctx.fillText(avatar, 0, -4);

      ctx.restore();
    }

    gameLoop(timestamp) {
      this.render();
      requestAnimationFrame((t) => this.gameLoop(t));
    }
  }

  // Auto-init on page ready
  window.addEventListener('DOMContentLoaded', () => {
    new TropicalTreasureGame();
  });

})();
