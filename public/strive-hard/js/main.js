/**
 * Strive Hard — main bootstrap
 */
import {
  createNewState,
  loadState,
  saveState,
  hasSave,
} from "./state.js";
import {
  applyChoice,
  travelTo,
  postSelfie,
  sendTextReply,
  markThreadRead,
} from "./game.js";
import {
  showScreen,
  showToast,
  renderCharacterSelect,
  updateStats,
  renderScene,
  openPhoneApp,
  renderPhoneHome,
  renderXApp,
  renderMap,
  renderTextThreads,
  renderTextChat,
  renderSelfiePresets,
  updatePhoneClock,
} from "./ui.js";

let state = null;
let selectedCharacterId = null;

function refresh() {
  if (!state) return;
  updateStats(state);
  renderScene(state, handleChoice);
  renderPhoneHome(state);
  const active = document.querySelector(".phone-screen.active");
  if (active?.id === "phone-x") renderXApp(state);
  if (active?.id === "phone-map") renderMap(state, handleTravel);
  if (active?.id === "phone-texts") {
    const chatHidden = document.getElementById("text-chat").hidden;
    if (chatHidden) renderTextThreads(state, handleOpenThread);
  }
  updatePhoneClock();
}

function handleChoice(choice) {
  const result = applyChoice(state, choice);
  if (result.error) {
    showToast(result.error, "bad");
    return;
  }
  state = result.state;
  if (result.toast) showToast(result.toast, "good");
  const toast = document.getElementById("save-toast");
  if (toast) {
    toast.hidden = false;
    setTimeout(() => {
      toast.hidden = true;
    }, 1200);
  }
  refresh();

  // "Open the Map / go somewhere" choices use next: null — pop open Map on the iHype
  const app = choice.openApp || (choice.next === null ? "map" : null);
  if (app) {
    openPhoneApp(app);
    if (app === "map") renderMap(state, handleTravel);
    if (app === "x") renderXApp(state);
    if (app === "texts") renderTextThreads(state, handleOpenThread);
  }
}

function handleTravel(locationId) {
  if (state.locationId === locationId) {
    showToast("You're already here.", "");
    openPhoneApp("home");
    return;
  }
  const result = travelTo(state, locationId);
  if (result.error) {
    showToast(result.error, "bad");
    return;
  }
  state = result.state;
  showToast(result.toast, "good");
  openPhoneApp("home");
  refresh();
}

function handleOpenThread(npcId) {
  state = markThreadRead(state, npcId);
  renderPhoneHome(state);
  renderTextChat(state, npcId, handleTextReply);
}

function handleTextReply(npcId, option) {
  const result = sendTextReply(state, npcId, option);
  if (result.error) {
    showToast(result.error, "bad");
    return;
  }
  state = result.state;
  if (result.toast) showToast(result.toast, "good");
  renderTextChat(state, npcId, handleTextReply);
  renderPhoneHome(state);
  updateStats(state);
}

function startGame(characterId) {
  state = createNewState(characterId);
  saveState(state);
  showScreen("screen-game");
  openPhoneApp("home");
  refresh();
  showToast(`Welcome, ${state.character.name}. Try not to die in the group chat.`, "good");
}

function continueGame() {
  const loaded = loadState();
  if (!loaded) {
    showToast("No save found.", "bad");
    return;
  }
  state = loaded;
  showScreen("screen-game");
  openPhoneApp("home");
  refresh();
  showToast("Save loaded. The grind resumes.", "good");
}

function refreshCharGrid() {
  renderCharacterSelect(selectedCharacterId, (id) => {
    selectedCharacterId = id;
    document.getElementById("btn-char-start").disabled = false;
    refreshCharGrid();
  });
}

function bindTitle() {
  document.getElementById("btn-new-game").addEventListener("click", () => {
    selectedCharacterId = null;
    document.getElementById("btn-char-start").disabled = true;
    refreshCharGrid();
    showScreen("screen-character");
  });

  const cont = document.getElementById("btn-continue");
  if (hasSave()) {
    cont.hidden = false;
  }
  cont.addEventListener("click", continueGame);
}

function bindCharacter() {
  document.getElementById("btn-char-back").addEventListener("click", () => {
    showScreen("screen-title");
  });
  document.getElementById("btn-char-start").addEventListener("click", () => {
    if (!selectedCharacterId) return;
    startGame(selectedCharacterId);
  });
}

function bindPhone() {
  document.querySelectorAll(".app-icon[data-app]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const app = btn.getAttribute("data-app");
      openPhoneApp(app);
      if (app === "x") renderXApp(state);
      if (app === "map") renderMap(state, handleTravel);
      if (app === "texts") renderTextThreads(state, handleOpenThread);
      if (app === "selfie") {
        document.getElementById("selfie-caption").value = "";
        renderSelfiePresets((preset) => {
          document.getElementById("selfie-caption").value = preset;
        });
      }
    });
  });

  document.querySelectorAll("[data-back]").forEach((btn) => {
    btn.addEventListener("click", () => openPhoneApp("home"));
  });

  document.getElementById("btn-thread-back").addEventListener("click", () => {
    document.getElementById("text-chat").hidden = true;
    document.getElementById("text-threads").hidden = false;
    renderTextThreads(state, handleOpenThread);
  });

  document.getElementById("btn-post-selfie").addEventListener("click", () => {
    const caption = document.getElementById("selfie-caption").value;
    const result = postSelfie(state, caption);
    if (result.error) {
      showToast(result.error, "bad");
      return;
    }
    state = result.state;
    showToast(result.toast, "good");
    document.getElementById("selfie-caption").value = "";
    openPhoneApp("x");
    renderXApp(state);
    updateStats(state);
  });

  document.getElementById("btn-compose").addEventListener("click", () => {
    openPhoneApp("selfie");
    renderSelfiePresets((preset) => {
      document.getElementById("selfie-caption").value = preset;
    });
  });
}

function bindMenu() {
  const modal = document.getElementById("modal-menu");
  document.getElementById("btn-menu").addEventListener("click", () => {
    modal.hidden = false;
  });
  document.getElementById("btn-close-menu").addEventListener("click", () => {
    modal.hidden = true;
  });
  document.getElementById("btn-save").addEventListener("click", () => {
    if (state) saveState(state);
    showToast("Progress saved to this browser.", "good");
    modal.hidden = true;
  });
  document.getElementById("btn-title").addEventListener("click", () => {
    modal.hidden = true;
    state = null;
    showScreen("screen-title");
    document.getElementById("btn-continue").hidden = !hasSave();
  });
}

function init() {
  bindTitle();
  bindCharacter();
  bindPhone();
  bindMenu();
  updatePhoneClock();
  showScreen("screen-title");
}

init();
