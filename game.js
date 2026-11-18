/* Sjajna staza — WebGlow Studio */
(() => {
  "use strict";

  const TILE = 32;
  const GRAVITY = 0.55;
  const JUMP = -12.5;
  const MOVE = 4.4;
  const MAX_FALL = 12.5;
  const COYOTE = 7;
  const BUFFER = 8;
  const LIVES0 = 3;
  const STAR_PTS = 50;
  const CLEAR_PTS = 100;
  const LIFE_PTS = 25;
  const STORE = "webglow-sjajna-staza-v1";

  const $ = (id) => document.getElementById(id);
  const canvas = $("game");
  const ctx = canvas.getContext("2d");

  const LEVELS = [
    {
      name: "Prvi skok",
      hint: "Kreni desno, pokupi zvezdice i preskoči rupicu.",
      map: [
        "..........................................",
        "..........................................",
        "..........................................",
        "..........................................",
        "..........................................",
        "..........................................",
        "..........................................",
        "..........................................",
        "..........................................",
        "................SSS.......................",
        "..............--------....................",
        "..........................................",
        "P.....S................S........S.....F...",
        "################################..########",
        "################################..########",
        "################################..########"
      ]
    },
    {
      name: "Mali jaz",
      hint: "Preskoči rupe i popni se po platformama.",
      map: [
        "..................................................",
        "..................................................",
        "..................................................",
        "..................................................",
        "..................................................",
        "..................................................",
        "........................S.........................",
        ".....................--------.....................",
        "..................................................",
        "............S.....................................",
        ".........--------.................................",
        "..................................................",
        "P...S...........S...........S..............S...F..",
        "######...########....#########....################",
        "######...########....#########....################",
        "######...########....#########....################"
      ]
    },
    {
      name: "Šiljci",
      hint: "Šiljci bode. Preskoči ih i ne upadaj u jamu.",
      map: [
        "....................................................",
        "....................................................",
        "....................................................",
        "....................................................",
        "....................................................",
        "....................................................",
        "....................................................",
        "......S.............................................",
        "....----............................................",
        "....................................................",
        ".....S...........................S..................",
        "...----........................------...............",
        "P....S....^^^^....S.......^^^^^.....S............F..",
        "##########....############.....###########....######",
        "##########^^^^############^^^^^###########^^^^######",
        "####################################################"
      ]
    },
    {
      name: "Pokretne daske",
      hint: "Sačekaj pokretnu dasku, pa skoči na nju.",
      map: [
        "......................................................",
        "......................................................",
        "......................................................",
        "......................................................",
        "......................................................",
        "......................................................",
        "......................................................",
        "......................................................",
        ".....................S.............S..................",
        "......................................................",
        "......................................................",
        "......................................................",
        "P....S...........................................S.F..",
        "########....................................##########",
        "########....................................##########",
        "########^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^##########"
      ],
      movers: [
        { x: 8, y: 13, w: 4, h: 1, axis: "x", a: 8, b: 20, speed: 1.05 },
        { x: 22, y: 11, w: 4, h: 1, axis: "x", a: 18, b: 32, speed: 0.95 },
        { x: 34, y: 13, w: 4, h: 1, axis: "x", a: 30, b: 44, speed: 1 }
      ]
    },
    {
      name: "Čuvari staze",
      hint: "Skoči preko čuvara ili im sleti na glavu.",
      map: [
        "........................................................",
        "........................................................",
        "........................................................",
        "........................................................",
        "........................................................",
        "........................................................",
        "........................................................",
        "...................S....................................",
        ".................------.................................",
        "........................................................",
        "....S..........................S...............S........",
        "..------.....................------..........------.....",
        "P..S...........ES.............E.S.............E......F..",
        "#########....###########....############....############",
        "#########^^^^###########^^^^############^^^^############",
        "########################################################"
      ]
    },
    {
      name: "Visine",
      hint: "Popni se nagore, pa skoči s daske na dasku.",
      map: [
        "............................................",
        "............................................",
        "................................S........F..",
        "......................................------",
        "............................................",
        "..............................S.............",
        "..............................--------......",
        "............................................",
        "......................S.....................",
        "....................--------................",
        "............................................",
        "............S...............................",
        "..........--------..........................",
        "............................................",
        "P...S.......................................",
        "########....................................",
        "########....................................",
        "########^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^",
        "############################################",
        "############################################"
      ]
    },
    {
      name: "Uske staze",
      hint: "Kratke platforme, šiljci ispod, jedna pokretna daska.",
      map: [
        "............................................................",
        "............................................................",
        "............................................................",
        "............................................................",
        "............................................................",
        "............................................................",
        "............................................................",
        "..............S........................S....................",
        "............................................................",
        "............------...................------.................",
        "..........S....................................S............",
        "............................................................",
        "P.....S...............................................S..F..",
        "########....------....########................------....####",
        "########^^^^......^^^^########^^^^^^^^^^^^^^^^......^^^^####",
        "############################################################"
      ],
      movers: [
        { x: 28, y: 13, w: 4, h: 1, axis: "x", a: 28, b: 48, speed: 1.05 }
      ]
    },
    {
      name: "Zvezdani vrh",
      hint: "Poslednji nivo: sve što si naučila, do zastave.",
      map: [
        "......................................................................",
        "......................................................................",
        "......................................................................",
        ".........................................................S............",
        ".....................................................----------.......",
        "......................................................................",
        "....................................................S.................",
        ".................................................----------...........",
        "...............S......................................................",
        "............--------..................................................",
        "....S.................................................S...............",
        ".------............................................--------...........",
        "P..S.........E....S.......E...S................................S...F..",
        "########....########....########............................##########",
        "########^^^^########^^^^########^^^^^^^^^^^^^^^^^^^^^^^^^^^^##########",
        "######################################################################"
      ],
      movers: [
        { x: 34, y: 12, w: 4, h: 1, axis: "x", a: 32, b: 56, speed: 1 }
      ]
    }
  ];

  function checkMaps() {
    LEVELS.forEach((lv, i) => {
      const w = lv.map[0].length;
      lv.map.forEach((r, y) => {
        if (r.length !== w) throw new Error("Nivo " + (i + 1) + " red " + y + " dužina " + r.length + " != " + w);
      });
      const t = lv.map.join("");
      if ((t.match(/P/g) || []).length !== 1) throw new Error("Nivo " + (i + 1) + " treba jednog P");
      if ((t.match(/F/g) || []).length !== 1) throw new Error("Nivo " + (i + 1) + " treba jedan F");
    });
  }
  checkMaps();

  /* ---------- persist ---------- */
  function loadStore() {
    const def = { unlocked: 1, best: [0, 0, 0, 0, 0, 0, 0, 0], bestScore: [0, 0, 0, 0, 0, 0, 0, 0], muted: false };
    try {
      const s = JSON.parse(localStorage.getItem(STORE) || "null");
      if (!s) return def;
      return {
        unlocked: Math.max(1, Math.min(8, s.unlocked | 0) || 1),
        best: Array.from({ length: 8 }, (_, i) => (s.best && s.best[i]) | 0),
        bestScore: Array.from({ length: 8 }, (_, i) => (s.bestScore && s.bestScore[i]) | 0),
        muted: !!s.muted,
      };
    } catch {
      return def;
    }
  }
  function saveStore() {
    localStorage.setItem(STORE, JSON.stringify(store));
  }
  let store = loadStore();

  /* ---------- audio ---------- */
  const audio = { ctx: null, muted: store.muted };
  function ac() {
    if (!audio.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audio.ctx = new AC();
    }
    if (audio.ctx.state === "suspended") audio.ctx.resume();
    return audio.ctx;
  }
  function beep(kind) {
    if (audio.muted) return;
    const c = ac();
    if (!c) return;
    const now = c.currentTime;
    const tone = (freq, dur, type, gain, at) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, at);
      g.gain.setValueAtTime(gain, at);
      g.gain.exponentialRampToValueAtTime(0.001, at + dur);
      o.connect(g);
      g.connect(c.destination);
      o.start(at);
      o.stop(at + dur + 0.02);
    };
    if (kind === "jump") tone(260, 0.1, "square", 0.06, now), tone(400, 0.08, "square", 0.04, now + 0.04);
    else if (kind === "coin") {
      tone(660, 0.08, "sine", 0.07, now);
      tone(880, 0.12, "sine", 0.07, now + 0.07);
    } else if (kind === "win") {
      [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, "triangle", 0.08, now + i * 0.11));
    } else if (kind === "stomp") tone(180, 0.1, "square", 0.07, now), tone(120, 0.12, "square", 0.05, now + 0.04);
    else if (kind === "die") tone(300, 0.18, "sawtooth", 0.06, now), tone(140, 0.25, "sawtooth", 0.05, now + 0.1);
    else if (kind === "click") tone(520, 0.05, "sine", 0.04, now);
  }
  function syncMute() {
    $("icon-on").hidden = audio.muted;
    $("icon-off").hidden = !audio.muted;
    $("btn-mute").setAttribute("aria-pressed", audio.muted ? "true" : "false");
    $("btn-mute").setAttribute("aria-label", audio.muted ? "Uključi zvuk" : "Utišaj zvuk");
  }

  /* ---------- input ---------- */
  const keys = { left: false, right: false, jump: false };
  const jumpBuf = { t: 0 };
  function bindHold(el, key) {
    const on = (e) => {
      e.preventDefault();
      keys[key] = true;
      if (key === "jump") jumpBuf.t = BUFFER;
      el.classList.add("held");
      ac();
    };
    const off = (e) => {
      e.preventDefault();
      keys[key] = false;
      el.classList.remove("held");
    };
    ["pointerdown", "touchstart"].forEach((ev) => el.addEventListener(ev, on, { passive: false }));
    ["pointerup", "pointerleave", "pointercancel", "touchend", "touchcancel"].forEach((ev) =>
      el.addEventListener(ev, off, { passive: false })
    );
  }
  bindHold($("btn-left"), "left");
  bindHold($("btn-right"), "right");
  bindHold($("btn-jump"), "jump");
  window.addEventListener("pointerup", () => {
    if (!("ontouchstart" in window) && !keys._k) return;
  });
  const codeMap = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "jump",
    Space: "jump",
    KeyA: "left",
    KeyD: "right",
    KeyW: "jump",
    KeyP: "pause",
    Escape: "pause",
  };
  window.addEventListener("keydown", (e) => {
    const k = codeMap[e.code];
    if (!k) return;
    if (e.repeat && k !== "pause") {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    if (k === "pause") {
      if (game.mode === "play") pause();
      else if (game.mode === "pause") resume();
      return;
    }
    keys[k] = true;
    if (k === "jump") jumpBuf.t = BUFFER;
    ac();
  });
  window.addEventListener("keyup", (e) => {
    const k = codeMap[e.code];
    if (!k || k === "pause") return;
    keys[k] = false;
  });
  document.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
  window.addEventListener("gesturestart", (e) => e.preventDefault());

  /* ---------- world ---------- */
  function rect(x, y, w, h) {
    return { x, y, w, h };
  }
  function overlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
  function parseLevel(index) {
    const lv = LEVELS[index];
    const rows = lv.map;
    const tw = rows[0].length;
    const th = rows.length;
    const solids = [];
    const spikes = [];
    const stars = [];
    const enemies = [];
    let spawn = { x: TILE, y: TILE };
    let flag = { x: (tw - 2) * TILE, y: (th - 4) * TILE, w: TILE, h: TILE * 2 };
    const seen = Array.from({ length: th }, () => Array(tw).fill(false));
    const isSolid = (ch) => ch === "#" || ch === "-";
    for (let y = 0; y < th; y++) {
      for (let x = 0; x < tw; x++) {
        const ch = rows[y][x];
        if (isSolid(ch) && !seen[y][x]) {
          let x2 = x;
          while (x2 + 1 < tw && isSolid(rows[y][x2 + 1]) && !seen[y][x2 + 1]) x2++;
          let y2 = y;
          let ok = true;
          while (ok && y2 + 1 < th) {
            for (let i = x; i <= x2; i++) if (!isSolid(rows[y2 + 1][i]) || seen[y2 + 1][i]) ok = false;
            if (ok) y2++;
          }
          for (let yy = y; yy <= y2; yy++) for (let xx = x; xx <= x2; xx++) seen[yy][xx] = true;
          const kind = rows[y][x] === "-" || (y2 === y && rows[y].slice(x, x2 + 1).includes("-")) ? "plat" : "block";
          solids.push({ x: x * TILE, y: y * TILE, w: (x2 - x + 1) * TILE, h: (y2 - y + 1) * TILE, kind });
        }
        if (ch === "^") spikes.push({ x: x * TILE + 3, y: y * TILE + 14, w: TILE - 6, h: TILE - 14, tx: x, ty: y });
        if (ch === "S") stars.push({ x: x * TILE + 8, y: y * TILE + 8, w: 16, h: 16, taken: false, tx: x, ty: y });
        if (ch === "E")
          enemies.push({
            x: x * TILE + 4,
            y: y * TILE + 8,
            w: 24,
            h: 24,
            vx: 0.9,
            dead: false,
            facing: 1,
          });
        if (ch === "P") spawn = { x: x * TILE + 5, y: y * TILE + 4 };
        if (ch === "F") flag = { x: x * TILE + 8, y: y * TILE + TILE - 72, w: 20, h: 72 };
      }
    }
    const movers = (lv.movers || []).map((m) => ({
      x: m.x * TILE,
      y: m.y * TILE,
      w: m.w * TILE,
      h: m.h * TILE,
      axis: m.axis,
      a: m.a * TILE,
      b: m.b * TILE,
      speed: m.speed,
      dir: 1,
      dx: 0,
      dy: 0,
      kind: "plat",
      mover: true,
    }));
    return {
      index,
      name: lv.name,
      hint: lv.hint,
      tw,
      th,
      pxW: tw * TILE,
      pxH: th * TILE,
      solids,
      spikes,
      stars,
      enemies,
      movers,
      spawn,
      flag,
      rows,
    };
  }

  function solidsOf(world) {
    return world.solids.concat(world.movers);
  }
  function hits(box, list) {
    const out = [];
    for (const s of list) if (overlap(box, s)) out.push(s);
    return out;
  }
  function standOn(px, feetY, world) {
    const probe = { x: px + 4, y: feetY, w: 12, h: 4 };
    return hits(probe, solidsOf(world))[0] || null;
  }

  /* ---------- game state ---------- */
  const game = {
    mode: "title", // title, levels, play, pause, dead, win
    world: null,
    player: null,
    lives: LIVES0,
    score: 0,
    runScore: 0,
    particles: [],
    t: 0,
    deathClock: 0,
    winClock: 0,
    invuln: 0,
    cam: { x: 0, y: 0, w: 960, h: 540 },
  };

  function makePlayer(spawn) {
    return {
      x: spawn.x,
      y: spawn.y,
      w: 22,
      h: 28,
      vx: 0,
      vy: 0,
      onGround: false,
      coyote: 0,
      facing: 1,
      walk: 0,
      squash: 0,
      riding: null,
      dead: false,
      won: false,
    };
  }

  function startLevel(index, keepScore) {
    const world = parseLevel(index);
    game.world = world;
    game.player = makePlayer(world.spawn);
    snapToGround(game.player, world);
    game.lives = LIVES0;
    if (!keepScore) game.runScore = 0;
    game.particles = [];
    game.t = 0;
    game.deathClock = 0;
    game.winClock = 0;
    game.invuln = 40;
    game.mode = "play";
    showScreen(null);
    $("hud").hidden = false;
    updateHud();
    syncTouch();
  }

  function snapToGround(p, world) {
    for (let i = 0; i < 48; i++) {
      const s = standOn(p.x, p.y + p.h, world);
      if (s) {
        p.y = s.y - p.h;
        p.onGround = true;
        return;
      }
      p.y += 1;
      if (p.y > world.pxH) break;
    }
  }

  function collectedCount() {
    return game.world.stars.filter((s) => s.taken).length;
  }

  function updateHud() {
    if (!game.world) return;
    $("hud-level").textContent = "Nivo " + (game.world.index + 1) + " · " + game.world.name;
    $("hud-lives").textContent = "♥".repeat(game.lives) + "♡".repeat(Math.max(0, LIVES0 - game.lives));
    $("hud-stars").textContent = "★ " + collectedCount() + "/" + game.world.stars.length;
    $("hud-score").textContent = String(game.score + game.runScore);
  }

  /* ---------- physics ---------- */
  function updateMovers(world) {
    for (const m of world.movers) {
      const prevX = m.x, prevY = m.y;
      if (m.axis === "x") {
        m.x += m.speed * m.dir;
        if (m.x <= m.a) {
          m.x = m.a;
          m.dir = 1;
        }
        if (m.x + m.w >= m.b) {
          m.x = m.b - m.w;
          m.dir = -1;
        }
      } else {
        m.y += m.speed * m.dir;
        const top = Math.min(m.a, m.b);
        const bot = Math.max(m.a, m.b);
        if (m.y <= top) {
          m.y = top;
          m.dir = 1;
        }
        if (m.y + m.h >= bot + TILE) {
          /* b is a tile row; bottom of travel is b*TILE + 0, platform sits at y up to b*TILE */
        }
        if (m.y >= bot) {
          m.y = bot;
          m.dir = -1;
        }
      }
      m.dx = m.x - prevX;
      m.dy = m.y - prevY;
    }
  }

  function moveActor(a, world, bounceEnemies) {
    a.riding = null;
    a.x += a.vx;
    let col = hits(a, solidsOf(world));
    for (const s of col) {
      if (a.vx > 0) a.x = s.x - a.w;
      else if (a.vx < 0) a.x = s.x + s.w;
      a.vx = 0;
    }
    const wasOn = a.onGround;
    a.onGround = false;
    a.y += a.vy;
    col = hits(a, solidsOf(world));
    for (const s of col) {
      if (a.vy >= 0 && a.y + a.h - s.y < Math.max(a.vy + 4, 12)) {
        a.y = s.y - a.h;
        a.vy = 0;
        a.onGround = true;
        if (s.mover) a.riding = s;
      } else if (a.vy < 0) {
        a.y = s.y + s.h;
        a.vy = 0;
      }
    }
    if (a.riding) {
      a.x += a.riding.dx;
      a.y += a.riding.dy;
      a.y = a.riding.y - a.h;
      a.onGround = true;
      const xcol = hits(a, world.solids);
      for (const s of xcol) {
        if (a.riding.dx > 0) a.x = s.x - a.w;
        else if (a.riding.dx < 0) a.x = s.x + s.w;
      }
    }
    if (a.onGround) a.coyote = COYOTE;
    else if (wasOn && a.vy >= 0) a.coyote = COYOTE;
    else if (a.coyote > 0) a.coyote--;
  }

  function puff(x, y, color, n, spd) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = Math.random() * spd;
      game.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 1,
        life: 18 + Math.random() * 16,
        max: 30,
        color,
        r: 2 + Math.random() * 3,
      });
    }
  }

  function killPlayer() {
    const p = game.player;
    if (p.dead || p.won || game.invuln > 0) return;
    p.dead = true;
    game.deathClock = 50;
    game.lives--;
    beep("die");
    puff(p.x + p.w / 2, p.y + p.h / 2, "#A3E635", 16, 3.2);
    updateHud();
  }

  function respawn() {
    const world = game.world;
    game.player = makePlayer(world.spawn);
    snapToGround(game.player, world);
    game.invuln = 70;
    game.deathClock = 0;
    updateHud();
  }

  function winLevel() {
    const p = game.player;
    if (p.won) return;
    p.won = true;
    game.winClock = 40;
    beep("win");
    puff(p.x + p.w / 2, p.y, "#E8C54A", 22, 3.6);
  }

  function finishWin() {
    const i = game.world.index;
    const stars = collectedCount();
    const gained = game.runScore + CLEAR_PTS + game.lives * LIFE_PTS;
    game.score += gained;
    game.runScore = 0;
    if (stars > store.best[i]) store.best[i] = stars;
    if (gained > store.bestScore[i]) store.bestScore[i] = gained;
    if (store.unlocked < i + 2) store.unlocked = Math.min(8, i + 2);
    saveStore();
    game.mode = "win";
    const last = i === LEVELS.length - 1;
    $("w-title").textContent = last ? "Bravo!" : "Bravo!";
    $("win-msg").textContent = last
      ? "Prošla si sve nivoe. Staza sija zbog tebe!"
      : "Nivo „" + game.world.name + "“ je završen.";
    $("win-stats").textContent =
      "Zvezdice " + stars + "/" + game.world.stars.length + " · +" + gained + " poena · životi " + game.lives;
    $("btn-next").textContent = last ? "Izaberi nivo" : "Dalje";
    showScreen("screen-win");
    $("hud").hidden = false;
    updateHud();
  }

  function updatePlay() {
    const world = game.world;
    const p = game.player;
    game.t++;
    if (game.invuln > 0) game.invuln--;
    if (jumpBuf.t > 0) jumpBuf.t--;
    updateMovers(world);

    if (p.dead) {
      game.deathClock--;
      if (game.deathClock <= 0) {
        if (game.lives <= 0) {
          game.mode = "dead";
          $("dead-msg").textContent = "Nestalo je života na nivou „" + world.name + "“.";
          showScreen("screen-dead");
        } else respawn();
      }
    } else if (p.won) {
      game.winClock--;
      if (game.winClock <= 0) finishWin();
    } else {
      const wantLeft = keys.left;
      const wantRight = keys.right;
      if (wantLeft && !wantRight) {
        p.vx = -MOVE;
        p.facing = -1;
      } else if (wantRight && !wantLeft) {
        p.vx = MOVE;
        p.facing = 1;
      } else p.vx *= p.onGround ? 0.6 : 0.85;
      if (Math.abs(p.vx) < 0.12) p.vx = 0;

      const canJump = p.onGround || p.coyote > 0;
      if (jumpBuf.t > 0 && canJump) {
        p.vy = JUMP;
        p.onGround = false;
        p.coyote = 0;
        jumpBuf.t = 0;
        p.squash = 8;
        beep("jump");
        puff(p.x + p.w / 2, p.y + p.h, "#9DB2A4", 6, 1.4);
      }
      if (!keys.jump && p.vy < -4) p.vy *= 0.55;

      p.vy = Math.min(MAX_FALL, p.vy + GRAVITY);
      moveActor(p, world);
      if (p.x < 0) p.x = 0;
      if (p.x + p.w > world.pxW) p.x = world.pxW - p.w;
      if (p.onGround && p.squash < 5) p.squash = 5;
      if (p.squash > 0) p.squash--;
      if (p.onGround && Math.abs(p.vx) > 0.4) p.walk += 0.35;
      else p.walk *= 0.8;

      for (const s of world.stars) {
        if (!s.taken && overlap(p, s)) {
          s.taken = true;
          game.runScore += STAR_PTS;
          beep("coin");
          puff(s.x + 8, s.y + 8, "#E8C54A", 10, 2.4);
          updateHud();
        }
      }
      for (const sp of world.spikes) {
        if (overlap(p, sp)) killPlayer();
      }
      for (const e of world.enemies) {
        if (e.dead) continue;
        e.x += e.vx;
        const frontX = e.vx > 0 ? e.x + e.w + 1 : e.x - 1;
        const wall = hits({ x: frontX, y: e.y + 4, w: 2, h: e.h - 8 }, world.solids);
        const floor = hits({ x: frontX, y: e.y + e.h, w: 2, h: 6 }, solidsOf(world));
        if (wall.length || !floor.length) e.vx *= -1;
        e.facing = e.vx >= 0 ? 1 : -1;
        if (!overlap(p, e)) continue;
        const fromAbove = p.vy > 0 && p.y + p.h - e.y < 16;
        if (fromAbove) {
          e.dead = true;
          p.vy = -8;
          game.runScore += 25;
          beep("stomp");
          puff(e.x + e.w / 2, e.y + e.h / 2, "#8b6bb5", 12, 2.2);
          updateHud();
        } else killPlayer();
      }
      if (p.y > world.pxH + 20) killPlayer();
      const flagBox = { x: world.flag.x - 4, y: world.flag.y, w: 24, h: world.flag.h };
      if (overlap(p, flagBox)) winLevel();
    }

    for (let i = game.particles.length - 1; i >= 0; i--) {
      const q = game.particles[i];
      q.x += q.vx;
      q.y += q.vy;
      q.vy += 0.12;
      q.life--;
      if (q.life <= 0) game.particles.splice(i, 1);
    }
  }

  /* ---------- render ---------- */
  function resize() {
    const stage = $("stage");
    const w = Math.max(1, stage.clientWidth);
    const h = Math.max(1, stage.clientHeight);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    game.viewW = w;
    game.viewH = h;
  }

  function starPath(g, x, y, r, rot) {
    g.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = rot + (i * Math.PI) / 4;
      const rad = i % 2 === 0 ? r : r * 0.4;
      const px = x + Math.cos(a) * rad;
      const py = y + Math.sin(a) * rad;
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.closePath();
  }

  function drawBackground(w, h, cam) {
    const g = ctx;
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "#0B0F0D");
    grd.addColorStop(1, "#163226");
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    g.save();
    g.globalAlpha = 0.9;
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 97 + 40) % (w + 80)) - 20 - (cam.x * 0.15) % (w + 80);
      const sy = ((i * 53 + 20) % (h * 0.7)) + 8;
      g.fillStyle = i % 5 === 0 ? "#E8C54A" : "#F4F1E8";
      g.globalAlpha = 0.35 + (i % 4) * 0.1;
      g.beginPath();
      g.arc(sx, sy, i % 7 === 0 ? 1.6 : 1.1, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
    const hills = (par, color, base, amp, off) => {
      g.beginPath();
      g.moveTo(0, h);
      for (let x = 0; x <= w; x += 8) {
        const wx = x + cam.x * par;
        const y = base + Math.sin(wx / 90 + off) * amp + Math.sin(wx / 40 + off * 2) * amp * 0.35;
        g.lineTo(x, y);
      }
      g.lineTo(w, h);
      g.closePath();
      g.fillStyle = color;
      g.fill();
    };
    hills(0.2, "#0f1a14", h * 0.62, 28, 0.2);
    hills(0.35, "#13261c", h * 0.72, 22, 1.1);
    hills(0.5, "#153024", h * 0.82, 16, 2.2);
  }

  function roundRect(g, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + rr, y);
    g.arcTo(x + w, y, x + w, y + h, rr);
    g.arcTo(x + w, y + h, x, y + h, rr);
    g.arcTo(x, y + h, x, y, rr);
    g.arcTo(x, y, x + w, y, rr);
    g.closePath();
  }

  function drawPlatform(s, t) {
    const g = ctx;
    g.fillStyle = "#163226";
    roundRect(g, s.x, s.y, s.w, s.h, s.kind === "plat" ? 6 : 3);
    g.fill();
    g.fillStyle = "#22C55E";
    g.fillRect(s.x, s.y, s.w, Math.min(8, s.h));
    g.fillStyle = "#A3E635";
    g.fillRect(s.x, s.y, s.w, 3);
    if (s.mover) {
      g.fillStyle = "rgba(232,197,74,.35)";
      g.fillRect(s.x + 4, s.y + 10, s.w - 8, 3);
    }
    if (s.kind === "plat" || s.h <= TILE) {
      g.fillStyle = "#A3E635";
      for (let x = s.x + 8; x < s.x + s.w; x += 18) {
        g.beginPath();
        g.moveTo(x, s.y + 1);
        g.lineTo(x + 2, s.y - 4);
        g.lineTo(x + 4, s.y + 1);
        g.fill();
      }
    }
  }

  function drawSpike(sp, t) {
    const g = ctx;
    const x = sp.tx * TILE;
    const y = sp.ty * TILE;
    g.beginPath();
    g.moveTo(x + 2, y + TILE);
    g.lineTo(x + TILE / 2, y + 2);
    g.lineTo(x + TILE - 2, y + TILE);
    g.closePath();
    g.fillStyle = "#c4453c";
    g.fill();
    g.beginPath();
    g.moveTo(x + TILE / 2 - 2, y + 8);
    g.lineTo(x + TILE / 2, y + 2);
    g.lineTo(x + TILE / 2 + 3, y + 12);
    g.fillStyle = "#f0a8a0";
    g.fill();
  }

  function drawStar(s, t) {
    if (s.taken) return;
    const g = ctx;
    const cx = s.x + 8, cy = s.y + 8 + Math.sin(t / 16 + s.tx) * 2;
    g.save();
    g.fillStyle = "rgba(232,197,74,.25)";
    g.beginPath();
    g.arc(cx, cy, 11, 0, Math.PI * 2);
    g.fill();
    starPath(g, cx, cy, 9, t / 40);
    g.fillStyle = "#E8C54A";
    g.fill();
    starPath(g, cx, cy, 5, t / 40);
    g.fillStyle = "#F3E7A8";
    g.fill();
    g.restore();
  }

  function drawEnemy(e, t) {
    if (e.dead) return;
    const g = ctx;
    const bob = Math.sin(t / 8 + e.x) * 1.5;
    const x = e.x, y = e.y + bob;
    g.fillStyle = "rgba(0,0,0,.25)";
    g.beginPath();
    g.ellipse(x + e.w / 2, e.y + e.h + 2, 10, 3, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#3b2a55";
    roundRect(g, x, y, e.w, e.h, 8);
    g.fill();
    g.fillStyle = "#6d4e8a";
    roundRect(g, x + 3, y + 3, e.w - 6, 10, 5);
    g.fill();
    g.fillStyle = "#f4f1e8";
    g.beginPath();
    g.arc(x + 8, y + 11, 3.2, 0, Math.PI * 2);
    g.arc(x + 16, y + 11, 3.2, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#0B0F0D";
    const look = e.facing * 1.1;
    g.beginPath();
    g.arc(x + 8 + look, y + 11, 1.5, 0, Math.PI * 2);
    g.arc(x + 16 + look, y + 11, 1.5, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#1a1024";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x + 6, y + 6);
    g.lineTo(x + e.w - 6, y + 6);
    g.stroke();
  }

  function drawFlag(f, t) {
    const g = ctx;
    g.fillStyle = "#F4F1E8";
    g.fillRect(f.x + 2, f.y, 3, f.h);
    g.beginPath();
    g.arc(f.x + 3.5, f.y, 3, 0, Math.PI * 2);
    g.fillStyle = "#E8C54A";
    g.fill();
    const wave = Math.sin(t / 10) * 3;
    g.beginPath();
    g.moveTo(f.x + 5, f.y + 4);
    g.lineTo(f.x + 28 + wave, f.y + 10);
    g.lineTo(f.x + 5, f.y + 20);
    g.closePath();
    g.fillStyle = "#A3E635";
    g.fill();
    g.fillStyle = "#22C55E";
    g.beginPath();
    g.moveTo(f.x + 5, f.y + 8);
    g.lineTo(f.x + 18 + wave * 0.5, f.y + 10);
    g.lineTo(f.x + 5, f.y + 14);
    g.fill();
    starPath(g, f.x + 13 + wave * 0.4, f.y + 11, 3.2, 0);
    g.fillStyle = "#E8C54A";
    g.fill();
  }

  function drawHero(p, t) {
    const g = ctx;
    if (p.dead && game.deathClock < 30 && game.deathClock % 6 < 3) return;
    if (game.invuln > 0 && !p.dead && Math.floor(game.invuln / 3) % 2 === 0) g.globalAlpha = 0.45;
    const sq = p.squash > 0 ? 1 - p.squash * 0.03 : 1;
    const sx = 1 + (1 - sq) * 0.4;
    const sy = sq;
    const cx = p.x + p.w / 2;
    const feet = p.y + p.h;
    g.fillStyle = "rgba(0,0,0,.28)";
    g.beginPath();
    g.ellipse(cx, feet + 1, 11, 3.2, 0, 0, Math.PI * 2);
    g.fill();
    g.save();
    g.translate(cx, feet);
    g.scale(p.facing, 1);
    g.scale(sx, sy);
    g.translate(-cx, -feet);
    const bodyY = p.y + 8;
    /* glow */
    g.fillStyle = "rgba(163,230,53,.22)";
    g.beginPath();
    g.arc(cx, p.y + 14, 18, 0, Math.PI * 2);
    g.fill();
    /* legs */
    const swing = p.onGround && Math.abs(p.vx) > 0.4 ? Math.sin(p.walk) * 5 : 0;
    g.fillStyle = "#1E4D32";
    g.beginPath();
    g.ellipse(cx - 5, feet - 3, 3.2, 5, -0.3 + swing / 20, 0, Math.PI * 2);
    g.ellipse(cx + 5, feet - 3, 3.2, 5, 0.3 - swing / 20, 0, Math.PI * 2);
    g.fill();
    /* body */
    g.fillStyle = "#22C55E";
    roundRect(g, cx - 8, bodyY, 16, 14, 7);
    g.fill();
    g.fillStyle = "#A3E635";
    roundRect(g, cx - 8, bodyY, 16, 9, 7);
    g.fill();
    /* head */
    g.fillStyle = "#C8F06A";
    g.beginPath();
    g.arc(cx, p.y + 11, 11, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#A3E635";
    g.beginPath();
    g.ellipse(cx - 7, p.y + 12, 3, 3.5, 0, 0, Math.PI * 2);
    g.fill();
    /* star tuft */
    starPath(g, cx + 1, p.y - 1, 5.5, t / 80);
    g.fillStyle = "#E8C54A";
    g.fill();
    /* eyes */
    g.fillStyle = "#0B0F0D";
    const blink = t % 220 < 6 ? 0.3 : 2.6;
    g.beginPath();
    g.ellipse(cx - 3.5, p.y + 11, 2.1, blink, 0, 0, Math.PI * 2);
    g.ellipse(cx + 4.5, p.y + 11, 2.1, blink, 0, 0, Math.PI * 2);
    g.fill();
    if (blink > 1) {
      g.fillStyle = "#fff";
      g.beginPath();
      g.arc(cx - 2.8, p.y + 10.2, 0.8, 0, Math.PI * 2);
      g.arc(cx + 5.2, p.y + 10.2, 0.8, 0, Math.PI * 2);
      g.fill();
    }
    /* smile */
    g.strokeStyle = "#163226";
    g.lineWidth = 1.2;
    g.beginPath();
    g.arc(cx + 0.5, p.y + 13.5, 3.2, 0.2, Math.PI - 0.2);
    g.stroke();
    /* blush */
    g.fillStyle = "rgba(232,120,140,.35)";
    g.beginPath();
    g.ellipse(cx - 7, p.y + 14, 2.2, 1.3, 0, 0, Math.PI * 2);
    g.ellipse(cx + 8, p.y + 14, 2.2, 1.3, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
    g.globalAlpha = 1;
  }

  function updateCamera() {
    const world = game.world;
    const p = game.player;
    const w = game.viewW, h = game.viewH;
    const tileCss = w < 520 ? 32 : w < 860 ? 28 : 26;
    let camW = (w * TILE) / tileCss;
    let camH = (h * TILE) / tileCss;
    camW = Math.min(Math.max(camW, 14 * TILE), Math.max(world.pxW, 14 * TILE));
    camH = Math.min(Math.max(camH, 11 * TILE), Math.max(world.pxH, 11 * TILE));
    if (camW > world.pxW) camW = world.pxW;
    if (camH > world.pxH) camH = world.pxH;
    let x = p.x + p.w / 2 - camW * 0.42;
    let y = p.y + p.h / 2 - camH * 0.58;
    x = Math.max(0, Math.min(x, world.pxW - camW));
    y = Math.max(0, Math.min(y, world.pxH - camH));
    if (world.pxW <= camW) x = (world.pxW - camW) / 2;
    if (world.pxH <= camH) y = (world.pxH - camH) / 2;
    const cam = game.cam;
    if (game.t < 2) {
      cam.x = x;
      cam.y = y;
    } else {
      cam.x += (x - cam.x) * 0.14;
      cam.y += (y - cam.y) * 0.14;
    }
    cam.w = camW;
    cam.h = camH;
  }

  function drawWorld() {
    const w = game.viewW, h = game.viewH;
    if (game.mode === "title" || game.mode === "levels" || !game.world) {
      drawBackground(w, h, { x: game.t * 0.4, y: 0 });
      /* idle hero preview */
      const p = { x: w * 0.18, y: h * 0.62, w: 22, h: 28, vx: 0, onGround: true, walk: game.t * 0.05, squash: 0, facing: 1, dead: false };
      /* draw in screen space a little diorama */
      ctx.save();
      const sc = Math.min(2.2, w / 400);
      ctx.translate(w * 0.5 - 200 * sc, h * 0.55);
      ctx.scale(sc, sc);
      drawPlatform({ x: 40, y: 80, w: 280, h: 40, kind: "block" }, game.t);
      drawStar({ x: 160, y: 40, taken: false, tx: 1 }, game.t);
      drawHero({ ...p, x: 90, y: 52 }, game.t);
      drawFlag({ x: 270, y: 24, h: 56 }, game.t);
      ctx.restore();
      return;
    }
    updateCamera();
    const cam = game.cam;
    drawBackground(w, h, cam);
    const scale = w / cam.w;
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(-cam.x, -cam.y);
    for (const s of game.world.solids) drawPlatform(s, game.t);
    for (const m of game.world.movers) drawPlatform(m, game.t);
    for (const sp of game.world.spikes) drawSpike(sp, game.t);
    for (const s of game.world.stars) drawStar(s, game.t);
    for (const e of game.world.enemies) drawEnemy(e, game.t);
    drawFlag(game.world.flag, game.t);
    for (const q of game.particles) {
      ctx.globalAlpha = Math.max(0, q.life / q.max);
      ctx.fillStyle = q.color;
      ctx.beginPath();
      ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    drawHero(game.player, game.t);
    ctx.restore();
  }

  /* ---------- ui / screens ---------- */
  function showScreen(id) {
    ["screen-title", "screen-levels", "screen-pause", "screen-dead", "screen-win"].forEach((s) => {
      const el = $(s);
      if (!id) {
        el.hidden = true;
        el.classList.remove("active");
      } else {
        el.hidden = s !== id;
        el.classList.toggle("active", s === id);
      }
    });
  }

  function syncTouch() {
    const touchy = ("ontouchstart" in window) || navigator.maxTouchPoints > 0;
    const narrow = window.matchMedia("(max-width: 900px)").matches;
    const noHover = window.matchMedia("(hover: none)").matches;
    $("touch").hidden = !(touchy || narrow || noHover);
  }

  function fillLevels() {
    const grid = $("level-grid");
    grid.innerHTML = "";
    LEVELS.forEach((lv, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "lvl";
      const locked = i + 1 > store.unlocked;
      if (locked) b.classList.add("locked");
      if (store.best[i] > 0) b.classList.add("done");
      b.disabled = locked;
      const stars = "★".repeat(store.best[i]) + "☆".repeat(Math.max(0, (lv.map.join("").match(/S/g) || []).length ? 0 : 0));
      const total = (lv.map.join("").match(/S/g) || []).length;
      b.innerHTML = "<span>" + (i + 1) + "</span><small>" + (locked ? "🔒" : store.best[i] ? store.best[i] + "/" + total + " ★" : lv.name.split(" ")[0]) + "</small>";
      b.setAttribute("aria-label", "Nivo " + (i + 1) + " " + lv.name + (locked ? " zaključan" : ""));
      b.addEventListener("click", () => {
        if (locked) return;
        beep("click");
        game.score = 0;
        startLevel(i, false);
      });
      grid.appendChild(b);
    });
  }

  function goTitle() {
    game.mode = "title";
    game.world = null;
    $("hud").hidden = true;
    showScreen("screen-title");
    syncTouch();
  }
  function goLevels() {
    game.mode = "levels";
    $("hud").hidden = true;
    fillLevels();
    showScreen("screen-levels");
  }
  function pause() {
    if (game.mode !== "play") return;
    game.mode = "pause";
    showScreen("screen-pause");
  }
  function resume() {
    if (game.mode !== "pause") return;
    game.mode = "play";
    showScreen(null);
  }
  function playFromTitle() {
    const i = Math.min(store.unlocked - 1, LEVELS.length - 1);
    game.score = 0;
    startLevel(i, false);
  }

  $("btn-play").addEventListener("click", () => {
    beep("click");
    ac();
    playFromTitle();
  });
  $("btn-levels").addEventListener("click", () => {
    beep("click");
    goLevels();
  });
  $("btn-levels-back").addEventListener("click", () => {
    beep("click");
    goTitle();
  });
  $("btn-resume").addEventListener("click", () => {
    beep("click");
    resume();
  });
  $("btn-restart").addEventListener("click", () => {
    beep("click");
    startLevel(game.world.index, false);
  });
  $("btn-pause-levels").addEventListener("click", () => {
    beep("click");
    goLevels();
  });
  $("btn-menu").addEventListener("click", () => pause());
  $("btn-dead-retry").addEventListener("click", () => {
    beep("click");
    startLevel(game.world.index, false);
  });
  $("btn-dead-levels").addEventListener("click", () => {
    beep("click");
    goLevels();
  });
  $("btn-next").addEventListener("click", () => {
    beep("click");
    const i = game.world.index;
    if (i >= LEVELS.length - 1) goLevels();
    else startLevel(i + 1, true);
  });
  $("btn-win-levels").addEventListener("click", () => {
    beep("click");
    goLevels();
  });
  $("btn-mute").addEventListener("click", () => {
    audio.muted = !audio.muted;
    store.muted = audio.muted;
    saveStore();
    syncMute();
    if (!audio.muted) {
      ac();
      beep("click");
    }
  });

  /* ---------- loop ---------- */
  let last = 0, acc = 0, manual = false;
  const STEP = 1000 / 60;
  function frame(now) {
    if (!last) last = now;
    let dt = now - last;
    last = now;
    if (dt > 80) dt = 80;
    acc += dt;
    while (acc >= STEP) {
      if (!manual) {
        if (game.mode === "play") updatePlay();
        else game.t++;
      }
      acc -= STEP;
    }
    drawWorld();
    requestAnimationFrame(frame);
  }

  /* ---------- test API ---------- */
  window.Igrica = {
    TILE,
    GRAVITY,
    JUMP,
    MOVE,
    LEVELS,
    get mode() {
      return game.mode;
    },
    getState() {
      if (!game.world || !game.player) return { mode: game.mode };
      const p = game.player;
      return {
        mode: game.mode,
        index: game.world.index,
        lives: game.lives,
        stars: collectedCount(),
        totalStars: game.world.stars.length,
        score: game.score + game.runScore,
        player: { x: p.x, y: p.y, vx: p.vx, vy: p.vy, onGround: p.onGround, coyote: p.coyote, dead: p.dead, won: p.won, w: p.w, h: p.h },
        flag: game.world.flag,
        enemies: game.world.enemies.filter((e) => !e.dead).map((e) => ({ x: e.x, y: e.y, w: e.w, h: e.h, vx: e.vx })),
        spikes: game.world.spikes,
        movers: game.world.movers.map((m) => ({ x: m.x, y: m.y, w: m.w, h: m.h, dx: m.dx, dy: m.dy, axis: m.axis })),
        solids: game.world.solids,
        pxW: game.world.pxW,
        pxH: game.world.pxH,
      };
    },
    setKeys(k) {
      if (k.left != null) keys.left = !!k.left;
      if (k.right != null) keys.right = !!k.right;
      if (k.jump != null) {
        const j = !!k.jump;
        if (j && !keys.jump) jumpBuf.t = BUFFER;
        keys.jump = j;
      }
    },
    startLevel(i) {
      game.score = 0;
      startLevel(i, false);
    },
    setManual(v) {
      manual = !!v;
    },
    step(n) {
      const c = n == null ? 1 : n;
      for (let i = 0; i < c; i++) {
        if (game.mode === "play") updatePlay();
        else game.t++;
      }
    },
    goTitle,
    parseLevel,
  };

  /* init */
  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", () => setTimeout(resize, 120));
  syncMute();
  syncTouch();
  window.addEventListener("resize", syncTouch);
  showScreen("screen-title");
  requestAnimationFrame(frame);
})();
