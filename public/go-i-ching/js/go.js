/**
 * Go / Weiqi engine: placement, capture, suicide, simple ko,
 * Chinese area scoring, SGF, and serialization.
 */
(function (global) {
  const GIC = (global.GIC = global.GIC || {});

  const EMPTY = 0;
  const BLACK = 1;
  const WHITE = 2;

  GIC.EMPTY = EMPTY;
  GIC.BLACK = BLACK;
  GIC.WHITE = WHITE;
  GIC.opp = function (c) {
    return c === BLACK ? WHITE : BLACK;
  };

  const COL_LETTERS = "ABCDEFGHJKLMNOPQRST";

  function starPointsFor(size) {
    if (size === 9) return [[2, 2], [2, 6], [6, 2], [6, 6], [4, 4]];
    if (size === 13) return [[3, 3], [3, 9], [9, 3], [9, 9], [6, 6]];
    if (size === 19) {
      return [
        [3, 3], [3, 9], [3, 15],
        [9, 3], [9, 9], [9, 15],
        [15, 3], [15, 9], [15, 15],
      ];
    }
    const t = (size / 2) | 0;
    return [[t, t]];
  }

  function GoGame(opts) {
    opts = opts || {};
    this.size = opts.size || 9;
    this.komi = opts.komi != null ? opts.komi : 7.5;
    this.reset();
  }

  GoGame.prototype.reset = function () {
    const n = this.size * this.size;
    this.board = new Int8Array(n);
    this.toPlay = BLACK;
    this.ko = -1;
    this.captures = { 1: 0, 2: 0 };
    this.moves = [];
    this.history = [];
    this.passedLast = false;
    this.over = false;
    this.resigned = 0;
    this.phase = "play";
    this.dead = new Uint8Array(n);
    this.result = null;
    this.moveNumber = 0;
  };

  GoGame.prototype.idx = function (x, y) {
    return y * this.size + x;
  };

  GoGame.prototype.xy = function (i) {
    return [i % this.size, (i / this.size) | 0];
  };

  GoGame.prototype.inb = function (x, y) {
    return x >= 0 && y >= 0 && x < this.size && y < this.size;
  };

  GoGame.prototype.neighbors = function (i) {
    const s = this.size;
    const x = i % s;
    const y = (i / s) | 0;
    const out = [];
    if (x > 0) out.push(i - 1);
    if (x < s - 1) out.push(i + 1);
    if (y > 0) out.push(i - s);
    if (y < s - 1) out.push(i + s);
    return out;
  };

  GoGame.prototype.snapshot = function () {
    return {
      board: this.board.slice(),
      toPlay: this.toPlay,
      ko: this.ko,
      captures: { 1: this.captures[1], 2: this.captures[2] },
      passedLast: this.passedLast,
      moveNumber: this.moveNumber,
    };
  };

  GoGame.prototype.restore = function (s) {
    this.board.set(s.board);
    this.toPlay = s.toPlay;
    this.ko = s.ko;
    this.captures = { 1: s.captures[1], 2: s.captures[2] };
    this.passedLast = s.passedLast;
    this.moveNumber = s.moveNumber;
    this.over = false;
    this.resigned = 0;
    this.phase = "play";
    this.result = null;
    this.dead.fill(0);
  };

  GoGame.prototype.groupAndLibs = function (start) {
    const color = this.board[start];
    if (!color) return { stones: [], libs: [] };
    const stones = [];
    const libs = [];
    const seenS = new Set();
    const seenL = new Set();
    const stack = [start];
    seenS.add(start);
    while (stack.length) {
      const i = stack.pop();
      stones.push(i);
      const nbs = this.neighbors(i);
      for (let k = 0; k < nbs.length; k++) {
        const n = nbs[k];
        const v = this.board[n];
        if (v === 0) {
          if (!seenL.has(n)) {
            seenL.add(n);
            libs.push(n);
          }
        } else if (v === color && !seenS.has(n)) {
          seenS.add(n);
          stack.push(n);
        }
      }
    }
    return { stones: stones, libs: libs };
  };

  GoGame.prototype.legalAt = function (i, color) {
    if (this.phase !== "play" || this.over) return false;
    if (i < 0 || i >= this.board.length) return false;
    if (this.board[i] !== EMPTY) return false;
    if (i === this.ko) return false;
    const c = color || this.toPlay;
    const opp = c === BLACK ? WHITE : BLACK;
    this.board[i] = c;
    let captured = 0;
    const nbs = this.neighbors(i);
    const checked = new Set();
    for (let k = 0; k < nbs.length; k++) {
      const n = nbs[k];
      if (this.board[n] === opp && !checked.has(n)) {
        const g = this.groupAndLibs(n);
        for (let t = 0; t < g.stones.length; t++) checked.add(g.stones[t]);
        if (g.libs.length === 0) captured += g.stones.length;
      }
    }
    let suicide = false;
    if (captured === 0) {
      const own = this.groupAndLibs(i);
      if (own.libs.length === 0) suicide = true;
    }
    this.board[i] = EMPTY;
    return !suicide;
  };

  GoGame.prototype.play = function (x, y, color) {
    if (this.phase !== "play" || this.over) return { ok: false, reason: "over" };
    const c = color || this.toPlay;
    if (!this.inb(x, y)) return { ok: false, reason: "oob" };
    const i = this.idx(x, y);
    if (this.board[i] !== EMPTY) return { ok: false, reason: "occupied" };
    if (i === this.ko) return { ok: false, reason: "ko" };

    const snap = this.history ? this.snapshot() : null;
    this.board[i] = c;
    const opp = c === BLACK ? WHITE : BLACK;
    const captured = [];
    const nbs = this.neighbors(i);
    const seen = new Set();
    for (let k = 0; k < nbs.length; k++) {
      const n = nbs[k];
      if (this.board[n] === opp && !seen.has(n)) {
        const g = this.groupAndLibs(n);
        for (let t = 0; t < g.stones.length; t++) seen.add(g.stones[t]);
        if (g.libs.length === 0) {
          for (let t = 0; t < g.stones.length; t++) {
            this.board[g.stones[t]] = EMPTY;
            captured.push(g.stones[t]);
          }
        }
      }
    }

    const own = this.groupAndLibs(i);
    if (own.libs.length === 0) {
      this.board[i] = EMPTY;
      return { ok: false, reason: "suicide" };
    }

    let newKo = -1;
    if (captured.length === 1 && own.stones.length === 1 && own.libs.length === 1) {
      newKo = captured[0];
    }

    this.captures[c] += captured.length;
    this.ko = newKo;
    this.toPlay = opp;
    this.passedLast = false;
    this.moveNumber++;
    const move = { x: x, y: y, color: c, captured: captured, ko: newKo, pass: false };
    if (this.moves) this.moves.push(move);
    if (this.history && snap) this.history.push(snap);

    let event = "play";
    if (captured.length) event = "capture";
    const region = this.regionOf(x, y);
    if (region === "center" && this.isTengen(x, y)) event = captured.length ? "capture" : "tengen";

    return {
      ok: true,
      x: x,
      y: y,
      i: i,
      color: c,
      captured: captured,
      event: event,
      ko: newKo,
      region: region,
      libs: own.libs.length,
      groupSize: own.stones.length,
    };
  };

  GoGame.prototype.playIndex = function (i, color) {
    const xy = this.xy(i);
    return this.play(xy[0], xy[1], color);
  };

  GoGame.prototype.pass = function (color) {
    if (this.phase !== "play" || this.over) return { ok: false, reason: "over" };
    const c = color || this.toPlay;
    const snap = this.history ? this.snapshot() : null;
    const ended = this.passedLast;
    this.ko = -1;
    this.toPlay = c === BLACK ? WHITE : BLACK;
    this.moveNumber++;
    const move = { x: -1, y: -1, color: c, captured: [], ko: -1, pass: true };
    if (this.moves) this.moves.push(move);
    if (this.history && snap) this.history.push(snap);
    if (ended) {
      this.phase = "score";
      return { ok: true, pass: true, event: "end", color: c };
    }
    this.passedLast = true;
    return { ok: true, pass: true, event: "pass", color: c };
  };

  GoGame.prototype.resign = function (color) {
    const c = color || this.toPlay;
    this.over = true;
    this.phase = "done";
    this.resigned = c;
    this.result = {
      winner: c === BLACK ? WHITE : BLACK,
      resigned: c,
      blackScore: null,
      whiteScore: null,
    };
    return { ok: true, event: "resign", color: c };
  };

  GoGame.prototype.undo = function () {
    if (!this.history || !this.history.length) return false;
    const s = this.history.pop();
    if (this.moves) this.moves.pop();
    this.restore(s);
    return true;
  };

  GoGame.prototype.toggleDead = function (x, y) {
    if (this.phase !== "score" && this.phase !== "done") return false;
    if (this.phase === "done") {
      this.phase = "score";
      this.over = false;
    }
    if (!this.inb(x, y)) return false;
    const i = this.idx(x, y);
    if (this.board[i] === EMPTY) return false;
    const g = this.groupAndLibs(i);
    const mark = this.dead[i] ? 0 : 1;
    for (let t = 0; t < g.stones.length; t++) this.dead[g.stones[t]] = mark;
    return true;
  };

  GoGame.prototype.clearDead = function () {
    this.dead.fill(0);
  };

  GoGame.prototype.score = function () {
    const s = this.size;
    const n = s * s;
    const temp = this.board.slice();
    let deadB = 0;
    let deadW = 0;
    for (let i = 0; i < n; i++) {
      if (this.dead[i]) {
        if (temp[i] === BLACK) deadB++;
        if (temp[i] === WHITE) deadW++;
        temp[i] = EMPTY;
      }
    }
    const vis = new Uint8Array(n);
    let terrB = 0;
    let terrW = 0;
    let dame = 0;
    let stonesB = 0;
    let stonesW = 0;
    for (let i = 0; i < n; i++) {
      if (temp[i] === BLACK) stonesB++;
      else if (temp[i] === WHITE) stonesW++;
    }
    for (let i = 0; i < n; i++) {
      if (temp[i] !== EMPTY || vis[i]) continue;
      const stack = [i];
      let area = 0;
      let touchB = false;
      let touchW = false;
      vis[i] = 1;
      while (stack.length) {
        const p = stack.pop();
        area++;
        const nbs = this.neighbors(p);
        for (let k = 0; k < nbs.length; k++) {
          const q = nbs[k];
          if (temp[q] === BLACK) touchB = true;
          else if (temp[q] === WHITE) touchW = true;
          else if (!vis[q]) {
            vis[q] = 1;
            stack.push(q);
          }
        }
      }
      if (touchB && !touchW) terrB += area;
      else if (touchW && !touchB) terrW += area;
      else dame += area;
    }
    const blackScore = stonesB + terrB;
    const whiteScore = stonesW + terrW + this.komi;
    let winner = 0;
    if (blackScore > whiteScore) winner = BLACK;
    else if (whiteScore > blackScore) winner = WHITE;
    this.result = {
      blackScore: blackScore,
      whiteScore: whiteScore,
      terrB: terrB,
      terrW: terrW,
      stonesB: stonesB,
      stonesW: stonesW,
      dame: dame,
      deadB: deadB,
      deadW: deadW,
      komi: this.komi,
      winner: winner,
      captures: { 1: this.captures[1], 2: this.captures[2] },
    };
    this.over = true;
    this.phase = "done";
    return this.result;
  };

  GoGame.prototype.cloneLight = function () {
    const g = new GoGame({ size: this.size, komi: this.komi });
    g.board.set(this.board);
    g.toPlay = this.toPlay;
    g.ko = this.ko;
    g.captures[1] = this.captures[1];
    g.captures[2] = this.captures[2];
    g.passedLast = this.passedLast;
    g.history = null;
    g.moves = null;
    return g;
  };

  GoGame.prototype.listLegal = function (color) {
    const out = [];
    const c = color || this.toPlay;
    for (let i = 0; i < this.board.length; i++) {
      if (this.legalAt(i, c)) out.push(i);
    }
    return out;
  };

  GoGame.prototype.isTengen = function (x, y) {
    const t = (this.size / 2) | 0;
    return x === t && y === t;
  };

  GoGame.prototype.regionOf = function (x, y) {
    const s = this.size;
    const cx = (s - 1) / 2;
    const cy = (s - 1) / 2;
    const dc = Math.max(Math.abs(x - cx), Math.abs(y - cy));
    if (dc <= s * 0.18) return "center";
    const left = x < s / 2;
    const top = y < s / 2;
    if (top && left) return "nw";
    if (top && !left) return "ne";
    if (!top && left) return "sw";
    return "se";
  };

  GoGame.prototype.starPoints = function () {
    return starPointsFor(this.size);
  };

  GoGame.prototype.coordName = function (x, y) {
    return COL_LETTERS[x] + String(this.size - y);
  };

  GoGame.prototype.stoneCount = function () {
    let b = 0;
    let w = 0;
    for (let i = 0; i < this.board.length; i++) {
      if (this.board[i] === BLACK) b++;
      else if (this.board[i] === WHITE) w++;
    }
    return { black: b, white: w };
  };

  GoGame.prototype.analyze = function () {
    const s = this.size;
    const counts = this.stoneCount();
    const regions = {
      nw: { b: 0, w: 0 },
      ne: { b: 0, w: 0 },
      sw: { b: 0, w: 0 },
      se: { b: 0, w: 0 },
      center: { b: 0, w: 0 },
    };
    const seen = new Uint8Array(this.board.length);
    const groups = [];
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const i = this.idx(x, y);
        const c = this.board[i];
        if (!c) continue;
        const r = this.regionOf(x, y);
        if (c === BLACK) regions[r].b++;
        else regions[r].w++;
        if (!seen[i]) {
          const g = this.groupAndLibs(i);
          for (let t = 0; t < g.stones.length; t++) seen[g.stones[t]] = 1;
          groups.push({
            color: c,
            size: g.stones.length,
            libs: g.libs.length,
          });
        }
      }
    }
    const total = counts.black + counts.white;
    const density = total / (s * s);
    let phase = "opening";
    if (density > 0.42) phase = "end";
    else if (density > 0.16) phase = "middle";

    let libB = 0;
    let libW = 0;
    let nB = 0;
    let nW = 0;
    let weakB = 0;
    let weakW = 0;
    for (let t = 0; t < groups.length; t++) {
      const g = groups[t];
      if (g.color === BLACK) {
        libB += g.libs;
        nB++;
        if (g.libs <= 2) weakB++;
      } else {
        libW += g.libs;
        nW++;
        if (g.libs <= 2) weakW++;
      }
    }
    const lastCap = [];
    if (this.moves && this.moves.length) {
      for (let t = this.moves.length - 1; t >= 0 && t >= this.moves.length - 6; t--) {
        if (this.moves[t].captured && this.moves[t].captured.length) {
          lastCap.push(this.moves[t].captured.length);
        }
      }
    }
    const capRecent = lastCap.reduce(function (a, b) {
      return a + b;
    }, 0);

    return {
      black: counts.black,
      white: counts.white,
      regions: regions,
      phase: phase,
      density: density,
      groups: groups,
      avgLibsB: nB ? libB / nB : 0,
      avgLibsW: nW ? libW / nW : 0,
      weakB: weakB,
      weakW: weakW,
      captures: { 1: this.captures[1], 2: this.captures[2] },
      capRecent: capRecent,
      moveNumber: this.moveNumber,
      lastMove: this.moves && this.moves.length ? this.moves[this.moves.length - 1] : null,
    };
  };

  GoGame.prototype.toSGF = function () {
    const sz = this.size;
    const letters = "abcdefghijklmnopqrstuvwxyz";
    let sgf = "(;FF[4]GM[1]SZ[" + sz + "]KM[" + this.komi + "]AP[Go I Ching:1.0]";
    if (this.moves) {
      for (let t = 0; t < this.moves.length; t++) {
        const m = this.moves[t];
        const col = m.color === BLACK ? "B" : "W";
        if (m.pass) sgf += ";" + col + "[]";
        else sgf += ";" + col + "[" + letters[m.x] + letters[m.y] + "]";
      }
    }
    sgf += ")";
    return sgf;
  };

  GoGame.prototype.serialize = function (meta) {
    return {
      version: 1,
      size: this.size,
      komi: this.komi,
      moves: this.moves,
      phase: this.phase,
      dead: Array.from(this.dead),
      resigned: this.resigned,
      result: this.result,
      meta: meta || {},
    };
  };

  GoGame.fromSerialized = function (data) {
    const g = new GoGame({ size: data.size, komi: data.komi });
    const moves = data.moves || [];
    for (let t = 0; t < moves.length; t++) {
      const m = moves[t];
      if (m.pass) g.pass(m.color);
      else g.play(m.x, m.y, m.color);
      if (g.phase === "score") break;
    }
    if (data.dead && data.dead.length === g.dead.length) {
      g.dead = new Uint8Array(data.dead);
    }
    if (data.phase === "score" || data.phase === "done") {
      g.phase = data.phase === "done" && data.result ? "done" : "score";
    }
    if (data.resigned) {
      g.resign(data.resigned);
    }
    if (data.result && g.phase === "done") g.result = data.result;
    return g;
  };

  GIC.GoGame = GoGame;
  GIC.COL_LETTERS = COL_LETTERS;
  GIC.starPointsFor = starPointsFor;
})(typeof window !== "undefined" ? window : globalThis);
