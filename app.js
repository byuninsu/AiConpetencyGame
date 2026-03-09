import { createRouteGame } from "./js/route-game.js";
import { createRotationGame } from "./js/rotation-game.js";

const dom = {
  siteTitle: document.querySelector("#siteTitle"),
  siteSubtitle: document.querySelector("#siteSubtitle"),
  menuButton: document.querySelector("#menuButton"),
  openGameButtons: Array.from(document.querySelectorAll("[data-open-game]")),
  screens: {
    menu: document.querySelector("#menuScreen"),
    route: document.querySelector("#routeScreen"),
    rotation: document.querySelector("#rotationScreen"),
  },
};

const appState = {
  screen: "menu",
};

const routeGame = createRouteGame({
  problemIndex: document.querySelector("#routeProblemIndex"),
  problemHint: document.querySelector("#routeProblemHint"),
  timerText: document.querySelector("#routeTimerText"),
  clickText: document.querySelector("#routeClickText"),
  requiredText: document.querySelector("#routeRequiredText"),
  placedText: document.querySelector("#routePlacedText"),
  bestText: document.querySelector("#routeBestText"),
  board: document.querySelector("#routeBoard"),
  pathOverlay: document.querySelector("#routePathOverlay"),
  pathToggle: document.querySelector("#routePathToggle"),
  statusText: document.querySelector("#routeStatusText"),
  checkButton: document.querySelector("#routeCheckButton"),
  resetButton: document.querySelector("#routeResetButton"),
  clearButton: document.querySelector("#routeClearButton"),
  nextButton: document.querySelector("#routeNextButton"),
});

const rotationGame = createRotationGame({
  roundBadge: document.querySelector("#rotationRoundBadge"),
  roundText: document.querySelector("#rotationRoundText"),
  questionText: document.querySelector("#rotationQuestionText"),
  timerText: document.querySelector("#rotationTimerText"),
  solvedText: document.querySelector("#rotationSolvedText"),
  clickText: document.querySelector("#rotationClickText"),
  stepCount: document.querySelector("#rotationStepCount"),
  movementToggle: document.querySelector("#rotationMovementToggle"),
  currentCard: document.querySelector("#rotationCurrentCard"),
  beforeStage: document.querySelector("#rotationBeforeStage"),
  afterStage: document.querySelector("#rotationAfterStage"),
  currentStage: document.querySelector("#rotationCurrentStage"),
  preview: document.querySelector("#rotationPreview"),
  popup: document.querySelector("#rotationRoundPopup"),
  popupCard: document.querySelector("#rotationRoundPopupCard"),
  popupTitle: document.querySelector("#rotationRoundPopupTitle"),
  popupStatus: document.querySelector("#rotationRoundPopupStatus"),
  popupMessage: document.querySelector("#rotationRoundPopupMessage"),
  popupScoreLabel: document.querySelector("#rotationRoundPopupScoreLabel"),
  popupScore: document.querySelector("#rotationRoundPopupScore"),
  popupDetails: document.querySelector("#rotationRoundPopupDetails"),
  popupFootnote: document.querySelector("#rotationRoundPopupFootnote"),
  popupProgress: document.querySelector("#rotationRoundPopupProgress"),
  popupProgressBar: document.querySelector("#rotationRoundPopupProgressBar"),
  popupAction: document.querySelector("#rotationRoundPopupAction"),
  statusText: document.querySelector("#rotationStatusText"),
  submitButton: document.querySelector("#rotationSubmitButton"),
  undoButton: document.querySelector("#rotationUndoButton"),
  clearButton: document.querySelector("#rotationClearButton"),
  nextButton: document.querySelector("#rotationNextButton"),
  operationButtons: Array.from(document.querySelectorAll("[data-rotation-op]")),
});

init();

function init() {
  document.body.dataset.screen = "menu";
  attachEvents();
  renderMenuHeader();
  showScreen("menu");
}

function attachEvents() {
  dom.openGameButtons.forEach((button) => {
    button.addEventListener("click", () => {
      showScreen(button.dataset.openGame);
    });
  });

  dom.menuButton.addEventListener("click", () => {
    showScreen("menu");
  });
}

function showScreen(screen) {
  if (appState.screen === screen) {
    return;
  }

  deactivateCurrentScreen();
  appState.screen = screen;
  document.body.dataset.screen = screen;

  Object.entries(dom.screens).forEach(([key, element]) => {
    element.classList.toggle("hidden", key !== screen);
  });

  dom.menuButton.classList.toggle("hidden", screen === "menu");

  if (screen === "menu") {
    renderMenuHeader();
    return;
  }

  if (screen === "route") {
    renderRouteHeader();
    routeGame.activate();
    return;
  }

  renderRotationHeader();
  rotationGame.activate();
}

function deactivateCurrentScreen() {
  if (appState.screen === "route") {
    routeGame.deactivate();
  }

  if (appState.screen === "rotation") {
    rotationGame.deactivate();
  }
}

function renderMenuHeader() {
  dom.siteTitle.textContent = "게임 선택";
  dom.siteSubtitle.textContent = "원하는 게임을 골라 바로 시작하세요.";
}

function renderRouteHeader() {
  dom.siteTitle.textContent = "길 만들기";
  dom.siteSubtitle.textContent = "거울을 배치해서 차량을 같은 색 손님에게 연결하세요.";
}

function renderRotationHeader() {
  dom.siteTitle.textContent = "도형 회전하기";
  dom.siteSubtitle.textContent = "1분 안에 최대한 많은 문제를 맞히는 라운드형 회전 퍼즐입니다.";
}
