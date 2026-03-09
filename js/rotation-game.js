const ROTATION_ROUND_MS = 60 * 1000;
const ROTATION_PREVIEW_SLOTS = 8;

const ROTATION_OPERATIONS = {
  left45: {
    label: "왼쪽 45°",
    shortLabel: "↺ 45°",
    matrix: rotationMatrix(-45),
  },
  right45: {
    label: "오른쪽 45°",
    shortLabel: "↻ 45°",
    matrix: rotationMatrix(45),
  },
  flipX: {
    label: "좌우반전",
    shortLabel: "↔",
    matrix: normalizeMatrix({ a: -1, b: 0, c: 0, d: 1 }),
  },
  flipY: {
    label: "상하반전",
    shortLabel: "↕",
    matrix: normalizeMatrix({ a: 1, b: 0, c: 0, d: -1 }),
  },
};

const ROTATION_ROUNDS = [
  {
    id: 1,
    clickLimit: 20,
    beforeMatrix: rotationMatrix(-45),
    targetMatrix: normalizeMatrix({ a: -1, b: 0, c: 0, d: 1 }),
    shape: {
      type: "glyph",
      text: "P",
      fontSize: 124,
    },
  },
  {
    id: 2,
    clickLimit: 20,
    beforeMatrix: rotationMatrix(45),
    targetMatrix: rotationMatrix(135),
    shape: {
      type: "tiles",
      cells: [
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [1, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    },
  },
];

export function createRotationGame(dom) {
  const state = {
    sessionStarted: false,
    roundIndex: 0,
    solvedCount: 0,
    history: [],
    clickCount: 0,
    currentMatrix: cloneMatrix(ROTATION_ROUNDS[0].beforeMatrix),
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
    state.solvedCount = 0;
    startRound();
  }

  function startRound() {
    const round = currentRound();

    state.history = [];
    state.clickCount = 0;
    state.currentMatrix = cloneMatrix(round.beforeMatrix);
    state.remainingMs = ROTATION_ROUND_MS;
    state.timerBaseMs = ROTATION_ROUND_MS;
    state.roundFinished = false;

    pauseTimer();
    render();
    dom.nextButton.classList.add("hidden");
    dom.nextButton.textContent = isLastRound() ? "처음부터 다시" : "다음 라운드";
    setStatus("버튼을 눌러 전 상태를 후 상태와 같게 만들어 보세요.");
    startTimer();
  }

  function render() {
    const round = currentRound();
    const roundText = `${state.roundIndex + 1}/${ROTATION_ROUNDS.length}`;

    dom.roundBadge.textContent = roundText;
    dom.roundText.textContent = roundText;
    dom.questionText.textContent = String(round.id);
    dom.timerText.textContent = formatCountdownTime(state.remainingMs);
    dom.solvedText.textContent = String(state.solvedCount);
    dom.clickText.textContent = String(getRemainingClicks());
    dom.stepCount.textContent = `${state.clickCount} / ${round.clickLimit}`;
    dom.submitButton.disabled = state.roundFinished;

    renderShape(dom.beforeStage, round, round.beforeMatrix);
    renderShape(dom.afterStage, round, round.targetMatrix);
    renderShape(dom.currentStage, round, state.currentMatrix);
    renderPreview();
  }

  function renderPreview() {
    const round = currentRound();
    const snapshots = [];
    let matrix = cloneMatrix(round.beforeMatrix);

    state.history.forEach((operationKey, index) => {
      const operation = ROTATION_OPERATIONS[operationKey];
      matrix = multiplyMatrices(operation.matrix, matrix);
      snapshots.push({
        step: index + 1,
        label: operation.shortLabel,
        matrix: cloneMatrix(matrix),
      });
    });

    const visibleSnapshots = snapshots.slice(-ROTATION_PREVIEW_SLOTS);
    dom.preview.innerHTML = "";

    for (let index = 0; index < ROTATION_PREVIEW_SLOTS; index += 1) {
      const slot = document.createElement("div");
      slot.className = "preview-slot";
      const snapshot = visibleSnapshots[index];

      if (snapshot) {
        slot.classList.add("is-filled");
        slot.innerHTML = `
          <span class="preview-slot-number">${snapshot.step}</span>
          <div class="preview-slot-canvas">${buildSvg(round, snapshot.matrix, true)}</div>
          <span class="preview-slot-label">${snapshot.label}</span>
        `;
      } else {
        slot.innerHTML = `
          <span class="preview-slot-number">${index + 1}</span>
          <div class="preview-slot-canvas"></div>
          <span class="preview-slot-label">비어 있음</span>
        `;
      }

      dom.preview.appendChild(slot);
    }
  }

  function applyOperation(operationKey) {
    const round = currentRound();
    const operation = ROTATION_OPERATIONS[operationKey];

    if (!operation) {
      return;
    }

    if (state.roundFinished) {
      setStatus("라운드가 종료되었습니다. 다음 라운드 버튼으로 넘어가세요.", "warning");
      return;
    }

    if (state.clickCount >= round.clickLimit) {
      setStatus("남은 클릭을 모두 사용했습니다. 하나 지움 또는 전체 초기화를 사용해 보세요.", "warning");
      return;
    }

    state.history.push(operationKey);
    state.clickCount += 1;
    state.currentMatrix = multiplyMatrices(operation.matrix, state.currentMatrix);
    render();
    setStatus(`${operation.label}을(를) 적용했습니다.`);
  }

  function undoOperation() {
    if (state.roundFinished) {
      setStatus("라운드가 종료된 뒤에는 과정을 수정할 수 없습니다.", "warning");
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
    setStatus("마지막 과정을 지웠습니다.");
  }

  function clearOperations() {
    if (state.roundFinished) {
      setStatus("라운드가 종료된 뒤에는 과정을 초기화할 수 없습니다.", "warning");
      return;
    }

    state.history = [];
    state.clickCount = 0;
    state.currentMatrix = cloneMatrix(currentRound().beforeMatrix);
    render();
    setStatus("과정을 모두 초기화했습니다.");
  }

  function submitAnswer() {
    if (state.roundFinished) {
      setStatus("이미 종료된 라운드입니다. 다음 버튼으로 계속 진행하세요.", "warning");
      return;
    }

    if (state.clickCount === 0) {
      setStatus("아직 적용한 과정이 없습니다.", "warning");
      return;
    }

    if (!matricesMatch(state.currentMatrix, currentRound().targetMatrix)) {
      setStatus("아직 후 상태와 정확히 같지 않습니다. 과정을 더 조정해 보세요.", "warning");
      return;
    }

    finishRound(true, "정답입니다.");
  }

  function finishRound(success, message) {
    pauseTimer();
    state.roundFinished = true;

    if (success) {
      state.solvedCount += 1;
    }

    render();

    if (isLastRound()) {
      dom.nextButton.textContent = "처음부터 다시";
      dom.nextButton.classList.remove("hidden");
      setStatus(`${message} 모든 라운드가 끝났습니다. 총 ${state.solvedCount}/${ROTATION_ROUNDS.length} 정답입니다.`, success ? "success" : "warning");
      return;
    }

    dom.nextButton.textContent = "다음 라운드";
    dom.nextButton.classList.remove("hidden");
    setStatus(`${message} 다음 라운드로 넘어갈 수 있습니다.`, success ? "success" : "warning");
  }

  function advanceRound() {
    if (!state.roundFinished) {
      setStatus("현재 라운드를 먼저 제출하거나 시간이 끝나야 다음으로 넘어갈 수 있습니다.", "warning");
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
        finishRound(false, "시간이 종료되었습니다.");
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

  function rebuildCurrentMatrix() {
    let matrix = cloneMatrix(currentRound().beforeMatrix);

    state.history.forEach((operationKey) => {
      matrix = multiplyMatrices(ROTATION_OPERATIONS[operationKey].matrix, matrix);
    });

    state.currentMatrix = matrix;
  }

  function currentRound() {
    return ROTATION_ROUNDS[state.roundIndex];
  }

  function isLastRound() {
    return state.roundIndex === ROTATION_ROUNDS.length - 1;
  }

  function getRemainingClicks() {
    return Math.max(0, currentRound().clickLimit - state.clickCount);
  }

  function renderShape(target, round, matrix) {
    target.innerHTML = buildSvg(round, matrix, false);
  }

  function buildSvg(round, matrix, compact) {
    const svgClass = round.shape.type === "tiles" ? "shape-figure tile-figure" : "shape-figure";
    const scaleText = compact ? " scale(0.84)" : "";

    return `
      <svg viewBox="0 0 220 220" aria-hidden="true">
        <g class="${svgClass}" transform="translate(110 110) matrix(${matrix.a} ${matrix.b} ${matrix.c} ${matrix.d} 0 0)${scaleText}">
          ${getShapeMarkup(round)}
        </g>
      </svg>
    `;
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

function getShapeMarkup(round) {
  if (round.shape.type === "glyph") {
    return `
      <text
        x="0"
        y="18"
        text-anchor="middle"
        font-size="${round.shape.fontSize}"
        font-weight="900"
        font-family="'Arial Black', 'Segoe UI', sans-serif"
      >
        ${round.shape.text}
      </text>
    `;
  }

  const tileSize = 24;
  const offset = ((round.shape.cells.length - 1) * tileSize) / 2;
  const cells = [];

  round.shape.cells.forEach((rowValues, rowIndex) => {
    rowValues.forEach((value, colIndex) => {
      const x = colIndex * tileSize - offset - tileSize / 2;
      const y = rowIndex * tileSize - offset - tileSize / 2;
      cells.push(`
        <rect
          x="${x}"
          y="${y}"
          width="${tileSize}"
          height="${tileSize}"
          fill="${value ? "#eef2ec" : "currentColor"}"
          stroke="#767676"
          stroke-width="1.4"
        ></rect>
      `);
    });
  });

  return cells.join("");
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

function formatCountdownTime(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutesText = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const secondsText = String(totalSeconds % 60).padStart(2, "0");
  return `${minutesText}:${secondsText}`;
}
