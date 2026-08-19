/**
 * Go I Ching — UI wiring, game flow, tutorial, persistence.
 */
(function () {
  const SAVE_KEY = "gic-save-v1";
  const PREF_KEY = "gic-prefs";

  const state = {
    game: null,
    mode: "ai",
    humanColor: 1,
    wisdom: true,
    masterCollapsed: false,
    thinking: false,
    tutorialIndex: -1,
    lastCommentAt: 0,
    lastRegion: "",
    speechTimer: null,
    speechFull: "",
    lastOracle: null,
    lastRegionSpoken: "",
    hoverRegion: "",
    hoverTimer: null,
    prefsLoaded: false,
  };

  let view;

  function $(id) {
    return document.getElementById(id);
  }

  function isHumanTurn() {
    if (!state.game || state.game.phase !== "play") return false;
    if (state.mode === "local" || state.mode === "tutorial") return true;
    return state.game.toPlay === state.humanColor;
  }

  function updateStatus() {
    const g = state.game;
    if (!g) return;
    const lang = GIC.lang;
    $("stat-black-caps").textContent = g.captures[1];
    $("stat-white-caps").textContent = g.captures[2];
    $("stat-move").textContent = g.moveNumber;
    const turn = $("stat-turn");
    if (g.phase === "score") {
      turn.textContent = GIC.t("markDead");
    } else if (g.phase === "done") {
      turn.textContent = GIC.t("gameOver");
    } else if (state.thinking) {
      turn.textContent = GIC.t("thinking");
    } else {
      const who = g.toPlay === GIC.BLACK ? GIC.t("black") : GIC.t("white");
      turn.textContent = who + " · " + GIC.t("toPlay");
    }
    $("pill-black").classList.toggle("active", g.toPlay === GIC.BLACK && g.phase === "play");
    $("pill-white").classList.toggle("active", g.toPlay === GIC.WHITE && g.phase === "play");
    document.body.classList.toggle("scoring", g.phase === "score");
    document.body.classList.toggle("thinking", state.thinking);
    $("btn-undo").disabled = !g.history || !g.history.length || state.thinking || state.mode === "tutorial";
    $("btn-pass").disabled = g.phase !== "play" || state.thinking || !isHumanTurn();
    $("btn-undo-h").disabled = $("btn-undo").disabled;
    $("btn-pass-h").disabled = $("btn-pass").disabled;
    $("btn-resign").disabled = g.phase !== "play" || state.thinking;
    $("score-bar").hidden = g.phase !== "score";
    $("wisdom-toggle").checked = state.wisdom;
    if (lang === "zh") {
      $("brand-title").textContent = "圍棋易經";
      $("brand-sub").textContent = "棋盤即是一部易";
    } else {
      $("brand-title").textContent = "Go I Ching";
      $("brand-sub").textContent = "The board is a Book of Changes";
    }
    const last = g.moves && g.moves.length ? g.moves[g.moves.length - 1] : null;
    $("btn-collapse").textContent = GIC.t(state.masterCollapsed ? "expand" : "collapse");
    const lastEl = $("stat-last");
    if (last && !last.pass) lastEl.textContent = g.coordName(last.x, last.y);
    else if (last && last.pass) lastEl.textContent = GIC.t("pass");
    else lastEl.textContent = "—";
  }

  function draw() {
    if (!view || !state.game) return;
    if (state.mode === "tutorial" && state.tutorialIndex >= 0) {
      const step = GIC.Master.TUTORIAL[state.tutorialIndex];
      view.hint = step && step.hint ? step.hint(state.game) : null;
    } else {
      view.hint = null;
    }
    view.draw(state.game, { wisdom: state.wisdom });
    updateStatus();
  }

  function setSpeaking(on) {
    $("master-portrait").classList.toggle("speaking", on);
    $("master-speak-img").classList.toggle("show", on);
  }

  function speak(text, opts) {
    opts = opts || {};
    if (state.speechTimer) {
      clearInterval(state.speechTimer);
      state.speechTimer = null;
    }
    state.speechFull = text || "";
    const box = $("master-speech");
    if (opts.instant || !text) {
      box.textContent = text || "";
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    box.textContent = "";
    let i = 0;
    const step = GIC.lang === "zh" ? 1 : 2;
    state.speechTimer = setInterval(function () {
      i += step;
      if (i >= text.length) {
        box.textContent = text;
        clearInterval(state.speechTimer);
        state.speechTimer = null;
        setSpeaking(false);
      } else {
        box.textContent = text.slice(0, i);
      }
    }, 18);
  }

  function maybeComment(ev) {
    if (state.mode === "tutorial") return;
    if (!state.game || state.game.phase !== "play") return;
    const interval = state.wisdom ? 5 : 10;
    const significant =
      ev &&
      (ev.event === "capture" ||
        ev.event === "tengen" ||
        (ev.captured && ev.captured.length >= 2));
    const due = state.game.moveNumber - state.lastCommentAt >= interval;
    if (!significant && !due) {
      if (state.wisdom && ev && ev.region && ev.region !== state.lastRegion && ev.region === "center") {
        state.lastRegion = ev.region;
        speak(GIC.Master.regionRemark(ev.region));
      }
      return;
    }
    state.lastCommentAt = state.game.moveNumber;
    if (ev && ev.region) state.lastRegion = ev.region;
    speak(GIC.Master.commentaryFor(state.game, ev, state.wisdom));
  }

  function afterMove(ev) {
    draw();
    if (!ev || !ev.ok) return;
    if (ev.event === "end") {
      enterScoring();
      return;
    }
    if (ev.event === "resign") {
      showResult();
      return;
    }
    maybeComment(ev);
    maybeAiTurn();
  }

  function illegal(reason) {
    const map = {
      ko: "illegalKo",
      suicide: "illegalSuicide",
      occupied: "illegalOccupied",
    };
    const key = map[reason];
    if (key) speak(GIC.t(key));
  }

  function tryPlace(x, y) {
    const g = state.game;
    if (!g || state.thinking) return;
    if (g.phase === "score") {
      g.toggleDead(x, y);
      draw();
      return;
    }
    if (g.phase !== "play") return;
    if (!isHumanTurn()) return;

    if (state.mode === "tutorial") {
      const step = GIC.Master.TUTORIAL[state.tutorialIndex];
      if (step.wait === "place-hint") {
        const h = step.hint(g);
        if (x !== h.x || y !== h.y) {
          speak(
            GIC.lang === "zh"
              ? "落在紅圈之處。那一口氣，正在等你。"
              : "Place on the marked point. That last breath is waiting for you."
          );
          return;
        }
      } else if (step.wait !== "place-any") {
        return;
      }
    }

    const ev = g.play(x, y);
    if (!ev.ok) {
      illegal(ev.reason);
      return;
    }
    if (state.mode === "tutorial" && (stepWait() === "place-any" || stepWait() === "place-hint")) {
      draw();
      advanceTutorial();
      return;
    }
    afterMove(ev);
  }

  function stepWait() {
    if (state.tutorialIndex < 0) return "";
    const s = GIC.Master.TUTORIAL[state.tutorialIndex];
    return s ? s.wait : "";
  }

  function maybeAiTurn() {
    const g = state.game;
    if (!g || g.phase !== "play") return;
    if (state.mode !== "ai") return;
    if (g.toPlay === state.humanColor) return;
    if (state.thinking) return;
    state.thinking = true;
    updateStatus();
    const delay = 420 + Math.random() * 380;
    setTimeout(function () {
      let mv;
      try {
        mv = GIC.chooseMove(g);
      } catch (err) {
        mv = { pass: true };
      }
      state.thinking = false;
      if (!state.game || state.game !== g || g.phase !== "play") {
        draw();
        return;
      }
      let ev;
      if (!mv || mv.pass) ev = g.pass();
      else ev = g.play(mv.x, mv.y);
      afterMove(ev);
    }, delay);
  }

  function enterScoring() {
    state.game.phase = "score";
    speak(
      GIC.lang === "zh"
        ? "雙方停著。請點死子。點完之後，我們讀這盤已成之卦。"
        : "Both have passed. Mark the dead, then we will read the hexagram this game has become."
    );
    draw();
  }

  function confirmScore() {
    const r = state.game.score();
    showResult(r);
  }

  function showResult() {
    const g = state.game;
    const r = g.result || {};
    const overlay = $("result-overlay");
    const body = $("result-body");
    let headline = GIC.t("jigo");
    if (r.winner === GIC.BLACK) headline = GIC.t("blackWins");
    if (r.winner === GIC.WHITE) headline = GIC.t("whiteWins");
    if (r.resigned) {
      headline +=
        " · " + (r.resigned === GIC.BLACK ? GIC.t("black") : GIC.t("white")) + " " + GIC.t("resigned");
    }
    $("result-title").textContent = GIC.t("gameOver");
    $("result-headline").textContent = headline;
    if (r.blackScore != null) {
      body.innerHTML =
        '<div class="score-grid">' +
        scoreRow(GIC.t("black"), r.stonesB, r.terrB, r.blackScore, null) +
        scoreRow(GIC.t("white"), r.stonesW, r.terrW, r.whiteScore, r.komi) +
        "</div>";
    } else {
      body.innerHTML = "";
    }
    overlay.hidden = false;
    speak(GIC.Master.endReading(g));
    draw();
  }

  function scoreRow(name, stones, terr, total, komi) {
    const k =
      komi != null
        ? "<span>" + GIC.t("komi") + " " + komi + "</span>"
        : "<span></span>";
    return (
      "<div class='score-row'><strong>" +
      name +
      "</strong><span>" +
      GIC.t("stones") +
      " " +
      stones +
      "</span><span>" +
      GIC.t("territory") +
      " " +
      terr +
      "</span>" +
      k +
      "<em>" +
      GIC.t("area") +
      " " +
      total +
      "</em></div>"
    );
  }

  function newGame(opts) {
    opts = opts || {};
    const size = opts.size || 9;
    state.mode = opts.mode || "ai";
    state.humanColor = opts.humanColor || GIC.BLACK;
    state.thinking = false;
    state.tutorialIndex = -1;
    state.lastCommentAt = 0;
    state.lastRegion = "";
    state.lastRegionSpoken = "";
    state.hoverRegion = "";
    state.lastOracle = null;
    $("oracle-badge").hidden = true;
    $("tutorial-bar").hidden = true;
    $("result-overlay").hidden = true;
    state.game = new GIC.GoGame({ size: size, komi: 7.5 });
    view.hover = null;
    if (state.mode === "tutorial") {
      startTutorial();
    } else {
      speak(GIC.Master.openingSpeech());
      draw();
      maybeAiTurn();
    }
    persistPrefs();
  }

  function startTutorial() {
    state.mode = "tutorial";
    state.tutorialIndex = 0;
    state.game = new GIC.GoGame({ size: 9, komi: 7.5 });
    $("tutorial-bar").hidden = false;
    $("result-overlay").hidden = true;
    applyTutorialStep();
  }

  function applyTutorialStep() {
    const steps = GIC.Master.TUTORIAL;
    if (state.tutorialIndex >= steps.length) {
      finishTutorial();
      return;
    }
    const step = steps[state.tutorialIndex];
    if (step.setup) step.setup(state.game);
    speak(GIC.txt(step.speech));
    $("btn-tut-continue").hidden = step.wait !== "continue";
    $("tutorial-step").textContent = state.tutorialIndex + 1 + " / " + steps.length;
    draw();
  }

  function advanceTutorial() {
    state.tutorialIndex++;
    applyTutorialStep();
  }

  function finishTutorial() {
    $("tutorial-bar").hidden = true;
    newGame({ size: 9, mode: "ai", humanColor: GIC.BLACK });
    speak(
      GIC.lang === "zh"
        ? "好。九路盤，你執黑。慢慢來，有疑則問。"
        : "Good. A 9×9 board; you hold Black. Go slowly. Ask when the position is unclear."
    );
  }

  function consult() {
    if (!state.game) return;
    const reading = GIC.Master.consult(state.game);
    state.lastOracle = reading;
    const badge = $("oracle-badge");
    badge.hidden = false;
    badge.textContent =
      reading.primary.glyph +
      " " +
      GIC.Master.hexName(reading.primary) +
      " · " +
      reading.secondary.glyph +
      " " +
      (GIC.lang === "zh" ? reading.secondary.zh : reading.secondary.en);
    speak(reading.text);
  }

  function persistPrefs() {
    try {
      localStorage.setItem(
        PREF_KEY,
        JSON.stringify({
          wisdom: state.wisdom,
          masterCollapsed: state.masterCollapsed,
        })
      );
    } catch (e) {}
  }

  function saveGame() {
    if (!state.game) return;
    try {
      const data = state.game.serialize({
        mode: state.mode,
        humanColor: state.humanColor,
        wisdom: state.wisdom,
      });
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      speak(GIC.t("saved"));
    } catch (e) {
      speak(GIC.t("noSave"));
    }
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) {
        speak(GIC.t("noSave"));
        return;
      }
      const data = JSON.parse(raw);
      state.game = GIC.GoGame.fromSerialized(data);
      if (data.meta) {
        state.mode = data.meta.mode || "local";
        state.humanColor = data.meta.humanColor || GIC.BLACK;
        if (data.meta.wisdom != null) state.wisdom = data.meta.wisdom;
      }
      state.tutorialIndex = -1;
      $("tutorial-bar").hidden = true;
      $("result-overlay").hidden = true;
      speak(GIC.t("loaded"));
      draw();
      maybeAiTurn();
    } catch (e) {
      speak(GIC.t("noSave"));
    }
  }

  function exportSgf() {
    if (!state.game) return;
    const sgf = state.game.toSGF();
    const blob = new Blob([sgf], { type: "application/x-go-sgf" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "go-i-ching.sgf";
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
    }, 1500);
  }

  function openModal(id) {
    $(id).hidden = false;
  }
  function closeModal(id) {
    $(id).hidden = true;
  }

  function fillLibrary(filter) {
    const q = (filter || "").trim().toLowerCase();
    const grid = $("library-grid");
    grid.innerHTML = "";
    GIC.HEXAGRAMS.forEach(function (h) {
      const label = (h.n + " " + h.zh + " " + h.py + " " + h.en).toLowerCase();
      if (q && label.indexOf(q) === -1) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "hex-cell";
      btn.innerHTML =
        "<span class='glyph'>" +
        h.glyph +
        "</span><span class='num'>" +
        h.n +
        "</span><span class='nm'>" +
        (GIC.lang === "zh" ? h.zh : h.en) +
        "</span>";
      btn.addEventListener("click", function () {
        showHexDetail(h);
      });
      grid.appendChild(btn);
    });
  }

  function showHexDetail(h) {
    const d = $("hex-detail");
    const up = GIC.TRIGRAMS[h.upper];
    const low = GIC.TRIGRAMS[h.lower];
    d.hidden = false;
    d.innerHTML =
      "<div class='hex-head'><span class='glyph'>" +
      h.glyph +
      "</span><div><h3>" +
      h.n +
      " · " +
      h.zh +
      " " +
      h.py +
      "</h3><p>" +
      h.en +
      "</p></div></div>" +
      "<p class='tri'>" +
      GIC.t("lower") +
      " " +
      low.symbol +
      " " +
      (GIC.lang === "zh" ? low.zh : low.en) +
      " · " +
      GIC.t("upper") +
      " " +
      up.symbol +
      " " +
      (GIC.lang === "zh" ? up.zh : up.en) +
      "</p>" +
      "<h4>" +
      GIC.t("judgment") +
      "</h4><p>" +
      GIC.txt(h.judgment) +
      "</p>" +
      "<h4>" +
      GIC.t("onTheBoard") +
      "</h4><p>" +
      GIC.txt(h.go) +
      "</p>";
  }

  function bind() {
    view = new GIC.BoardView($("board"));
    view.resize();

    $("board").addEventListener("pointermove", function (ev) {
      if (!state.game || state.game.phase !== "play" || !isHumanTurn()) {
        if (view.hover) {
          view.hover = null;
          draw();
        }
        return;
      }
      const p = view.eventToPoint(ev);
      const prev = view.hover;
      view.hover = p;
      if ((!prev && p) || (prev && !p) || (p && prev && (p.x !== prev.x || p.y !== prev.y))) draw();
      if (p && state.wisdom && state.mode !== "tutorial") {
        const region = state.game.regionOf(p.x, p.y);
        if (region !== state.hoverRegion) {
          state.hoverRegion = region;
          if (state.hoverTimer) clearTimeout(state.hoverTimer);
          state.hoverTimer = setTimeout(function () {
            if (state.lastRegionSpoken === region) return;
            state.lastRegionSpoken = region;
            speak(GIC.Master.regionRemark(region));
          }, 1400);
        }
      }
    });
    $("board").addEventListener("pointerleave", function () {
      view.hover = null;
      draw();
    });
    $("board").addEventListener("pointerdown", function (ev) {
      ev.preventDefault();
      const p = view.eventToPoint(ev);
      if (p) tryPlace(p.x, p.y);
    });

    $("btn-lang").addEventListener("click", function () {
      GIC.toggleLang();
    });
    GIC.onLangChange = function () {
      draw();
      fillLibrary($("library-search").value);
      $("btn-lang").textContent = GIC.t("language");
      $("btn-collapse").textContent = GIC.t(state.masterCollapsed ? "expand" : "collapse");
      if (state.game && state.game.phase === "done") {
        speak(GIC.Master.endReading(state.game), { instant: true });
      } else if (state.mode === "tutorial" && state.tutorialIndex >= 0) {
        speak(GIC.txt(GIC.Master.TUTORIAL[state.tutorialIndex].speech), { instant: true });
      } else if (state.lastOracle) {
        const reading = GIC.Master.consult(state.game);
        state.lastOracle = reading;
        $("oracle-badge").textContent =
          reading.primary.glyph + " " + GIC.Master.hexName(reading.primary);
        speak(reading.text, { instant: true });
      } else if (state.game && state.game.moveNumber === 0) {
        speak(GIC.Master.openingSpeech(), { instant: true });
      } else if (state.game) {
        speak(GIC.Master.commentaryFor(state.game, null, state.wisdom), { instant: true });
      }
    };

    $("btn-new").addEventListener("click", function () {
      openModal("modal-new");
    });
    $("btn-start-game").addEventListener("click", function () {
      if (state.game && state.game.moveNumber > 0 && state.game.phase === "play") {
        if (!window.confirm(GIC.t("confirmNew"))) return;
      }
      const size = parseInt(document.querySelector("input[name=size]:checked").value, 10);
      const mode = document.querySelector("input[name=mode]:checked").value;
      const color = document.querySelector("input[name=color]:checked").value === "w" ? GIC.WHITE : GIC.BLACK;
      closeModal("modal-new");
      newGame({ size: size, mode: mode, humanColor: color });
    });
    document.querySelectorAll(".modal").forEach(function (m) {
      m.addEventListener("click", function (ev) {
        if (ev.target === m) m.hidden = true;
      });
    });
    document.querySelectorAll("[data-close]").forEach(function (el) {
      el.addEventListener("click", function () {
        closeModal(el.getAttribute("data-close"));
      });
    });

    $("btn-pass-h").addEventListener("click", function () {
      $("btn-pass").click();
    });
    $("btn-undo-h").addEventListener("click", function () {
      $("btn-undo").click();
    });
    $("btn-pass").addEventListener("click", function () {
      if (!isHumanTurn() || state.thinking) return;
      const ev = state.game.pass();
      afterMove(ev);
    });
    $("btn-resign").addEventListener("click", function () {
      if (state.game.phase !== "play") return;
      if (!window.confirm(GIC.t("confirmResign"))) return;
      const ev = state.game.resign(state.mode === "ai" ? state.humanColor : state.game.toPlay);
      afterMove(ev);
    });
    $("btn-undo").addEventListener("click", function () {
      if (state.thinking || state.mode === "tutorial") return;
      state.game.undo();
      if (state.mode === "ai" && state.game.toPlay !== state.humanColor) state.game.undo();
      draw();
    });
    $("btn-ask").addEventListener("click", consult);
    $("btn-library").addEventListener("click", function () {
      fillLibrary("");
      $("library-search").value = "";
      $("hex-detail").hidden = true;
      openModal("modal-library");
    });
    $("library-search").addEventListener("input", function () {
      fillLibrary(this.value);
    });
    $("wisdom-toggle").addEventListener("change", function () {
      state.wisdom = this.checked;
      persistPrefs();
      if (state.wisdom) {
        speak(GIC.txt(GIC.Master.WISDOM_ASIDES[0]));
      }
      draw();
    });
    $("btn-tutorial").addEventListener("click", function () {
      startTutorial();
    });
    $("btn-tut-continue").addEventListener("click", advanceTutorial);
    $("btn-tut-skip").addEventListener("click", finishTutorial);
    $("btn-save").addEventListener("click", saveGame);
    $("btn-load").addEventListener("click", loadGame);
    $("btn-sgf").addEventListener("click", exportSgf);
    $("btn-score").addEventListener("click", confirmScore);
    $("btn-clear-dead").addEventListener("click", function () {
      state.game.clearDead();
      draw();
    });
    $("btn-collapse").addEventListener("click", function () {
      state.masterCollapsed = !state.masterCollapsed;
      document.body.classList.toggle("master-collapsed", state.masterCollapsed);
      $("btn-collapse").textContent = GIC.t(state.masterCollapsed ? "expand" : "collapse");
      persistPrefs();
      setTimeout(function () {
        view.resize();
        draw();
      }, 80);
    });
    $("btn-menu").addEventListener("click", function () {
      document.body.classList.toggle("drawer-open");
    });
    $("drawer").addEventListener("click", function () {
      document.body.classList.remove("drawer-open");
    });
    $("btn-about").addEventListener("click", function () {
      openModal("modal-about");
    });
    $("btn-again").addEventListener("click", function () {
      $("result-overlay").hidden = true;
      openModal("modal-new");
    });
    $("btn-result-close").addEventListener("click", function () {
      $("result-overlay").hidden = true;
    });

    function onViewport() {
      view.resize();
      draw();
    }
    window.addEventListener("resize", onViewport);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", onViewport);
    }
    window.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") {
        document.querySelectorAll(".modal").forEach(function (m) {
          m.hidden = true;
        });
        document.body.classList.remove("drawer-open");
      }
      if (ev.target.matches("input, textarea")) return;
      if (ev.key === "p" || ev.key === "P") $("btn-pass").click();
      if (ev.key === "u" || ev.key === "U") $("btn-undo").click();
    });
  }

  function boot() {
    GIC.loadLang();
    try {
      const prefs = JSON.parse(localStorage.getItem(PREF_KEY) || "{}");
      if (prefs.wisdom != null) state.wisdom = prefs.wisdom;
      if (prefs.masterCollapsed) {
        state.masterCollapsed = true;
        document.body.classList.add("master-collapsed");
      }
    } catch (e) {}
    bind();
    GIC.applyI18n();
    $("btn-lang").textContent = GIC.t("language");
    newGame({ size: 9, mode: "ai", humanColor: GIC.BLACK });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
