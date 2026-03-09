const BEST_STORAGE_KEY = "mirror-route-session-best-v1";
const BOARD_SIZE = 5;
const MAX_ANALYSIS_MIRRORS = 6;
const BOARD_CELLS = [];

for (let row = 0; row < BOARD_SIZE; row += 1) {
  for (let col = 0; col < BOARD_SIZE; col += 1) {
    BOARD_CELLS.push([row, col]);
  }
}

const COLOR_META = {
  yellow: {
    code: "노",
    swatchClass: "color-yellow",
    vehicleName: "노란 택시",
    passengerName: "노란 손님",
  },
  blue: {
    code: "파",
    swatchClass: "color-blue",
    vehicleName: "파란 버스",
    passengerName: "파란 손님",
  },
  red: {
    code: "빨",
    swatchClass: "color-red",
    vehicleName: "빨간 스포츠카",
    passengerName: "빨간 손님",
  },
};

const PUZZLE_POOL = [
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

const dom = {
  problemIndex: document.querySelector("#problemIndex"),
  problemHint: document.querySelector("#problemHint"),
  timerText: document.querySelector("#timerText"),
  clickText: document.querySelector("#clickText"),
  requiredText: document.querySelector("#requiredText"),
  placedText: document.querySelector("#placedText"),
  bestText: document.querySelector("#bestText"),
  assignmentList: document.querySelector("#assignmentList"),
  board: document.querySelector("#board"),
  statusText: document.querySelector("#statusText"),
  checkButton: document.querySelector("#checkButton"),
  resetButton: document.querySelector("#resetButton"),
  clearButton: document.querySelector("#clearButton"),
  nextButton: document.querySelector("#nextButton"),
};

const state = {
  currentPuzzle: null,
  currentRequiredMirrors: 0,
  puzzleBag: [],
  roundNumber: 1,
  mirrors: new Map(),
  clickCount: 0,
  solved: false,
  elapsedMs: 0,
  startedAt: null,
  timerId: null,
  bestTime: loadBestTime(),
};

const puzzleMinimumCache = new Map();

function loadBestTime() {
  try {
    const raw = window.localStorage.getItem(BEST_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return typeof parsed === "number" ? parsed : parsed?.sessionBest ?? null;
  } catch {
    return null;
  }
}

function saveBestTime() {
  try {
    window.localStorage.setItem(BEST_STORAGE_KEY, JSON.stringify(state.bestTime));
  } catch {
    // Ignore storage failures.
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

function nextPuzzleId() {
  if (state.puzzleBag.length === 0) {
    state.puzzleBag = shuffle(PUZZLE_POOL.map((puzzle) => puzzle.id));
  }

  const nextId = state.puzzleBag.shift();
  if (state.currentPuzzle && nextId === state.currentPuzzle.id && state.puzzleBag.length > 0) {
    const fallback = state.puzzleBag.shift();
    state.puzzleBag.push(nextId);
    return fallback;
  }
  return nextId;
}

function startPuzzle(advanceRound) {
  const puzzleId = nextPuzzleId();
  state.currentPuzzle = PUZZLE_POOL.find((puzzle) => puzzle.id === puzzleId);
  state.currentRequiredMirrors = getVerifiedRequiredMirrors(state.currentPuzzle);
  state.mirrors = new Map();
  state.clickCount = 0;
  state.solved = false;
  resetTimer();
  if (advanceRound) {
    state.roundNumber += 1;
  }
  renderAll();
  setStatus("칸 안에서 대각선 가까이를 눌러 울타리를 설치하세요.");
}

function currentPuzzle() {
  return state.currentPuzzle;
}

function cellKey(row, col) {
  return `${row},${col}`;
}

function placedMirrorCount() {
  return state.mirrors.size;
}

function remainingClicks() {
  return Math.max(0, currentPuzzle().maxClicks - state.clickCount);
}

function formatTime(ms) {
  if (ms === null || ms === undefined) {
    return "--:--";
  }
  const seconds = Math.floor(ms / 1000);
  const minutesText = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secondsText = String(seconds % 60).padStart(2, "0");
  return `${minutesText}:${secondsText}`;
}

function formatEdge(edge) {
  const sideText = {
    left: "왼쪽",
    right: "오른쪽",
    top: "위쪽",
    bottom: "아래쪽",
  }[edge.side];
  return `${sideText} ${edge.index + 1}`;
}

function sameEdge(a, b) {
  return a.side === b.side && a.index === b.index;
}

function getPassengerByColor(puzzle, color) {
  return puzzle.passengers.find((passenger) => passenger.color === color);
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

function ensureTimer() {
  if (state.timerId || state.solved) {
    return;
  }
  state.startedAt = Date.now() - state.elapsedMs;
  state.timerId = window.setInterval(() => {
    state.elapsedMs = Date.now() - state.startedAt;
    dom.timerText.textContent = formatTime(state.elapsedMs);
  }, 250);
}

function stopTimer() {
  if (state.startedAt) {
    state.elapsedMs = Date.now() - state.startedAt;
  }
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
}

function resetTimer() {
  stopTimer();
  state.elapsedMs = 0;
  state.startedAt = null;
  dom.timerText.textContent = formatTime(0);
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

function reflect(dir, mirror) {
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

function simulateVehicle(vehicle, mirrors = state.mirrors) {
  const seen = new Set();
  let { row, col, dir } = getStartState(vehicle.entry);

  for (let step = 0; step < 80; step += 1) {
    const next = moveStep(row, col, dir);
    if (next.row < 0 || next.row >= BOARD_SIZE || next.col < 0 || next.col >= BOARD_SIZE) {
      return { exit: getExitEdge(row, col, dir), loop: false };
    }

    row = next.row;
    col = next.col;

    const loopKey = `${row},${col},${dir}`;
    if (seen.has(loopKey)) {
      return { exit: null, loop: true };
    }
    seen.add(loopKey);

    const mirror = mirrors.get(cellKey(row, col));
    if (mirror) {
      dir = reflect(dir, mirror);
    }
  }

  return { exit: null, loop: true };
}

function allRoutesMatched(puzzle = currentPuzzle(), mirrors = state.mirrors) {
  return puzzle.vehicles.every((vehicle) => {
    const result = simulateVehicle(vehicle, mirrors);
    if (result.loop || !result.exit) {
      return false;
    }
    const passenger = getPassengerByColor(puzzle, vehicle.color);
    return sameEdge(result.exit, passenger.exit);
  });
}

function* walkCellCombinations(targetCount, startIndex = 0, chosen = []) {
  if (chosen.length === targetCount) {
    yield chosen.slice();
    return;
  }

  const remaining = targetCount - chosen.length;
  for (let index = startIndex; index <= BOARD_CELLS.length - remaining; index += 1) {
    chosen.push(BOARD_CELLS[index]);
    yield* walkCellCombinations(targetCount, index + 1, chosen);
    chosen.pop();
  }
}

function hasMatchingAssignment(puzzle, cells, cellIndex, mirrors) {
  if (cellIndex === cells.length) {
    return allRoutesMatched(puzzle, mirrors);
  }

  const [row, col] = cells[cellIndex];
  const key = cellKey(row, col);

  mirrors.set(key, "/");
  if (hasMatchingAssignment(puzzle, cells, cellIndex + 1, mirrors)) {
    mirrors.delete(key);
    return true;
  }

  mirrors.set(key, "\\");
  if (hasMatchingAssignment(puzzle, cells, cellIndex + 1, mirrors)) {
    mirrors.delete(key);
    return true;
  }

  mirrors.delete(key);
  return false;
}

function hasSolutionAtMirrorCount(puzzle, mirrorCount) {
  for (const cells of walkCellCombinations(mirrorCount)) {
    if (hasMatchingAssignment(puzzle, cells, 0, new Map())) {
      return true;
    }
  }
  return false;
}

function getVerifiedRequiredMirrors(puzzle) {
  if (!puzzle) {
    return 0;
  }

  if (puzzleMinimumCache.has(puzzle.id)) {
    return puzzleMinimumCache.get(puzzle.id);
  }

  const searchLimit = Math.min(MAX_ANALYSIS_MIRRORS, puzzle.maxClicks);
  let detectedMinimum = null;

  for (let mirrorCount = 0; mirrorCount <= searchLimit; mirrorCount += 1) {
    if (hasSolutionAtMirrorCount(puzzle, mirrorCount)) {
      detectedMinimum = mirrorCount;
      break;
    }
  }

  const resolvedMinimum = detectedMinimum ?? puzzle.requiredMirrors;
  if (detectedMinimum !== null && detectedMinimum !== puzzle.requiredMirrors) {
    console.warn(
      `[길 만들기] 퍼즐 ${puzzle.id}의 정의값은 ${puzzle.requiredMirrors}개지만 실제 최소는 ${detectedMinimum}개입니다.`,
    );
  }

  puzzleMinimumCache.set(puzzle.id, resolvedMinimum);
  return resolvedMinimum;
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

function renderAssignments() {
  const puzzle = currentPuzzle();
  dom.assignmentList.innerHTML = "";

  puzzle.vehicles.forEach((vehicle) => {
    const meta = COLOR_META[vehicle.color];
    const passenger = getPassengerByColor(puzzle, vehicle.color);
    const item = document.createElement("div");
    item.className = "assignment-item";
    item.innerHTML = `
      <div class="assignment-side ${meta.swatchClass}">
        ${createVehicleSvg(vehicle.color)}
        <div class="assignment-copy">
          <strong>${meta.vehicleName}</strong>
          <span>${formatEdge(vehicle.entry)}</span>
        </div>
      </div>
      <span class="assignment-arrow">→</span>
      <div class="assignment-side ${meta.swatchClass}">
        ${createPersonSvg()}
        <div class="assignment-copy">
          <strong>${meta.passengerName}</strong>
          <span>${formatEdge(passenger.exit)}</span>
        </div>
      </div>
    `;
    dom.assignmentList.appendChild(item);
  });
}

function renderBoard() {
  const puzzle = currentPuzzle();
  const edgeItems = new Map();

  puzzle.vehicles.forEach((vehicle) => {
    edgeItems.set(`${vehicle.entry.side}:${vehicle.entry.index}`, {
      color: vehicle.color,
      role: "출발",
      icon: createVehicleSvg(vehicle.color),
      code: COLOR_META[vehicle.color].code,
    });
  });

  puzzle.passengers.forEach((passenger) => {
    edgeItems.set(`${passenger.exit.side}:${passenger.exit.index}`, {
      color: passenger.color,
      role: "손님",
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
        const empty = document.createElement("div");
        empty.className = "slot-empty";
        slot.appendChild(empty);
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
          const empty = document.createElement("div");
          empty.className = "slot-empty";
          slot.appendChild(empty);
        } else {
          const token = document.createElement("div");
          token.className = `edge-token ${COLOR_META[tokenData.color].swatchClass}`;
          token.innerHTML = `
            ${tokenData.icon}
            <span class="token-code">${tokenData.code}</span>
            <span class="token-role">${tokenData.role}</span>
          `;
          slot.appendChild(token);
        }

        dom.board.appendChild(slot);
        continue;
      }

      const boardRow = row - 1;
      const boardCol = col - 1;
      const key = cellKey(boardRow, boardCol);
      const mirror = state.mirrors.get(key);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "board-cell";
      if (remainingClicks() === 0 && !state.solved) {
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

function renderStats() {
  dom.problemIndex.textContent = String(state.roundNumber);
  dom.problemHint.textContent = `현재 문제는 최소 울타리 ${state.currentRequiredMirrors}개입니다. 칸 안에서 원하는 대각선 쪽을 눌러 바로 배치하세요.`;
  dom.clickText.textContent = String(remainingClicks());
  dom.requiredText.textContent = String(state.currentRequiredMirrors);
  dom.placedText.textContent = String(placedMirrorCount());
  dom.bestText.textContent = formatTime(state.bestTime);
  dom.timerText.textContent = formatTime(state.elapsedMs);
  dom.checkButton.disabled = state.solved;
}

function renderAll() {
  renderAssignments();
  renderBoard();
  renderStats();
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

function applyMirrorAtCell(key, nextMirror) {
  const currentMirror = state.mirrors.get(key) || null;
  const finalMirror = currentMirror === nextMirror ? null : nextMirror;

  if (currentMirror === finalMirror) {
    return;
  }

  if (remainingClicks() <= 0) {
    setStatus("클릭 가능 횟수를 모두 사용했습니다. 제출하거나 새 문제로 넘어가세요.", "warning");
    return;
  }

  if (!state.timerId) {
    ensureTimer();
  }

  if (finalMirror) {
    state.mirrors.set(key, finalMirror);
  } else {
    state.mirrors.delete(key);
  }

  state.clickCount += 1;
  state.solved = false;
  renderAll();

  if (remainingClicks() === 0) {
    setStatus("클릭 가능 횟수를 모두 사용했습니다. 이제 제출해서 확인하세요.");
  } else {
    setStatus("울타리를 배치했습니다. 계속 수정하거나 제출할 수 있습니다.");
  }
}

function handleBoardPointerDown(event) {
  const button = event.target.closest("[data-cell-key]");
  if (!button) {
    return;
  }

  if (state.solved) {
    setStatus("이미 정답 처리된 문제입니다. 랜덤 다음 문제를 눌러 계속 진행하세요.", "success");
    return;
  }

  const key = button.dataset.cellKey;
  const pickedMirror = pickMirrorFromPoint(button, event);
  applyMirrorAtCell(key, pickedMirror);
}

function checkSolution() {
  const requiredMirrors = state.currentRequiredMirrors;
  const placed = placedMirrorCount();

  if (placed === 0) {
    setStatus("아직 배치된 울타리가 없습니다.", "warning");
    return;
  }

  if (!allRoutesMatched()) {
    setStatus("아직 정답이 아닙니다. 차량과 손님 연결을 다시 확인하세요.", "warning");
    return;
  }

  if (placed < requiredMirrors) {
    setStatus(`정답 경로는 맞지만 최소 울타리 수 ${requiredMirrors}개보다 적습니다.`, "warning");
    return;
  }

  if (placed > requiredMirrors) {
    setStatus(
      `연결은 맞지만 이 문제는 ${requiredMirrors}개로도 풀립니다. 지금 배치에서 하나만 빼서는 안 풀릴 수 있고, 다른 칸 조합으로 줄여야 합니다.`,
      "warning",
    );
    return;
  }

  state.solved = true;
  stopTimer();
  if (!state.bestTime || state.elapsedMs < state.bestTime) {
    state.bestTime = state.elapsedMs;
    saveBestTime();
  }
  renderStats();
  setStatus("정답입니다. 랜덤 다음 문제로 계속 진행할 수 있습니다.", "success");
}

function attachEvents() {
  dom.board.addEventListener("pointerdown", handleBoardPointerDown);
  dom.checkButton.addEventListener("click", checkSolution);
  dom.resetButton.addEventListener("click", () => {
    state.mirrors = new Map();
    state.clickCount = 0;
    state.solved = false;
    resetTimer();
    renderAll();
    setStatus("현재 문제를 처음부터 다시 시작합니다.");
  });
  dom.clearButton.addEventListener("click", () => {
    state.mirrors = new Map();
    state.clickCount = 0;
    state.solved = false;
    resetTimer();
    renderAll();
    setStatus("울타리를 모두 지웠습니다.");
  });
  dom.nextButton.addEventListener("click", () => {
    startPuzzle(true);
  });
}

function init() {
  attachEvents();
  startPuzzle(false);
}

init();
