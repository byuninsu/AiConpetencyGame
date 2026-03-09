const ROUTE_BEST_STORAGE_KEY = "mirror-route-session-best-v1";
const BOARD_SIZE = 5;
const SOLVED_PATH_COLOR = "#d94b45";

const PREVIEW_PATH_COLORS = {
  yellow: "#d7a019",
  blue: "#4b69d6",
  red: "#de6b63",
};

const COLOR_META = {
  yellow: {
    code: "노",
    swatchClass: "color-yellow",
  },
  blue: {
    code: "파",
    swatchClass: "color-blue",
  },
  red: {
    code: "빨",
    swatchClass: "color-red",
  },
};

const ROUTE_PUZZLES = [
  { id: 1, requiredMirrors: 3, maxClicks: 18, vehicles: [{ color: "yellow", entry: { side: "right", index: 2 } }, { color: "blue", entry: { side: "top", index: 1 } }, { color: "red", entry: { side: "bottom", index: 4 } }], passengers: [{ color: "yellow", exit: { side: "bottom", index: 2 } }, { color: "blue", exit: { side: "right", index: 3 } }, { color: "red", exit: { side: "right", index: 0 } }] },
  { id: 2, requiredMirrors: 4, maxClicks: 20, vehicles: [{ color: "yellow", entry: { side: "left", index: 0 } }, { color: "blue", entry: { side: "top", index: 2 } }, { color: "red", entry: { side: "left", index: 4 } }], passengers: [{ color: "yellow", exit: { side: "top", index: 4 } }, { color: "blue", exit: { side: "bottom", index: 1 } }, { color: "red", exit: { side: "left", index: 1 } }] },
  { id: 3, requiredMirrors: 3, maxClicks: 18, vehicles: [{ color: "yellow", entry: { side: "left", index: 0 } }, { color: "blue", entry: { side: "top", index: 2 } }, { color: "red", entry: { side: "left", index: 4 } }], passengers: [{ color: "yellow", exit: { side: "top", index: 1 } }, { color: "blue", exit: { side: "right", index: 3 } }, { color: "red", exit: { side: "bottom", index: 2 } }] },
  { id: 4, requiredMirrors: 3, maxClicks: 18, vehicles: [{ color: "yellow", entry: { side: "top", index: 4 } }, { color: "blue", entry: { side: "left", index: 0 } }, { color: "red", entry: { side: "bottom", index: 2 } }], passengers: [{ color: "yellow", exit: { side: "left", index: 2 } }, { color: "blue", exit: { side: "top", index: 3 } }, { color: "red", exit: { side: "left", index: 1 } }] },
  { id: 5, requiredMirrors: 3, maxClicks: 18, vehicles: [{ color: "yellow", entry: { side: "left", index: 0 } }, { color: "blue", entry: { side: "top", index: 2 } }, { color: "red", entry: { side: "left", index: 4 } }], passengers: [{ color: "yellow", exit: { side: "top", index: 1 } }, { color: "blue", exit: { side: "right", index: 3 } }, { color: "red", exit: { side: "right", index: 0 } }] },
  { id: 6, requiredMirrors: 4, maxClicks: 20, vehicles: [{ color: "yellow", entry: { side: "top", index: 4 } }, { color: "blue", entry: { side: "left", index: 0 } }, { color: "red", entry: { side: "bottom", index: 2 } }], passengers: [{ color: "yellow", exit: { side: "top", index: 2 } }, { color: "blue", exit: { side: "right", index: 2 } }, { color: "red", exit: { side: "right", index: 3 } }] },
  { id: 7, requiredMirrors: 4, maxClicks: 20, vehicles: [{ color: "yellow", entry: { side: "right", index: 2 } }, { color: "blue", entry: { side: "top", index: 1 } }, { color: "red", entry: { side: "bottom", index: 4 } }], passengers: [{ color: "yellow", exit: { side: "right", index: 1 } }, { color: "blue", exit: { side: "top", index: 2 } }, { color: "red", exit: { side: "right", index: 3 } }] },
  { id: 8, requiredMirrors: 4, maxClicks: 20, vehicles: [{ color: "yellow", entry: { side: "left", index: 1 } }, { color: "blue", entry: { side: "bottom", index: 3 } }, { color: "red", entry: { side: "right", index: 4 } }], passengers: [{ color: "yellow", exit: { side: "top", index: 1 } }, { color: "blue", exit: { side: "bottom", index: 2 } }, { color: "red", exit: { side: "left", index: 0 } }] },
  { id: 9, requiredMirrors: 4, maxClicks: 20, vehicles: [{ color: "yellow", entry: { side: "right", index: 2 } }, { color: "blue", entry: { side: "top", index: 1 } }, { color: "red", entry: { side: "bottom", index: 4 } }], passengers: [{ color: "yellow", exit: { side: "left", index: 0 } }, { color: "blue", exit: { side: "top", index: 4 } }, { color: "red", exit: { side: "left", index: 4 } }] },
  { id: 10, requiredMirrors: 4, maxClicks: 20, vehicles: [{ color: "yellow", entry: { side: "top", index: 1 } }, { color: "blue", entry: { side: "right", index: 3 } }, { color: "red", entry: { side: "left", index: 4 } }], passengers: [{ color: "yellow", exit: { side: "top", index: 3 } }, { color: "blue", exit: { side: "bottom", index: 4 } }, { color: "red", exit: { side: "top", index: 4 } }] },
  { id: 11, requiredMirrors: 3, maxClicks: 18, vehicles: [{ color: "yellow", entry: { side: "left", index: 0 } }, { color: "blue", entry: { side: "top", index: 2 } }, { color: "red", entry: { side: "left", index: 4 } }], passengers: [{ color: "yellow", exit: { side: "top", index: 1 } }, { color: "blue", exit: { side: "right", index: 3 } }, { color: "red", exit: { side: "top", index: 3 } }] },
  { id: 12, requiredMirrors: 4, maxClicks: 20, vehicles: [{ color: "yellow", entry: { side: "left", index: 0 } }, { color: "blue", entry: { side: "top", index: 2 } }, { color: "red", entry: { side: "left", index: 4 } }], passengers: [{ color: "yellow", exit: { side: "right", index: 4 } }, { color: "blue", exit: { side: "top", index: 3 } }, { color: "red", exit: { side: "top", index: 0 } }] },
  { id: 13, requiredMirrors: 3, maxClicks: 18, vehicles: [{ color: "yellow", entry: { side: "top", index: 0 } }, { color: "blue", entry: { side: "left", index: 2 } }, { color: "red", entry: { side: "bottom", index: 4 } }], passengers: [{ color: "yellow", exit: { side: "right", index: 0 } }, { color: "blue", exit: { side: "top", index: 3 } }, { color: "red", exit: { side: "bottom", index: 3 } }] },
  { id: 14, requiredMirrors: 4, maxClicks: 20, vehicles: [{ color: "yellow", entry: { side: "left", index: 1 } }, { color: "blue", entry: { side: "bottom", index: 3 } }, { color: "red", entry: { side: "right", index: 4 } }], passengers: [{ color: "yellow", exit: { side: "bottom", index: 0 } }, { color: "blue", exit: { side: "bottom", index: 1 } }, { color: "red", exit: { side: "right", index: 1 } }] },
  { id: 15, requiredMirrors: 3, maxClicks: 18, vehicles: [{ color: "yellow", entry: { side: "top", index: 4 } }, { color: "blue", entry: { side: "left", index: 0 } }, { color: "red", entry: { side: "bottom", index: 2 } }], passengers: [{ color: "yellow", exit: { side: "right", index: 0 } }, { color: "blue", exit: { side: "top", index: 0 } }, { color: "red", exit: { side: "left", index: 3 } }] },
  { id: 16, requiredMirrors: 4, maxClicks: 20, vehicles: [{ color: "yellow", entry: { side: "top", index: 1 } }, { color: "blue", entry: { side: "right", index: 3 } }, { color: "red", entry: { side: "left", index: 4 } }], passengers: [{ color: "yellow", exit: { side: "bottom", index: 0 } }, { color: "blue", exit: { side: "right", index: 1 } }, { color: "red", exit: { side: "bottom", index: 3 } }] },
  { id: 17, requiredMirrors: 3, maxClicks: 18, vehicles: [{ color: "yellow", entry: { side: "top", index: 0 } }, { color: "blue", entry: { side: "left", index: 2 } }, { color: "red", entry: { side: "bottom", index: 4 } }], passengers: [{ color: "yellow", exit: { side: "left", index: 4 } }, { color: "blue", exit: { side: "top", index: 1 } }, { color: "red", exit: { side: "right", index: 2 } }] },
  { id: 18, requiredMirrors: 3, maxClicks: 18, vehicles: [{ color: "yellow", entry: { side: "left", index: 1 } }, { color: "blue", entry: { side: "bottom", index: 3 } }, { color: "red", entry: { side: "right", index: 4 } }], passengers: [{ color: "yellow", exit: { side: "top", index: 2 } }, { color: "blue", exit: { side: "left", index: 0 } }, { color: "red", exit: { side: "top", index: 4 } }] },
  { id: 19, requiredMirrors: 4, maxClicks: 20, vehicles: [{ color: "yellow", entry: { side: "right", index: 0 } }, { color: "blue", entry: { side: "bottom", index: 2 } }, { color: "red", entry: { side: "left", index: 4 } }], passengers: [{ color: "yellow", exit: { side: "right", index: 4 } }, { color: "blue", exit: { side: "bottom", index: 3 } }, { color: "red", exit: { side: "top", index: 0 } }] },
  { id: 20, requiredMirrors: 3, maxClicks: 18, vehicles: [{ color: "yellow", entry: { side: "right", index: 2 } }, { color: "blue", entry: { side: "top", index: 1 } }, { color: "red", entry: { side: "bottom", index: 4 } }], passengers: [{ color: "yellow", exit: { side: "top", index: 0 } }, { color: "blue", exit: { side: "left", index: 0 } }, { color: "red", exit: { side: "left", index: 4 } }] },
  { id: 21, requiredMirrors: 3, maxClicks: 18, vehicles: [{ color: "yellow", entry: { side: "right", index: 0 } }, { color: "blue", entry: { side: "bottom", index: 2 } }, { color: "red", entry: { side: "left", index: 4 } }], passengers: [{ color: "yellow", exit: { side: "top", index: 4 } }, { color: "blue", exit: { side: "right", index: 1 } }, { color: "red", exit: { side: "top", index: 3 } }] },
  { id: 22, requiredMirrors: 3, maxClicks: 18, vehicles: [{ color: "yellow", entry: { side: "top", index: 4 } }, { color: "blue", entry: { side: "left", index: 0 } }, { color: "red", entry: { side: "bottom", index: 2 } }], passengers: [{ color: "yellow", exit: { side: "right", index: 4 } }, { color: "blue", exit: { side: "top", index: 0 } }, { color: "red", exit: { side: "bottom", index: 0 } }] },
  { id: 23, requiredMirrors: 3, maxClicks: 18, vehicles: [{ color: "yellow", entry: { side: "right", index: 0 } }, { color: "blue", entry: { side: "bottom", index: 2 } }, { color: "red", entry: { side: "left", index: 4 } }], passengers: [{ color: "yellow", exit: { side: "top", index: 3 } }, { color: "blue", exit: { side: "right", index: 3 } }, { color: "red", exit: { side: "bottom", index: 4 } }] },
  { id: 24, requiredMirrors: 4, maxClicks: 20, vehicles: [{ color: "yellow", entry: { side: "top", index: 4 } }, { color: "blue", entry: { side: "left", index: 0 } }, { color: "red", entry: { side: "bottom", index: 2 } }], passengers: [{ color: "yellow", exit: { side: "bottom", index: 0 } }, { color: "blue", exit: { side: "left", index: 3 } }, { color: "red", exit: { side: "right", index: 0 } }] },
  { id: 25, requiredMirrors: 3, maxClicks: 18, vehicles: [{ color: "yellow", entry: { side: "right", index: 0 } }, { color: "blue", entry: { side: "bottom", index: 2 } }, { color: "red", entry: { side: "left", index: 4 } }], passengers: [{ color: "yellow", exit: { side: "bottom", index: 0 } }, { color: "blue", exit: { side: "right", index: 2 } }, { color: "red", exit: { side: "bottom", index: 1 } }] },
  { id: 26, requiredMirrors: 4, maxClicks: 20, vehicles: [{ color: "yellow", entry: { side: "left", index: 1 } }, { color: "blue", entry: { side: "bottom", index: 3 } }, { color: "red", entry: { side: "right", index: 4 } }], passengers: [{ color: "yellow", exit: { side: "left", index: 4 } }, { color: "blue", exit: { side: "top", index: 0 } }, { color: "red", exit: { side: "top", index: 4 } }] },
  { id: 27, requiredMirrors: 3, maxClicks: 18, vehicles: [{ color: "yellow", entry: { side: "left", index: 0 } }, { color: "blue", entry: { side: "top", index: 2 } }, { color: "red", entry: { side: "left", index: 4 } }], passengers: [{ color: "yellow", exit: { side: "bottom", index: 2 } }, { color: "blue", exit: { side: "bottom", index: 3 } }, { color: "red", exit: { side: "top", index: 0 } }] },
  { id: 28, requiredMirrors: 3, maxClicks: 18, vehicles: [{ color: "yellow", entry: { side: "right", index: 0 } }, { color: "blue", entry: { side: "bottom", index: 2 } }, { color: "red", entry: { side: "left", index: 4 } }], passengers: [{ color: "yellow", exit: { side: "top", index: 2 } }, { color: "blue", exit: { side: "top", index: 1 } }, { color: "red", exit: { side: "top", index: 0 } }] },
];

export function createRouteGame(dom) {
  const state = {
    currentPuzzle: null,
    puzzleBag: [],
    roundNumber: 1,
    mirrors: new Map(),
    clickCount: 0,
    solved: false,
    elapsedMs: 0,
    timerId: null,
    timerAnchorMs: null,
    timerBaseMs: 0,
    bestTime: loadStoredNumber(ROUTE_BEST_STORAGE_KEY),
    started: false,
    showPathPreview: false,
  };

  attachEvents();

  return {
    activate,
    deactivate,
  };

  function attachEvents() {
    dom.board.addEventListener("pointerdown", handleBoardPointerDown);
    dom.checkButton.addEventListener("click", checkSolution);
    dom.resetButton.addEventListener("click", restartPuzzle);
    dom.clearButton.addEventListener("click", clearMirrors);
    dom.pathToggle.addEventListener("change", handlePathToggleChange);
    dom.nextButton.addEventListener("click", () => {
      startPuzzle(true);
    });
  }

  function activate() {
    if (!state.started) {
      startPuzzle(false);
      return;
    }

    render();
    if (!state.solved && state.clickCount > 0) {
      startTimer();
    }
  }

  function deactivate() {
    pauseTimer();
  }

  function startPuzzle(advanceRound) {
    state.currentPuzzle = nextPuzzle();
    state.mirrors = new Map();
    state.clickCount = 0;
    state.solved = false;
    state.started = true;
    resetTimer();

    if (advanceRound) {
      state.roundNumber += 1;
    }

    render();
    setStatus("칸의 대각선 방향을 눌러 `/` 또는 `\\` 거울을 배치하세요.");
  }

  function restartPuzzle() {
    state.mirrors = new Map();
    state.clickCount = 0;
    state.solved = false;
    resetTimer();
    render();
    setStatus("현재 문제를 처음부터 다시 시작합니다.");
  }

  function clearMirrors() {
    state.mirrors = new Map();
    state.clickCount = 0;
    state.solved = false;
    resetTimer();
    render();
    setStatus("현재 문제의 거울을 모두 지웠습니다.");
  }

  function nextPuzzle() {
    if (state.puzzleBag.length === 0) {
      state.puzzleBag = shuffle(ROUTE_PUZZLES.map((puzzle) => puzzle.id));
    }

    const nextId = state.puzzleBag.shift();
    if (state.currentPuzzle && nextId === state.currentPuzzle.id && state.puzzleBag.length > 0) {
      const fallbackId = state.puzzleBag.shift();
      state.puzzleBag.push(nextId);
      return ROUTE_PUZZLES.find((puzzle) => puzzle.id === fallbackId);
    }

    return ROUTE_PUZZLES.find((puzzle) => puzzle.id === nextId);
  }

  function render() {
    renderBoard();
    renderPathOverlay();
    dom.problemIndex.textContent = String(state.roundNumber);
    dom.problemHint.textContent =
      `이번 문제는 최소 거울 ${state.currentPuzzle.requiredMirrors}개가 필요합니다. 칸의 대각선을 눌러 배치하세요.`;
    dom.clickText.textContent = String(getRemainingClicks());
    dom.requiredText.textContent = String(state.currentPuzzle.requiredMirrors);
    dom.placedText.textContent = String(state.mirrors.size);
    dom.bestText.textContent = formatElapsedTime(state.bestTime);
    dom.timerText.textContent = formatElapsedTime(state.elapsedMs);
    dom.checkButton.disabled = state.solved;
    dom.pathToggle.checked = state.showPathPreview;
  }

  function renderBoard() {
    const edgeItems = new Map();

    state.currentPuzzle.vehicles.forEach((vehicle) => {
      edgeItems.set(`${vehicle.entry.side}:${vehicle.entry.index}`, {
        color: vehicle.color,
        icon: createVehicleSvg(vehicle.color),
        code: COLOR_META[vehicle.color].code,
      });
    });

    state.currentPuzzle.passengers.forEach((passenger) => {
      edgeItems.set(`${passenger.exit.side}:${passenger.exit.index}`, {
        color: passenger.color,
        icon: createPersonSvg(),
        code: COLOR_META[passenger.color].code,
      });
    });

    dom.board.innerHTML = "";

    for (let row = 0; row < 7; row += 1) {
      for (let col = 0; col < 7; col += 1) {
        const slot = document.createElement("div");
        slot.className = "board-slot";

        const isCorner = (row === 0 || row === 6) && (col === 0 || col === 6);
        if (isCorner) {
          slot.innerHTML = '<div class="slot-empty"></div>';
          dom.board.appendChild(slot);
          continue;
        }

        const isEdge = row === 0 || row === 6 || col === 0 || col === 6;
        if (isEdge) {
          const edge =
            row === 0
              ? { side: "top", index: col - 1 }
              : row === 6
                ? { side: "bottom", index: col - 1 }
                : col === 0
                  ? { side: "left", index: row - 1 }
                  : { side: "right", index: row - 1 };
          const tokenData = edgeItems.get(`${edge.side}:${edge.index}`);

          if (!tokenData) {
            slot.innerHTML = '<div class="slot-empty"></div>';
          } else {
            slot.innerHTML = `
              <div class="edge-token ${COLOR_META[tokenData.color].swatchClass}">
                ${tokenData.icon}
                <span class="token-code">${tokenData.code}</span>
              </div>
            `;
          }

          dom.board.appendChild(slot);
          continue;
        }

        const boardRow = row - 1;
        const boardCol = col - 1;
        const key = getCellKey(boardRow, boardCol);
        const mirror = state.mirrors.get(key);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "board-cell";
        if (getRemainingClicks() === 0 && !state.solved) {
          button.classList.add("is-locked");
        }
        button.dataset.cellKey = key;
        button.dataset.state = mirror === "/" ? "slash" : mirror === "\\" ? "backslash" : "empty";
        button.setAttribute("aria-label", `${boardRow + 1}행 ${boardCol + 1}열`);
        slot.appendChild(button);
        dom.board.appendChild(slot);
      }
    }
  }

  function handleBoardPointerDown(event) {
    const button = event.target.closest("[data-cell-key]");
    if (!button) {
      return;
    }

    if (state.solved) {
      setStatus("이미 정답 처리된 문제입니다. 다음 문제 버튼으로 계속 진행하세요.", "success");
      return;
    }

    const key = button.dataset.cellKey;
    const nextMirror = pickMirrorFromPoint(button, event);
    applyMirror(key, nextMirror);
  }

  function handlePathToggleChange() {
    state.showPathPreview = dom.pathToggle.checked;
    renderPathOverlay();
  }

  function applyMirror(key, nextMirror) {
    const currentMirror = state.mirrors.get(key) ?? null;
    const finalMirror = currentMirror === nextMirror ? null : nextMirror;

    if (currentMirror === finalMirror) {
      return;
    }

    if (getRemainingClicks() <= 0) {
      setStatus("남은 클릭을 모두 사용했습니다. 제출하거나 다음 문제로 넘어가세요.", "warning");
      return;
    }

    if (state.clickCount === 0) {
      startTimer();
    }

    if (finalMirror) {
      state.mirrors.set(key, finalMirror);
    } else {
      state.mirrors.delete(key);
    }

    state.clickCount += 1;
    render();

    if (getRemainingClicks() === 0) {
      setStatus("남은 클릭을 모두 사용했습니다. 이제 정답 제출로 확인해 보세요.");
    } else {
      setStatus("거울을 배치했습니다. 계속 수정하거나 정답 제출로 확인할 수 있습니다.");
    }
  }

  function checkSolution() {
    const placedCount = state.mirrors.size;

    if (placedCount === 0) {
      setStatus("아직 배치한 거울이 없습니다.", "warning");
      return;
    }

    if (!allRoutesMatched()) {
      setStatus("아직 정답이 아닙니다. 차량과 손님의 연결을 다시 확인해 보세요.", "warning");
      return;
    }

    if (placedCount < state.currentPuzzle.requiredMirrors) {
      setStatus(`정답 경로는 맞지만 최소 거울 수 ${state.currentPuzzle.requiredMirrors}개보다 적습니다.`, "warning");
      return;
    }

    if (placedCount > state.currentPuzzle.requiredMirrors) {
      setStatus(`연결은 맞지만 이 문제는 거울 ${state.currentPuzzle.requiredMirrors}개로 풀 수 있습니다.`, "warning");
      return;
    }

    state.solved = true;
    pauseTimer();

    if (!state.bestTime || state.elapsedMs < state.bestTime) {
      state.bestTime = state.elapsedMs;
      storeNumber(ROUTE_BEST_STORAGE_KEY, state.bestTime);
    }

    render();
    setStatus("정답입니다. 다음 문제 버튼으로 계속 진행할 수 있습니다.", "success");
  }

  function allRoutesMatched() {
    return getVehicleTraces().every((result) => {
      if (result.loop || !result.exit) {
        return false;
      }

      const passenger = getPassengerByColor(result.vehicle.color);
      return passenger.exit.side === result.exit.side && passenger.exit.index === result.exit.index;
    });
  }

  function simulateVehicle(vehicle) {
    const visited = new Set();
    let { row, col, dir } = getStartState(vehicle.entry);
    const points = [getEdgePoint(vehicle.entry)];

    for (let step = 0; step < 80; step += 1) {
      const next = moveStep(row, col, dir);
      if (next.row < 0 || next.row >= BOARD_SIZE || next.col < 0 || next.col >= BOARD_SIZE) {
        const exit = getExitEdge(row, col, dir);
        points.push(getEdgePoint(exit));
        return { exit, loop: false, points };
      }

      row = next.row;
      col = next.col;
      points.push(getCellCenter(row, col));

      const loopKey = `${row},${col},${dir}`;
      if (visited.has(loopKey)) {
        return { exit: null, loop: true, points };
      }
      visited.add(loopKey);

      const mirror = state.mirrors.get(getCellKey(row, col));
      if (mirror) {
        dir = reflectDirection(dir, mirror);
      }
    }

    return { exit: null, loop: true, points };
  }

  function getVehicleTraces() {
    return state.currentPuzzle.vehicles.map((vehicle) => ({
      vehicle,
      ...simulateVehicle(vehicle),
    }));
  }

  function renderPathOverlay() {
    if (!state.currentPuzzle || (!state.showPathPreview && !state.solved)) {
      dom.pathOverlay.innerHTML = "";
      return;
    }

    const traces = getVehicleTraces();
    dom.pathOverlay.innerHTML = traces
      .map((trace) => buildPathMarkup(trace))
      .filter(Boolean)
      .join("");
  }

  function buildPathMarkup(trace) {
    if (!trace.points || trace.points.length < 2) {
      return "";
    }

    const pathData = trace.points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");
    const color = state.solved ? SOLVED_PATH_COLOR : PREVIEW_PATH_COLORS[trace.vehicle.color];
    const opacity = trace.loop ? "0.45" : "0.9";

    return `<path class="route-path${state.solved ? " is-solved" : ""}" d="${pathData}" stroke="${color}" opacity="${opacity}"></path>`;
  }

  function getEdgePoint(edge) {
    if (edge.side === "left") {
      return { x: 0.5, y: edge.index + 1.5 };
    }
    if (edge.side === "right") {
      return { x: 6.5, y: edge.index + 1.5 };
    }
    if (edge.side === "top") {
      return { x: edge.index + 1.5, y: 0.5 };
    }
    return { x: edge.index + 1.5, y: 6.5 };
  }

  function getCellCenter(row, col) {
    return { x: col + 1.5, y: row + 1.5 };
  }

  function getPassengerByColor(color) {
    return state.currentPuzzle.passengers.find((passenger) => passenger.color === color);
  }

  function getStartState(entry) {
    if (entry.side === "left") {
      return { row: entry.index, col: -1, dir: "right" };
    }
    if (entry.side === "right") {
      return { row: entry.index, col: BOARD_SIZE, dir: "left" };
    }
    if (entry.side === "top") {
      return { row: -1, col: entry.index, dir: "down" };
    }
    return { row: BOARD_SIZE, col: entry.index, dir: "up" };
  }

  function moveStep(row, col, dir) {
    if (dir === "up") {
      return { row: row - 1, col };
    }
    if (dir === "down") {
      return { row: row + 1, col };
    }
    if (dir === "left") {
      return { row, col: col - 1 };
    }
    return { row, col: col + 1 };
  }

  function reflectDirection(dir, mirror) {
    if (mirror === "/") {
      return { up: "right", right: "up", down: "left", left: "down" }[dir];
    }
    return { up: "left", left: "up", down: "right", right: "down" }[dir];
  }

  function getExitEdge(row, col, dir) {
    if (dir === "right") {
      return { side: "right", index: row };
    }
    if (dir === "left") {
      return { side: "left", index: row };
    }
    if (dir === "down") {
      return { side: "bottom", index: col };
    }
    return { side: "top", index: col };
  }

  function getCellKey(row, col) {
    return `${row},${col}`;
  }

  function getRemainingClicks() {
    return Math.max(0, state.currentPuzzle.maxClicks - state.clickCount);
  }

  function pickMirrorFromPoint(button, event) {
    const rect = button.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const slashDistance = Math.abs(y - (1 - x));
    const backslashDistance = Math.abs(y - x);

    if (Math.abs(slashDistance - backslashDistance) < 0.045) {
      return x < 0.5 ? "\\" : "/";
    }

    return slashDistance < backslashDistance ? "/" : "\\";
  }

  function startTimer() {
    if (state.timerId || state.solved) {
      return;
    }

    state.timerAnchorMs = Date.now();
    state.timerBaseMs = state.elapsedMs;
    state.timerId = window.setInterval(() => {
      state.elapsedMs = state.timerBaseMs + (Date.now() - state.timerAnchorMs);
      dom.timerText.textContent = formatElapsedTime(state.elapsedMs);
    }, 250);
  }

  function pauseTimer() {
    if (state.timerId) {
      state.elapsedMs = state.timerBaseMs + (Date.now() - state.timerAnchorMs);
      window.clearInterval(state.timerId);
      state.timerId = null;
    }
    state.timerAnchorMs = null;
  }

  function resetTimer() {
    pauseTimer();
    state.elapsedMs = 0;
    state.timerBaseMs = 0;
    dom.timerText.textContent = "00:00";
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

function loadStoredNumber(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return typeof parsed === "number" ? parsed : null;
  } catch {
    return null;
  }
}

function storeNumber(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures in static hosting.
  }
}

function shuffle(list) {
  const copy = list.slice();
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function formatElapsedTime(ms) {
  if (ms === null || ms === undefined) {
    return "--:--";
  }

  const totalSeconds = Math.floor(ms / 1000);
  const minutesText = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const secondsText = String(totalSeconds % 60).padStart(2, "0");
  return `${minutesText}:${secondsText}`;
}

function createVehicleSvg(color) {
  if (color === "blue") {
    return `
      <svg class="icon-svg" viewBox="0 0 56 36" aria-hidden="true">
        <rect x="6" y="10" width="44" height="18" rx="5" fill="currentColor"></rect>
        <rect x="11" y="13" width="8" height="6" rx="1" fill="#ffffff" opacity="0.82"></rect>
        <rect x="22" y="13" width="8" height="6" rx="1" fill="#ffffff" opacity="0.82"></rect>
        <rect x="33" y="13" width="8" height="6" rx="1" fill="#ffffff" opacity="0.82"></rect>
        <circle cx="18" cy="29" r="4.5" fill="#33384a"></circle>
        <circle cx="38" cy="29" r="4.5" fill="#33384a"></circle>
      </svg>
    `;
  }

  if (color === "red") {
    return `
      <svg class="icon-svg" viewBox="0 0 56 36" aria-hidden="true">
        <path d="M8 22c0-4 3-7 7-7h10l6-6h9c3 0 5 1 6 3l3 8v5H8z" fill="currentColor"></path>
        <circle cx="18" cy="28" r="4.5" fill="#33384a"></circle>
        <circle cx="39" cy="28" r="4.5" fill="#33384a"></circle>
      </svg>
    `;
  }

  return `
    <svg class="icon-svg" viewBox="0 0 56 36" aria-hidden="true">
      <rect x="9" y="16" width="38" height="11" rx="5" fill="currentColor"></rect>
      <path d="M17 16l6-7h11l5 7z" fill="currentColor" opacity="0.9"></path>
      <rect x="25" y="8" width="7" height="4" rx="1" fill="#33384a"></rect>
      <circle cx="19" cy="29" r="4.5" fill="#33384a"></circle>
      <circle cx="37" cy="29" r="4.5" fill="#33384a"></circle>
    </svg>
  `;
}

function createPersonSvg() {
  return `
    <svg class="icon-svg icon-person" viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="7" r="4.5" fill="currentColor"></circle>
      <path d="M6.5 24c0-5 3.5-8.5 7.5-8.5s7.5 3.5 7.5 8.5" fill="currentColor"></path>
    </svg>
  `;
}
