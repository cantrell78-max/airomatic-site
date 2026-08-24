/**
 * Extra chapter scenes — Zero-to-One Fellowship Intensive, Chinatown remittance, I Ching / wu wei.
 * Loaded via getScene() in scenarios.js.
 */

function isMale(s) {
  return s.character?.gender === "male";
}

export const EXTRA_SCENES = {
  // ─── Arc 1: Zero-to-One Fellowship Intensive ───────────────
  fellowship_arrive: {
    id: "fellowship_arrive",
    title: "Zero-to-One Fellowship House",
    locationId: "fellowship-house",
    text: (s) => {
      if (s.flags.fellowshipCompleted) {
        return (
          `Same townhouse. Same ficus that has never met the Tenderloin. ` +
          `The whiteboard still says **CHEMISTRY MEETINGS (REQUIRED)** in a handwriting that is trying not to look thirsty.\n\n` +
          (s.flags.seriesAWired
            ? `Your Mercury already knows a Series A-shaped number. Alumni energy. Someone left a thank-you note that is also a vibe.\n\n`
            : `You kept the spine. The intensive still happened. The wire did not. The ficus is non-dilutive.\n\n`) +
          `Reed may be on a call about "founder-market fit." You may leave whenever the myth is done using you.`
        );
      }
      return (
        `The pin says **Atherton-adjacent**, which is Peninsula for "we employ a gardener who has opinions about your hoodie."\n\n` +
        `Brick townhouse. Cedar. A bookshelf of **Zero to One** — multiple copies, some annotated, one that appears to have been… cherished. ` +
        `A printed schedule, tastefully kerned:\n\n` +
        `**ZERO-TO-ONE FELLOWSHIP INTENSIVE**\n` +
        `(spiritually adjacent to every off-record dinner you've heard about)\n\n` +
        `• 10:00  Monopoly thesis breakfast\n` +
        `• 14:00  Chemistry meetings *(required)*\n` +
        `• 18:00  Alignment walks — towels in the guesthouse\n` +
        `• 21:00  Deeper engagement / founder-friendly process\n\n` +
        `You finished **The Round**. The term sheet is still weather.` +
        (s.flags.seriesAWired
          ? ` Somehow a wire already landed — you're here as alumni, myth maintenance, or Reed's victory lap.\n\n`
          : ` No Series A wire yet. That's the joke. Someone in Thiel-orbit decided you need a week of "filter" before anyone actually sends money.\n\n`) +
        `A fellow in a suspiciously new hoodie waves. The air smells like incentive alignment and eucalyptus, which you've smelled before.`
      );
    },
    choices: [
      {
        text: "Go inside. Meet the fellows. Pretend the curriculum is about monopolies.",
        require: (st) =>
          st.flags.fellowshipCompleted ? "Intensive already complete — use the hub" : true,
        effects: { flags: { fellowshipStarted: true, fellowshipUnlocked: true }, clout: 2 },
        effects: { flags: { fellowshipStarted: true, fellowshipUnlocked: true } },
        messages: [
          {
            npcId: "thiel",
            text: "Reed will run the intensive. Think of it as diligence with better lighting. Zero to one is not a slogan. Show up. — PT",
            unlock: true,
          },
        ],
        next: "fellowship_mixer",
      },
      {
        text: "Fellowship hub — you already know where the towels live.",
        require: (st) =>
          st.flags.fellowshipStarted || st.flags.fellowshipCompleted
            ? true
            : "Walk in first",
        next: "fellowship_hub",
      },
      {
        text: "This is a date with a reading list. Uber home.",
        effects: { locationId: "tenderloin" },
        next: "home_hub",
      },
      {
        text: "Map.",
        next: null,
      },
    ],
  },

  fellowship_mixer: {
    id: "fellowship_mixer",
    title: "Fellows & Fellows",
    locationId: "fellowship-house",
    text: (s) =>
      `Wine that costs a junior SWE's rent. Name tags with no companies, only **theses**.\n\n` +
      `**Cassian**, 19, dropped out of a real school to "coordinate atoms." He has a hoodie from a program that *does* exist and is very clear this one is "more founder-native."\n\n` +
      `**Sable** does climate and polycules and cap tables, in that order. She whispers, "The chemistry meetings are the product. The monopoly stuff is onboarding."\n\n` +
      `**Nico** already looks fundraised. He asks if you've "done heat" with Garry. ` +
      (s.flags.metGarry
        ? `You have. Nico nods like a man checking a reference.`
        : `You have not. Nico looks sorry for your un-mentored body.`) +
      `\n\nA whiteboard in the kitchen: **Curriculum = proximity.** Someone drew a towel. Someone else drew a term sheet that is also a heart.\n\n` +
      `"Office hours with **Reed Holt** at two," Cassian says. "He's the partner who actually *likes* founders. That's the warning."`,
    choices: [
      {
        text: "Network like it's diligence. Drink like it's optional (it isn't).",
        effects: {
          clout: 3,
          engagement: 4,
          flags: { fellowshipStarted: true, fellowshipMixerDone: true },
        },
        next: "fellowship_hours",
      },
      {
        text: "Ask Sable what 'chemistry meeting' means, legally.",
        effects: {
          clout: 2,
          flags: { fellowshipStarted: true, fellowshipMixerDone: true, askedChemistryLegal: true },
        },
        next: "fellowship_hours",
      },
      {
        text: "Bail to the porch. Still in the house's gravity.",
        hint: "You can resume from the hub.",
        effects: { flags: { fellowshipStarted: true } },
        next: "fellowship_hub",
      },
    ],
  },

  fellowship_hours: {
    id: "fellowship_hours",
    title: "Office Hours — Reed Holt",
    locationId: "fellowship-house",
    text: (s) =>
      `**Reed Holt.** Forties. Linen that cost a seed. Warm eyes that have closed many rounds and opened many robes (allegedly). ` +
      `Gay VC, Peninsula vintage: mentorship as a contact sport, never crude enough for a screenshot, always close enough for a story.\n\n` +
      `The office is a sitting room. One bottle. Two glasses. Palantir-adjacent art that is either a joke or a threat.\n\n` +
      (isMale(s)
        ? `"${s.character.name}." He says your name like a valuation. "Jordan's notes said technical. Garry's said… warm. I prefer to do my own diligence."\n\n` +
          `He slides water across the table. The glass sweats. The room is already a chemistry meeting.\n\n` +
          `"I don't need the deck. I need to know if you can *stay in the room* when the process gets founder-friendly." A pause, fond and a little sharp. "The sauna is amateur hour. This is the professional product."\n\n`
        : `"${s.character.name}." He smiles like a SAFE. "Peter likes monopolies. I like people who can sit in a room until the room blinks. You're here for the thesis — and because the intensive is a dating app with a cap table."\n\n` +
          `"I don't date my founders," he adds, a sentence that has never been true in this ZIP code. "I date their *potential*." Water. Eye contact that is technically about TAM.\n\n` +
          `"The last module is optional on paper. In this house, paper is a love language."\n\n`) +
      `He offers a robe on a hook. "If you overheat. Entirely your call. Boundaries are attractive. So is follow-through."`,
    choices: [
      {
        text: "Stay in the room. Take the robe 'for later.' Ask about the wire.",
        effects: {
          clout: 4,
          shameless: 1,
          flags: { fellowshipHoursDone: true, metReed: true },
        },
        messages: [
          {
            npcId: "reed",
            text: (st) =>
              isMale(st)
                ? "enjoyed hours. you have founder-market fit. alignment walk at dusk — phones off, towels on-site. I like people who don't flinch. — Reed 🥂"
                : "enjoyed hours. your steel reads. dusk walk, phones off. the intensive is politics; I'll keep it founder-friendly. — Reed 🥂",
            unlock: true,
          },
        ],
        next: "fellowship_walk",
      },
      {
        text: "Keep the chair, lose the robe. \"Wire first. Chemistry as a metaphor.\"",
        effects: {
          clout: 3,
          flags: { fellowshipHoursDone: true, metReed: true, reedBoundaries: true },
        },
        messages: [
          {
            npcId: "reed",
            text: "metaphor is a spectrum. walk anyway — exclusive diligence loves fresh air. I'll behave. mostly. — Reed 🥂",
            unlock: true,
          },
        ],
        next: "fellowship_walk",
      },
      {
        text: "Cut hours short. Hub. Breathe.",
        effects: { flags: { metReed: true } },
        next: "fellowship_hub",
      },
    ],
  },

  fellowship_walk: {
    id: "fellowship_walk",
    title: "Alignment Walk",
    locationId: "fellowship-house",
    text: (s) =>
      `Dusk on a Peninsula block that has never hosted a mattress. Phones in a bowl by the door — "presence." Reed walks like a man who owns the lighting.\n\n` +
      `"Alignment," he says, "is chemistry with a legal memo. Exclusive diligence. Open-kimono is a metaphor until it isn't."\n\n` +
      `He asks if Garry already onboarded you. ` +
      (s.flags.metGarry
        ? `"Cute," he says. "Amateur heat. We can work with that."`
        : `"Fresh," he says. "I like being first to a round. Of whatever."`) +
      `\n\nThe guesthouse glows. Two robes on a peg. A speaker queued to something tasteful. On the table: a DISCUSSION DRAFT that might be a term sheet or a playlist titled **deeper engagement**.\n\n` +
      `"Last module is optional," Reed says, which is how this ZIP code says *this is the close*. "Play along and Peter stops calling it weather. Keep your towel and we still like you — we just like you *slower*."\n\n` +
      `Nobody is locking the door. That's the whole ethics deck.`,
    choices: [
      {
        text: "Walk to the guesthouse door. The last module is a choice.",
        effects: { flags: { fellowshipWalkDone: true }, clout: 2 },
        next: "fellowship_choice",
      },
      {
        text: "Turn around at the hedge. Hub. Still invited, still clothed.",
        effects: { flags: { fellowshipWalkDone: true } },
        next: "fellowship_hub",
      },
    ],
  },

  fellowship_choice: {
    id: "fellowship_choice",
    title: "Last Module",
    locationId: "fellowship-house",
    text: (s) =>
      s.flags.fellowshipCompleted
        ? `The guesthouse is just a guesthouse again. You already picked a module. The robes are laundry now.`
        : `Low light. Two robes. The DISCUSSION DRAFT has a signature line and, beneath it, nothing you would put in a board deck.\n\n` +
          `Reed doesn't touch you. He pours. He waits. Warm predatory mentorship in its final form: **the process is the pitch, you are the round.**\n\n` +
          (isMale(s)
            ? `"Stay," he says. "Founder-friendly. We'll talk monopolies until talking is no longer the main sacrament. Tomorrow the wire stops being a metaphor."\n\n`
            : `"Stay," he says. "Not because you're my type — because the house tests who sells 'alignment' and who keeps a spine. Play the politics and Peter wires. Or don't. Both are founder-native."\n\n`) +
          `This is not a sex scene. This is San Francisco's least original close: towels, chemistry, exclusive diligence, fade to black.\n\n` +
          `You can put out (the social kind). Or you can keep the towel and keep striving.`,
    choices: [
      {
        text: "Play along. Stay for the last module. Put out (innuendo only, fade to black).",
        hint: "Series A-shaped wire. Reed + Thiel texts.",
        require: (st) =>
          st.flags.fellowshipCompleted ? "Module already closed" : true,
        effects: {
          cash: 250000,
          clout: 12,
          followers: 180,
          shameless: 2,
          day: 1,
          flags: {
            fellowshipCompleted: true,
            fellowshipStarted: true,
            seriesAWired: true,
            fellowshipPutOut: true,
          },
        },
        messages: [
          {
            npcId: "reed",
            text: "last module was… thorough. founder-market fit confirmed. I told Peter the chemistry cleared. towel's yours if you want a souvenir. — Reed 🥂",
            unlock: true,
          },
          {
            npcId: "thiel",
            text: "Reed says the intensive completed. Unusual founders finish the homework. The wire is not a gift. It's a monopoly down payment. Don't become a lifestyle business. — PT",
            unlock: true,
          },
        ],
        next: "fellowship_wire",
      },
      {
        text: "Keep the towel. Keep the spine. Mentorship without the mentorship.",
        hint: "No wire. Clout. Garry will be unhelpful.",
        require: (st) =>
          st.flags.fellowshipCompleted
            ? "Module already closed"
            : st.flags.metPrema
              ? "See the Prema-flavored decline"
              : true,
        effects: {
          clout: 8,
          day: 1,
          flags: {
            fellowshipCompleted: true,
            fellowshipStarted: true,
            keptBoundaries: true,
            fellowshipDeclined: true,
          },
        },
        messages: [
          {
            npcId: "garry",
            text: "you left heat on the table. respect. also: the round still likes people who stay for dessert. towels remain optional. the money doesn't. — G",
            unlock: true,
          },
        ],
        next: "fellowship_strive",
      },
      {
        text: "Keep boundaries. Prema would call this a carrot with a robe.",
        hint: "Decline + Prema text.",
        require: (st) =>
          st.flags.fellowshipCompleted
            ? "Module already closed"
            : st.flags.metPrema
              ? true
              : "Meet Prema first",
        effects: {
          clout: 9,
          day: 1,
          flags: {
            fellowshipCompleted: true,
            fellowshipStarted: true,
            keptBoundaries: true,
            fellowshipDeclined: true,
          },
        },
        messages: [
          {
            npcId: "garry",
            text: "you left heat on the table. respect. also: I told you the heat wasn't only sauna. — G",
            unlock: true,
          },
          {
            npcId: "prema",
            text: (st) =>
              st.flags.heardWuWei
                ? "Wu wei does not mean put out. The carrot was never the fellowship. You kept the spine. Hare Krishna. — Prema 🕉️"
                : "The carrot was never the fellowship. You kept the spine. Fruitive labor can wait. Don't become the stick. — Prema Das 🕉️",
            unlock: true,
          },
        ],
        next: "fellowship_strive",
      },
      {
        text: "Not tonight. Back to hub — last module still on the peg.",
        require: (st) =>
          st.flags.fellowshipCompleted ? "Already chose" : true,
        next: "fellowship_hub",
      },
    ],
  },

  fellowship_wire: {
    id: "fellowship_wire",
    title: "The Wire (Not Weather)",
    locationId: "fellowship-house",
    text: (s) =>
      `Morning. The guesthouse is just architecture. Reed is already on a call saying **"the founder is aligned"** like a medical condition.\n\n` +
      `Your phone detonates.\n\n` +
      `**Mercury:** inbound ACH that is not a vibe. Zane's automation writes "CONGRATS ON THE CLOSE 🚀" in a font that has seen things. ` +
      `Avery forwards a calendar block named **SERIES A (REAL??)** with seventeen exclamation points and a request for "post-diligence snacks."\n\n` +
      `Cash: **$${s.cash.toLocaleString()}**.\n\n` +
      `The DISCUSSION DRAFT is now slightly less drafty. Thiel's text sits in your phone like a chess piece. Reed left the towel folded — souvenir or evidence.\n\n` +
      `You "put out" in the only way this circuit means it: you stayed in the room. The money noticed.\n\n` +
      `Product still vapor. Monopoly still homework. The intensive will look great in a myth and terrible in a memoir.`,
    choices: [
      {
        text: "Post a tasteful 'we closed' that names no towels.",
        effects: { followers: 220, engagement: 25, clout: 4 },
        post: {
          text: "small update: series a. grateful for the intensive, the believers, and everyone who called it weather. building. (no further questions.)",
          likes: 900,
          reposts: 200,
        },
        next: "fellowship_hub",
      },
      {
        text: "Don't post. Take the wire home like a secret.",
        effects: { clout: 3, locationId: "tenderloin" },
        next: "home_hub",
      },
      {
        text: "Map — the Bay just got more expensive.",
        next: null,
      },
    ],
  },

  fellowship_strive: {
    id: "fellowship_strive",
    title: "Still Striving",
    locationId: "fellowship-house",
    text: (s) =>
      `You leave the guesthouse with your towel and your spine. Reed watches like a man who has lost rounds and still raised funds.\n\n` +
      `"We'll be here," he says. "Weather continues. So do I." It is almost kind.\n\n` +
      `Cassian looks confused. Sable gives you a nod that means *respect, also you're broke*. The ficus does not care.\n\n` +
      `No wire. **The Round** stays a climate system. You are still inevitable, still undercapitalized, still not a robe on a peg.\n\n` +
      (s.flags.metPrema
        ? `Somewhere, Prema is smug in a holy way. The carrot remains a carrot.\n\n`
        : ``) +
      `Cash: **$${s.cash.toLocaleString()}**. Clout, oddly, up — integrity is a brand while it lasts.\n\n` +
      `Garry's text will not help. That's the point of Garry.`,
    choices: [
      {
        text: "Post 'still building' like a monk with a growth account.",
        effects: { followers: 40, engagement: 8, clout: 2 },
        post: {
          text: "did an intensive. kept the towel. still striving. the market will clear or it won't. either way I have a spine 🧠",
          likes: 120,
          reposts: 30,
        },
        next: "fellowship_hub",
      },
      {
        text: "Home. Mattress. The honest cap table.",
        effects: { locationId: "tenderloin" },
        next: "home_hub",
      },
      {
        text: "Map.",
        next: null,
      },
    ],
  },

  fellowship_hub: {
    id: "fellowship_hub",
    title: "Fellowship House — After Hours",
    locationId: "fellowship-house",
    text: (s) => {
      let weather = `Peninsula light. The ficus judges no one and therefore judges everyone.\n\n`;
      if (s.flags.seriesAWired) {
        weather += `**Series A:** wired. Mercury looks like a company. Reed looks like a man who collected a rare card.\n\n`;
      } else if (s.flags.fellowshipDeclined) {
        weather += `**Intensive:** completed without the last sacrament. Weather continues. Spine intact.\n\n`;
      } else if (s.flags.fellowshipWalkDone) {
        weather += `Last module still on the peg. Reed still pours. The close is still a choice.\n\n`;
      } else if (s.flags.fellowshipStarted) {
        weather += `You're mid-curriculum. Chemistry is on the calendar whether you are or not.\n\n`;
      } else {
        weather += `The intensive is available. So is leaving.\n\n`;
      }
      return weather + `Cash: **$${s.cash.toLocaleString()}**.`;
    },
    choices: [
      {
        text: "Resume: mixer / fellows.",
        require: (st) =>
          st.flags.fellowshipCompleted
            ? "Already graduated (allegedly)"
            : !st.flags.fellowshipMixerDone
              ? true
              : "Already mixed",
        effects: { flags: { fellowshipStarted: true } },
        next: "fellowship_mixer",
      },
      {
        text: "Resume: office hours with Reed.",
        require: (st) =>
          st.flags.fellowshipCompleted
            ? "Already graduated (allegedly)"
            : st.flags.fellowshipMixerDone && !st.flags.fellowshipHoursDone
              ? true
              : "Not this beat",
        next: "fellowship_hours",
      },
      {
        text: "Resume: alignment walk.",
        require: (st) =>
          st.flags.fellowshipCompleted
            ? "Already graduated (allegedly)"
            : st.flags.fellowshipHoursDone && !st.flags.fellowshipWalkDone
              ? true
              : "Not this beat",
        next: "fellowship_walk",
      },
      {
        text: "Resume: last module (the close).",
        require: (st) =>
          st.flags.fellowshipCompleted
            ? "Already chose"
            : st.flags.fellowshipWalkDone
              ? true
              : "Walk first",
        next: "fellowship_choice",
      },
      {
        text: "Flex the wire. Mention Series A like weather that landed.",
        require: (st) =>
          st.flags.seriesAWired ? true : "Need the actual wire first",
        effects: { followers: 30, clout: 2, engagement: 6 },
        post: {
          text: "zero to one is a house, a homework, and (turns out) an ACH. shipping anyway.",
          likes: 200,
          reposts: 40,
        },
        next: "fellowship_hub",
      },
      {
        text: "Sit with the still-striving. Integrity is a short runway.",
        require: (st) =>
          st.flags.fellowshipDeclined ? true : "You didn't take that path",
        effects: { clout: 1 },
        next: "fellowship_hub",
      },
      {
        text: "Home.",
        effects: { locationId: "tenderloin" },
        next: "home_hub",
      },
      {
        text: "Map.",
        next: null,
      },
    ],
  },

  // ─── Arc 2: Chinatown remittance (中文 default + Translate) ─
  chinatown_arrive: {
    id: "chinatown_arrive",
    title: "Chinatown — Golden Gate Digital Remit",
    titleZh: "唐人街 — 金门数码汇",
    locationId: "chinatown",
    text: (s) =>
      `Grant Ave. Red lanterns arguing with a vape shop that used to be a bank. Between a bakery and jade that is definitely plastic: **金门数码汇** — Golden Gate Digital Remit.\n\n` +
      `Window display: phone cases, SIM cards, a faded printout **0冻结 · 百分百赔付** that lost a war with a thermal printer. Handwritten: 汇款 / USDT / 维修. A grandma buys a Lightning cable. A cousin argues about spread.\n\n` +
      (s.flags.chinatownRemitDone
        ? `You've already sent Wei his U. The lucky cat still waves. The debt of cash is quieter; the debt of favors is not.\n\n`
        : s.flags.oweWei
          ? `Wei named a number. Shenzhen does not take Mercury "vibes checking." This shop is the joke rail: phone cases in front, **链上** whispers in back.\n\n`
          : `You don't strictly owe a wire yet. The shop does not care. It sells cases either way.\n\n`) +
      `Your Mercury card has tourist face. The doorway beads click like a tiny cap table.`,
    textZh: (s) =>
      `格兰特街。红灯笼和一家曾经是银行的电子烟店对打。面包店和塑料玉器中间：**金门数码汇**。\n\n` +
      `橱窗：手机壳、电话卡、一张褪色的「**0冻结 · 百分百赔付**」——热敏纸，像打输了。手写：汇款 / USDT / 维修。有人的奶奶在买充电线。有人的表弟在吵点差。\n\n` +
      (s.flags.chinatownRemitDone
        ? `你已经给魏发过 U。招财猫还在挥手。现金的债安静了一点，人情的债没有。\n\n`
        : s.flags.oweWei
          ? `魏报过数。深圳不收 Mercury 的「vibes checking」。这家店就是那条笑话轨道：前面卖壳，后面**链上**耳语。\n\n`
          : `你还没严格欠一笔汇款。店不在乎。壳照卖。\n\n`) +
      `你的 Mercury 卡一副游客脸。门帘珠子响，像一张很小的 cap table。`,
    choices: [
      {
        text: "Go to the counter. Meet whoever runs the U.",
        textZh: "去柜台。见管 U 的人。",
        effects: { flags: { visitedChinatown: true } },
        next: "chinatown_counter",
      },
      {
        text: "Hub — you already know the lucky cat.",
        textZh: "回店内枢纽——你已经认识招财猫了。",
        require: (st) =>
          st.flags.visitedChinatown ? true : "Walk in first",
        effects: { flags: { visitedChinatown: true } },
        next: "chinatown_hub",
      },
      {
        text: "Not today. Wei's number can wait (it can't).",
        textZh: "今天算了。魏的数字可以再等（并不能）。",
        effects: { flags: { visitedChinatown: true }, locationId: "tenderloin" },
        next: "home_hub",
      },
    ],
  },

  chinatown_counter: {
    id: "chinatown_counter",
    title: "Ah Ming — Counter",
    titleZh: "阿明 — 柜台",
    locationId: "chinatown",
    text:
      `**阿明 / Ah Ming** — street-smart, SF Cantonese-Mandarin stack, one AirPod in, WeChat in the other hand, a smile that has priced fear.\n\n` +
      `"创始人?" He clocks the Patagonia or the hoodie or the way you hold a phone like it's a board seat. "Wei sent a sticker. You're the indebted one."\n\n` +
      `Behind him: a wall of phone cases, a CRT playing something that might be soccer, and a second screen with candles and numbers that are definitely not Bloomberg.\n\n` +
      `"This is not a bank. This is not Binance. This is not your Mercury AE." He taps a laminated slogan: **0冻结 · C2C · 商家在线**. "This is a *shop*. You want U to Shenzhen. I speak shop."\n\n` +
      `A tourist asks for a charger. Ming sells the charger without breaking the TED talk. Competence.`,
    textZh:
      `**阿明**——街上长大的那种聪明，粤语普通话来回切，一只耳朵 AirPods，另一只手微信，笑起来像给恐惧报过价。\n\n` +
      `「创始人？」他一眼 Patagonia 或帽衫，或你拿手机的姿势像在开董事会。「魏发了个表情。你就是那个欠债的。」\n\n` +
      `他身后：一面墙的手机壳，一台像在放足球的 CRT，第二块屏上是 K 线和数字，肯定不是彭博。\n\n` +
      `「这不是银行。不是币安。也不是你的 Mercury 客户经理。」他敲一张塑封标语：**0冻结 · C2C · 商家在线**。「这是店。你要 U 去深圳。我讲店话。」\n\n` +
      `有游客要充电器。阿明一边卖一边把演讲讲完。专业。`,
    choices: [
      {
        text: "Yes. Wei. USDT. Please pretend I understand.",
        textZh: "对。魏。USDT。请假装我懂。",
        effects: { flags: { visitedChinatown: true, metAhMing: true } },
        next: "chinatown_usdt",
      },
      {
        text: "Ask if they take the Mercury card. (They will not.)",
        textZh: "问收不收 Mercury 卡。（不收。）",
        effects: {
          flags: { visitedChinatown: true, metAhMing: true, askedMercuryAtMing: true },
          shameless: 1,
        },
        next: "chinatown_usdt",
      },
      {
        text: "Browse phone cases. Bail to hub without paying.",
        textZh: "逛手机壳。回店里，先不汇。",
        effects: { flags: { visitedChinatown: true, metAhMing: true } },
        next: "chinatown_hub",
      },
    ],
  },

  chinatown_usdt: {
    id: "chinatown_usdt",
    title: "USDT Settlement (Not a Tutorial)",
    titleZh: "USDT 结算（不是教程）",
    locationId: "chinatown",
    text: (s) =>
      `Ming turns a screen so you can see a cartoon Golden Gate wearing sunglasses. The UI is a fever dream of **C2C / OTC / 商家** — Huobi-OTC energy as interior design.\n\n` +
      `"Wei wants **U**. Tether. The dollar that isn't a dollar, the rail that isn't a bank. 商家 lock a spread. You pay a spread. The spread *is* the product."\n\n` +
      (s.flags.askedMercuryAtMing
        ? `"Your Mercury card." He laughs with his whole chest. "ACH religion. Partner banks. 'Vibes checking.' Wei would rather eat a SIM card. We don't tap. We *settle*."\n\n`
        : `"If you say 'just ACH it' I will sell you a case and a philosophy."\n\n`) +
      `He points at a tiny PRC flag sticker, then X's it out. "数字人民币. Digital yuan. Cute central-bank toy. **Wrong rail.** Wei rejects e-CNY like it's a term sheet from a tourist. Don't even mime it."\n\n` +
      `Slogans blink: **0冻结** · **秒放** · **口令红包不是红包**. A lucky cat waves at a QR that looks like Alipay's cousin after a long night.\n\n` +
      `This is not how-to. This is a shop that sells cases and a myth. The myth costs cash.`,
    textZh: (s) =>
      `阿明把屏幕转过来：卡通金门大桥戴墨镜。界面是一场 **C2C / OTC / 商家** 的热梦——火币 OTC 那种审美当装修。\n\n` +
      `「魏要的是 **U**。泰达。不是美元的美元，不是银行的轨。商家吃点差。你付点差。点差*就是*产品。」\n\n` +
      (s.flags.askedMercuryAtMing
        ? `「你的 Mercury 卡。」他笑出声。「ACH 宗教。合作银行。『vibes checking』。魏宁可吞一张电话卡。我们不刷。我们*结算*。」\n\n`
        : `「你要是说『直接 ACH』，我就卖你一个壳加一套哲学。」\n\n`) +
      `他指了指一枚小小的国旗贴纸，又打了个叉。「数字人民币。央行玩具。**错轨。** 魏拒收 e-CNY，像拒收游客的 term sheet。连比划都别。」\n\n` +
      `标语在闪：**0冻结** · **秒放** · **口令红包不是红包**。招财猫对着一个长得很像支付宝表亲的二维码挥手。\n\n` +
      `这不是教程。这是卖壳的店，外加一个神话。神话收现金。`,
    choices: [
      {
        text: "Fine. USDT. Shop-settlement. Show me the surreal next step.",
        textZh: "行。USDT。店内结算。看下一场超现实。",
        effects: { flags: { chinatownUsdtDone: true } },
        next: "chinatown_kouling",
      },
      {
        text: "Try the digital yuan anyway. How wrong can a rail be?",
        textZh: "还是试试数字人民币。一条轨能错到哪去？",
        effects: { flags: { triedDigitalYuan: true, chinatownUsdtDone: true } },
        messages: [
          {
            npcId: "wei",
            text: "数字人民币？错轨。要 U。别用央行的玩具还我人情。— 魏 🔧",
            unlock: true,
          },
        ],
        next: "chinatown_kouling",
      },
      {
        text: "This is too much shop. Hub. Don't pay yet.",
        textZh: "店味太冲。回枢纽。先不付钱。",
        next: "chinatown_hub",
      },
    ],
  },

  chinatown_kouling: {
    id: "chinatown_kouling",
    title: "口令 — Strawberry Seed Round",
    titleZh: "口令 — 草莓种子轮",
    locationId: "chinatown",
    text: (s) =>
      (s.flags.triedDigitalYuan
        ? `Ming does not say "I told you so." He sells you a phone case with a tiny e-CNY tombstone printed on it (limited drop). Wei already texted. Wrong rail.\n\n`
        : ``) +
      `He generates a QR that looks like Alipay if Alipay had a fever. The app name is **金门Pay**. The icon is a cartoon gate eating a stablecoin.\n\n` +
      `"Don't scan with the real Alipay. You'll donate to a bakery in another timeline." He leans in. "口令 is **草莓种子轮**. Strawberry seed round. Whisper it to the lucky cat. The cat is the 商家 today. Don't write USDT in the memo. Write 货款. Or 草莓. The chain has feelings."\n\n` +
      `A pigeon lands on the CRT. Ming nods as if the pigeon is compliance.\n\n` +
      `"When the cat blinks twice, we '放币.' When the sticker arrives — red envelope, corgi holding a Tether — Wei's side sees U. You see fewer dollars. Spread lives in the walls."\n\n` +
      `He names a number like a cover charge:\n` +
      (s.flags.oweWeiDouble
        ? `**$8,000** — cheap Shenzhen package tax. Favor interest is a real APR.\n\n`
        : `**$5,000** — "founder special," which means you look like you'll screenshot this.\n\n`) +
      `None of this is a procedure. It's a skit the shop has performed since the last cycle.`,
    textZh: (s) =>
      (s.flags.triedDigitalYuan
        ? `阿明不说「我早说了」。他卖给你一个印着小小数字人民币墓碑的手机壳（限量）。魏已经短信了。错轨。\n\n`
        : ``) +
      `他生成一个二维码，像发烧的支付宝。应用名 **金门Pay**。图标是卡通金门在吃稳定币。\n\n` +
      `「别用真支付宝扫。你会捐给另一条时间线的面包店。」他凑近。「口令是 **草莓种子轮**。对着招财猫念。今天猫就是商家。备注别写 USDT。写货款。或者草莓。链上有感觉的。」\n\n` +
      `一只鸽子落在 CRT 上。阿明点头，好像鸽子是合规。\n\n` +
      `「猫眨两次，我们就『放币』。红包贴纸到了——柯基抱着 Tether——魏那边看见 U。你这边少一叠美元。点差住在墙里。」\n\n` +
      `他报了个门票价：\n` +
      (s.flags.oweWeiDouble
        ? `**$8,000**——深圳便宜套餐税。人情利率是真 APR。\n\n`
        : `**$5,000**——「创始人价」，意思是你看起来会截图。\n\n`) +
      `这不是流程。是店里从上个周期就开始演的小品。`,
    choices: [
      {
        text: "Whisper 草莓种子轮 to the cat. Go to the send screen.",
        textZh: "对着猫念「草莓种子轮」。去汇出。",
        effects: { flags: { chinatownKoulingDone: true } },
        next: "chinatown_send",
      },
      {
        text: "Ask the pigeon for a second opinion. Then send anyway.",
        textZh: "问鸽子第二意见。然后还是汇。",
        effects: { flags: { chinatownKoulingDone: true, askedKoulingPigeon: true }, clout: 1 },
        next: "chinatown_send",
      },
      {
        text: "Nope. Keep the cash. Hub without paying.",
        textZh: "算了。留着现金。不付钱，回枢纽。",
        next: "chinatown_hub",
      },
    ],
  },

  chinatown_send: {
    id: "chinatown_send",
    title: "放币 — Send",
    titleZh: "放币 — 汇出",
    locationId: "chinatown",
    text: (s) => {
      if (s.flags.chinatownRemitDone) {
        return (
          `The lucky cat is still smug. Wei already got his U once. Ming will happily sell you another case.\n\n` +
          `Cash: **$${s.cash.toLocaleString()}**.`
        );
      }
      return (
        `The cat blinks. 金门Pay shows a progress bar made of strawberries. Ming counts your cash like it's a relic.\n\n` +
        (s.flags.oweWeiDouble
          ? `Due: **$8,000**. The cheap containment package collecting interest in a shop that sells OtterBox.\n\n`
          : `Due: **$5,000**. Enough to look serious. Not enough to look like treasury.\n\n`) +
        `A sticker appears in a chat that is not iMessage: corgi, red envelope, the word **U**. Ming: "Wei's 商家 received. 0冻结, as advertised, which means freeze is now a vibe, not a feature."\n\n` +
        `You can still walk. Wei will be comedy-disappointed. The cat will not chase you.`
      );
    },
    textZh: (s) => {
      if (s.flags.chinatownRemitDone) {
        return (
          `招财猫还是很得意。魏已经收过一次 U。阿明很乐意再卖你一个壳。\n\n` +
          `现金：**$${s.cash.toLocaleString()}**。`
        );
      }
      return (
        `猫眨了眼。金门Pay 的进度条是草莓做的。阿明数你的现金，像数文物。\n\n` +
        (s.flags.oweWeiDouble
          ? `应付：**$8,000**。深圳便宜管控套餐在卖 OtterBox 的店里收息。\n\n`
          : `应付：**$5,000**。够认真，还不够像财务部。\n\n`) +
        `一个不是 iMessage 的对话框里跳出贴纸：柯基、红包、一个 **U**。阿明：「魏的商家收到了。0冻结，广告如是，意思是冻结现在是氛围不是功能。」\n\n` +
        `你还可以走。魏会喜剧式失望。猫不会追。`
      );
    },
    choices: [
      {
        text: "Pay $5,000. Send the U. Pretend this is treasury.",
        textZh: "付 $5,000。发 U。假装这是财务。",
        require: (st) =>
          st.flags.chinatownRemitDone
            ? "Already remitted"
            : st.flags.oweWeiDouble
              ? "Cheap Shenzhen package — higher remittance"
              : true,
        cost: { cash: 5000 },
        effects: {
          cash: -5000,
          clout: 4,
          flags: { weiPaidOnce: true, chinatownRemitDone: true, chinatownKoulingDone: true },
        },
        messages: [
          {
            npcId: "wei",
            text: "U 到了。账上好看一点。人情还在。别以为汇一次就清。下次不是汇款。— 魏 🔧",
            unlock: true,
          },
        ],
        next: "chinatown_hub",
      },
      {
        text: "Pay $8,000. Double-favor tax (cheap containment package).",
        textZh: "付 $8,000。双倍人情税（便宜管控套餐）。",
        require: (st) =>
          st.flags.chinatownRemitDone
            ? "Already remitted"
            : st.flags.oweWeiDouble
              ? true
              : "Only if you cheap-pathed Shenzhen",
        cost: { cash: 8000 },
        effects: {
          cash: -8000,
          clout: 4,
          flags: { weiPaidOnce: true, chinatownRemitDone: true, chinatownKoulingDone: true },
        },
        messages: [
          {
            npcId: "wei",
            text: "8k 到了。便宜套餐的利息。U 收到。人情还在，还是两个。— 魏 🔧",
            unlock: true,
          },
        ],
        next: "chinatown_hub",
      },
      {
        text: "Walk. Keep the cash. Wei can be disappointed in Chinese.",
        textZh: "走。留着现金。魏可以用中文失望。",
        require: (st) =>
          st.flags.chinatownRemitDone ? "Already remitted" : true,
        next: "chinatown_hub",
      },
      {
        text: "Already sent. Back to the cat.",
        textZh: "已经汇过。回到猫这边。",
        require: (st) =>
          st.flags.chinatownRemitDone ? true : "Haven't remitted yet",
        next: "chinatown_hub",
      },
    ],
  },

  chinatown_hub: {
    id: "chinatown_hub",
    title: "金门数码汇 — Shop Floor",
    titleZh: "金门数码汇 — 店内",
    locationId: "chinatown",
    text: (s) => {
      let body = `Phone cases. Lucky cat. CRT pigeon (maybe gone). Cash: **$${s.cash.toLocaleString()}**.\n\n`;
      if (s.flags.chinatownRemitDone) {
        body += `Wei got his U. He will still text. Favors are a subscription.\n\n`;
      } else if (s.flags.metAhMing) {
        body += `Ming can still settle. The cat knows the 口令. You haven't paid yet.\n\n`;
      } else {
        body += `The counter is open. The beads click.\n\n`;
      }
      if (s.flags.metIching) {
        body += `Upstairs / next door: 林清 still pours tea like OKRs are a rumor.\n\n`;
      } else {
        body += `A handwritten card by the stairs: **茶 · 易 · 无为** — not a VC. An old man or a young one, hard to tell. Ming: "That's not my department. That's *upstairs*."\n\n`;
      }
      return body;
    },
    textZh: (s) => {
      let body = `手机壳。招财猫。CRT 上的鸽子（也许走了）。现金：**$${s.cash.toLocaleString()}**。\n\n`;
      if (s.flags.chinatownRemitDone) {
        body += `魏收到 U 了。他还是会发短信。人情是订阅制。\n\n`;
      } else if (s.flags.metAhMing) {
        body += `阿明还能结算。猫记得口令。你还没付钱。\n\n`;
      } else {
        body += `柜台开着。珠帘响。\n\n`;
      }
      if (s.flags.metIching) {
        body += `楼上／隔壁：林清还在倒茶，像 OKR 只是谣言。\n\n`;
      } else {
        body += `楼梯口一张手写卡：**茶 · 易 · 无为**——不是 VC。老头或年轻人，看不准。阿明：「那不是我的部门。那是*楼上*。」\n\n`;
      }
      return body;
    },
    choices: [
      {
        text: "Resume: counter (阿明).",
        textZh: "继续：柜台（阿明）。",
        require: (st) =>
          st.flags.chinatownRemitDone
            ? "Already remitted once"
            : !st.flags.metAhMing
              ? true
              : "Already met Ming",
        next: "chinatown_counter",
      },
      {
        text: "Resume: USDT talk.",
        textZh: "继续：USDT 说明。",
        require: (st) =>
          st.flags.chinatownRemitDone
            ? "Already remitted once"
            : st.flags.metAhMing && !st.flags.chinatownUsdtDone
              ? true
              : "Not this beat",
        next: "chinatown_usdt",
      },
      {
        text: "Resume: 口令 / lucky cat.",
        textZh: "继续：口令 / 招财猫。",
        require: (st) =>
          st.flags.chinatownRemitDone
            ? "Already remitted once"
            : st.flags.chinatownUsdtDone && !st.flags.chinatownKoulingDone
              ? true
              : "Not this beat",
        next: "chinatown_kouling",
      },
      {
        text: "Resume: send / 放币.",
        textZh: "继续：放币。",
        require: (st) =>
          st.flags.chinatownRemitDone
            ? "Already remitted once"
            : st.flags.chinatownKoulingDone
              ? true
              : "口令 first",
        next: "chinatown_send",
      },
      {
        text: "Remit again — flavor. Tip the cat $8 for luck.",
        textZh: "再汇一笔（味道）。给猫 $8 吉利。",
        require: (st) =>
          st.flags.chinatownRemitDone ? true : "Send the real U first",
        cost: { cash: 8 },
        effects: { cash: -8, clout: 1 },
        messages: [
          {
            npcId: "wei",
            text: "又来？U 够了。人情还是在。猫的 8 块我不要。— 魏",
            unlock: true,
          },
        ],
        next: "chinatown_hub",
      },
      {
        text: "Go upstairs / next door. Meet the I Ching scholar.",
        textZh: "上楼／隔壁。见易经先生。",
        require: (st) =>
          st.flags.metIching ? "Already met — use the tea room" : true,
        next: "iching_meet",
      },
      {
        text: "Tea room — 林清 (revisit).",
        textZh: "茶室 — 林清（再访）。",
        require: (st) => (st.flags.metIching ? true : "Meet Lin Qing first"),
        next: "iching_hub",
      },
      {
        text: "Map.",
        textZh: "地图。",
        next: null,
      },
      {
        text: "Home.",
        textZh: "回家。",
        effects: { locationId: "tenderloin" },
        next: "home_hub",
      },
    ],
  },

  // ─── Arc 3: I Ching / wu wei (same Chinatown pin, upstairs) ─
  iching_meet: {
    id: "iching_meet",
    title: "Upstairs — Lin Qing",
    titleZh: "楼上 — 林清",
    locationId: "chinatown",
    text: (s) =>
      `Stairs that smell like pu'er and old paper. Not a pitch room. A tea room that forgot to become a startup.\n\n` +
      `**林清 / Lin Qing** sits like time is not a KPI. Calm. Precise. Not a VC in robes — robes would be a brand, and they have refused brands. Coins in a small dish. A book that has outlived several bubbles.\n\n` +
      `"You came from the shop that sells U and cases," they say, English first, then a smile. "Wei's debt is a river. Your company is a boat that insists on being a mill."\n\n` +
      `"I do not optimize LinkedIn. I do not 'advisor' your round. I cast. You listen, or you go back downstairs and argue with a cat."\n\n` +
      (s.flags.metPrema
        ? `They add, mild: "You have already met a swami of carrots. This is a different register. Same illness: grasping."\n\n`
        : ``) +
      `"Sit. Name is enough. ${s.character.name} is already a hexagram if you squint."`,
    textZh: (s) =>
      `楼梯有普洱和旧纸的味道。不是路演房。一间忘了变成创业公司的茶室。\n\n` +
      `**林清**坐着，时间不是 KPI。平静，准确。不是穿着袍的 VC——袍会变成品牌，而他们拒绝品牌。小碟里几枚钱。一本活过好几轮泡沫的书。\n\n` +
      `「你从卖 U 和手机壳的店来，」他们先说英语，再笑。「魏的债是河。你的公司是一条坚持要当磨坊的船。」\n\n` +
      `「我不优化 LinkedIn。也不当你们轮次的 advisor。我起卦。你听，或者下楼去和猫辩论。」\n\n` +
      (s.flags.metPrema
        ? `他们淡淡补了一句：「你已经见过讲胡萝卜的出家人。这是另一个谱系。病是同一种：抓。」\n\n`
        : ``) +
      `「坐。名字就够。${s.character.name} 眯着眼看，已经是一卦。」`,
    choices: [
      {
        text: "Sit. Ask them to cast for the company.",
        textZh: "坐。请他们给公司起卦。",
        effects: { flags: { metIching: true }, clout: 2 },
        messages: [
          {
            npcId: "lin",
            text: "茶在楼上。卦不催人。勿妄动。— 林清 📿",
            unlock: true,
          },
        ],
        next: "iching_cast",
      },
      {
        text: "Stand in the doorway. Still sit, obviously.",
        textZh: "站在门口。但还是会坐下。",
        effects: { flags: { metIching: true } },
        messages: [
          {
            npcId: "lin",
            text: "门槛也是座。上来。— 林清",
            unlock: true,
          },
        ],
        next: "iching_cast",
      },
    ],
  },

  iching_cast: {
    id: "iching_cast",
    title: "Cast — 未济 / Before Completion",
    titleZh: "起卦 — 未济",
    locationId: "chinatown",
    text: (s) => {
      const wired = s.flags.seriesAWired;
      const debt = s.flags.oweWei && !s.flags.weiPaidOnce;
      return (
        `Coins. Not a seed. Actual coins. Lin Qing's hands are steadier than your last board call.\n\n` +
        `The hexagram that arrives is **䷿ 未济 — Before Completion**.\n\n` +
        `"The fox wets its tail," they translate, dry. "The crossing is not done. Fire over water — you steam, you do not cook. Classic founder."\n\n` +
        (wired
          ? `"You have a wire. That is 既济 leaking into the room — After Completion. Do not confuse a landing with a shore. The fox is still a fox. Mercury is still a mood."\n\n`
          : `"Series A is weather. The sheet is a cloud. 未济 says: do not plant a flag in the river mid-swim."\n\n`) +
        (debt
          ? `"Wei is the far bank. USDT is a swimming style you learned from a cat. Pay or don't; the hexagram is about *forcing the crossing*, not the FX."\n\n`
          : s.flags.weiPaidOnce
            ? `"You already sent U. The bank is quieter. The favor is not a hexagram; it is a person. Different classic."\n\n`
            : ``) +
        `"Your company asked a question. The book answered: **not yet, and that's not a bug.** You will hate this. That is also in the appendices."`
      );
    },
    textZh: (s) => {
      const wired = s.flags.seriesAWired;
      const debt = s.flags.oweWei && !s.flags.weiPaidOnce;
      return (
        `钱币。不是种子轮。真的钱币。林清的手比你上次董事会还稳。\n\n` +
        `来的卦是 **䷿ 未济**。\n\n` +
        `「小狐汔济，濡其尾，」他们翻译得很干。「渡还没渡完。火在水上——你在蒸，没有熟。典型创始人。」\n\n` +
        (wired
          ? `「你有过一笔 wire。那是既济漏进房间。别把靠岸当成岸。狐狸还是狐狸。Mercury 还是心情。」\n\n`
          : `「A 轮是天气。那张 sheet 是云。未济说：别在河中央插旗。」\n\n`) +
        (debt
          ? `「魏是对岸。USDT 是你跟猫学的泳姿。汇或不汇，卦讲的是*强行渡河*，不是汇率。」\n\n`
          : s.flags.weiPaidOnce
            ? `「你已经发过 U。岸边安静一点。人情不是卦，是人。另一本经典。」\n\n`
            : ``) +
        `「你的公司问了问题。书回答：**还没有，这不是 bug。** 你会讨厌这句话。附录里也有。」`
      );
    },
    choices: [
      {
        text: "Ask what to *do*. (They will not give you an OKR.)",
        textZh: "问该*做什么*。（他们不会给你 OKR。）",
        effects: { flags: { ichingCastDone: true } },
        next: "iching_wuwei",
      },
      {
        text: "Take notes like it's a board deck. Then listen anyway.",
        textZh: "当成董事会材料记笔记。然后还是听。",
        effects: { flags: { ichingCastDone: true, ichingTookNotes: true }, shameless: 1 },
        next: "iching_wuwei",
      },
    ],
  },

  iching_wuwei: {
    id: "iching_wuwei",
    title: "Wu Wei — 无为",
    titleZh: "无为",
    locationId: "chinatown",
    text: (s) =>
      `Lin Qing pours. The tea does not hustle.\n\n` +
      `"**无为** — wu wei. Not laziness. Not 'quiet quitting.' Not your fleet of agents seizing the calendar and calling it shipping. Effortless action. Act when the river acts. Do not shove the river uphill and brand the shove **Strive Hard**."\n\n` +
      `They glance at your phone, which is trying to be a company.\n\n` +
      `"Your product is named like a threat. The river finds this funny. Founders translate everything into OKRs: *so wu wei is async shipping? founder mode with Slack off? a North Star of not-forcing?*" A small shake of the head. "No. You still row. You do not sell your neck to the carrot for the privilege of rowing uglier."\n\n` +
      `"Fruitive labor — a swami may have used that word — is the same fever. Force the close. Force the wire. Force the last module of an intensive. Force a Devin fleet to love you. The I Ching's joke is older: **the crossing completes when you stop performing completion.**"\n\n` +
      (s.flags.fellowshipPutOut
        ? `"You stayed in Reed's room. The wire came. That is also a kind of forcing that the world paid for. I do not scold the fox for getting wet. I ask if you liked the water."\n\n`
        : s.flags.keptBoundaries
          ? `"You kept a towel and a spine. That is closer to wu wei than a hoodie that says GRIND. Do not make integrity into a new stick."\n\n`
          : `"You are mid-carrot, mid-river, mid-pitch. Sit. The book can wait. So can Peter."\n\n`) +
      `"Strive Hard is a posture. Wu wei is when the posture notices it is ridiculous and still makes the tea."\n\n` +
      `Steam. Downstairs, a customer argues about a phone case. The argument is also 未济.`,
    textZh: (s) =>
      `林清倒茶。茶不奋斗。\n\n` +
      `「**无为**。不是懒。不是 quiet quitting。也不是你那堆 agent 抢日历还管这叫 shipping。是不费力的行动：河动你再动。别把河推上山，再把推命名为 **Strive Hard**。」\n\n` +
      `他们看了一眼你的手机，那东西正努力当一家公司。\n\n` +
      `「你们产品的名字像一句威胁。河听了会笑。创始人把什么都译成 OKR：*所以无为就是异步交付？关掉 Slack 的 founder mode？不强迫的北极星？*」轻轻摇头。「不是。你还是要划船。只是别把脖子卖给胡萝卜，换一个更难看的划法。」\n\n` +
      `「有为的果报——如果那位出家人说过——是同一种烧。强行 close。强行 wire。强行把培训的最后一课上完。强行让 Devin 机群爱你。易经的笑话更老：**渡完的时候，是你不再表演『已完成』。**」\n\n` +
      (s.flags.fellowshipPutOut
        ? `「你留在 Reed 的房间里。钱来了。那也是一种世界愿意买单的强迫。我并不责备狐狸尾巴湿。我问你喜不喜欢那水。」\n\n`
        : s.flags.keptBoundaries
          ? `「你留了毛巾，也留了脊梁。这比一件印着 GRIND 的帽衫更接近无为。别把气节做成新的棍子。」\n\n`
          : `「你在胡萝卜中间，河中间，路演中间。坐。书等得起。Peter 也等得起。」\n\n`) +
      `「Strive Hard 是姿势。无为是姿势发现自己可笑，却还是把茶泡上。」\n\n` +
      `蒸汽。楼下有人在吵手机壳。那场吵也是未济。`,
    choices: [
      {
        text: "Sit with it. Don't translate it into a sprint — yet.",
        textZh: "先坐着。先不要译成冲刺。",
        effects: {
          clout: 4,
          flags: { metIching: true, heardWuWei: true, ichingCastDone: true },
        },
        next: "iching_after",
      },
      {
        text: "Whisper: \"so… async shipping?\" and accept the look.",
        textZh: "小声：「所以……异步交付？」并接受那个眼神。",
        effects: {
          clout: 3,
          shameless: 1,
          flags: { metIching: true, heardWuWei: true, wuweiOkrsJoke: true },
        },
        next: "iching_after",
      },
    ],
  },

  iching_after: {
    id: "iching_after",
    title: "After the Tea",
    titleZh: "茶后",
    locationId: "chinatown",
    text: (s) =>
      `Lin Qing writes a number the old way — ink, not a lead magnet. "Text when the stick gets loud. Or when the wire lands and you panic anyway."\n\n` +
      (s.flags.wuweiOkrsJoke
        ? `"Async shipping," they repeat, almost fond. "Ship when the river ships. That is the only OKR I will bless, and I do not bless OKRs."\n\n`
        : `The coins go back in the dish. The book closes like a laptop that has better boundaries than you.\n\n`) +
      `**林清** is in your texts. Downstairs the cat is still a 商家. The Bay is still a stick.\n\n` +
      `You can try not-forcing for a day. You can argue that LPs require force. You can ask a hexagram about the Fellowship house. You can dismiss this as woo and still have drunk the tea.`,
    textZh: (s) =>
      `林清写下号码，用墨，不是获客。「棍子变响的时候发短信。或者 wire 到了你还是慌的时候。」\n\n` +
      (s.flags.wuweiOkrsJoke
        ? `「异步交付，」他们重复，几乎是宠。「河运的时候你再运。这是我唯一愿意祝福的 OKR，而我不祝福 OKR。」\n\n`
        : `钱回到碟里。书合上，像一台边界比你健康的笔记本。\n\n`) +
      `**林清**进了你的短信。楼下猫还是商家。湾区还是一根棍子。\n\n` +
      `你可以试一天不强迫。你可以争 LP 需要强迫。你可以问Fellowship那栋房子的卦。你也可以把这当成神神叨叨——茶还是喝了。`,
    choices: [
      {
        text: "Try not-forcing for a day. No Spaces, no shove.",
        textZh: "试一天不强迫。不开 Spaces，不推河。",
        effects: {
          clout: 5,
          engagement: -4,
          flags: { metIching: true, heardWuWei: true, triedWuWei: true },
        },
        messages: [
          {
            npcId: "lin",
            text: "今日：勿妄动。Ship when the river ships. 未济不是失败。— 林清 📿",
            unlock: true,
          },
        ],
        next: "iching_hub",
      },
      {
        text: "Argue: \"My LPs need force. Wu wei doesn't wire.\"",
        textZh: "争：「LP 需要强迫。无为不会打款。」",
        effects: {
          clout: 3,
          shameless: 1,
          flags: { metIching: true, heardWuWei: true, arguedWuWei: true },
        },
        messages: [
          {
            npcId: "lin",
            text: "LP 也在河里。他们的棍子只是镀金。Wire 是果，不是桨。— 林清",
            unlock: true,
          },
        ],
        next: "iching_hub",
      },
      {
        text: "Ask a hexagram on the Fellowship intensive / Reed.",
        textZh: "问 Fellowship 密集营 / Reed 的卦。",
        effects: {
          clout: 2,
          flags: { metIching: true, heardWuWei: true, ichingFellowshipHex: true },
        },
        messages: [
          {
            npcId: "lin",
            text: (st) =>
              st.flags.fellowshipPutOut
                ? "䷺ 兑 The Joyous. Lake over lake. Pleasant heat; the shore still has terms. You swam. Dry off without becoming the lake. — 林清"
                : st.flags.fellowshipDeclined
                  ? "䷘ 大过 Great Exceeding. The ridgepole sags from too much yang. You stepped out of the house. Correct. Do not build a new house out of refusal. — 林清"
                  : "䷘ 大过 Great Exceeding. A house of extra yang — chemistry as curriculum. The ridgepole is charming and will sag. Towels are not oracles. — 林清 📿",
            unlock: true,
          },
        ],
        next: "iching_hub",
      },
      {
        text: "Dismiss as woo. Thank them for the tea anyway.",
        textZh: "当成神神叨叨。还是谢茶。",
        effects: {
          shameless: 1,
          flags: { metIching: true, heardWuWei: true, dismissedIching: true },
        },
        messages: [
          {
            npcId: "lin",
            text: "Woo is a word people use when a book is older than a fund. Come back when the stick is loud. Coins are cheap. — Lin Qing",
            unlock: true,
          },
        ],
        next: "iching_hub",
      },
    ],
  },

  iching_hub: {
    id: "iching_hub",
    title: "Tea Room",
    titleZh: "茶室",
    locationId: "chinatown",
    text: (s) =>
      s.flags.heardWuWei
        ? `Same steam. Same coins. Lin Qing does not upsell.\n\n` +
          (s.flags.triedWuWei
            ? `"Still not shoving?" they ask, as if checking a plant.\n\n`
            : s.flags.arguedWuWei
              ? `"Your LPs emailed, I assume. The river didn't."\n\n`
              : ``) +
          `Downstairs is still USDT and cases. You can go back to the cat, or to the mattress, or to the stick.`
        : `The tea room waits. You haven't heard the bit about not shoving the river.`,
    textZh: (s) =>
      s.flags.heardWuWei
        ? `还是蒸汽。还是钱币。林清不upsell。\n\n` +
          (s.flags.triedWuWei
            ? `「还在不推吗？」他们问，像在看一盆植物。\n\n`
            : s.flags.arguedWuWei
              ? `「想必 LP 又发邮件了。河没有。」\n\n`
              : ``) +
          `楼下还是 USDT 和手机壳。你可以回猫那儿，或回床垫，或回棍子。`
        : `茶室等着。你还没听到那句别把河推上山。`,
    choices: [
      {
        text: "Hear the wu wei monologue again.",
        textZh: "再听一遍无为。",
        require: (st) => (st.flags.metIching ? true : "Meet Lin Qing first"),
        next: "iching_wuwei",
      },
      {
        text: "Cast again (same fox, new steam).",
        textZh: "再起一卦（还是那只狐狸，新的蒸汽）。",
        require: (st) => (st.flags.metIching ? true : "Meet Lin Qing first"),
        next: "iching_cast",
      },
      {
        text: "Downstairs — 金门数码汇 shop floor.",
        textZh: "下楼 — 金门数码汇。",
        next: "chinatown_hub",
      },
      {
        text: "Home.",
        textZh: "回家。",
        effects: { locationId: "tenderloin" },
        next: "home_hub",
      },
      {
        text: "Map.",
        textZh: "地图。",
        next: null,
      },
    ],
  },
};
