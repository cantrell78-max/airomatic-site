const KEY = "rat-race-lang";

export const STRINGS = {
  zh: {
    docTitle: "老鼠赛跑",
    attract: "演示模式 · 第 47 周目",
    title: "老鼠赛跑",
    subtitle: "RAT RACE",
    tag: "注意力有限。和其他老鼠抢 X，把腮帮子塞满，别让喵兹警长在你发帖的时候逮到。",
    start: "投币开始",
    how: "怎么跑",
    soundOn: "声音开",
    soundOff: "声音关",
    langToggle: "ENGLISH",
    how1: "<kbd>WASD</kbd> / <kbd>↑←↓→</kbd> 跑 · <kbd>Shift</kbd> 冲刺",
    how2: "在 X 旁按住 <kbd>空格</kbd> / <kbd>E</kbd> 吃饲料",
    how3: "X 里的饲料就是倒计时。吃光后，饲料最多的老鼠获胜。",
    how4: "越吃越胖，越胖越慢。躲进垃圾箱、电视、冰箱后面。",
    how5: "被喵兹警长按住会掉饲料。别的老鼠会来抢。",
    how6: "<kbd>P</kbd> 暂停 · 要躲在障碍物背对猫的那一侧",
    credit: "一条关于发帖的湿漉漉寓言。内卷没有终点。",
    brand: "老鼠赛跑",
    brandSub: "内卷",
    feedLeft: "X 剩余饲料",
    yourPellets: "你的饲料",
    fatHungry: "饥饿",
    fatHeavy: "发福",
    fatStuffed: "撑了",
    statusLoose: "在逃",
    statusDetained: "被抓",
    statusHidden: "隐蔽",
    statusSpotted: "暴露",
    statusFeed: "正在投喂",
    hint: "WASD 移动 · SHIFT 冲刺 · 在 X 按住空格 · 躲进杂物后",
    dash: "冲刺",
    feed: "投喂",
    move: "移动",
    paused: "暂停",
    pauseBlurb: "时间线不等老鼠。猫会等。",
    resume: "继续",
    quit: "回标题",
    feedEmpty: "饲料见底",
    results: "结算",
    winYou: "你赢了这场老鼠赛",
    winOther: "{name} 吃光了热度",
    blurbYou: "注意力有限。你囤到了。猫还是知道你住哪。",
    blurbOther: "时间线翻篇了。别人发得更多。内卷没有终点。",
    fatPct: "{n}% 肥",
    again: "再跑一局",
    titleBack: "标题",
    toastStart: "X 开张了。注意力有限。",
    toastSpotted: "暴露 — 喵兹警长盯上你了",
    toastDrop: "被抓 — 掉了 {n} 颗饲料",
    toastEmpty: "被抓 — 没什么可抄的",
    "rat.you": "你",
    "rat.vex": "韦克斯",
    "rat.noodle": "面条",
    "rat.pivot": "转进",
    cat: "喵兹警长",
  },
  en: {
    docTitle: "RAT RACE — 老鼠赛跑",
    attract: "ATTRACT MODE · CYCLE 47",
    title: "RAT RACE",
    subtitle: "老鼠赛跑",
    tag: "Attention is finite. Race the other rats to the X, stuff your cheeks, and don't let Sgt. Meowz catch you posting.",
    start: "INSERT CREDIT",
    how: "HOW TO RUN",
    soundOn: "SOUND ON",
    soundOff: "SOUND OFF",
    langToggle: "中文",
    how1: "<kbd>WASD</kbd> / <kbd>↑←↓→</kbd> scurry · <kbd>Shift</kbd> dash",
    how2: "Hold <kbd>Space</kbd> / <kbd>E</kbd> at the X to eat pellets",
    how3: "Pellets in the X are the clock. When they run out, fattest feed wins.",
    how4: "Eating makes you slower. Hide behind dumpsters, TVs, fridges.",
    how5: "If Sgt. Meowz pins you, you drop pellets. Other rats will steal them.",
    how6: "<kbd>P</kbd> pause · hide on the far side of cover from the cat",
    credit: "A wet-street parable about posting. 内卷 never ends.",
    brand: "RAT RACE",
    brandSub: "内卷",
    feedLeft: "X FEED LEFT",
    yourPellets: "YOUR PELLETS",
    fatHungry: "HUNGRY",
    fatHeavy: "HEAVY",
    fatStuffed: "STUFFED",
    statusLoose: "LOOSE",
    statusDetained: "DETAINED",
    statusHidden: "HIDDEN",
    statusSpotted: "SPOTTED",
    statusFeed: "AT THE X",
    hint: "WASD move · SHIFT dash · HOLD SPACE at X · hide behind junk",
    dash: "DASH",
    feed: "FEED",
    move: "Move",
    paused: "PAUSED",
    pauseBlurb: "The timeline waits for no rat. The cat does.",
    resume: "RESUME",
    quit: "QUIT TO TITLE",
    feedEmpty: "FEED EMPTY",
    results: "RESULTS",
    winYou: "YOU WON THE RAT RACE",
    winOther: "{name} ATE THE FEED",
    blurbYou: "Limited attention. You hoarded it. The cat still knows where you live.",
    blurbOther: "The timeline moved on. Someone else posted more. 内卷 never ends.",
    fatPct: "{n}% fat",
    again: "RUN IT BACK",
    titleBack: "TITLE",
    toastStart: "THE X IS LIVE. ATTENTION IS FINITE.",
    toastSpotted: "SPOTTED — SGT. MEOWZ IS ON YOUR CASE",
    toastDrop: "DETAINED — DROPPED {n} PELLETS",
    toastEmpty: "DETAINED — NOTHING TO SEIZE",
    "rat.you": "YOU",
    "rat.vex": "VEX",
    "rat.noodle": "NOODLE",
    "rat.pivot": "PIVOT",
    cat: "SGT. MEOWZ",
  },
};

let current = "zh";

function readStored() {
  try {
    const v = globalThis.localStorage?.getItem(KEY);
    if (v === "en" || v === "zh") return v;
  } catch {
    /* ignore */
  }
  return "zh";
}

export function getLang() {
  return current;
}

export function t(key, vars) {
  const pack = STRINGS[current] || STRINGS.zh;
  let s = pack[key] ?? STRINGS.zh[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v));
    }
  }
  return s;
}

export function ratName(id) {
  return t(`rat.${id}`);
}

export function applyStatic() {
  const doc = globalThis.document;
  if (!doc) return;
  doc.documentElement.lang = current === "zh" ? "zh-Hans" : "en";
  if (doc.body) doc.body.dataset.lang = current;
  const title = doc.querySelector("title");
  if (title) title.textContent = t("docTitle");
  doc.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  doc.querySelectorAll("[data-i18n-html]").forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  doc.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  });
}

export function setLang(lang) {
  current = lang === "en" ? "en" : "zh";
  try {
    globalThis.localStorage?.setItem(KEY, current);
  } catch {
    /* ignore */
  }
  applyStatic();
  return current;
}

export function toggleLang() {
  return setLang(current === "zh" ? "en" : "zh");
}

export function initLang() {
  current = readStored();
  applyStatic();
  return current;
}
