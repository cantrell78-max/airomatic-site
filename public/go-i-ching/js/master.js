/**
 * Elder Yi: commentary, oracle mapping, tutorial, end-of-game reading.
 */
(function (global) {
  const GIC = (global.GIC = global.GIC || {});

  const REGION_WISDOM = {
    nw: {
      en: "The northwest is Heaven — Qián. Play here as one sets a ridge-beam: high, clear, and not cluttered.",
      zh: "西北為乾天。落子如架梁：宜高、宜清、不宜雜。",
    },
    ne: {
      en: "The northeast is Mountain — Gèn. Stillness and a firm base. A stone here should know how to stop.",
      zh: "東北為艮山。止而有據。此處之子，當知止。",
    },
    sw: {
      en: "The southwest is Earth — Kūn. Wide, receiving, patient. Territory grows here as millet in a field.",
      zh: "西南為坤地。廣、容、耐。此地如禾，徐徐成畝。",
    },
    se: {
      en: "The southeast is Wind — Xùn. Enter the gaps; do not strike the wall. Penetration, not collision.",
      zh: "東南為巽風。循隙而入，勿擊其牆。是入，非撞。",
    },
    center: {
      en: "The center is Taiji — the uncarved pivot. A stone on tengen speaks to all four quarters at once.",
      zh: "中央為太極，未鑿之樞。天元一子，四面皆聞。",
    },
  };

  const WISDOM_ASIDES = [
    {
      en: "Black is yang in motion, white is yin in rest — yet either color may yield, and either may be firm. The names are conveniences.",
      zh: "黑為陽動，白為陰靜——然黑亦可柔，白亦可剛。名不過方便。",
    },
    {
      en: "Empty points are not absence. They are the unborn ten thousand things. Guard space as you would guard a stone.",
      zh: "空點非無。乃未生之萬物。護空如護子。",
    },
    {
      en: "A living group needs two eyes — two emptinesses that cannot both be filled. Life is a pair of hollows.",
      zh: "活棋須兩眼——兩處不可同填之空。生，是一對虛。",
    },
    {
      en: "The soft conquers the hard as water shapes the mountain. A light stone on the outside can contain a thick wall.",
      zh: "柔能克剛，如水成山。外側一輕子，可包一厚牆。",
    },
    {
      en: "Do not stare only at the last stone. The Way is the whole board, as a hexagram is six lines read together.",
      zh: "勿只盯前一手。道在全盤，如一卦六爻同讀。",
    },
    {
      en: "Timing is everything: the same cut is Sheng in one month and Guài in another. Ask what season the board is in.",
      zh: "時為至要：同一斷，或為升，或為夬。當問盤中何季。",
    },
    {
      en: "Thickness is virtue stored. Spend it to take the large, not to prove you can kill the small.",
      zh: "厚是蓄德。用以取大，勿用以證能殺小。",
    },
    {
      en: "Ko is the Book of Changes in miniature: a point that may not return until the world around it has changed.",
      zh: "劫是易之縮影：一點不得即復，除非四周已變。",
    },
  ];

  function pick(arr) {
    return arr[(Math.random() * arr.length) | 0];
  }

  function hexName(h) {
    if (!h) return "";
    if (GIC.lang === "zh") return h.n + ". " + h.zh + " " + h.py;
    return h.n + ". " + h.zh + " " + h.en;
  }

  function scoreHexagrams(a) {
    const scores = new Array(65).fill(0);
    function add(n, w) {
      scores[n] += w;
    }

    if (a.phase === "opening") {
      add(3, 4);
      add(4, 3);
      add(19, 4);
      add(20, 4);
      add(46, 3);
      add(53, 3);
    } else if (a.phase === "middle") {
      add(11, 3);
      add(16, 2);
      add(32, 2);
      add(35, 3);
      add(44, 3);
      add(64, 2);
    } else {
      add(15, 3);
      add(52, 3);
      add(60, 3);
      add(63, 4);
      add(64, 3);
    }

    const tot = a.black + a.white || 1;
    const ratio = a.black / tot;
    if (Math.abs(ratio - 0.5) < 0.08) {
      add(11, 4);
      add(61, 4);
      add(2, 2);
    } else {
      add(12, 3);
      add(23, 3);
      add(36, 2);
    }

    if (a.capRecent >= 2) {
      add(21, 5);
      add(49, 4);
      add(6, 3);
      add(40, 3);
    } else if (a.captures[1] + a.captures[2] > 0 && a.phase !== "opening") {
      add(7, 2);
      add(40, 2);
    }

    if (a.weakB + a.weakW >= 3) {
      add(29, 4);
      add(47, 3);
      add(51, 3);
      add(39, 2);
    }

    const thickB = a.avgLibsB >= 4;
    const thickW = a.avgLibsW >= 4;
    if (thickB || thickW) {
      add(26, 3);
      add(1, 2);
      add(34, 2);
      add(50, 2);
    }
    if (a.avgLibsB > 0 && a.avgLibsB < 2.6) add(28, 3);
    if (a.avgLibsW > 0 && a.avgLibsW < 2.6) add(18, 2);

    const r = a.regions;
    const centerDom = r.center.b + r.center.w;
    if (centerDom >= Math.max(2, (a.black + a.white) * 0.18)) {
      add(1, 3);
      add(61, 4);
      add(13, 2);
    }

    let cornerSkew = 0;
    ["nw", "ne", "sw", "se"].forEach(function (k) {
      const d = Math.abs(r[k].b - r[k].w);
      if (r[k].b + r[k].w >= 2 && d >= 2) cornerSkew++;
    });
    if (cornerSkew >= 3) {
      add(38, 3);
      add(12, 2);
      add(56, 2);
    }

    if (a.lastMove && a.lastMove.region === "center") add(1, 2);
    if (a.phase === "opening" && a.moveNumber <= 4) add(3, 2);

    // slight breath so repeats are not mechanical
    for (let n = 1; n <= 64; n++) scores[n] += Math.random() * 0.35;

    const ranked = [];
    for (let n = 1; n <= 64; n++) ranked.push({ n: n, s: scores[n] });
    ranked.sort(function (x, y) {
      return y.s - x.s;
    });
    return ranked;
  }

  function interpret(h, a) {
    const name = hexName(h);
    const g = GIC.txt(h.go);
    const j = GIC.txt(h.judgment);
    const phase =
      a.phase === "opening"
        ? GIC.lang === "zh"
          ? "布局如春"
          : "the opening is spring"
        : a.phase === "middle"
          ? GIC.lang === "zh"
            ? "中盤如夏"
            : "the middle game is summer"
          : GIC.lang === "zh"
            ? "官子如秋"
            : "the endgame is autumn";

    if (GIC.lang === "zh") {
      return (
        "此局與「" +
        name +
        "」相應。\n\n" +
        j +
        "\n\n" +
        g +
        "\n\n" +
        "眼下" +
        phase +
        "。黑子 " +
        a.black +
        "，白子 " +
        a.white +
        "。把卦辭還給眼前這盤活棋，不要交給書冊。"
      );
    }
    return (
      "This position resonates with " +
      name +
      ".\n\n" +
      j +
      "\n\n" +
      g +
      "\n\n" +
      "Just now " +
      phase +
      ". Black stones " +
      a.black +
      ", white " +
      a.white +
      ". Return the hexagram to the living board; do not leave it in a book."
    );
  }

  function commentaryFor(game, ev, wisdom) {
    const a = game.analyze();
    const lines = [];

    if (ev && ev.event === "capture") {
      const n = ev.captured ? ev.captured.length : 1;
      if (n >= 3) {
        lines.push(
          GIC.lang === "zh"
            ? "大提如「革」。命已改，當治，勿再燒澤。"
            : "A large capture is Gé — Revolution. The mandate has changed. Govern now; do not keep burning the lake."
        );
      } else {
        lines.push(
          GIC.lang === "zh"
            ? "提子是「噬嗑」：梗去則路通。數清氣，再看全盤是否仍平。"
            : "A capture is Shì Kè — biting through. When the obstruction is gone, see whether the whole board is still even."
        );
      }
    } else if (ev && ev.event === "tengen") {
      lines.push(GIC.txt(REGION_WISDOM.center));
    } else if (ev && ev.event === "pass") {
      lines.push(
        GIC.lang === "zh"
          ? "停著也是一著。止，有時比行更近於道。"
          : "A pass is also a move. Stillness is sometimes nearer the Way than action."
      );
    } else if (ev && ev.region && ev.event === "play") {
      if (wisdom && Math.random() < 0.55) lines.push(GIC.txt(REGION_WISDOM[ev.region]));
    }

    if (!lines.length) {
      const ranked = scoreHexagrams(a);
      const h = GIC.hexByNumber(ranked[0].n);
      if (GIC.lang === "zh") {
        lines.push(
          "棋勢近於「" +
            h.zh +
            "」——" +
            h.go.zh +
            (wisdom ? "\n\n" + pick(WISDOM_ASIDES).zh : "")
        );
      } else {
        lines.push(
          "The position leans toward " +
            h.zh +
            " " +
            h.en +
            ". " +
            h.go.en +
            (wisdom ? "\n\n" + pick(WISDOM_ASIDES).en : "")
        );
      }
    } else if (wisdom && Math.random() < 0.5) {
      lines.push(GIC.txt(pick(WISDOM_ASIDES)));
    }

    return lines.join("\n\n");
  }

  function openingSpeech() {
    if (GIC.lang === "zh") {
      return "坐。黑白未落，太極未分。你下一子，陰陽始生。棋盤是一部活的易，我只是旁邊讀卦的老人。";
    }
    return "Sit. Before a stone is placed, Taiji is undivided. Your first stone parts yin from yang. The board is a living Book of Changes; I am only the old man reading beside it.";
  }

  function endReading(game) {
    const a = game.analyze();
    const r = game.result || {};
    const ranked = scoreHexagrams(a);
    const h1 = GIC.hexByNumber(ranked[0].n);
    const h2 = GIC.hexByNumber(ranked[1].n);
    const winner =
      r.resigned != null && r.resigned
        ? r.winner === GIC.BLACK
          ? GIC.lang === "zh"
            ? "白投子，黑勝。"
            : "White resigned; Black prevails."
          : GIC.lang === "zh"
            ? "黑投子，白勝。"
            : "Black resigned; White prevails."
        : r.winner === GIC.BLACK
          ? GIC.lang === "zh"
            ? "黑以 " + r.blackScore + " 對白 " + r.whiteScore + " 而勝。"
            : "Black wins, " + r.blackScore + " to White's " + r.whiteScore + "."
          : r.winner === GIC.WHITE
            ? GIC.lang === "zh"
              ? "白以 " + r.whiteScore + " 對黑 " + r.blackScore + " 而勝。"
              : "White wins, " + r.whiteScore + " to Black's " + r.blackScore + "."
            : GIC.lang === "zh"
              ? "子空相等，暫歸於靜。"
              : "The areas rest equal. A rare stillness.";

    const style =
      a.capRecent + a.captures[1] + a.captures[2] >= 6
        ? GIC.lang === "zh"
          ? "此局多戰，如雷火交作。"
          : "This contest was a meeting of thunder and fire."
        : a.phase === "end" && a.weakB + a.weakW <= 1
          ? GIC.lang === "zh"
            ? "此局重勢與空，如地之載物。"
            : "This contest favored influence and earth — the slow carrying of territory."
          : GIC.lang === "zh"
            ? "此局剛柔相濟，未偏一端。"
            : "This contest kept firmness and yielding in conversation.";

    if (GIC.lang === "zh") {
      return (
        winner +
        "\n\n終局之卦，首應「" +
        hexName(h1) +
        "」，次應「" +
        hexName(h2) +
        "」。\n\n" +
        h1.go.zh +
        "\n\n" +
        style +
        "勝負是一季之果；你在盤上學到的變，才是明年的種子。\n\n" +
        "收子。茶還熱。"
      );
    }
    return (
      winner +
      "\n\nThe finished board first resonates with " +
      hexName(h1) +
      ", and then with " +
      hexName(h2) +
      ".\n\n" +
      h1.go.en +
      "\n\n" +
      style +
      " Winning is one season's fruit; the change you learned on the board is next year's seed.\n\n" +
      "Gather the stones. The tea is still warm."
    );
  }

  const TUTORIAL = [
    {
      id: "welcome",
      wait: "continue",
      setup: function () {},
      speech: {
        en: "Welcome. I am Elder Yi. Weiqi and the Yijing are two faces of one Way. Black and white are yin and yang; the empty points are what has not yet become. We will walk slowly.",
        zh: "來。我是易翁。圍棋與周易，一道之兩面。黑白為陰陽，空點為未成。我們慢慢走。",
      },
    },
    {
      id: "place",
      wait: "place-any",
      setup: function () {},
      speech: {
        en: "Place your first black stone on any intersection — not inside a square, but where the lines meet. That crossing is a moment of change.",
        zh: "把第一顆黑子放在任何交叉點上——不是方格之內，而是線與線相會之處。那一交，便是變。",
      },
    },
    {
      id: "liberties",
      wait: "continue",
      setup: function (game) {
        // leave the player's stone; add a white reply nearby if empty
      },
      speech: {
        en: "A stone breathes through its liberties: the empty crossings beside it. Four at the center, three on the side, two in the corner. When the last breath is taken, the stone is lifted.",
        zh: "子以氣而活：旁邊的空交叉點。中央四氣，邊上三氣，角上兩氣。氣盡則提。",
      },
    },
    {
      id: "capture-setup",
      wait: "place-hint",
      hint: function (game) {
        return { x: 4, y: 5 };
      },
      setup: function (game) {
        game.reset();
        // White stone at 3-4 (index 2,4 on 9x9) with three liberties filled
        // Board coords: place a capture puzzle
        // W at (4,4), B at (3,4),(5,4),(4,3) — player takes (4,5)
        game.board[game.idx(4, 4)] = GIC.WHITE;
        game.board[game.idx(3, 4)] = GIC.BLACK;
        game.board[game.idx(5, 4)] = GIC.BLACK;
        game.board[game.idx(4, 3)] = GIC.BLACK;
        game.toPlay = GIC.BLACK;
        game.moveNumber = 4;
      },
      speech: {
        en: "Here a white stone has one breath left. Place on the marked point and take it. This is capture — the soft surrounding the hard.",
        zh: "這一顆白子只剩一氣。落在標記之處，提之。這便是提子——柔圍剛。",
      },
    },
    {
      id: "ko",
      wait: "continue",
      setup: function () {},
      speech: {
        en: "Sometimes a single captured stone could be recaptured at once, forever. The ko rule forbids that instant return. Change something elsewhere, then you may come back. Even a fight must breathe.",
        zh: "有時一子之提，可以立刻回提，循環不息。劫禁立刻復還。先在別處一變，然後可回。即便是戰，也要呼吸。",
      },
    },
    {
      id: "territory",
      wait: "continue",
      setup: function () {},
      speech: {
        en: "When the stones have settled, we count by the Chinese way: your living stones plus the empty points they enclose. Komi of 7.5 is given to White, for Black spoke first. Empty space that you have made safe is as real as a stone.",
        zh: "子定之後，以中國子空之法計：己之活子，加所圍之空。白得貼目七目半，因黑先言。你守住的空，與子同等真實。",
      },
    },
    {
      id: "done",
      wait: "continue",
      setup: function () {},
      speech: {
        en: "Pass when you see nothing larger to do; two passes end the game. You may ask me at any time, or open the hexagram library. Wisdom Mode lets me speak more often. Now — shall we play?",
        zh: "別無可為則停著；兩次停著即終局。隨時可問我，或開卦象典藏。悟道模式裡，我說得更勤。現在——可以對弈了。",
      },
    },
  ];

  GIC.Master = {
    REGION_WISDOM: REGION_WISDOM,
    WISDOM_ASIDES: WISDOM_ASIDES,
    TUTORIAL: TUTORIAL,
    openingSpeech: openingSpeech,
    commentaryFor: commentaryFor,
    interpret: interpret,
    scoreHexagrams: scoreHexagrams,
    endReading: endReading,
    hexName: hexName,
    consult: function (game) {
      const a = game.analyze();
      const ranked = scoreHexagrams(a);
      const h = GIC.hexByNumber(ranked[0].n);
      const h2 = GIC.hexByNumber(ranked[1].n);
      return {
        primary: h,
        secondary: h2,
        analysis: a,
        text: interpret(h, a),
      };
    },
    regionRemark: function (region) {
      return GIC.txt(REGION_WISDOM[region]);
    },
  };
})(typeof window !== "undefined" ? window : globalThis);
