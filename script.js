// DOM Elements
let beep, timerDisplay, statusDisplay, progressDisplay, mainBtn, stopBtn, calfBar;

// Configuration
const tickTime = 100;

// State
let countdown;
let totalSeconds = 0;
let totalWorkoutSeconds = 0;
let currentRound = 1;
let currentRep = 1;
let isWorking = true;
let isRoundRest = false;
let isRunning = false;
let isPaused = false;
let workoutStartedAt = null;        // timestamp when START was pressed
let pausedTimeTotal = 0;           // total seconds spent paused
let lastPauseStart = null;        // when current pause began
let getReadyActive = false;
let wakeLock = null;

function initElements() {
  if (typeof document === 'undefined') return;
  beep = document.getElementById('beep');
  timerDisplay = document.getElementById('timer');
  statusDisplay = document.getElementById('status');
  progressDisplay = document.getElementById('progress');
  mainBtn = document.getElementById('mainBtn');
  stopBtn = document.getElementById('stopBtn');
  calfBar = document.getElementById('calfBar');
}

function updateVisualBars() {
  if (typeof document === 'undefined') return;
  if (getReadyActive || !isRunning) {
    if (calfBar) calfBar.style.display = 'none';
    return;
  }
  if (calfBar) calfBar.style.display = 'block';

  if (isWorking) {
    // WORK = lowering = fill from TOP to BOTTOM
    const workVal = document.getElementById('work') ? parseInt(document.getElementById('work').value) : 6;
    const progress = (workVal - totalSeconds) / workVal;
    calfBar.style.transform = `scaleY(${progress})`;
    calfBar.style.transformOrigin = 'top';
    calfBar.style.background = 'linear-gradient(to bottom, #4CAF50, #2e7d32)';  // green
  } else if (!isRoundRest) {
    // SHORT REST = rising = fill from BOTTOM to TOP
    const restTime = document.getElementById('rest') ? parseInt(document.getElementById('rest').value) : 2;
    const progress = (restTime - totalSeconds) / restTime;
    calfBar.style.transform = `scaleY(${progress})`;
    calfBar.style.transformOrigin = 'bottom';
    calfBar.style.background = 'linear-gradient(to top, #ff9800, #e65100)';     // orange
  } else {
    // During long round rest → hide or keep orange (your choice)
    calfBar.style.display = 'none';
  }
}

function playBeep(times = 1, delay = 200) {
  if (typeof document === 'undefined' || !beep) return;
  if (times > 0) {
    beep.currentTime = 0;
    beep.play().catch(e => console.log('Audio play failed', e));
    setTimeout(() => playBeep(times - 1, delay), delay);
  }
}

function formatTime(sec) {
  sec = Math.floor(sec);
  const mins = Math.floor(sec / 60).toString().padStart(2, '0');
  const secs = (sec % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function updateDisplay() {
  if (timerDisplay) timerDisplay.textContent = formatTime(totalSeconds);
}

function updateProgress() {
  if (typeof document === 'undefined') return;
  const rounds = parseInt(document.getElementById('rounds').value);
  const repsPerRound = parseInt(document.getElementById('reps').value);
  const workSec = parseInt(document.getElementById('work').value);
  const restSec = parseInt(document.getElementById('rest').value);
  const roundRestSec = parseInt(document.getElementById('roundRest').value);

  const totalReps = rounds * repsPerRound;

  // Completed reps
  let completedReps = (currentRound - 1) * repsPerRound;
  if (isRoundRest) {
    completedReps += repsPerRound;
  } else {
    completedReps += isWorking ? (currentRep - 1) : currentRep;
  }

  // ───── TOTAL WORKOUT DURATION ─────
  const timePerRound = repsPerRound * workSec + (repsPerRound - 1) * restSec + roundRestSec;
  const totalWorkoutSeconds = (rounds - 1) * timePerRound + (repsPerRound * workSec + (repsPerRound - 1) * restSec);

  // ───── ELAPSED TIME ─────
  let elapsed = 0;
  if (workoutStartedAt) {
    const now = Date.now();
    const currentPauseTime = (isPaused && lastPauseStart) ? (now - lastPauseStart) : 0;
    elapsed = Math.floor((now - workoutStartedAt - pausedTimeTotal - currentPauseTime) / 1000);
  }

  const remaining = Math.max(0, totalWorkoutSeconds - elapsed);

  const mins = Math.floor(remaining / 60);
  const secs = (remaining % 60).toString().padStart(2, '0');
  const timeLeft = remaining >= 60 ? `${mins}m ${secs}s left` : `${remaining}s left`;
  const workoutProgressPct = Math.floor((elapsed / totalWorkoutSeconds) * 100);

  // Update Scoreboard Grid
  updateScoreboardGrid();

  if (progressDisplay) {
    progressDisplay.innerHTML = `
            Total Reps: <strong>${completedReps}</strong>/${totalReps} &nbsp;•&nbsp; 
            Time Left: <span style="color:#4CAF50;">${timeLeft}</span>
        `;
    // Update the total bar to fill from left to right
    const totalBar = document.getElementById('totalBar');
    if (totalBar) {
      totalBar.style.transform = `scaleX(${workoutProgressPct / 100})`;
      totalBar.style.transformOrigin = 'left';
      totalBar.style.background = 'linear-gradient(to right, #4CAF50, #2e7d32)';
    }
  }
}

function tick() {
  totalSeconds -= tickTime / 1000;
  updateDisplay();      // big 00:00 timer
  updateProgress();     // updates total remaining time every second
  updateVisualBars();

  if (typeof document !== 'undefined' && document.body) {
    // BACKGROUND COLOR LOGIC
    document.body.style.background =
      isWorking ? '#222' :
        isRoundRest ? '#e65100' : '#ff9800';   // dark orange for round rest, bright for rep rest

    const baseColor = isWorking ? '#fff' : '#000';
    document.body.style.color = baseColor;

    // TIMER TEXT COLOR LOGIC
    if (timerDisplay) {
      if (totalSeconds <= 3 && totalSeconds > 0) {
        timerDisplay.style.color = '#ff0000'; // Red flash last 3 seconds
      } else {
        timerDisplay.style.color = ''; // Inherit from body
      }
    }
  }

  if (totalSeconds <= 0) {
    playBeep(3, 150);
    nextPhase();
  }
}

function nextPhase() {
  if (typeof document === 'undefined') return;
  const workSec = parseInt(document.getElementById('work').value);
  const restSec = parseInt(document.getElementById('rest').value);
  const roundRestSec = parseInt(document.getElementById('roundRest').value);
  const totalRounds = parseInt(document.getElementById('rounds').value);
  const repsPerRound = parseInt(document.getElementById('reps').value);

  if (isRoundRest) {
    // End of round rest → next round
    isRoundRest = false;
    currentRound++;
    currentRep = 1;
    if (currentRound > totalRounds) {
      finishWorkout();
      return;
    }
    statusDisplay.textContent = `ROUND ${currentRound} – WORK`;
    statusDisplay.style.color = '#4CAF50';
    isWorking = true;
    totalSeconds = workSec;
  } else if (isWorking) {
    // End of work
    console.log(`Work ended: Round ${currentRound}/${totalRounds}, Rep ${currentRep}/${repsPerRound}`);
    isWorking = false;
    currentRep++;
    console.log(`After increment: currentRep=${currentRep}, repsPerRound=${repsPerRound}, currentRound=${currentRound}, totalRounds=${totalRounds}`);

    // Check if we just completed the last rep of the last round
    if (currentRep > repsPerRound && currentRound === totalRounds) {
      console.log('FINISHING WORKOUT - last rep of last round completed');
      finishWorkout();
      return;
    }

    if (currentRep > repsPerRound) {
      // Moving to next round
      isRoundRest = true;
      totalSeconds = roundRestSec;
      statusDisplay.textContent = `REST BETWEEN ROUNDS (${roundRestSec}s)`;
      statusDisplay.style.color = '#ff9800';
    } else {
      // Rest between reps in the same round
      totalSeconds = restSec;
      statusDisplay.textContent = `REST (${restSec}s)`;
      statusDisplay.style.color = '#ff9800';
    }
  } else {
    // End of rest → next rep
    isWorking = true;
    totalSeconds = workSec;
    statusDisplay.textContent = `ROUND ${currentRound} – REP ${currentRep} WORK`;
    statusDisplay.style.color = '#4CAF50';
  }

  updateProgress();
  updateDisplay();
  updateVisualBars();

  // Force correct background immediately when phase changes
  document.body.style.background =
    isWorking ? '#222' :
      isRoundRest ? '#e65100' : '#ff9800';   // dark orange for round rest, bright for rep rest

  document.body.style.color = isWorking ? '#fff' : '#000';
  if (timerDisplay) timerDisplay.style.color = '';
}

function startTimer() {
  if (typeof document === 'undefined') return;
  const rounds = parseInt(document.getElementById('rounds').value);
  const repsPerRound = parseInt(document.getElementById('reps').value);
  const workSec = parseInt(document.getElementById('work').value);
  const restSec = parseInt(document.getElementById('rest').value);
  const roundRestSec = parseInt(document.getElementById('roundRest').value);

  if (!workoutStartedAt) {
    workoutStartedAt = Date.now();
    totalWorkoutSeconds = (rounds - 1) * (repsPerRound * workSec + (repsPerRound - 1) * restSec + roundRestSec) + (repsPerRound * workSec + (repsPerRound - 1) * restSec);
  }

  if (isRunning && !isPaused) return;

  isRunning = true;
  isPaused = false;
  if (mainBtn) mainBtn.textContent = "PAUSE";
  if (stopBtn) {
    stopBtn.disabled = true;
    stopBtn.classList.remove('enabled');
  }

  if (totalSeconds === 0) {
    totalSeconds = isRoundRest ? roundRestSec :
      (isWorking ? workSec : restSec);
    if (totalSeconds === 0) totalSeconds = workSec;
    if (statusDisplay) {
      statusDisplay.textContent = `ROUND 1 – WORK`;
      statusDisplay.style.color = '#4CAF50';
    }
    updateProgress();
  }

  updateDisplay();
  countdown = setInterval(tick, tickTime);
  requestWakeLock();
}

function pauseTimer() {
  clearInterval(countdown);
  isPaused = true;
  if (mainBtn) mainBtn.textContent = "RESUME";
  if (stopBtn) {
    stopBtn.disabled = false;
    stopBtn.classList.add('enabled');
  }
  if (statusDisplay) statusDisplay.textContent += " (PAUSED)";
  lastPauseStart = Date.now();
  // releaseWakeLock(); // optional
}

function resumeTimer() {
  if (lastPauseStart) {
    pausedTimeTotal += Date.now() - lastPauseStart;
    lastPauseStart = null;
  }

  isPaused = false;
  if (mainBtn) mainBtn.textContent = "PAUSE";
  if (stopBtn) {
    stopBtn.disabled = true;
    stopBtn.classList.remove('enabled');
  }
  if (statusDisplay) statusDisplay.textContent = statusDisplay.textContent.replace(" (PAUSED)", "");
  countdown = setInterval(tick, tickTime);
}

function stopTimer() {
  resetTimer();
  clearInterval(countdown);
  resetTimer();
  releaseWakeLock();
}

function resetTimer() {
  clearInterval(countdown);
  totalSeconds = 0;
  currentRound = 1;
  currentRep = 1;
  isWorking = true;
  isRoundRest = false;
  isRunning = false;
  isPaused = false;

  if (mainBtn) mainBtn.textContent = "START";
  if (stopBtn) {
    stopBtn.disabled = true;
    stopBtn.classList.remove('enabled');
  }

  updateDisplay();
  if (statusDisplay) {
    statusDisplay.textContent = "Ready – Press START";
    statusDisplay.style.color = '#fff';
  }
  if (progressDisplay) progressDisplay.textContent = '';
  if (document.body) {
    document.body.style.background = '#222';
    document.body.style.color = '#fff';
  }
  if (timerDisplay) timerDisplay.style.color = '';

  workoutStartedAt = null;
  pausedTimeTotal = 0;
  lastPauseStart = null;
  if (calfBar) calfBar.style.display = 'none';
  initScoreboard();
  releaseWakeLock();
}

function finishWorkout() {
  clearInterval(countdown);
  isRunning = false;
  isPaused = false;
  if (timerDisplay) timerDisplay.textContent = "DONE!";
  if (statusDisplay) {
    statusDisplay.textContent = "WORKOUT COMPLETE!";
    statusDisplay.style.color = '#4CAF50';
  }
  if (progressDisplay) progressDisplay.textContent = '';
  if (mainBtn) mainBtn.textContent = "START";
  if (stopBtn) stopBtn.disabled = true;
  playBeep(8, 250);
  if (document.body) document.body.style.background = '#1b5e20';
  releaseWakeLock();
}

async function requestWakeLock() {
  if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      console.log('Screen wake lock active');
      wakeLock.addEventListener('release', () => {
        console.log('Wake lock released');
      });
    } catch (err) {
      console.warn('Wake lock failed:', err);
    }
  }
}

function releaseWakeLock() {
  if (wakeLock) {
    wakeLock.release();
    wakeLock = null;
  }
}

function updateTotalWorkoutTime() {
  if (typeof document === 'undefined') return;
  const rounds = parseInt(document.getElementById('rounds').value) || 0;
  const repsPerRound = parseInt(document.getElementById('reps').value) || 0;
  const workSec = parseInt(document.getElementById('work').value) || 0;
  const restSec = parseInt(document.getElementById('rest').value) || 0;
  const roundRestSec = parseInt(document.getElementById('roundRest').value) || 0;

  const display = document.getElementById('totalTimeDisplay');
  if (!display) return;

  if (rounds === 0 || repsPerRound === 0) {
    display.textContent = '—';
    return;
  }

  const timePerFullRound = repsPerRound * workSec + (repsPerRound - 1) * restSec + roundRestSec;
  const lastRoundTime = repsPerRound * workSec + (repsPerRound - 1) * restSec;
  const totalSeconds = (rounds - 1) * timePerFullRound + lastRoundTime;

  const mins = Math.floor(totalSeconds / 60);
  const secs = (totalSeconds % 60).toString().padStart(2, '0');
  display.textContent =
    totalSeconds >= 3600 ? `${Math.floor(totalSeconds / 3600)}h ${mins}m ${secs}s` :
      mins > 0 ? `${mins}m ${secs}s` : `${totalSeconds}s`;
}

function initScoreboard() {
  if (typeof document === 'undefined') return;
  const rounds = parseInt(document.getElementById('rounds').value) || 6;
  const reps = parseInt(document.getElementById('reps').value) || 15;
  const table = document.getElementById('sbTable');
  if (!table) return;

  let html = '';

  // Row 1: Planned
  html += '<tr class="row-planned">';
  html += '<td class="sb-header-col">Planned</td>';
  for (let i = 1; i <= rounds; i++) {
    html += `<td id="sb-plan-${i}">${reps}</td>`;
  }
  html += '</tr>';

  // Row 2: Completed
  html += '<tr class="row-completed">';
  html += '<td class="sb-header-col">Completed</td>';
  for (let i = 1; i <= rounds; i++) {
    html += `<td id="sb-comp-${i}">0</td>`;
  }
  html += '</tr>';

  table.innerHTML = html;
  updateScoreboardGrid();
}

function updateScoreboardGrid() {
  if (typeof document === 'undefined') return;
  const rounds = parseInt(document.getElementById('rounds').value) || 6;
  const repsPerRound = parseInt(document.getElementById('reps').value) || 15;

  for (let i = 1; i <= rounds; i++) {
    const cellPlan = document.getElementById(`sb-plan-${i}`);
    const cellComp = document.getElementById(`sb-comp-${i}`);
    if (!cellPlan || !cellComp) continue;

    // Reset classes
    cellPlan.className = '';
    cellComp.className = '';

    if (i < currentRound) {
      // Past rounds
      cellComp.textContent = repsPerRound;
      cellPlan.classList.add('col-past');
      cellComp.classList.add('col-past');
    } else if (i === currentRound) {
      // Current round
      let completedInRound = isRoundRest ? repsPerRound : (currentRep - 1);
      cellComp.textContent = completedInRound;
      cellPlan.classList.add('col-active');
      cellComp.classList.add('col-active');
    } else {
      // Future rounds
      cellComp.textContent = '0';
      cellPlan.classList.add('col-future');
      cellComp.classList.add('col-future');
    }
  }
}

// Initialization
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    initElements();
    updateTotalWorkoutTime();
    initScoreboard();

    // Event Listeners
    if (mainBtn) {
      mainBtn.onclick = () => {
        if (!isRunning) {
          startTimer();
        } else if (isPaused) {
          resumeTimer();
        } else {
          pauseTimer();
        }
      };
    }

    if (stopBtn) stopBtn.onclick = stopTimer;
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) resetBtn.onclick = resetTimer;

    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && mainBtn && (mainBtn.textContent === 'START' || mainBtn.textContent === 'RESUME')) {
        mainBtn.click();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (mainBtn && (mainBtn.textContent === 'START' || mainBtn.textContent === 'RESUME')) {
          mainBtn.click();
        }
        else if (mainBtn && mainBtn.textContent === 'PAUSE' && isRunning && !isPaused) {
          mainBtn.click();
        }
      }
    });

    document.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', updateTotalWorkoutTime);
    });

    document.querySelectorAll('#rounds, #reps').forEach(input => {
      input.addEventListener('change', initScoreboard);
    });
  });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatTime,
    updateTotalWorkoutTime,
    // Expose other functions or state if needed for testing
    // Note: Testing functions that rely on DOM requires jsdom
  };
}
