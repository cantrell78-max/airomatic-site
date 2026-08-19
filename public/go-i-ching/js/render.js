/**
 * Canvas renderer: wooden board, stones, coordinates, last-move, hints.
 */
(function (global) {
  const GIC = (global.GIC = global.GIC || {});

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function BoardView(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.hover = null;
    this.hint = null;
    this.pulse = 0;
    this.layout = { pad: 36, cell: 28, origin: 36, size: 9 };
    this._grain = null;
    const self = this;
    this._tick = function () {
      self.pulse += 0.04;
      if (self.hint) self.draw(self._lastGame, self._lastOpts);
      self._raf = requestAnimationFrame(self._tick);
    };
    this._raf = requestAnimationFrame(this._tick);
  }

  BoardView.prototype.resize = function () {
    const canvas = this.canvas;
    const parent = canvas.parentElement;
    const header = document.querySelector("header");
    const headerH = header ? header.getBoundingClientRect().height : 52;
    const vw = document.documentElement.clientWidth || window.innerWidth;
    const vh =
      (window.visualViewport && window.visualViewport.height) || window.innerHeight;
    const narrow = vw <= 760;

    let availW;
    let availH;
    if (narrow) {
      // Do not use the parent box: it is sized by the canvas and will
      // lock to the 640px HTML attributes on first paint.
      availW = vw - 16;
      availH = vh - headerH - 196;
    } else if (parent) {
      availW = parent.clientWidth;
      availH = parent.clientHeight;
      if (availH < 160) availH = vh - headerH - 24;
    } else {
      availW = vw;
      availH = vh - headerH;
    }

    const side = Math.max(180, Math.floor(Math.min(availW, availH) - 4));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.style.width = side + "px";
    canvas.style.height = side + "px";
    canvas.width = Math.round(side * dpr);
    canvas.height = Math.round(side * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.cssSize = side;
  };

  BoardView.prototype.compute = function (size) {
    const side = this.cssSize || 480;
    const pad = Math.max(28, Math.round(side * 0.078));
    const cell = (side - pad * 2) / (size - 1);
    this.layout = { pad: pad, cell: cell, origin: pad, size: size, side: side };
  };

  BoardView.prototype.xyToPoint = function (cssX, cssY) {
    const L = this.layout;
    const x = Math.round((cssX - L.origin) / L.cell);
    const y = Math.round((cssY - L.origin) / L.cell);
    if (x < 0 || y < 0 || x >= L.size || y >= L.size) return null;
    const px = L.origin + x * L.cell;
    const py = L.origin + y * L.cell;
    const dist = Math.hypot(cssX - px, cssY - py);
    if (dist > L.cell * 0.42) return null;
    return { x: x, y: y };
  };

  BoardView.prototype.eventToPoint = function (ev) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (ev.clientX - rect.left) * (this.cssSize / rect.width);
    const y = (ev.clientY - rect.top) * (this.cssSize / rect.height);
    return this.xyToPoint(x, y);
  };

  BoardView.prototype._wood = function (ctx, side, size) {
    const grd = ctx.createLinearGradient(0, 0, side, side);
    grd.addColorStop(0, "#d7b07a");
    grd.addColorStop(0.35, "#c9a06a");
    grd.addColorStop(0.7, "#d8b684");
    grd.addColorStop(1, "#c1965c");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, side, side);

    if (!this._grain || this._grain.size !== side) {
      const c = document.createElement("canvas");
      c.width = side;
      c.height = side;
      const g = c.getContext("2d");
      const rnd = mulberry32(size * 997 + 17);
      g.strokeStyle = "rgba(90, 50, 16, 0.045)";
      g.lineWidth = 1;
      for (let i = 0; i < side * 0.9; i++) {
        const y = rnd() * side;
        g.beginPath();
        g.moveTo(0, y);
        for (let x = 0; x <= side; x += 12) {
          g.lineTo(x, y + Math.sin(x * 0.04 + rnd() * 4) * 1.6);
        }
        g.stroke();
      }
      this._grain = { size: side, canvas: c };
    }
    ctx.drawImage(this._grain.canvas, 0, 0);

    ctx.strokeStyle = "rgba(70, 38, 10, 0.35)";
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, side - 3, side - 3);
    ctx.strokeStyle = "rgba(176, 130, 60, 0.45)";
    ctx.lineWidth = 1;
    ctx.strokeRect(6, 6, side - 12, side - 12);
  };

  BoardView.prototype._regionVeil = function (ctx, game, wisdom) {
    if (!wisdom) return;
    const L = this.layout;
    const s = game.size;
    const mid = (s - 1) / 2;
    const o = L.origin;
    const c = L.cell;
    const colors = {
      nw: "rgba(40, 50, 80, 0.045)",
      ne: "rgba(70, 70, 50, 0.05)",
      sw: "rgba(80, 60, 30, 0.05)",
      se: "rgba(40, 70, 50, 0.045)",
    };
    const half = mid * c;
    ctx.fillStyle = colors.nw;
    ctx.fillRect(o, o, half, half);
    ctx.fillStyle = colors.ne;
    ctx.fillRect(o + half, o, half, half);
    ctx.fillStyle = colors.sw;
    ctx.fillRect(o, o + half, half, half);
    ctx.fillStyle = colors.se;
    ctx.fillRect(o + half, o + half, half, half);
  };

  BoardView.prototype.draw = function (game, opts) {
    this._lastGame = game;
    this._lastOpts = opts || {};
    if (!game) return;
    opts = opts || {};
    const ctx = this.ctx;
    const size = game.size;
    this.compute(size);
    const L = this.layout;
    const side = L.side;
    ctx.clearRect(0, 0, side, side);
    this._wood(ctx, side, size);
    this._regionVeil(ctx, game, opts.wisdom);

    const o = L.origin;
    const cell = L.cell;

    ctx.strokeStyle = "rgba(42, 26, 10, 0.72)";
    ctx.lineWidth = size >= 19 ? 0.9 : 1.15;
    ctx.beginPath();
    for (let i = 0; i < size; i++) {
      const p = o + i * cell;
      ctx.moveTo(o, p);
      ctx.lineTo(o + (size - 1) * cell, p);
      ctx.moveTo(p, o);
      ctx.lineTo(p, o + (size - 1) * cell);
    }
    ctx.stroke();

    const stars = game.starPoints();
    ctx.fillStyle = "rgba(40, 22, 8, 0.85)";
    for (let t = 0; t < stars.length; t++) {
      const sx = o + stars[t][0] * cell;
      const sy = o + stars[t][1] * cell;
      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(2.2, cell * 0.09), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(62, 40, 18, 0.72)";
    ctx.font =
      Math.max(10, Math.round(cell * 0.32)) +
      "px 'Noto Serif SC', 'Songti SC', 'STSong', 'PMingLiU', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 0; i < size; i++) {
      const px = o + i * cell;
      const py = o + i * cell;
      const letter = GIC.COL_LETTERS[i];
      const num = String(size - i);
      ctx.fillText(letter, px, o - cell * 0.48);
      ctx.fillText(letter, px, o + (size - 1) * cell + cell * 0.48);
      ctx.fillText(num, o - cell * 0.48, py);
      ctx.fillText(num, o + (size - 1) * cell + cell * 0.48, py);
    }

    const r = cell * 0.46;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = game.idx(x, y);
        const c = game.board[i];
        if (!c) continue;
        this._stone(ctx, o + x * cell, o + y * cell, r, c, game.dead[i]);
      }
    }

    if (game.ko >= 0 && game.phase === "play") {
      const xy = game.xy(game.ko);
      ctx.strokeStyle = "rgba(140, 50, 40, 0.55)";
      ctx.lineWidth = 1.2;
      const kx = o + xy[0] * cell;
      const ky = o + xy[1] * cell;
      ctx.strokeRect(kx - r * 0.38, ky - r * 0.38, r * 0.76, r * 0.76);
    }

    const last = game.moves && game.moves.length ? game.moves[game.moves.length - 1] : null;
    if (last && !last.pass && game.phase !== "score") {
      const lx = o + last.x * cell;
      const ly = o + last.y * cell;
      ctx.beginPath();
      ctx.strokeStyle = last.color === GIC.BLACK ? "rgba(230, 210, 170, 0.95)" : "rgba(50, 24, 12, 0.9)";
      ctx.lineWidth = 2;
      ctx.arc(lx, ly, r * 0.34, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (this.hint && game.phase === "play") {
      const hx = o + this.hint.x * cell;
      const hy = o + this.hint.y * cell;
      const pr = r * (0.9 + Math.sin(this.pulse) * 0.12);
      ctx.beginPath();
      ctx.strokeStyle = "rgba(160, 40, 36, " + (0.45 + Math.sin(this.pulse) * 0.25) + ")";
      ctx.lineWidth = 2;
      ctx.arc(hx, hy, pr, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (this.hover && game.phase === "play" && game.legalAt(game.idx(this.hover.x, this.hover.y))) {
      const hx = o + this.hover.x * cell;
      const hy = o + this.hover.y * cell;
      ctx.globalAlpha = 0.38;
      this._stone(ctx, hx, hy, r, game.toPlay, 0);
      ctx.globalAlpha = 1;
    }

    if (game.phase === "score" || (game.phase === "done" && game.result && !game.resigned)) {
      ctx.fillStyle = "rgba(40, 24, 10, 0.06)";
      ctx.fillRect(0, 0, side, side);
    }
  };

  BoardView.prototype._stone = function (ctx, x, y, r, color, dead) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + r * 0.08, y + r * 0.12, r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(30, 16, 6, 0.28)";
    ctx.fill();

    const g = ctx.createRadialGradient(
      x - r * 0.32,
      y - r * 0.38,
      r * 0.05,
      x,
      y,
      r * 1.05
    );
    if (color === GIC.BLACK) {
      g.addColorStop(0, "#5a5a5e");
      g.addColorStop(0.35, "#2a2a2e");
      g.addColorStop(0.85, "#0c0c0e");
      g.addColorStop(1, "#050506");
    } else {
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.4, "#ece6da");
      g.addColorStop(0.82, "#d4cbb8");
      g.addColorStop(1, "#b9ad96");
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = color === GIC.BLACK ? "rgba(0,0,0,0.55)" : "rgba(80,60,40,0.35)";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(x - r * 0.28, y - r * 0.32, r * 0.22, r * 0.14, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = color === GIC.BLACK ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.7)";
    ctx.fill();

    if (dead) {
      ctx.beginPath();
      ctx.strokeStyle = color === GIC.BLACK ? "rgba(220,80,70,0.9)" : "rgba(160,30,28,0.85)";
      ctx.lineWidth = 2;
      const d = r * 0.45;
      ctx.moveTo(x - d, y - d);
      ctx.lineTo(x + d, y + d);
      ctx.moveTo(x + d, y - d);
      ctx.lineTo(x - d, y + d);
      ctx.stroke();
    }
    ctx.restore();
  };

  GIC.BoardView = BoardView;
})(typeof window !== "undefined" ? window : globalThis);
