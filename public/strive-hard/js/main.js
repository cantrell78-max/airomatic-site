/**
 * Strive Hard — main bootstrap
 */
import {
  createNewState,
  loadState,
  saveState,
  hasSave,
  toggleBubbleTranslate,
} from "./state.js";
import {
  applyChoice,
  travelTo,
  postSelfie,
  sendTextReply,
  markThreadRead,
  flareupSwipe,
  flareupResetDeck,
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
  renderFlareUp,
  updatePhoneClock,
} from "./ui.js";

let state = null;
let selectedCharacterId = null;

function handleTranslate(sceneId, revert) {
  if (!state) return;
  const translatedScenes = { ...(state.translatedScenes || {}) };
  if (revert) {
    delete translatedScenes[sceneId];
  } else {
    translatedScenes[sceneId] = true;
  }
  state = { ...state, translatedScenes };
  saveState(state);
  refresh();
}

function refresh() {
  if (!state) return;
  updateStats(state);
  renderScene(state, handleChoice, handleTranslate);
  renderPhoneHome(state);
  const active = document.querySelector(".phone-screen.active");
  if (active?.id === "phone-x") renderXApp(state);
  if (active?.id === "phone-map") renderMap(state, handleTravel);
  if (active?.id === "phone-texts") {
    const chatHidden = document.getElementById("text-chat").hidden;
    if (chatHidden) renderTextThreads(state, handleOpenThread);
  }
  if (active?.id === "phone-flareup") renderFlareUp(state, flareHandlers);
  updatePhoneClock();
}

const flareHandlers = {
  onLike: () => handleFlareSwipe("like"),
  onPass: () => handleFlareSwipe("pass"),
  onReset: () => {
    const result = flareupResetDeck(state);
    state = result.state;
    if (result.toast) showToast(result.toast, "good");
    renderFlareUp(state, flareHandlers);
    renderPhoneHome(state);
    updateStats(state);
  },
};

function handleFlareSwipe(action) {
  const result = flareupSwipe(state, action);
  if (result.error) {
    showToast(result.error, "bad");
    return;
  }
  state = result.state;
  if (result.toast) showToast(result.toast, result.matched ? "good" : "");
  renderFlareUp(state, flareHandlers);
  renderPhoneHome(state);
  updateStats(state);
}

function handleChoice(choice) {
  const result = applyChoice(state, choice);
  if (result.error) {
    showToast(result.error, "bad");
    return;
  }
  state = result.state;
  if (result.toast) showToast(result.toast, "good");
  refresh();

  // "Open the Map / go somewhere" choices use next: null — pop open Map on the iHype
  // App ids: map | x | texts | flareup | selfie | home  (alias: messages → texts)
  const app = choice.openApp || (choice.next === null ? "map" : null);
  if (app) {
    const appId = app === "messages" || app === "imessage" || app === "sms" ? "texts" : app;
    openPhoneApp(appId);
    if (appId === "map") renderMap(state, handleTravel);
    if (appId === "x") renderXApp(state);
    if (appId === "texts") {
      renderTextThreads(state, handleOpenThread);
      // Optional: jump straight into a thread (e.g. Prema at temple)
      if (choice.openThread && state.threads?.[choice.openThread] && !state.threads[choice.openThread].locked) {
        handleOpenThread(choice.openThread);
      }
    }
    if (appId === "flareup") renderFlareUp(state, flareHandlers);
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

function handleToggleBubbleTranslate(npcId, msgIndex) {
  state = toggleBubbleTranslate(state, npcId, msgIndex);
  renderTextChat(state, npcId, handleTextReply, handleToggleBubbleTranslate);
}

function handleOpenThread(npcId) {
  try {
    // Always show Messages app first so a render error can't leave a blank phone
    openPhoneApp("texts");
    state = markThreadRead(state, npcId);
    renderPhoneHome(state);
    renderTextChat(state, npcId, handleTextReply, handleToggleBubbleTranslate);
  } catch (err) {
    console.error("open thread failed", npcId, err);
    openPhoneApp("texts");
    renderTextThreads(state, handleOpenThread);
    showToast("That thread glitched. Back to inbox.", "bad");
  }
}

function handleTextReply(npcId, option) {
  try {
    const result = sendTextReply(state, npcId, option);
    if (result.error) {
      showToast(result.error, "bad");
      return;
    }
    state = result.state;
    if (result.toast) showToast(result.toast, "good");
    openPhoneApp("texts");
    renderTextChat(state, npcId, handleTextReply, handleToggleBubbleTranslate);
    renderPhoneHome(state);
    updateStats(state);
  } catch (err) {
    console.error("text reply failed", npcId, err);
    openPhoneApp("texts");
    renderTextThreads(state, handleOpenThread);
    showToast("Message failed to send. Phone recovered.", "bad");
  }
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
      if (app === "flareup") renderFlareUp(state, flareHandlers);
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

  // Always-visible home pill (survives blank/crashed app screens)
  const homeBar = document.getElementById("btn-phone-home");
  if (homeBar) {
    homeBar.addEventListener("click", () => {
      openPhoneApp("home");
      renderPhoneHome(state);
    });
  }

  const threadBack = document.getElementById("btn-thread-back");
  if (threadBack) {
    threadBack.addEventListener("click", () => {
      try {
        openPhoneApp("texts");
        document.getElementById("text-chat").hidden = true;
        document.getElementById("text-threads").hidden = false;
        renderTextThreads(state, handleOpenThread);
      } catch (err) {
        console.error("thread back failed", err);
        openPhoneApp("home");
      }
    });
  }

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

function isFullscreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}

function updateFullscreenButton() {
  const btn = document.getElementById("btn-fullscreen");
  if (!btn) return;
  btn.textContent = isFullscreen() ? "Exit Fullscreen" : "Fullscreen";
}

async function toggleFullscreen() {
  try {
    if (isFullscreen()) {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) await exit.call(document);
    } else {
      const el = document.documentElement;
      const req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (req) {
        await req.call(el);
      } else {
        showToast("Fullscreen not supported in this browser.", "bad");
        return;
      }
    }
  } catch {
    // Iframe may block fullscreen; open standalone app as fallback when on site
    if (window.location.pathname.includes("/strive-hard/") && !window.location.pathname.endsWith("app.html")) {
      window.open("/strive-hard/app.html", "_blank", "noopener");
      showToast("Opened fullscreen window.", "good");
    } else {
      showToast("Could not enter fullscreen.", "bad");
    }
  }
  updateFullscreenButton();
}

function bindMenu() {
  const modal = document.getElementById("modal-menu");
  document.getElementById("btn-menu").addEventListener("click", () => {
    updateFullscreenButton();
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
  document.getElementById("btn-fullscreen").addEventListener("click", async () => {
    await toggleFullscreen();
    // Keep menu open so user can resume; label already updated
  });
  document.getElementById("btn-title").addEventListener("click", () => {
    modal.hidden = true;
    state = null;
    showScreen("screen-title");
    document.getElementById("btn-continue").hidden = !hasSave();
  });
  document.addEventListener("fullscreenchange", updateFullscreenButton);
  document.addEventListener("webkitfullscreenchange", updateFullscreenButton);
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
