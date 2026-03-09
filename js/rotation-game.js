const ROTATION_ROUND_MS = 60 * 1000;
const ROTATION_PREVIEW_SLOTS = 8;
const LETTER_POOL = ["Q", "P", "R", "F"];
const TILE_SIZE = 24;

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
    sessionStarted: false,
    roundIndex: 0,
    roundSolvedCount: 0,
    roundResults: Array(ROUND_CONFIGS.length).fill(0),
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
  };

  attachEvents();
  renderPreview();

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
    dom.movementToggle.addEventListener("change", () => {
      state.revealMoves = dom.movementToggle.checked;
      render();
    });
  }

  function activate() {
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
    pauseTimer();
  }

  function startSession() {
    state.sessionStarted = true;
    state.roundIndex = 0;
    state.roundResults = Array(ROUND_CONFIGS.length).fill(0);
    startRound();
  }

  function startRound() {
    pauseTimer();
    state.roundSolvedCount = 0;
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
    startTimer();
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

    dom.roundBadge.textContent = roundText;
    dom.roundText.textContent = roundText;
    dom.questionText.textContent = String(state.problemNumber);
    dom.timerText.textContent = formatCountdownTime(state.remainingMs);
    dom.solvedText.textContent = String(state.roundSolvedCount);
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

      if (operationKey) {
        const operation = ROTATION_OPERATIONS[operationKey];
        slot.className = `preview-slot ${state.revealMoves ? "" : "preview-slot-text"}`.trim();

        if (state.revealMoves) {
          slot.classList.add("is-filled");
          slot.innerHTML = `
            <span class="preview-slot-number">${stepNumber}</span>
            <div class="preview-slot-canvas">${buildSvg(state.currentProblem, recentMatrices[index], true)}</div>
            <span class="preview-slot-label">${operation.shortLabel}</span>
          `;
        } else {
          slot.classList.add("is-filled");
          slot.innerHTML = `
            <span class="preview-slot-number">${stepNumber}</span>
            <span class="preview-slot-label">${operation.shortLabel}</span>
          `;
        }
      } else {
        slot.className = `preview-slot ${state.revealMoves ? "" : "preview-slot-text"}`.trim();
        slot.innerHTML = `
          <span class="preview-slot-number">${index + 1}</span>
          ${state.revealMoves ? '<div class="preview-slot-canvas"></div>' : ""}
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
      setStatus("라운드가 종료되었습니다. 다음 버튼으로 이동하세요.", "warning");
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

    if (state.clickCount === 0) {
      setStatus("먼저 회전이나 반전을 한 번 이상 입력해 보세요.", "warning");
      return;
    }

    if (!matricesMatch(state.currentMatrix, state.currentProblem.targetMatrix)) {
      setStatus("아직 후 상태와 같지 않습니다. 움직임을 다시 점검해 보세요.", "warning");
      return;
    }

    state.roundSolvedCount += 1;
    state.roundResults[state.roundIndex] = state.roundSolvedCount;
    state.problemNumber += 1;
    loadProblem();
    render();
    setStatus("정답입니다. 다음 랜덤 문제로 넘어갑니다.", "success");
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
    render();
    dom.nextButton.classList.remove("hidden");

    if (isLastRound()) {
      const round1 = state.roundResults[0];
      const round2 = state.roundResults[1];
      dom.nextButton.textContent = "처음부터 다시";
      setStatus(`2라운드 종료. 1라운드 ${round1}개, 2라운드 ${round2}개 정답입니다.`, "success");
      return;
    }

    dom.nextButton.textContent = "2라운드 시작";
    setStatus(`1라운드 종료. 1분 동안 ${state.roundSolvedCount}개를 맞혔습니다.`, "success");
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

  function isLastRound() {
    return state.roundIndex === ROUND_CONFIGS.length - 1;
  }

  function getRemainingClicks() {
    return Math.max(0, currentRoundConfig().clickLimit - state.clickCount);
  }

  function renderShape(target, problem, matrix) {
    target.innerHTML = buildSvg(problem, matrix, false);
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
  const cells = Array.from({ length: 4 }, () => Array(4).fill(0));
  const filledCount = randomInteger(4, 9);
  let painted = 0;

  while (painted < filledCount) {
    const row = randomInteger(0, 3);
    const col = randomInteger(0, 3);
    if (cells[row][col] === 1) {
      continue;
    }
    cells[row][col] = 1;
    painted += 1;
  }

  return cells;
}

function getTileSignature(cells, matrix) {
  const points = [];

  cells.forEach((rowValues, rowIndex) => {
    rowValues.forEach((value, colIndex) => {
      if (!value) {
        return;
      }

      const x = colIndex - 1.5;
      const y = rowIndex - 1.5;
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
      font-weight="900"
      font-family="'Arial Black', 'Segoe UI', sans-serif"
      fill="#2c2c2c"
    >
      ${problem.text}
    </text>
  `;
}

function buildTileMarkup(problem) {
  const offset = ((4 - 1) * TILE_SIZE) / 2;
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

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
