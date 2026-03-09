const ROTATION_ROUND_MS = 60 * 1000;
const ROTATION_PREVIEW_SLOTS = 8;
const LETTER_POOL = ["Q", "P", "R", "F"];
const TILE_GRID_SIZE = 4;
const TILE_SIZE = 24;
const TILE_FILLED_MIN = 9;
const TILE_FILLED_MAX = 10;
const TILE_SHAPE_ATTEMPTS = 32;
const PASS_RATIO = 0.6;
const ROUND_TRANSITION_DELAY_MS = 3000;
const TILE_NEIGHBOR_OFFSETS = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
];

const ROTATION_OPERATIONS = {
  left45: {
    label: "왼쪽 45도",
    shortLabel: "왼쪽 45도",
    matrix: rotationMatrix(-45),
  },
  right45: {
    label: "오른쪽 45도",
    shortLabel: "오른쪽 45도",
    matrix: rotationMatrix(45),
  },
  flipX: {
    label: "좌우반전",
    shortLabel: "좌우반전",
    matrix: normalizeMatrix({ a: -1, b: 0, c: 0, d: 1 }),
  },
  flipY: {
    label: "상하반전",
    shortLabel: "상하반전",
    matrix: normalizeMatrix({ a: 1, b: 0, c: 0, d: -1 }),
  },
};

const TRANSFORM_SET = buildTransformSet();

const ROUND_CONFIGS = [
  {
    id: 1,
    clickLimit: 20,
    kind: "glyph",
    title: "문자 회전",
  },
  {
    id: 2,
    clickLimit: 20,
    kind: "tiles",
    title: "블록 회전",
  },
];

export function createRotationGame(dom) {
  const state = {
    active: false,
    sessionStarted: false,
    roundIndex: 0,
    roundStats: ROUND_CONFIGS.map(createEmptyRoundStat),
    problemNumber: 1,
    history: [],
    clickCount: 0,
    currentMatrix: cloneMatrix(TRANSFORM_SET[0]),
    currentProblem: null,
    revealMoves: false,
    remainingMs: ROTATION_ROUND_MS,
    timerId: null,
    timerAnchorMs: null,
    timerBaseMs: ROTATION_ROUND_MS,
    roundFinished: false,
    popupTimeoutId: null,
  };

  attachEvents();
  renderPreview();
  hidePopup();

  return {
    activate,
    deactivate,
  };

  function attachEvents() {
    dom.operationButtons.forEach((button) => {
      button.addEventListener("click", () => {
        applyOperation(button.dataset.rotationOp);
      });
    });

    dom.undoButton.addEventListener("click", undoOperation);
    dom.clearButton.addEventListener("click", clearOperations);
    dom.submitButton.addEventListener("click", submitAnswer);
    dom.nextButton.addEventListener("click", advanceRound);
    dom.popupAction.addEventListener("click", advanceRound);
    dom.movementToggle.addEventListener("change", () => {
      state.revealMoves = dom.movementToggle.checked;
      render();
    });
  }

  function activate() {
    state.active = true;

    if (!state.sessionStarted) {
      startSession();
      return;
    }

    render();
    if (!state.roundFinished) {
      startTimer();
    }
  }

  function deactivate() {
    state.active = false;
    pauseTimer();
  }

  function startSession() {
    state.sessionStarted = true;
    state.roundIndex = 0;
    state.roundStats = ROUND_CONFIGS.map(createEmptyRoundStat);
    startRound();
  }

  function startRound() {
    clearPopupTimer();
    hidePopup();
    pauseTimer();

    state.roundStats[state.roundIndex] = createEmptyRoundStat();
    state.problemNumber = 1;
    state.history = [];
    state.clickCount = 0;
    state.revealMoves = false;
    state.remainingMs = ROTATION_ROUND_MS;
    state.timerBaseMs = ROTATION_ROUND_MS;
    state.roundFinished = false;
    dom.movementToggle.checked = false;

    loadProblem();
    render();
    dom.nextButton.classList.add("hidden");
    dom.nextButton.textContent = isLastRound() ? "처음부터 다시" : "2라운드 시작";
    setStatus(`${currentRoundConfig().title} 라운드가 시작되었습니다. 1분 안에 최대한 많이 맞혀 보세요.`);

    if (state.active) {
      startTimer();
    }
  }

  function loadProblem() {
    state.history = [];
    state.clickCount = 0;
    state.currentProblem =
      currentRoundConfig().kind === "glyph" ? buildRandomGlyphProblem() : buildRandomTileProblem();
    state.currentMatrix = cloneMatrix(state.currentProblem.beforeMatrix);
  }

  function render() {
    const roundText = `${state.roundIndex + 1} / ${ROUND_CONFIGS.length}`;
    const stat = currentRoundStat();

    dom.roundBadge.textContent = roundText;
    dom.roundText.textContent = roundText;
    dom.questionText.textContent = String(state.problemNumber);
    dom.timerText.textContent = formatCountdownTime(state.remainingMs);
    dom.solvedText.textContent = String(stat.correct);
    dom.clickText.textContent = String(getRemainingClicks());
    dom.stepCount.textContent = `${state.clickCount} / ${currentRoundConfig().clickLimit}`;
    dom.submitButton.disabled = state.roundFinished;
    dom.movementToggle.checked = state.revealMoves;
    dom.currentCard.classList.toggle("hidden", !state.revealMoves);

    renderShape(dom.beforeStage, state.currentProblem, state.currentProblem.beforeMatrix);
    renderShape(dom.afterStage, state.currentProblem, state.currentProblem.targetMatrix);

    if (state.revealMoves) {
      renderShape(dom.currentStage, state.currentProblem, state.currentMatrix);
    } else {
      dom.currentStage.innerHTML = "";
    }

    renderPreview();
  }

  function renderPreview() {
    dom.preview.innerHTML = "";

    const recentHistory = state.history.slice(-ROTATION_PREVIEW_SLOTS);
    const startStep = Math.max(0, state.history.length - recentHistory.length) + 1;

    let matrix = cloneMatrix(state.currentProblem?.beforeMatrix ?? TRANSFORM_SET[0]);
    const previewMatrices = [];
    state.history.forEach((operationKey) => {
      matrix = multiplyMatrices(ROTATION_OPERATIONS[operationKey].matrix, matrix);
      previewMatrices.push(cloneMatrix(matrix));
    });
    const recentMatrices = previewMatrices.slice(-ROTATION_PREVIEW_SLOTS);

    for (let index = 0; index < ROTATION_PREVIEW_SLOTS; index += 1) {
      const slot = document.createElement("div");
      const operationKey = recentHistory[index];
      const stepNumber = startStep + index;
      slot.className = `preview-slot ${state.revealMoves ? "" : "preview-slot-text"}`.trim();

      if (operationKey) {
        const operation = ROTATION_OPERATIONS[operationKey];
        slot.classList.add("is-filled");

        if (state.revealMoves) {
          slot.innerHTML = `
            <span class="preview-slot-number">${stepNumber}</span>
            <div class="preview-slot-canvas">${buildSvg(state.currentProblem, recentMatrices[index], true)}</div>
            <span class="preview-slot-label">${operation.shortLabel}</span>
          `;
        } else {
          slot.innerHTML = `
            <span class="preview-slot-number">${stepNumber}</span>
            <span class="preview-slot-label">${operation.shortLabel}</span>
          `;
        }
      } else if (state.revealMoves) {
        slot.innerHTML = `
          <span class="preview-slot-number">${index + 1}</span>
          <div class="preview-slot-canvas"></div>
          <span class="preview-slot-label">비어 있음</span>
        `;
      } else {
        slot.innerHTML = `
          <span class="preview-slot-number">${index + 1}</span>
          <span class="preview-slot-label">비어 있음</span>
        `;
      }

      dom.preview.appendChild(slot);
    }
  }

  function applyOperation(operationKey) {
    const operation = ROTATION_OPERATIONS[operationKey];

    if (!operation) {
      return;
    }

    if (state.roundFinished) {
      setStatus("라운드가 종료되었습니다.", "warning");
      return;
    }

    if (state.clickCount >= currentRoundConfig().clickLimit) {
      setStatus("이 문제의 클릭 수를 모두 사용했습니다. 하나 지움이나 전체 초기화를 이용하세요.", "warning");
      return;
    }

    state.history.push(operationKey);
    state.clickCount += 1;
    state.currentMatrix = multiplyMatrices(operation.matrix, state.currentMatrix);
    render();
    setStatus(`${operation.label}을 적용했습니다.`);
  }

  function undoOperation() {
    if (state.roundFinished) {
      setStatus("라운드 종료 후에는 과정을 수정할 수 없습니다.", "warning");
      return;
    }

    if (state.history.length === 0) {
      setStatus("지울 과정이 없습니다.", "warning");
      return;
    }

    state.history.pop();
    state.clickCount = Math.max(0, state.clickCount - 1);
    rebuildCurrentMatrix();
    render();
    setStatus("마지막 움직임을 지웠습니다.");
  }

  function clearOperations() {
    if (state.roundFinished) {
      setStatus("라운드 종료 후에는 초기화할 수 없습니다.", "warning");
      return;
    }

    state.history = [];
    state.clickCount = 0;
    state.currentMatrix = cloneMatrix(state.currentProblem.beforeMatrix);
    render();
    setStatus("현재 문제의 입력을 모두 지웠습니다.");
  }

  function submitAnswer() {
    if (state.roundFinished) {
      setStatus("라운드가 이미 종료되었습니다.", "warning");
      return;
    }

    const stat = currentRoundStat();
    const isCorrect = matricesMatch(state.currentMatrix, state.currentProblem.targetMatrix);

    stat.attempts += 1;
    if (isCorrect) {
      stat.correct += 1;
    }

    state.problemNumber += 1;
    loadProblem();
    render();

    if (isCorrect) {
      setStatus("정답입니다. 다음 랜덤 문제로 넘어갑니다.", "success");
    } else {
      setStatus("오답입니다. 다음 문제로 넘어갑니다.", "warning");
    }
  }

  function advanceRound() {
    if (!state.roundFinished) {
      setStatus("현재 라운드가 끝난 뒤에만 다음으로 넘어갈 수 있습니다.", "warning");
      return;
    }

    if (isLastRound()) {
      startSession();
      return;
    }

    state.roundIndex += 1;
    startRound();
  }

  function startTimer() {
    if (state.timerId || state.roundFinished) {
      return;
    }

    state.timerAnchorMs = Date.now();
    state.timerBaseMs = state.remainingMs;
    state.timerId = window.setInterval(() => {
      state.remainingMs = Math.max(0, state.timerBaseMs - (Date.now() - state.timerAnchorMs));
      dom.timerText.textContent = formatCountdownTime(state.remainingMs);

      if (state.remainingMs === 0) {
        finishRound();
      }
    }, 250);
  }

  function pauseTimer() {
    if (state.timerId) {
      state.remainingMs = Math.max(0, state.timerBaseMs - (Date.now() - state.timerAnchorMs));
      window.clearInterval(state.timerId);
      state.timerId = null;
    }
    state.timerAnchorMs = null;
  }

  function finishRound() {
    pauseTimer();
    state.roundFinished = true;

    const stat = currentRoundStat();
    const roundSummary = summarizeStat(stat);
    stat.passed = roundSummary.passed;

    render();

    if (isLastRound()) {
      const allRoundSummaries = state.roundStats.map(summarizeStat);
      const totalSummary = summarizeAllRounds(state.roundStats);
      const sessionPassed = allRoundSummaries.every((summary) => summary.passed);

      dom.nextButton.textContent = "처음부터 다시";
      showPopup({
        title: "최종 결과",
        passed: sessionPassed,
        message: sessionPassed ? "기준 충족" : "노력 필요",
        scoreLabel: "전체",
        scoreText: formatSummaryLine(totalSummary),
        detailLines: allRoundSummaries.map(
          (summary, index) => `${index + 1}라운드: ${formatSummaryLine(summary)}`,
        ),
        footnote: `통과 기준: 각 라운드 정답률 ${formatPercent(PASS_RATIO)}% 이상`,
        actionLabel: "처음부터 다시",
        progressDurationMs: 0,
      });
      setStatus(
        `2라운드 종료. 전체 ${totalSummary.correct}개 / ${totalSummary.attempts}개 정답, 정답률 ${totalSummary.percentText}%로 최종 ${sessionPassed ? "합격" : "불합격"}입니다.`,
        sessionPassed ? "success" : "warning",
      );
      return;
    }

    showPopup({
      title: "1라운드 결과",
      passed: roundSummary.passed,
      message: roundSummary.passed ? "기준 충족" : "노력 필요",
      scoreLabel: "1라운드",
      scoreText: formatSummaryLine(roundSummary),
      detailLines: ["3초 뒤 2라운드가 시작됩니다."],
      footnote: `통과 기준: 라운드 정답률 ${formatPercent(PASS_RATIO)}% 이상`,
      actionLabel: "",
      progressDurationMs: ROUND_TRANSITION_DELAY_MS,
    });
    setStatus(
      `1라운드 종료. ${roundSummary.correct}개 / ${roundSummary.attempts}개 정답, 정답률 ${roundSummary.percentText}%로 ${roundSummary.passed ? "합격" : "불합격"}입니다.`,
      roundSummary.passed ? "success" : "warning",
    );
    clearPopupTimer();
    state.popupTimeoutId = window.setTimeout(() => {
      state.roundIndex += 1;
      startRound();
    }, ROUND_TRANSITION_DELAY_MS);
  }

  function rebuildCurrentMatrix() {
    let matrix = cloneMatrix(state.currentProblem.beforeMatrix);
    state.history.forEach((operationKey) => {
      matrix = multiplyMatrices(ROTATION_OPERATIONS[operationKey].matrix, matrix);
    });
    state.currentMatrix = matrix;
  }

  function currentRoundConfig() {
    return ROUND_CONFIGS[state.roundIndex];
  }

  function currentRoundStat() {
    return state.roundStats[state.roundIndex];
  }

  function isLastRound() {
    return state.roundIndex === ROUND_CONFIGS.length - 1;
  }

  function getRemainingClicks() {
    return Math.max(0, currentRoundConfig().clickLimit - state.clickCount);
  }

  function renderShape(target, problem, matrix) {
    target.innerHTML = buildSvg(problem, matrix, false);
  }

  function showPopup({
    title,
    passed,
    message,
    scoreLabel,
    scoreText,
    detailLines = [],
    footnote,
    actionLabel = "",
    progressDurationMs = 0,
  }) {
    dom.popupCard.classList.remove("is-pass", "is-fail");
    dom.popupCard.classList.add(passed ? "is-pass" : "is-fail");
    dom.popupTitle.textContent = title;
    dom.popupStatus.textContent = passed ? "합격" : "불합격";
    dom.popupMessage.textContent = message;
    dom.popupScoreLabel.textContent = scoreLabel;
    dom.popupScore.textContent = scoreText;
    renderPopupDetails(detailLines);
    dom.popupFootnote.textContent = footnote;
    dom.popupAction.textContent = actionLabel || "처음부터 다시";
    dom.popupAction.classList.toggle("hidden", !actionLabel);
    syncPopupProgress(progressDurationMs);
    dom.popup.classList.remove("hidden");
  }

  function hidePopup() {
    dom.popupCard.classList.remove("is-pass", "is-fail");
    dom.popupAction.classList.add("hidden");
    syncPopupProgress(0);
    dom.popup.classList.add("hidden");
  }

  function clearPopupTimer() {
    if (state.popupTimeoutId) {
      window.clearTimeout(state.popupTimeoutId);
      state.popupTimeoutId = null;
    }
  }

  function setStatus(message, type = "info") {
    dom.statusText.textContent = message;
    dom.statusText.className = "status-text";
    if (type === "success") {
      dom.statusText.classList.add("status-success");
    }
    if (type === "warning") {
      dom.statusText.classList.add("status-warning");
    }
  }

  function renderPopupDetails(detailLines) {
    dom.popupDetails.replaceChildren(
      ...detailLines.map((line) => {
        const detail = document.createElement("p");
        detail.className = "round-popup-detail";
        detail.textContent = line;
        return detail;
      }),
    );
  }

  function syncPopupProgress(durationMs) {
    dom.popupProgress.classList.remove("is-animating");
    dom.popupProgress.classList.toggle("hidden", durationMs <= 0);
    dom.popupProgressBar.style.animation = "none";

    if (durationMs <= 0) {
      dom.popupProgressBar.style.removeProperty("--popup-progress-duration");
      dom.popupProgressBar.style.removeProperty("animation");
      return;
    }

    dom.popupProgressBar.style.setProperty("--popup-progress-duration", `${durationMs}ms`);
    void dom.popupProgress.offsetWidth;
    dom.popupProgressBar.style.removeProperty("animation");
    dom.popupProgress.classList.add("is-animating");
  }
}

function createEmptyRoundStat() {
  return {
    correct: 0,
    attempts: 0,
    passed: false,
  };
}

function summarizeStat(stat) {
  const accuracy = stat.attempts === 0 ? 0 : stat.correct / stat.attempts;
  return {
    correct: stat.correct,
    attempts: stat.attempts,
    accuracy,
    percentText: formatPercent(accuracy),
    passed: accuracy >= PASS_RATIO,
  };
}

function summarizeAllRounds(roundStats) {
  const totals = roundStats.reduce(
    (summary, stat) => {
      summary.correct += stat.correct;
      summary.attempts += stat.attempts;
      return summary;
    },
    { correct: 0, attempts: 0 },
  );

  const accuracy = totals.attempts === 0 ? 0 : totals.correct / totals.attempts;
  return {
    correct: totals.correct,
    attempts: totals.attempts,
    accuracy,
    percentText: formatPercent(accuracy),
  };
}

function formatSummaryLine(summary) {
  return `${summary.correct} / ${summary.attempts} (${summary.percentText}%)`;
}

function buildRandomGlyphProblem() {
  const text = pickRandom(LETTER_POOL);
  const beforeMatrix = pickRandom(TRANSFORM_SET);
  let targetMatrix = pickRandom(TRANSFORM_SET);

  while (matricesMatch(beforeMatrix, targetMatrix)) {
    targetMatrix = pickRandom(TRANSFORM_SET);
  }

  return {
    type: "glyph",
    text,
    fontSize: 124,
    beforeMatrix: cloneMatrix(beforeMatrix),
    targetMatrix: cloneMatrix(targetMatrix),
  };
}

function buildRandomTileProblem() {
  let cells = [];
  let beforeMatrix = pickRandom(TRANSFORM_SET);
  let targetMatrix = pickRandom(TRANSFORM_SET);

  do {
    cells = createRandomCells();
    beforeMatrix = pickRandom(TRANSFORM_SET);
    targetMatrix = pickRandom(TRANSFORM_SET);
  } while (
    matricesMatch(beforeMatrix, targetMatrix) ||
    getTileSignature(cells, beforeMatrix) === getTileSignature(cells, targetMatrix)
  );

  return {
    type: "tiles",
    cells,
    beforeMatrix: cloneMatrix(beforeMatrix),
    targetMatrix: cloneMatrix(targetMatrix),
  };
}

function createRandomCells() {
  for (let attempt = 0; attempt < TILE_SHAPE_ATTEMPTS; attempt += 1) {
    const filledCount = randomInteger(TILE_FILLED_MIN, TILE_FILLED_MAX);
    const cells = createCompactTileCells(filledCount);
    if (cells) {
      return cells;
    }
  }

  return createFallbackTileCells();
}

function createCompactTileCells(filledCount) {
  const bounds = pickTileBounds(filledCount);
  const cells = Array.from({ length: TILE_GRID_SIZE }, () => Array(TILE_GRID_SIZE).fill(0));
  const removeCount = bounds.width * bounds.height - filledCount;

  for (let row = bounds.top; row < bounds.top + bounds.height; row += 1) {
    for (let col = bounds.left; col < bounds.left + bounds.width; col += 1) {
      cells[row][col] = 1;
    }
  }

  for (let removed = 0; removed < removeCount; removed += 1) {
    const removableCells = findRemovableTileCells(cells, bounds);
    if (removableCells.length === 0) {
      return null;
    }

    const nextCell = pickRandom(removableCells);
    cells[nextCell.row][nextCell.col] = 0;
  }

  return cells;
}

function pickTileBounds(filledCount) {
  const sizeOptions =
    filledCount === TILE_FILLED_MIN
      ? [
          { width: 3, height: 4 },
          { width: 4, height: 3 },
          { width: 3, height: 4 },
          { width: 4, height: 3 },
          { width: 3, height: 3 },
        ]
      : [
          { width: 3, height: 4 },
          { width: 4, height: 3 },
        ];

  const size = pickRandom(sizeOptions);
  return {
    width: size.width,
    height: size.height,
    top: randomInteger(0, TILE_GRID_SIZE - size.height),
    left: randomInteger(0, TILE_GRID_SIZE - size.width),
  };
}

function findRemovableTileCells(cells, bounds) {
  const removable = [];

  for (let row = bounds.top; row < bounds.top + bounds.height; row += 1) {
    for (let col = bounds.left; col < bounds.left + bounds.width; col += 1) {
      if (!cells[row][col] || !isBoxBoundaryCell(row, col, bounds)) {
        continue;
      }

      if (canRemoveTileCell(cells, row, col)) {
        removable.push({ row, col });
      }
    }
  }

  return removable;
}

function isBoxBoundaryCell(row, col, bounds) {
  return (
    row === bounds.top ||
    row === bounds.top + bounds.height - 1 ||
    col === bounds.left ||
    col === bounds.left + bounds.width - 1
  );
}

function canRemoveTileCell(cells, row, col) {
  cells[row][col] = 0;
  const stillConnected = isTileShapeConnected(cells);
  cells[row][col] = 1;
  return stillConnected;
}

function isTileShapeConnected(cells) {
  const start = findFirstFilledCell(cells);
  if (!start) {
    return false;
  }

  const seen = new Set();
  const queue = [start];
  let visited = 0;

  while (queue.length > 0) {
    const current = queue.shift();
    const key = `${current.row}:${current.col}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    visited += 1;

    TILE_NEIGHBOR_OFFSETS.forEach((offset) => {
      const nextRow = current.row + offset.row;
      const nextCol = current.col + offset.col;
      if (
        nextRow < 0 ||
        nextRow >= TILE_GRID_SIZE ||
        nextCol < 0 ||
        nextCol >= TILE_GRID_SIZE ||
        !cells[nextRow][nextCol]
      ) {
        return;
      }

      queue.push({ row: nextRow, col: nextCol });
    });
  }

  return visited === countFilledCells(cells);
}

function findFirstFilledCell(cells) {
  for (let row = 0; row < TILE_GRID_SIZE; row += 1) {
    for (let col = 0; col < TILE_GRID_SIZE; col += 1) {
      if (cells[row][col]) {
        return { row, col };
      }
    }
  }

  return null;
}

function countFilledCells(cells) {
  return cells.reduce(
    (total, rowValues) => total + rowValues.reduce((rowTotal, value) => rowTotal + value, 0),
    0,
  );
}

function createFallbackTileCells() {
  const cells = Array.from({ length: TILE_GRID_SIZE }, () => Array(TILE_GRID_SIZE).fill(0));
  const top = randomInteger(0, TILE_GRID_SIZE - 3);
  const left = randomInteger(0, TILE_GRID_SIZE - 3);

  for (let row = top; row < top + 3; row += 1) {
    for (let col = left; col < left + 3; col += 1) {
      cells[row][col] = 1;
    }
  }

  return cells;
}

function getTileSignature(cells, matrix) {
  const points = [];
  const axisOffset = (TILE_GRID_SIZE - 1) / 2;

  cells.forEach((rowValues, rowIndex) => {
    rowValues.forEach((value, colIndex) => {
      if (!value) {
        return;
      }

      const x = colIndex - axisOffset;
      const y = rowIndex - axisOffset;
      const tx = normalizeMatrixValue(matrix.a * x + matrix.c * y);
      const ty = normalizeMatrixValue(matrix.b * x + matrix.d * y);
      points.push(`${tx},${ty}`);
    });
  });

  return points.sort().join("|");
}

function buildSvg(problem, matrix, compact) {
  const scaleText = compact ? " scale(0.84)" : "";
  return `
    <svg viewBox="0 0 220 220" aria-hidden="true">
      <g class="shape-figure${problem.type === "tiles" ? " tile-figure" : ""}" transform="translate(110 110) matrix(${matrix.a} ${matrix.b} ${matrix.c} ${matrix.d} 0 0)${scaleText}">
        ${problem.type === "glyph" ? buildGlyphMarkup(problem) : buildTileMarkup(problem)}
      </g>
    </svg>
  `;
}

function buildGlyphMarkup(problem) {
  return `
    <text
      x="0"
      y="18"
      text-anchor="middle"
      font-size="${problem.fontSize}"
      font-weight="800"
      font-family="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      fill="#2c2c2c"
    >
      ${problem.text}
    </text>
  `;
}

function buildTileMarkup(problem) {
  const offset = ((TILE_GRID_SIZE - 1) * TILE_SIZE) / 2;
  const cells = [];

  problem.cells.forEach((rowValues, rowIndex) => {
    rowValues.forEach((value, colIndex) => {
      const x = colIndex * TILE_SIZE - offset - TILE_SIZE / 2;
      const y = rowIndex * TILE_SIZE - offset - TILE_SIZE / 2;
      cells.push(`
        <rect
          x="${x}"
          y="${y}"
          width="${TILE_SIZE}"
          height="${TILE_SIZE}"
          fill="${value ? "#1d1d1d" : "#f3f4ef"}"
          stroke="#7c7c7c"
          stroke-width="1.3"
        ></rect>
      `);
    });
  });

  return cells.join("");
}

function buildTransformSet() {
  const set = [];
  const seen = new Set();
  const flipX = normalizeMatrix({ a: -1, b: 0, c: 0, d: 1 });

  for (let degrees = 0; degrees < 360; degrees += 45) {
    addMatrix(rotationMatrix(degrees));
    addMatrix(multiplyMatrices(rotationMatrix(degrees), flipX));
  }

  return set;

  function addMatrix(matrix) {
    const key = matrixKey(matrix);
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    set.push(matrix);
  }
}

function rotationMatrix(degrees) {
  const radians = (degrees * Math.PI) / 180;
  return normalizeMatrix({
    a: Math.cos(radians),
    b: Math.sin(radians),
    c: -Math.sin(radians),
    d: Math.cos(radians),
  });
}

function multiplyMatrices(left, right) {
  return normalizeMatrix({
    a: left.a * right.a + left.c * right.b,
    b: left.b * right.a + left.d * right.b,
    c: left.a * right.c + left.c * right.d,
    d: left.b * right.c + left.d * right.d,
  });
}

function normalizeMatrix(matrix) {
  return {
    a: normalizeMatrixValue(matrix.a),
    b: normalizeMatrixValue(matrix.b),
    c: normalizeMatrixValue(matrix.c),
    d: normalizeMatrixValue(matrix.d),
  };
}

function normalizeMatrixValue(value) {
  const rounded = Math.round(value * 1000000) / 1000000;
  return Math.abs(rounded) < 0.000001 ? 0 : rounded;
}

function cloneMatrix(matrix) {
  return { a: matrix.a, b: matrix.b, c: matrix.c, d: matrix.d };
}

function matricesMatch(left, right) {
  return ["a", "b", "c", "d"].every((key) => Math.abs(left[key] - right[key]) < 0.0001);
}

function matrixKey(matrix) {
  return `${matrix.a},${matrix.b},${matrix.c},${matrix.d}`;
}

function formatCountdownTime(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutesText = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const secondsText = String(totalSeconds % 60).padStart(2, "0");
  return `${minutesText}:${secondsText}`;
}

function formatPercent(ratio) {
  return (ratio * 100).toFixed(1);
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
