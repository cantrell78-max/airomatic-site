/**
 * Go AI: capture/escape heuristics plus Monte-Carlo playouts on 9×9 / 13×13.
 * 19×19 uses a lighter local heuristic so the UI stays responsive.
 */
(function (global) {
  const GIC = (global.GIC = global.GIC || {});
  const EMPTY = 0;
  const BLACK = 1;
  const WHITE = 2;

  function neighbors(s, i) {
    const x = i % s;
    const y = (i / s) | 0;
    const out = [];
    if (x > 0) out.push(i - 1);
    if (x < s - 1) out.push(i + 1);
    if (y > 0) out.push(i - s);
    if (y < s - 1) out.push(i + s);
    return out;
  }

  function isTrueEye(board, s, i, color) {
    const nbs = neighbors(s, i);
    for (let k = 0; k < nbs.length; k++) {
      if (board[nbs[k]] !== color) return false;
    }
    const x = i % s;
    const y = (i / s) | 0;
    let diag = 0;
    let bad = 0;
    for (let dy = -1; dy <= 1; dy += 2) {
      for (let dx = -1; dx <= 1; dx += 2) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= s || ny >= s) continue;
        diag++;
        if (board[ny * s + nx] !== color) bad++;
      }
    }
    if (diag === 4) return bad <= 1;
    return bad === 0;
  }

  function groupLibs(board, s, start, scratch) {
    const color = board[start];
    const n = s * s;
    const stamp = (scratch.stamp = (scratch.stamp + 1) | 0) || (scratch.stamp = 1);
    if (!scratch.mark || scratch.mark.length !== n) scratch.mark = new Int32Array(n);
    if (!scratch.lmark || scratch.lmark.length !== n) scratch.lmark = new Int32Array(n);
    const mark = scratch.mark;
    const lmark = scratch.lmark;
    let stones = 0;
    let libs = 0;
    const stack = scratch.stack || (scratch.stack = []);
    stack.length = 0;
    stack.push(start);
    mark[start] = stamp;
    while (stack.length) {
      const i = stack.pop();
      stones++;
      const x = i % s;
      const y = (i / s) | 0;
      if (x > 0) visit(i - 1);
      if (x < s - 1) visit(i + 1);
      if (y > 0) visit(i - s);
      if (y < s - 1) visit(i + s);
    }
    function visit(nidx) {
      const v = board[nidx];
      if (v === 0) {
        if (lmark[nidx] !== stamp) {
          lmark[nidx] = stamp;
          libs++;
        }
      } else if (v === color && mark[nidx] !== stamp) {
        mark[nidx] = stamp;
        stack.push(nidx);
      }
    }
    return { stones: stones, libs: libs, stamp: stamp, mark: mark };
  }

  function tryPlay(state, i) {
    const board = state.board;
    const s = state.size;
    if (board[i] !== EMPTY) return false;
    if (i === state.ko) return false;
    const c = state.toPlay;
    const opp = c === BLACK ? WHITE : BLACK;
    board[i] = c;
    const nbs = neighbors(s, i);
    const captured = [];
    const seen = state.capSeen || (state.capSeen = new Int32Array(s * s));
    const stamp = (state.capStamp = (state.capStamp + 1) | 0) || (state.capStamp = 1);
    for (let k = 0; k < nbs.length; k++) {
      const n = nbs[k];
      if (board[n] !== opp) continue;
      const g = groupLibs(board, s, n, state);
      if (g.libs === 0) {
        // remove group: scan via mark
        for (let p = 0; p < board.length; p++) {
          if (g.mark[p] === g.stamp && board[p] === opp) {
            board[p] = EMPTY;
            captured.push(p);
          }
        }
      }
    }
    const own = groupLibs(board, s, i, state);
    if (own.libs === 0) {
      board[i] = EMPTY;
      for (let t = 0; t < captured.length; t++) board[captured[t]] = opp;
      return false;
    }
    let newKo = -1;
    if (captured.length === 1 && own.stones === 1 && own.libs === 1) {
      newKo = captured[0];
    }
    state.ko = newKo;
    state.toPlay = opp;
    state.passed = false;
    return { captured: captured.length, libs: own.libs, stones: own.stones };
  }

  function estimateArea(state) {
    const board = state.board;
    const s = state.size;
    const n = s * s;
    const vis = state.vis || (state.vis = new Uint8Array(n));
    vis.fill(0);
    let b = 0;
    let w = 0;
    for (let i = 0; i < n; i++) {
      if (board[i] === BLACK) b++;
      else if (board[i] === WHITE) w++;
    }
    const stack = state.estStack || (state.estStack = []);
    for (let i = 0; i < n; i++) {
      if (board[i] !== EMPTY || vis[i]) continue;
      stack.length = 0;
      stack.push(i);
      vis[i] = 1;
      let area = 0;
      let tb = false;
      let tw = false;
      while (stack.length) {
        const p = stack.pop();
        area++;
        const nbs = neighbors(s, p);
        for (let k = 0; k < nbs.length; k++) {
          const q = nbs[k];
          if (board[q] === BLACK) tb = true;
          else if (board[q] === WHITE) tw = true;
          else if (!vis[q]) {
            vis[q] = 1;
            stack.push(q);
          }
        }
      }
      if (tb && !tw) b += area;
      else if (tw && !tb) w += area;
    }
    return b - (w + state.komi);
  }

  function dist(s, a, b) {
    if (a < 0 || b < 0) return 99;
    const ax = a % s;
    const ay = (a / s) | 0;
    const bx = b % s;
    const by = (b / s) | 0;
    return Math.abs(ax - bx) + Math.abs(ay - by);
  }

  function lastMoveIndex(game) {
    if (!game.moves || !game.moves.length) return -1;
    const m = game.moves[game.moves.length - 1];
    if (!m || m.pass) return -1;
    return game.idx(m.x, m.y);
  }

  function heuristic(game, i) {
    const s = game.size;
    const board = game.board;
    const c = game.toPlay;
    const opp = c === BLACK ? WHITE : BLACK;
    const x = i % s;
    const y = (i / s) | 0;

    if (isTrueEye(board, s, i, c)) return -200;

    const state = {
      board: board.slice(),
      size: s,
      toPlay: c,
      ko: game.ko,
      komi: game.komi,
    };
    const res = tryPlay(state, i);
    if (!res) return -999;

    let h = 0;
    h += res.captured * 42;
    if (res.libs === 1 && res.captured === 0) h -= 36;
    if (res.libs === 2) h += 4;
    if (res.libs >= 4) h += 3;

    const nbs = neighbors(s, i);
    let ownN = 0;
    let oppN = 0;
    let emptyN = 0;
    for (let k = 0; k < nbs.length; k++) {
      const v = board[nbs[k]];
      if (v === c) ownN++;
      else if (v === opp) oppN++;
      else emptyN++;
    }
    h += ownN * 4.5;
    h += oppN * 3.2;

    // Save own atari / threaten opponent
    for (let k = 0; k < nbs.length; k++) {
      const n = nbs[k];
      if (board[n] === 0) continue;
      const g = game.groupAndLibs(n);
      if (board[n] === c && g.libs.length === 1) h += 28 + g.stones.length * 3;
      if (board[n] === opp && g.libs.length === 1) h += 18 + g.stones.length * 2;
      if (board[n] === opp && g.libs.length === 2) h += 6;
    }

    const last = lastMoveIndex(game);
    const d = dist(s, i, last);
    if (d < 6) h += (6 - d) * 2.4;

    const stones = game.stoneCount();
    const total = stones.black + stones.white;
    const opening = total < s * 1.4;

    if (opening) {
      const stars = game.starPoints();
      for (let t = 0; t < stars.length; t++) {
        if (stars[t][0] === x && stars[t][1] === y) h += 16;
      }
      // Prefer 3rd/4th line
      const line = Math.min(x + 1, y + 1, s - x, s - y);
      if (line === 3) h += 7;
      if (line === 4) h += 6;
      if (line === 2) h += 2;
      if (line === 1) h -= 8;
      if (game.isTengen(x, y) && s <= 13) h += 8;
    } else {
      const line = Math.min(x + 1, y + 1, s - x, s - y);
      if (line === 1 && emptyN >= 2) h -= 4;
    }

    // Empty triangle penalty
    if (ownN >= 2) {
      const x0 = x;
      const y0 = y;
      let et = 0;
      if (x0 > 0 && y0 > 0 && board[i - 1] === c && board[i - s] === c && board[i - 1 - s] !== c)
        et++;
      if (x0 < s - 1 && y0 > 0 && board[i + 1] === c && board[i - s] === c && board[i + 1 - s] !== c)
        et++;
      if (x0 > 0 && y0 < s - 1 && board[i - 1] === c && board[i + s] === c && board[i - 1 + s] !== c)
        et++;
      if (x0 < s - 1 && y0 < s - 1 && board[i + 1] === c && board[i + s] === c && board[i + 1 + s] !== c)
        et++;
      h -= et * 5;
    }

    return h;
  }

  function generateCandidates(game) {
    const s = game.size;
    const n = s * s;
    const set = new Set();
    const last = lastMoveIndex(game);

    function add(i) {
      if (i >= 0 && i < n && game.legalAt(i)) set.add(i);
    }

    if (last >= 0) {
      const lx = last % s;
      const ly = (last / s) | 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (dx === 0 && dy === 0) continue;
          const x = lx + dx;
          const y = ly + dy;
          if (x >= 0 && y >= 0 && x < s && y < s) add(y * s + x);
        }
      }
    }

    // Captures and atari responses anywhere
    const seen = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      if (!game.board[i] || seen[i]) continue;
      const g = game.groupAndLibs(i);
      for (let t = 0; t < g.stones.length; t++) seen[g.stones[t]] = 1;
      if (g.libs.length === 1) add(g.libs[0]);
      if (g.libs.length === 2) {
        add(g.libs[0]);
        add(g.libs[1]);
      }
    }

    if (game.moveNumber < s) {
      const stars = game.starPoints();
      for (let t = 0; t < stars.length; t++) add(game.idx(stars[t][0], stars[t][1]));
    }

    // Sparse scan of empty points with a neighbor
    const step = s >= 19 ? 2 : 1;
    for (let i = 0; i < n; i += step) {
      if (game.board[i] !== EMPTY) continue;
      const nbs = neighbors(s, i);
      let touch = false;
      for (let k = 0; k < nbs.length; k++) {
        if (game.board[nbs[k]]) {
          touch = true;
          break;
        }
      }
      if (touch) add(i);
    }

    if (set.size < 8) {
      for (let i = 0; i < n; i++) add(i);
    }

    return Array.from(set);
  }

  function randomLegal(state, scratch) {
    const board = state.board;
    const s = state.size;
    const n = board.length;
    const c = state.toPlay;
    const tries = Math.min(n, 28);
    for (let t = 0; t < tries; t++) {
      const i = (Math.random() * n) | 0;
      if (board[i] !== EMPTY) continue;
      if (i === state.ko) continue;
      if (isTrueEye(board, s, i, c)) continue;
      const savedKo = state.ko;
      const savedPlay = state.toPlay;
      const copyPoint = i;
      const res = tryPlay(state, i);
      if (res) return i;
      state.ko = savedKo;
      state.toPlay = savedPlay;
    }
    // linear fallback
    const start = (Math.random() * n) | 0;
    for (let k = 0; k < n; k++) {
      const i = (start + k) % n;
      if (board[i] !== EMPTY) continue;
      if (i === state.ko) continue;
      if (isTrueEye(board, s, i, c)) continue;
      const savedKo = state.ko;
      const savedPlay = state.toPlay;
      if (tryPlay(state, i)) return i;
      state.ko = savedKo;
      state.toPlay = savedPlay;
    }
    return -1;
  }

  function playoutFrom(game, firstMove, maxMoves) {
    const state = {
      board: game.board.slice(),
      size: game.size,
      toPlay: game.toPlay,
      ko: game.ko,
      komi: game.komi,
    };
    if (!tryPlay(state, firstMove)) return 0;
    let passes = 0;
    const cap = Math.min(maxMoves, game.size * game.size);
    for (let t = 0; t < cap && passes < 2; t++) {
      const mv = randomLegal(state);
      if (mv < 0) {
        state.toPlay = state.toPlay === BLACK ? WHITE : BLACK;
        state.ko = -1;
        passes++;
      } else {
        passes = 0;
      }
    }
    return estimateArea(state);
  }

  function chooseMove(game, opts) {
    opts = opts || {};
    const s = game.size;
    const legal = generateCandidates(game);
    if (!legal.length) return { pass: true };

    const scored = [];
    for (let t = 0; t < legal.length; t++) {
      const i = legal[t];
      const h = heuristic(game, i);
      if (h > -500) scored.push({ i: i, h: h });
    }
    if (!scored.length) return { pass: true };
    scored.sort(function (a, b) {
      return b.h - a.h;
    });

    // Late game: pass if best heuristic is meek and both passed-adjacent
    const stones = game.stoneCount();
    const fill = (stones.black + stones.white) / (s * s);
    if (fill > 0.72 && scored[0].h < 6) return { pass: true, reason: "end" };

    if (s >= 19 || opts.heuristicOnly) {
      // light noise so games vary
      let best = scored[0];
      const band = Math.max(3, best.h * 0.08);
      for (let t = 0; t < Math.min(6, scored.length); t++) {
        if (scored[t].h >= best.h - band && Math.random() < 0.28) best = scored[t];
      }
      const xy = game.xy(best.i);
      return { x: xy[0], y: xy[1], i: best.i, h: best.h };
    }

    const K = s === 9 ? 10 : 7;
    const N = opts.playouts || (s === 9 ? 36 : 14);
    const me = game.toPlay;
    let bestI = scored[0].i;
    let bestS = -Infinity;
    const top = scored.slice(0, K);
    for (let t = 0; t < top.length; t++) {
      let acc = 0;
      for (let p = 0; p < N; p++) {
        const area = playoutFrom(game, top[t].i, s * s);
        acc += me === BLACK ? area : -area;
      }
      const avg = acc / N + top[t].h * 0.12;
      if (avg > bestS) {
        bestS = avg;
        bestI = top[t].i;
      }
    }
    const xy = game.xy(bestI);
    return { x: xy[0], y: xy[1], i: bestI, score: bestS };
  }

  GIC.chooseMove = chooseMove;
  GIC._ai = {
    heuristic: heuristic,
    generateCandidates: generateCandidates,
    isTrueEye: isTrueEye,
  };
})(typeof window !== "undefined" ? window : globalThis);
