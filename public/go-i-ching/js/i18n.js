/**
 * English / Traditional Chinese strings and language application.
 */
(function (global) {
  const GIC = (global.GIC = global.GIC || {});

  GIC.STR = {
    en: {
      title: "Go I Ching",
      titleZh: "Weiqi · Yijing",
      tagline: "The board is a Book of Changes",
      newGame: "New Game",
      boardSize: "Board",
      size9: "9×9 Beginner",
      size13: "13×13",
      size19: "19×19",
      mode: "Mode",
      twoPlayer: "Two players",
      vsAi: "Play the Master",
      playAs: "You play",
      asBlack: "Black",
      asWhite: "White",
      start: "Begin",
      cancel: "Cancel",
      pass: "Pass",
      resign: "Resign",
      undo: "Undo",
      askMaster: "Ask the Master",
      castGuidance: "Cast Guidance",
      library: "Hexagram Library",
      wisdom: "Wisdom Mode",
      tutorial: "Tutorial",
      save: "Save",
      load: "Load",
      exportSgf: "Export SGF",
      score: "Score",
      confirmScore: "Confirm score",
      recount: "Recount",
      markDead: "Mark dead stones",
      collapse: "Hide master",
      expand: "Show master",
      language: "中文",
      black: "Black",
      white: "White",
      captures: "Captures",
      toPlay: "to play",
      thinking: "The Master places a stone…",
      blackWins: "Black wins",
      whiteWins: "White wins",
      jigo: "Even — a rare stillness",
      resigned: "resigned",
      komi: "Komi",
      territory: "Territory",
      stones: "Stones",
      area: "Area",
      scoringHint: "Tap groups to mark them dead, then confirm the score.",
      scoringTitle: "Reading the finished board",
      gameOver: "The changes rest",
      newFromOver: "Another game",
      close: "Close",
      saved: "The record is kept.",
      loaded: "The record returns.",
      noSave: "No saved game.",
      illegalKo: "The ko forbids this point — for one breath only.",
      illegalSuicide: "A stone cannot throw itself into a pit with no air.",
      illegalOccupied: "A stone already sits here.",
      passHint: "Two passes end the contest and open the counting.",
      confirmResign: "Lay down the stones and leave the Way of this game?",
      confirmNew: "Leave the present board and begin again?",
      masterName: "Elder Yi",
      masterTitle: "Keeper of the Changes",
      hexagram: "Hexagram",
      upper: "Above",
      lower: "Below",
      judgment: "Judgment",
      onTheBoard: "On the board",
      searchHex: "Search name or number…",
      continue: "Continue",
      skipTutorial: "Leave the lesson",
      finishTutorial: "The lesson is complete. Shall we play?",
      lastMove: "Last",
      move: "Move",
      menu: "Menu",
      about: "About",
      aboutBody:
        "Go I Ching is a contemplative fusion of Weiqi and the Yijing. Black and white are yin and yang; empty points are potential; the whole game is continuous change. The Master is a companion, not a judge.",
      rulesNote: "Chinese area scoring · simple ko · komi 7.5",
      you: "You",
      ai: "Master",
      local: "Local",
      hoverHint: "Place on an intersection",
    },
    zh: {
      title: "圍棋易經",
      titleZh: "圍棋 · 易經",
      tagline: "棋盤即是一部易",
      newGame: "新局",
      boardSize: "棋盤",
      size9: "九路 · 入門",
      size13: "十三路",
      size19: "十九路",
      mode: "對局",
      twoPlayer: "雙人對弈",
      vsAi: "與先生對弈",
      playAs: "執",
      asBlack: "黑",
      asWhite: "白",
      start: "開局",
      cancel: "取消",
      pass: "停著",
      resign: "投子",
      undo: "悔棋",
      askMaster: "問先生",
      castGuidance: "卜問",
      library: "卦象典藏",
      wisdom: "悟道模式",
      tutorial: "啟蒙",
      save: "存譜",
      load: "讀譜",
      exportSgf: "導出 SGF",
      score: "點目",
      confirmScore: "確認點目",
      recount: "重數",
      markDead: "點死子",
      collapse: "收起先生",
      expand: "請出先生",
      language: "EN",
      black: "黑",
      white: "白",
      captures: "提子",
      toPlay: "行棋",
      thinking: "先生落子中…",
      blackWins: "黑勝",
      whiteWins: "白勝",
      jigo: "和棋 — 難得的靜",
      resigned: "投子",
      komi: "貼目",
      territory: "空",
      stones: "子數",
      area: "子空合計",
      scoringHint: "點選棋塊以標記死子，然後確認點目。",
      scoringTitle: "讀此終局",
      gameOver: "變已暫息",
      newFromOver: "再一局",
      close: "關閉",
      saved: "棋譜已存。",
      loaded: "棋譜歸來。",
      noSave: "尚無存譜。",
      illegalKo: "劫禁這一點 — 僅此一口氣。",
      illegalSuicide: "無氣不可自投。",
      illegalOccupied: "此處已有子。",
      passHint: "雙方連續停著，則終局而點目。",
      confirmResign: "投子離此局之道乎？",
      confirmNew: "棄此盤而再開新局乎？",
      masterName: "易翁",
      masterTitle: "守變之人",
      hexagram: "卦",
      upper: "上卦",
      lower: "下卦",
      judgment: "卦辭",
      onTheBoard: "在棋",
      searchHex: "尋卦名或序號…",
      continue: "繼續",
      skipTutorial: "離開啟蒙",
      finishTutorial: "課已成。可以對弈了。",
      lastMove: "前手",
      move: "手",
      menu: "菜單",
      about: "關於",
      aboutBody:
        "《圍棋易經》將圍棋與周易視為同一條道。黑白為陰陽，空點為未發，全局為變。先生是同道，不是判官。",
      rulesNote: "中國子空計算法 · 禁止打劫立刻回提 · 貼目七目半",
      you: "己",
      ai: "先生",
      local: "對坐",
      hoverHint: "落子於交叉點",
    },
  };

  GIC.lang = "en";

  GIC.t = function (key) {
    const pack = GIC.STR[GIC.lang] || GIC.STR.en;
    if (pack[key] != null) return pack[key];
    if (GIC.STR.en[key] != null) return GIC.STR.en[key];
    return key;
  };

  GIC.txt = function (pair) {
    if (!pair) return "";
    if (typeof pair === "string") return pair;
    return pair[GIC.lang] || pair.en || "";
  };

  GIC.setLang = function (lang) {
    GIC.lang = lang === "zh" ? "zh" : "en";
    try {
      localStorage.setItem("gic-lang", GIC.lang);
    } catch (e) {}
    GIC.applyI18n();
    if (GIC.onLangChange) GIC.onLangChange();
  };

  GIC.toggleLang = function () {
    GIC.setLang(GIC.lang === "en" ? "zh" : "en");
  };

  GIC.applyI18n = function () {
    const root = document.documentElement;
    root.lang = GIC.lang === "zh" ? "zh-Hant" : "en";
    root.setAttribute("data-lang", GIC.lang);
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = GIC.t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      el.title = GIC.t(el.getAttribute("data-i18n-title"));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      el.placeholder = GIC.t(el.getAttribute("data-i18n-placeholder"));
    });
    const title = GIC.lang === "zh" ? "圍棋易經 — Go I Ching" : "Go I Ching — 圍棋易經";
    document.title = title;
  };

  GIC.loadLang = function () {
    try {
      const saved = localStorage.getItem("gic-lang");
      if (saved === "zh" || saved === "en") GIC.lang = saved;
    } catch (e) {}
  };
})(typeof window !== "undefined" ? window : globalThis);
