const MEMORY_REVEAL_MS = 1000;
const SESSION_INTRO_MS = 3000;
const ANSWER_WINDOW_MS = 3000;
const RESULT_HOLD_MS = 900;

const PEOPLE = ["영수", "철수", "미미"];

const WEEKDAY_OPTIONS = [
  { id: "mon", label: "월" },
  { id: "tue", label: "화" },
  { id: "wed", label: "수" },
  { id: "thu", label: "목" },
  { id: "fri", label: "금" },
  { id: "sat", label: "토" },
  { id: "sun", label: "일" },
];

const PLACE_OPTIONS = [
  { id: "cafe", label: "카페", color: "#ffb08d" },
  { id: "park", label: "공원", color: "#8fd3a1" },
  { id: "cinema", label: "영화관", color: "#98c2ff" },
  { id: "bookstore", label: "서점", color: "#cdb2ff" },
  { id: "bakery", label: "빵집", color: "#ffd38a" },
  { id: "flower", label: "꽃집", color: "#ff9db7" },
  { id: "restaurant", label: "식당", color: "#ffb86f" },
  { id: "market", label: "마트", color: "#99d4c0" },
  { id: "gallery", label: "미술관", color: "#b8b2ff" },
  { id: "arcade", label: "오락실", color: "#ff9a8b" },
  { id: "library", label: "도서관", color: "#9bbef5" },
  { id: "stadium", label: "운동장", color: "#90d39f" },
  { id: "aquarium", label: "수족관", color: "#8ccffd" },
  { id: "stationery", label: "문구점", color: "#c6b4f3" },
  { id: "mall", label: "쇼핑몰", color: "#f7b5cf" },
  { id: "photo", label: "사진관", color: "#ffd1a6" },
];

const MENU_OPTIONS = [
  { id: "chicken", label: "치킨", color: "#ffb43c", image: "./image/menu_chicken.svg" },
  { id: "jeon", label: "전", color: "#ffd84f", image: "./image/menu_jeon.svg" },
  { id: "sushi", label: "초밥", color: "#ff7c6b", image: "./image/menu_sushi.svg" },
  { id: "tangsuyuk", label: "탕수육", color: "#f58c4b", image: "./image/menu_tangsuyuk.svg" },
  { id: "bossam", label: "보쌈", color: "#61c587", image: "./image/menu_bossam.svg" },
  { id: "jokbal", label: "족발", color: "#7f6ce5", image: "./image/menu_jokbal.svg" },
];

const BUS_OPTIONS = [
  { id: "87", label: "87" },
  { id: "530", label: "530" },
  { id: "666", label: "666" },
  { id: "19", label: "19" },
  { id: "12", label: "12" },
  { id: "44", label: "44" },
];

const BUS_COLOR_POOL = ["#59c36a", "#ffb347", "#5e97ff", "#ff7b72", "#8d6df0", "#2fc5b4", "#f6cf57", "#ef7db9"];

const ROUND_DEFINITIONS = [
  {
    id: 1,
    type: "weekday",
    title: "공통 요일 찾기",
    memoryPrompt: "세 사람이 선호하는 요일을 기억하세요.",
    answerPrompt: "세 사람이 공통으로 말한 요일은 무엇인가요?",
  },
  {
    id: 2,
    type: "place",
    title: "장소 약속 잡기",
    memoryPrompt: "세 사람이 선호하는 장소를 기억하세요.",
    answerPrompt: "세 사람이 모두 선호한 장소는 어디인가요?",
  },
  {
    id: 3,
    type: "menu",
    title: "공통 메뉴 찾기",
    memoryPrompt: "세 사람이 고른 메뉴를 기억하세요.",
    answerPrompt: "세 사람이 모두 고른 메뉴는 무엇인가요?",
  },
  {
    id: 4,
    type: "bus",
    title: "빈 버스 찾기",
    memoryPrompt: "세 사람이 탄 버스를 기억하세요.",
    answerPrompt: "아무도 타지 않은 버스는 몇 번인가요?",
  },
];

export function createAppointmentGame(dom) {
  const state = {
    active: false,
    started: false,
    roundIndex: 0,
    phase: "memory",
    personIndex: 0,
    currentRound: null,
    results: [],
    answerRemainingMs: ANSWER_WINDOW_MS,
    memoryTimeoutId: null,
    answerTimerId: null,
    transitionTimeoutId: null,
    answerTimerAnchorMs: null,
    answerTimerBaseMs: ANSWER_WINDOW_MS,
    selectedOptionId: null,
    locked: false,
    introRemainingMs: SESSION_INTRO_MS,
    introTimerId: null,
    introTimerAnchorMs: null,
  };

  attachEvents();

  return {
    activate,
    deactivate,
  };

  function attachEvents() {
    dom.restartButton.addEventListener("click", restartSession);
  }

  function activate() {
    state.active = true;

    if (!state.started) {
      startSession();
      return;
    }

    resumeCurrentPhase();
  }

  function deactivate() {
    state.active = false;
    clearAllTimers();
  }

  function startSession() {
    clearAllTimers();
    state.started = true;
    state.roundIndex = 0;
    state.results = [];
    startIntro();
  }

  function restartSession() {
    startSession();
  }

  function resumeCurrentPhase() {
    render();

    if (state.phase === "intro") {
      startIntro();
      return;
    }

    if (state.phase === "memory") {
      showMemoryPerson(0);
      return;
    }

    if (state.phase === "answer" && !state.locked) {
      startAnswerPhase();
    }
  }

  function startIntro() {
    clearAllTimers();
    state.phase = "intro";
    state.currentRound = null;
    state.personIndex = 0;
    state.answerRemainingMs = ANSWER_WINDOW_MS;
    state.answerTimerBaseMs = ANSWER_WINDOW_MS;
    state.answerTimerAnchorMs = null;
    state.selectedOptionId = null;
    state.locked = true;
    state.introRemainingMs = SESSION_INTRO_MS;
    state.introTimerAnchorMs = Date.now();
    setStatus("곧 게임이 시작됩니다. 집중해 주세요.");
    render();

    if (!state.active) {
      return;
    }

    state.introTimerId = window.setInterval(() => {
      state.introRemainingMs = Math.max(0, SESSION_INTRO_MS - (Date.now() - state.introTimerAnchorMs));
      renderIntroPopup();
    }, 50);

    state.transitionTimeoutId = window.setTimeout(() => {
      startRound();
    }, SESSION_INTRO_MS);
  }

  function startRound() {
    clearAllTimers();
    state.currentRound = buildRound(ROUND_DEFINITIONS[state.roundIndex]);
    state.phase = "memory";
    state.personIndex = 0;
    state.answerRemainingMs = ANSWER_WINDOW_MS;
    state.answerTimerBaseMs = ANSWER_WINDOW_MS;
    state.answerTimerAnchorMs = null;
    state.selectedOptionId = null;
    state.locked = false;
    setStatus(`${PEOPLE[0]}가 말한 선호를 기억하세요.`);
    render();

    if (state.active) {
      showMemoryPerson(0);
    }
  }

  function showMemoryPerson(index) {
    window.clearTimeout(state.memoryTimeoutId);
    state.phase = "memory";
    state.personIndex = index;
    setStatus(`${PEOPLE[index]}가 말한 선호를 기억하세요.`);
    render();

    state.memoryTimeoutId = window.setTimeout(() => {
      if (index < PEOPLE.length - 1) {
        showMemoryPerson(index + 1);
        return;
      }

      startAnswerPhase();
    }, MEMORY_REVEAL_MS);
  }

  function startAnswerPhase() {
    window.clearTimeout(state.memoryTimeoutId);
    window.clearTimeout(state.transitionTimeoutId);
    window.clearInterval(state.answerTimerId);

    state.phase = "answer";
    state.answerRemainingMs = ANSWER_WINDOW_MS;
    state.answerTimerBaseMs = ANSWER_WINDOW_MS;
    state.answerTimerAnchorMs = Date.now();
    state.selectedOptionId = null;
    state.locked = false;

    setStatus("3초 안에 정답을 선택하세요.");
    render();

    state.answerTimerId = window.setInterval(() => {
      state.answerRemainingMs = Math.max(0, state.answerTimerBaseMs - (Date.now() - state.answerTimerAnchorMs));
      renderAnswerTimer();

      if (state.answerRemainingMs === 0) {
        handleSelection(null);
      }
    }, 50);
  }

  function handleSelection(optionId) {
    if (state.phase !== "answer" || state.locked) {
      return;
    }

    window.clearInterval(state.answerTimerId);
    state.answerTimerId = null;
    state.locked = true;
    state.selectedOptionId = optionId;

    const correct = optionId === state.currentRound.answerId;
    state.results[state.roundIndex] = {
      roundId: state.currentRound.id,
      title: state.currentRound.title,
      correct,
      answerLabel: state.currentRound.answerLabel,
      selectedLabel: optionId ? getOptionLabel(state.currentRound.allOptions, optionId) : "시간 초과",
    };

    setStatus(
      optionId === null
        ? `시간 종료. 정답은 ${state.currentRound.answerLabel}입니다.`
        : correct
          ? `정답입니다. ${state.currentRound.answerLabel}을 골랐습니다.`
          : `오답입니다. 정답은 ${state.currentRound.answerLabel}입니다.`,
      correct ? "success" : "warning",
    );

    render();

    state.transitionTimeoutId = window.setTimeout(() => {
      if (state.roundIndex === ROUND_DEFINITIONS.length - 1) {
        showSummary();
        return;
      }

      state.roundIndex += 1;
      startRound();
    }, optionId === null ? RESULT_HOLD_MS + 250 : RESULT_HOLD_MS);
  }

  function showSummary() {
    clearAllTimers();
    state.phase = "summary";
    state.selectedOptionId = null;
    state.locked = true;
    setStatus(`모든 라운드가 끝났습니다. 총 ${getCorrectCount()} / ${ROUND_DEFINITIONS.length} 정답입니다.`);
    render();
  }

  function render() {
    renderHeader();
    renderStage();
    renderOptions();
    renderAnswerTimer();
    renderIntroPopup();
  }

  function renderHeader() {
    const roundDefinition = ROUND_DEFINITIONS[state.roundIndex] ?? ROUND_DEFINITIONS[ROUND_DEFINITIONS.length - 1];
    const roundText =
      state.phase === "summary" ? `${ROUND_DEFINITIONS.length} / ${ROUND_DEFINITIONS.length}` : `${state.roundIndex + 1} / ${ROUND_DEFINITIONS.length}`;

    dom.roundBadge.textContent = state.phase === "summary" ? "완료" : roundText;
    dom.roundText.textContent = roundText;
    dom.hintText.textContent =
      state.phase === "summary"
        ? "4개 라운드의 결과를 확인하고 다시 도전해 보세요."
        : state.phase === "intro"
          ? "곧 1라운드가 시작됩니다. 안내를 보고 집중해 주세요."
          : roundDefinition.memoryPrompt;
    dom.phaseText.textContent = getPhaseLabel();
    dom.modeText.textContent = getModeLabel();
    dom.solvedText.textContent = String(getCorrectCount());
    dom.remainingText.textContent = state.phase === "summary" ? "0" : String(ROUND_DEFINITIONS.length - state.roundIndex);
    dom.promptText.textContent = getPromptText();
    dom.choiceCountText.textContent = getChoiceCountText();
    dom.timerWrap.classList.toggle("hidden", state.phase !== "answer" || state.locked);
    dom.progress.classList.toggle("hidden", state.phase !== "answer" || state.locked);
    dom.restartButton.textContent = state.phase === "summary" ? "한 번 더 하기" : "처음부터 다시";
  }

  function renderStage() {
    if (state.phase === "intro") {
      dom.stage.innerHTML = buildIntroStageMarkup();
      return;
    }

    if (state.phase === "summary") {
      dom.stage.innerHTML = buildSummaryMarkup(state.results);
      return;
    }

    if (state.phase === "answer") {
      dom.stage.innerHTML = buildAnswerStageMarkup(state.currentRound, state.selectedOptionId, state.locked);
      attachStageOptionEvents();
      return;
    }

    dom.stage.innerHTML = buildMemoryStageMarkup(state.currentRound, state.personIndex);
  }

  function renderOptions() {
    dom.options.innerHTML = "";
    dom.options.className = "appointment-options";

    if (state.phase !== "answer" || state.currentRound.type === "place") {
      dom.options.classList.add("hidden");
      return;
    }

    const fragment = document.createDocumentFragment();
    dom.options.classList.add(`option-layout-${state.currentRound.type}`);

    state.currentRound.options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `appointment-option appointment-option-${state.currentRound.type}`;
      button.dataset.optionId = option.id;

      if (option.color) {
        button.style.setProperty("--option-accent", option.color);
      }

      if (state.selectedOptionId === option.id) {
        button.classList.add("is-selected");
      }

      if (state.locked && option.id === state.currentRound.answerId) {
        button.classList.add("is-correct");
      }

      if (state.locked && state.selectedOptionId === option.id && option.id !== state.currentRound.answerId) {
        button.classList.add("is-wrong");
      }

      button.disabled = state.locked;
      button.innerHTML = buildOptionMarkup(state.currentRound.type, option);
      button.addEventListener("click", () => handleSelection(option.id));
      fragment.appendChild(button);
    });

    dom.options.appendChild(fragment);
  }

  function attachStageOptionEvents() {
    dom.stage.querySelectorAll("[data-stage-option-id]").forEach((button) => {
      button.addEventListener("click", () => handleSelection(button.dataset.stageOptionId));
    });
  }

  function renderAnswerTimer() {
    if (state.phase !== "answer" || state.locked) {
      dom.timerText.textContent = formatAnswerCountdown(ANSWER_WINDOW_MS);
      dom.progressBar.style.transform = "scaleX(0)";
      return;
    }

    dom.timerText.textContent = formatAnswerCountdown(state.answerRemainingMs);
    dom.progressBar.style.transform = `scaleX(${1 - state.answerRemainingMs / ANSWER_WINDOW_MS})`;
  }

  function renderIntroPopup() {
    const visible = state.phase === "intro";
    dom.introPopup.classList.toggle("hidden", !visible);

    if (!visible) {
      dom.introCountdown.textContent = "3";
      dom.introProgressBar.style.transform = "scaleX(0)";
      return;
    }

    dom.introCountdown.textContent = String(Math.max(0, Math.ceil(state.introRemainingMs / 1000)));
    dom.introProgressBar.style.transform = `scaleX(${1 - state.introRemainingMs / SESSION_INTRO_MS})`;
  }

  function clearAllTimers() {
    window.clearTimeout(state.memoryTimeoutId);
    window.clearInterval(state.answerTimerId);
    window.clearTimeout(state.transitionTimeoutId);
    window.clearInterval(state.introTimerId);
    state.memoryTimeoutId = null;
    state.answerTimerId = null;
    state.transitionTimeoutId = null;
    state.introTimerId = null;
  }

  function getCorrectCount() {
    return state.results.filter((result) => result?.correct).length;
  }

  function getPhaseLabel() {
    if (state.phase === "intro") {
      return "시작 안내";
    }

    if (state.phase === "memory") {
      return `${PEOPLE[state.personIndex]} 기억`;
    }

    if (state.phase === "answer") {
      return "선택 단계";
    }

    return "최종 요약";
  }

  function getModeLabel() {
    if (state.phase === "intro") {
      return "준비";
    }

    if (state.phase === "memory") {
      return "기억";
    }

    if (state.phase === "answer") {
      return "선택";
    }

    return "요약";
  }

  function getPromptText() {
    if (state.phase === "intro") {
      return "곧 게임이 시작됩니다. 3초 뒤에 1라운드가 진행됩니다.";
    }

    if (state.phase === "memory") {
      return state.currentRound.memoryPrompt;
    }

    if (state.phase === "answer") {
      return state.currentRound.answerPrompt;
    }

    return "4개 라운드의 총 결과를 확인하세요.";
  }

  function getChoiceCountText() {
    if (state.phase === "intro") {
      return `시작까지 ${Math.max(0, Math.ceil(state.introRemainingMs / 1000))}초`;
    }

    if (state.phase === "memory") {
      return `제시 ${state.personIndex + 1} / ${PEOPLE.length}`;
    }

    if (state.phase === "answer") {
      return `선택지 ${state.currentRound.options.length}개`;
    }

    return `정답 ${getCorrectCount()}개`;
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

function buildRound(definition) {
  if (definition.type === "weekday") {
    return buildPreferenceRound(definition, WEEKDAY_OPTIONS, "weekday");
  }

  if (definition.type === "place") {
    return buildPreferenceRound(definition, PLACE_OPTIONS, "place");
  }

  if (definition.type === "menu") {
    return buildMenuRound(definition);
  }

  return buildBusRound(definition);
}

function buildPreferenceRound(definition, pool, type) {
  const answer = pickRandom(pool);
  const remaining = shuffleArray(pool.filter((item) => item.id !== answer.id));
  const peopleSelections = [
    shuffleArray([answer, remaining[0], remaining[1]]),
    shuffleArray([answer, remaining[2], remaining[3]]),
    shuffleArray([answer, remaining[4], remaining[5]]),
  ];

  return {
    ...definition,
    peopleSelections,
    answerId: answer.id,
    answerLabel: answer.label,
    allOptions: pool,
    options:
      type === "place"
        ? shuffleArray([answer, ...shuffleArray(getUniqueItemsById(peopleSelections.flat().filter((item) => item.id !== answer.id))).slice(0, 2)])
        : pool.slice(),
  };
}

function buildMenuRound(definition) {
  const answer = pickRandom(MENU_OPTIONS);
  const remaining = shuffleArray(MENU_OPTIONS.filter((item) => item.id !== answer.id));
  const sharedExtra = remaining[0];
  const peopleSelections = [
    shuffleArray([answer, sharedExtra, remaining[1]]),
    shuffleArray([answer, sharedExtra, remaining[2]]),
    shuffleArray([answer, remaining[3], remaining[4]]),
  ];

  return {
    ...definition,
    peopleSelections,
    answerId: answer.id,
    answerLabel: answer.label,
    allOptions: MENU_OPTIONS,
    options: MENU_OPTIONS.slice(),
  };
}

function buildBusRound(definition) {
  const busColors = shuffleArray(BUS_COLOR_POOL).slice(0, BUS_OPTIONS.length);
  const coloredOptions = BUS_OPTIONS.map((option, index) => ({
    ...option,
    color: busColors[index],
  }));
  const shuffled = shuffleArray(coloredOptions);
  const answer = shuffled[0];
  const ridden = shuffled.slice(1);
  const counts = shuffleArray([2, 2, 1]);
  const peopleSelections = [];
  let cursor = 0;

  counts.forEach((count) => {
    peopleSelections.push(ridden.slice(cursor, cursor + count));
    cursor += count;
  });

  return {
    ...definition,
    peopleSelections,
    answerId: answer.id,
    answerLabel: answer.label,
    allOptions: coloredOptions,
    options: shuffleArray(coloredOptions.slice()),
  };
}

function buildIntroStageMarkup() {
  return `
    <div class="appointment-answer-stage appointment-answer-stage-intro">
      <p class="appointment-question">곧 게임이 시작됩니다</p>
      <p class="appointment-answer-help">안내 팝업이 끝나면 바로 1라운드가 진행됩니다.</p>
    </div>
  `;
}

function buildMemoryStageMarkup(round, personIndex) {
  const person = PEOPLE[personIndex];
  const items = round.peopleSelections[personIndex];

  if (round.type === "weekday") {
    return `
      <div class="appointment-memory-stage">
        <p class="appointment-person-name">${person}</p>
        <div class="appointment-weekday-memory-grid">
          ${items.map((item) => `<div class="appointment-memory-card appointment-weekday-card">${item.label}</div>`).join("")}
        </div>
      </div>
    `;
  }

  if (round.type === "place") {
    return `
      <div class="appointment-memory-stage">
        <p class="appointment-person-name">${person}</p>
        ${buildPlaceBoardMarkup({ activeIds: items.map((item) => item.id) })}
      </div>
    `;
  }

  if (round.type === "menu") {
    return `
      <div class="appointment-memory-stage">
        <p class="appointment-person-name">${person}</p>
        <div class="appointment-menu-tray">
          ${items.map((item) => {
            return `
              <div class="appointment-menu-choice">
                <div class="appointment-menu-plate" style="--option-accent: ${item.color};">
                  ${buildMenuImageMarkup(item, "appointment-menu-image")}
                </div>
                <span class="appointment-menu-plate-label">${item.label}</span>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  return `
    <div class="appointment-memory-stage">
      <p class="appointment-person-name">${person}</p>
        <div class="appointment-bus-scene">
          <div class="appointment-bus-skyline"></div>
          <div class="appointment-bus-row bus-count-${items.length}">
          ${items.map((item) => {
            return `
              <div class="appointment-bus-unit">
                <span class="appointment-bus-bubble" style="--bus-color: ${item.color};">${item.label}</span>
                <div class="appointment-bus-body" style="--bus-color: ${item.color};">
                  <span class="appointment-bus-window"></span>
                  <span class="appointment-bus-window"></span>
                  <span class="appointment-bus-window"></span>
                </div>
              </div>
            `;
          }).join("")}
        </div>
        <div class="appointment-bus-stop"></div>
        <div class="appointment-bus-store"></div>
        <div class="appointment-bus-road"></div>
      </div>
    </div>
  `;
}

function buildAnswerStageMarkup(round, selectedOptionId, locked) {
  if (round.type === "place") {
    return `
      <div class="appointment-answer-stage appointment-answer-stage-place">
        <p class="appointment-question">${round.answerPrompt}</p>
        <p class="appointment-answer-help">지도에서 강조된 3곳 중 하나를 눌러 주세요.</p>
        ${buildPlaceBoardMarkup({
          choiceIds: round.options.map((option) => option.id),
          selectedId: selectedOptionId,
          answerId: round.answerId,
          locked,
          interactive: true,
        })}
      </div>
    `;
  }

  return `
    <div class="appointment-answer-stage">
      <p class="appointment-question">${round.answerPrompt}</p>
      <p class="appointment-answer-help">3초 안에 선택해 주세요.</p>
    </div>
  `;
}

function buildSummaryMarkup(results) {
  const correctCount = results.filter((result) => result?.correct).length;
  const percent = Math.round((correctCount / ROUND_DEFINITIONS.length) * 100);

  return `
    <div class="appointment-summary">
      <div class="appointment-summary-card">
        <p class="appointment-summary-kicker">최종 정리</p>
        <strong class="appointment-summary-total">${correctCount} / ${ROUND_DEFINITIONS.length}</strong>
        <p class="appointment-summary-rate">정답률 ${percent}%</p>
        <p class="appointment-summary-copy">4개 라운드 결과를 한 번에 정리했습니다.</p>
      </div>
      <div class="appointment-summary-list">
        ${results
          .map((result) => {
            return `
              <div class="appointment-summary-row ${result.correct ? "is-success" : "is-fail"}">
                <div>
                  <strong>${result.title}</strong>
                  <p>정답: ${result.answerLabel}</p>
                </div>
                <div class="appointment-summary-meta">
                  <span class="appointment-summary-badge">${result.correct ? "정답" : "오답"}</span>
                  <p>선택: ${result.selectedLabel}</p>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function buildOptionMarkup(type, option) {
  if (type === "place") {
    return `
      <span class="appointment-option-accent"></span>
      <strong>${option.label}</strong>
    `;
  }

  if (type === "menu") {
    return `
      <span class="appointment-option-media appointment-option-media-menu">
        ${buildMenuImageMarkup(option, "appointment-option-image")}
      </span>
      <strong>${option.label}</strong>
    `;
  }

  if (type === "bus") {
    return `
      <span class="appointment-option-accent"></span>
      <span class="appointment-option-sub">버스</span>
      <strong>${option.label}</strong>
    `;
  }

  return `<strong>${option.label}</strong>`;
}

function getOptionLabel(options, optionId) {
  return options.find((option) => option.id === optionId)?.label ?? "";
}

function formatAnswerCountdown(ms) {
  return (Math.max(0, ms) / 1000).toFixed(1);
}

function buildPlaceBoardMarkup({ activeIds = [], choiceIds = [], selectedId = null, answerId = null, locked = false, interactive = false }) {
  return `
    <div class="appointment-place-board ${interactive ? "appointment-place-board-answer" : ""}">
      <span class="appointment-place-road appointment-place-road-vertical" aria-hidden="true"></span>
      <span class="appointment-place-road appointment-place-road-horizontal" aria-hidden="true"></span>
      ${PLACE_OPTIONS.map((option) => {
        const position = getPlaceBoardPosition(option.id);
        const isPicked = activeIds.includes(option.id);
        const isChoice = choiceIds.includes(option.id);
        const isSelected = selectedId === option.id;
        const isCorrect = locked && answerId === option.id;
        const isWrong = locked && isSelected && option.id !== answerId;
        const classes = [
          "appointment-place-tile",
          isPicked ? "is-picked" : "",
          interactive ? "is-answer-tile" : "",
          isChoice ? "is-choice" : "",
          interactive && !isChoice ? "is-muted" : "",
          isSelected ? "is-selected" : "",
          isCorrect ? "is-correct" : "",
          isWrong ? "is-wrong" : "",
        ]
          .filter(Boolean)
          .join(" ");
        const badge = isChoice ? `<span class="appointment-place-choice-badge">${getPlaceChoiceIndex(choiceIds, option.id) + 1}</span>` : "";
        const content = `
          <span class="appointment-place-mini" aria-hidden="true">
            <span class="appointment-place-tree"></span>
            <span class="appointment-place-building"></span>
          </span>
          ${badge}
          <span class="appointment-place-tag">${option.label}</span>
        `;

        if (interactive && isChoice) {
          return `
            <button
              type="button"
              class="${classes}"
              data-stage-option-id="${option.id}"
              ${locked ? "disabled" : ""}
              style="--option-accent: ${option.color}; grid-column: ${position.column}; grid-row: ${position.row};"
            >
              ${content}
            </button>
          `;
        }

        return `
          <div
            class="${classes}"
            style="--option-accent: ${option.color}; grid-column: ${position.column}; grid-row: ${position.row};"
          >
            ${content}
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function buildMenuImageMarkup(item, className) {
  return `<img class="${className}" src="${item.image}" alt="${item.label}" loading="lazy" decoding="async" />`;
}

function getPlaceBoardPosition(optionId) {
  const index = PLACE_OPTIONS.findIndex((option) => option.id === optionId);
  const rawColumn = (index % 4) + 1;
  const rawRow = Math.floor(index / 4) + 1;

  return {
    column: rawColumn <= 2 ? rawColumn : rawColumn + 1,
    row: rawRow <= 2 ? rawRow : rawRow + 1,
  };
}

function getUniqueItemsById(items) {
  return items.filter((item, index) => items.findIndex((candidate) => candidate.id === item.id) === index);
}

function getPlaceChoiceIndex(choiceIds, optionId) {
  return choiceIds.findIndex((choiceId) => choiceId === optionId);
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffleArray(list) {
  const copy = [...list];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}
