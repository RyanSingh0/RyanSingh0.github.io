/* demos.js: the live figures. All data comes from window.DATA (assets/data.js),
   exported from the public repos; nothing here is made up except the Side B game,
   which is labelled as pure noise on purpose. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const D = window.DATA;
  const NS = "http://www.w3.org/2000/svg";
  const fmt = (n, d = 0) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ================= Figure 1: the dollar index, two feeds ================= */
  const fig = { mode: "free", first: true };
  function drawDXY() {
    const host = $("#dxy-plot"); if (!host) return;
    const W = Math.max(300, host.clientWidth), H = Math.max(220, host.clientHeight);
    const narrow = W < 560;
    const m = { l: narrow ? 36 : 46, r: narrow ? 14 : 120, t: 18, b: 30 };
    const { dates, free, exch } = D.dxy;
    const n = dates.length;
    const lo = 55, hi = 125;
    const x = (i) => m.l + (i / (n - 1)) * (W - m.l - m.r);
    const y = (v) => m.t + (1 - (v - lo) / (hi - lo)) * (H - m.t - m.b);
    const path = (arr) => arr.map((v, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1)).join("");
    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">`;
    [60, 80, 100, 120].forEach((v) => {
      s += `<line class="${v === 100 ? "base100" : "ax"}" x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}"/>`;
      s += `<text class="ax-t" x="${m.l - 6}" y="${y(v) + 4}" text-anchor="end">$${v}</text>`;
    });
    const step = narrow ? 4 : 2;
    for (let yr = 2011; yr <= 2025; yr += step) {
      const i = dates.findIndex((d) => d >= yr + "-01-01"); if (i < 0) continue;
      s += `<line class="ax" x1="${x(i)}" x2="${x(i)}" y1="${H - m.b}" y2="${H - m.b + 4}"/><text class="ax-t" x="${x(i)}" y="${H - m.b + 18}" text-anchor="middle">${yr}</text>`;
    }
    s += `<line class="ax" x1="${m.l}" x2="${W - m.r}" y1="${H - m.b}" y2="${H - m.b}"/>`;
    const showFree = fig.mode !== "exch", showExch = fig.mode !== "free";
    s += `<path id="ln-exch" class="ln-exch ${showExch ? "" : "ln-dim"}" d="${path(exch)}"/>`;
    s += `<path id="ln-free" class="ln-free ${showFree ? "" : "ln-dim"}" d="${path(free)}"/>`;
    const fx = x(n - 1), fy = y(free[n - 1]), ex = y(exch[n - 1]);
    if (showFree) s += `<circle class="dot-end" cx="${fx}" cy="${fy}" r="4.5" fill="var(--pen)"/>`;
    if (showExch) s += `<circle class="dot-end" cx="${fx}" cy="${ex}" r="4.5" fill="var(--ledger)"/>`;
    if (!narrow) {
      if (showFree) s += `<text class="note-hand pen" x="${fx + 10}" y="${fy + 6}">$61.68</text>`;
      if (showExch) s += `<text class="note-hand ink" x="${fx + 10}" y="${ex + 6}">$108.08</text>`;
    }
    // handwritten margin notes, placed at fixed fractions so they scale with the chart
    const ai = Math.round(n * 0.52);
    if (fig.mode === "free") {
      const ax = x(ai), ay = y(free[ai]);
      const tx = narrow ? m.l + 30 : x(Math.round(n * 0.18)), ty = narrow ? y(94) : y(70);
      if (!narrow) {
        s += `<path class="note-line pen" d="M${tx + 120} ${ty - 22} Q ${ax - 20} ${ty - 30} ${ax - 4} ${ay + 8}"/>`;
        s += `<path class="note-line pen" d="M${ax - 12} ${ay + 6} L${ax - 4} ${ay + 9} L${ax - 3} ${ay}"/>`;
      }
      s += `<text class="note-hand pen" x="${tx}" y="${ty}">Down almost every year since 2013.</text>`;
      s += `<text class="note-hand pen" x="${tx}" y="${ty + 24}">Short it and get rich?</text>`;
    } else if (fig.mode === "exch") {
      const tx = narrow ? m.l + 30 : x(Math.round(n * 0.08)), ty = narrow ? y(90) : y(118);
      s += `<text class="note-hand ink" x="${tx}" y="${ty}">Same nights, the traded contract:</text>`;
      s += `<text class="note-hand ink" x="${tx}" y="${ty + 24}">no pattern to trade.</text>`;
    }
    s += `<line id="dxy-cross" class="ax" x1="0" x2="0" y1="${m.t}" y2="${H - m.b}" visibility="hidden"/>`;
    s += `<rect id="dxy-hit" x="${m.l}" y="${m.t}" width="${W - m.l - m.r}" height="${H - m.t - m.b}" fill="transparent"/>`;
    s += `</svg>`;
    host.innerHTML = s;
    if (fig.first && !reduced) {
      const p = $("#ln-free"); const len = p.getTotalLength();
      p.style.setProperty("--len", len); p.classList.add("draw");
    }
    fig.first = false;
    readout();
    const hit = $("#dxy-hit"), cross = $("#dxy-cross");
    const move = (ev) => {
      const r = host.getBoundingClientRect();
      const px = (ev.clientX - r.left) * (W / r.width);
      const i = Math.max(0, Math.min(n - 1, Math.round(((px - m.l) / (W - m.l - m.r)) * (n - 1))));
      cross.setAttribute("x1", x(i)); cross.setAttribute("x2", x(i)); cross.setAttribute("visibility", "visible");
      readout(i);
    };
    hit.addEventListener("pointermove", move);
    hit.addEventListener("pointerdown", move);
    hit.addEventListener("pointerleave", () => { cross.setAttribute("visibility", "hidden"); readout(); });
  }
  function readout(i) {
    const { dates, free, exch } = D.dxy; const el = $("#dxy-readout");
    const last = i == null;
    const k = last ? dates.length - 1 : i;
    const when = last ? "Dec 2010 → Dec 2025" : new Date(dates[k] + "T12:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" });
    const f = `<span class="k-free">Spot index, free feed: <b>$${fmt(free[k], 2)}</b>${last ? ", Sharpe −1.36" : ""}</span>`;
    const e = `<span class="k-exch">ICE futures via Barchart: <b>$${fmt(exch[k], 2)}</b>${last ? ", Sharpe +0.25" : ""}</span>`;
    el.innerHTML = `<span>${when}</span>` + (fig.mode === "exch" ? e : fig.mode === "free" ? f : f + e);
  }
  $$(".fig1 .seg-b").forEach((b) => b.addEventListener("click", () => {
    fig.mode = b.dataset.src;
    $$(".fig1 .seg-b").forEach((o) => o.setAttribute("aria-pressed", String(o === b)));
    drawDXY();
  }));

  /* ================= Readmission call list ================= */
  function readmit() {
    const sl = $("#cap-slider"); if (!sl) return;
    const total = D.readmit.readmits;
    const row = (label, v, cls) => `<div class="cap-row"><span>${label}</span><span class="cap-track"><span class="cap-fill ${cls}" style="width:${(100 * v / total).toFixed(2)}%"></span></span><span class="num">${fmt(v)}</span></div>`;
    const upd = () => {
      const p = +sl.value; const c = D.readmit.cap.find((r) => r[0] === p);
      const [pct, k, caught, rand] = c;
      $("#cap-pct").textContent = "top " + pct + "%";
      $("#cap-bars").innerHTML = row("Model’s list", caught, "") + row("Random list", rand, "rand");
      $("#cap-text").textContent = `Calling the riskiest ${pct}% (${fmt(k)} discharges) reaches ${fmt(caught)} future readmissions, ${(caught / rand).toFixed(1)}× the ${fmt(rand)} that random calls reach: ${(100 * caught / total).toFixed(0)}% of all ${fmt(total)}.`;
      sl.setAttribute("aria-valuetext", `top ${pct} percent: ${fmt(caught)} readmissions reached versus ${fmt(rand)} at random`);
    };
    sl.addEventListener("input", upd); upd();
  }

  /* ================= WikiFlow ================= */
  const MODELS = {
    lr: { auc: "0.845", t: "19 s", note: "From-scratch logistic regression on Spark RDDs. Precision 0.772, recall 0.908: catches more of the editors who leave, and you can read every coefficient." },
    dnn: { auc: "0.909", t: "86 s", note: "Keras network distributed with Elephas. Precision 0.873, recall 0.874: 6.4 AUC points more for 4.5× the training time." }
  };
  function wiki() {
    const card = $("#model-card"); if (!card) return;
    const show = (k) => {
      const M = MODELS[k];
      card.innerHTML = `<div><span class="big">${M.auc}</span><span class="lab">AUC on held-out editors</span></div><div><span class="big">${M.t}</span><span class="lab">training time on the cluster</span></div><p>${M.note}</p>`;
      $$("#s-wiki .seg-b").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.model === k)));
    };
    $$("#s-wiki .seg-b").forEach((b) => b.addEventListener("click", () => show(b.dataset.model)));
    show("lr");
    const A = [["Casual contributors", 402276], ["Frustrated burst editors", 308377], ["Focused, bot-like editors", 307231], ["Power users on talk pages", 140364]];
    const max = A[0][1];
    $("#arch").innerHTML = A.map(([l, v]) => `<div class="arch-row"><span>${l}</span><span class="arch-bar" style="width:${(100 * v / max).toFixed(1)}%"></span><span class="num">${fmt(v)}</span></div>`).join("");
  }

  /* ================= MBTA ================= */
  const mb = { closed: new Set(["place-coecl"]) };
  const LINE = { Red: "var(--l-red)", Orange: "var(--l-orange)", Blue: "var(--l-blue)", Green: "var(--l-green)", Mattapan: "var(--l-matt)" };
  const LABELS = new Set(["Copley", "Park Street", "Alewife", "Oak Grove", "Wonderland", "Medford/Tufts", "Bowdoin", "Riverside", "Boston College", "Heath Street", "Forest Hills", "JFK/UMass", "Ashmont", "Braintree"]);
  function mbta() {
    const host = $("#mbta-map"); if (!host) return;
    const { nodes, edges } = D.mbta;
    const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
    const adj = {}; nodes.forEach((n) => (adj[n.id] = []));
    edges.forEach(([u, v]) => { adj[u].push(v); adj[v].push(u); });
    // Equirectangular in km, then a radial fisheye around Park Street (r -> r^0.55),
    // the way transit diagrams open up downtown. Topology is untouched.
    const c = byId["place-pktrm"] || nodes[0], kx = 111.32 * Math.cos(c.la * Math.PI / 180), ky = 110.57;
    const raw = nodes.map((n) => { const dx = (n.lo - c.lo) * kx, dy = (n.la - c.la) * ky, r = Math.hypot(dx, dy) || 1e-9, r2 = Math.pow(r, 0.55); return [n.id, dx / r * r2, -dy / r * r2]; });
    const xs = raw.map((p) => p[1]), ys = raw.map((p) => p[2]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const S = 1000, pad = 70, span = Math.max(maxX - minX, maxY - minY), sc = (S - 2 * pad) / span;
    const ox = pad + ((S - 2 * pad) - (maxX - minX) * sc) / 2, oy = pad + ((S - 2 * pad) - (maxY - minY) * sc) / 2;
    const P = Object.fromEntries(raw.map(([id, X, Y]) => [id, [ox + (X - minX) * sc, oy + (Y - minY) * sc]]));
    const px = (n) => P[n.id][0], py = (n) => P[n.id][1];
    let s = `<svg viewBox="0 0 ${S} ${S}">`;
    edges.forEach(([u, v, l], i) => { const a = byId[u], b = byId[v]; s += `<line class="seg-ln" data-u="${u}" data-v="${v}" stroke="${LINE[l] || "var(--ink-2)"}" x1="${px(a).toFixed(1)}" y1="${py(a).toFixed(1)}" x2="${px(b).toFixed(1)}" y2="${py(b).toFixed(1)}"/>`; });
    nodes.forEach((n) => {
      const r = n.t ? 9 : 6.5;
      s += `<g class="st" data-id="${n.id}" tabindex="0" role="button" aria-pressed="false" aria-label="${n.n}"><title>${n.n} (closing it alone severs ${n.p}%)</title><circle class="hit" cx="${px(n).toFixed(1)}" cy="${py(n).toFixed(1)}" r="16"/><circle class="dot" cx="${px(n).toFixed(1)}" cy="${py(n).toFixed(1)}" r="${r}"/></g>`;
      if (LABELS.has(n.n)) {
        const right = n.n === "Copley" ? false : px(n) < S * 0.62;
        s += `<text class="mbta-lab" x="${(px(n) + (right ? 13 : -13)).toFixed(1)}" y="${(py(n) + 4).toFixed(1)}" text-anchor="${right ? "start" : "end"}">${n.n}</text>`;
      }
    });
    s += `</svg>`;
    host.innerHTML = s;
    const ids = nodes.map((n) => n.id);
    function update() {
      const closed = mb.closed;
      const rem = ids.filter((i) => !closed.has(i));
      const comp = {}; const sizes = [];
      rem.forEach((s0) => {
        if (comp[s0] != null) return;
        const c = sizes.length; let cnt = 0; const st = [s0]; comp[s0] = c;
        while (st.length) { const a = st.pop(); cnt++; adj[a].forEach((b) => { if (!closed.has(b) && comp[b] == null) { comp[b] = c; st.push(b); } }); }
        sizes.push(cnt);
      });
      const m = rem.length, tot = m * (m - 1) / 2;
      const ok = sizes.reduce((a, c) => a + c * (c - 1) / 2, 0);
      const pct = tot ? 100 * (tot - ok) / tot : 0;
      const big = sizes.indexOf(Math.max(...sizes));
      $$(".st", host).forEach((g) => {
        const id = g.dataset.id, isC = closed.has(id);
        g.classList.toggle("closed", isC);
        g.classList.toggle("cut", !isC && comp[id] !== big);
        g.setAttribute("aria-pressed", String(isC));
        g.setAttribute("aria-label", byId[id].n + (isC ? ", closed. Activate to reopen" : ", open. Activate to close"));
      });
      $$(".seg-ln", host).forEach((l) => {
        const u = l.dataset.u, v = l.dataset.v;
        l.classList.toggle("cut", closed.has(u) || closed.has(v) || comp[u] !== big);
      });
      $("#mbta-pct").textContent = pct.toFixed(1) + "%";
      const names = [...closed].map((i) => byId[i].n);
      $("#mbta-text").textContent = !names.length ? "Every station can reach every other. Click a station to close it."
        : `of station pairs can no longer reach each other with ${names.length === 1 ? names[0] : names.length + " stations"} closed.`;
    }
    const toggle = (g) => { const id = g.dataset.id; mb.closed.has(id) ? mb.closed.delete(id) : mb.closed.add(id); update(); };
    host.addEventListener("click", (e) => { const g = e.target.closest(".st"); if (g) toggle(g); });
    host.addEventListener("keydown", (e) => { const g = e.target.closest(".st"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); toggle(g); } });
    $("#mbta-reset").addEventListener("click", () => { mb.closed.clear(); update(); });
    $("#mbta-worst").addEventListener("click", () => { mb.closed = new Set(["place-coecl"]); update(); });
    update();
  }

  /* ================= JudgeGuard trace ================= */
  function trace() {
    const out = $("#trace-out"); if (!out) return;
    $$("[data-verdict]").forEach((b) => b.addEventListener("click", () => {
      const step = $("#trace-step");
      if (!step.classList.contains("bad")) {
        step.classList.add("bad");
        step.insertAdjacentHTML("beforeend", `<span class="fix">4200 × 28.5 = 119,700</span>`);
      }
      out.textContent = b.dataset.verdict === "flag"
        ? "Right. The final answer matches, but step 3 recorded 115,500 when the arithmetic gives 119,700. A judge that reads only the final answer passes this trace; JudgeGuard replays the call and flags the exact step."
        : "That’s what a judge reading only the final answer would say. Replay step 3: 4200 × 28.5 is 119,700, but the trace recorded 115,500. JudgeGuard flags the exact step.";
      $$("[data-verdict]").forEach((x) => (x.disabled = true));
    }));
  }

  /* ================= small bar figures ================= */
  function bars(id, groups, max) {
    const el = document.getElementById(id); if (!el) return;
    el.innerHTML = groups.map((g) => (g.label ? `<p class="bar-group">${g.label}</p>` : "") + g.rows.map((r) =>
      `<div class="bar-row"><span>${r.l}</span><span><span class="bar-fill ${r.c || ""}" style="display:block;width:${(100 * r.v / max).toFixed(1)}%"></span></span><span class="num">${r.t}</span></div>`).join("")).join("");
  }
  function staticFigures() {
    bars("commod-bars", [
      { label: "Commodity ETFs", rows: [{ l: "Monthly winners", v: 337, t: "$337", c: "hi" }, { l: "Equal weight", v: 121, t: "$121" }, { l: "DBC benchmark", v: 86, t: "$86" }] },
      { label: "Commodity futures", rows: [{ l: "Semiannual median", v: 170, t: "$170", c: "hi" }, { l: "Equal weight", v: 126, t: "$113–126" }, { l: "BCOM benchmark", v: 103, t: "$103" }] }
    ], 337);
    bars("risk-bars", [{ rows: [{ l: "Block bootstrap", v: 11.1, t: "11.1%", c: "lo" }, { l: "Normal model", v: 7.4, t: "7.4%" }] }], 11.1);
    bars("retail-bars", [{ rows: [{ l: "Delivered on time", v: 4.29, t: "4.29 ★", c: "hi" }, { l: "Delivered late", v: 2.57, t: "2.57 ★", c: "lo" }] }], 5);
  }

  /* ================= Side B: Overfit me ================= */
  const G = { round: 0, picks: [], strats: [], pick: -1, revealed: false, playing: null };
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function gauss(r) { let u = 0, v = 0; while (u === 0) u = r(); v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  const IS = 756, OOS = 504;
  const sharpe = (a) => { const mu = a.reduce((x, y) => x + y, 0) / a.length; const sd = Math.sqrt(a.reduce((x, y) => x + (y - mu) ** 2, 0) / (a.length - 1)); return mu / sd * Math.sqrt(252); };
  function deal() {
    const r = rng((Date.now() ^ (G.round * 2654435761)) >>> 0);
    G.strats = Array.from({ length: 12 }, (_, i) => {
      const ret = Array.from({ length: IS + OOS }, () => 0.01 * gauss(r));
      const eq = [100]; ret.forEach((x) => eq.push(eq[eq.length - 1] * (1 + x)));
      return { name: "Strategy " + String.fromCharCode(65 + i), ret, eq, srIn: sharpe(ret.slice(0, IS)), srOut: sharpe(ret.slice(IS)) };
    });
    G.pick = -1; G.revealed = false; G.round++;
    renderGame();
    $("#game-msg").textContent = "Pick the strategy you’d fund. Higher backtest Sharpe looks better, right?";
    $("#game-next").textContent = "Run the next two years"; $("#game-next").disabled = true;
  }
  function spark(st) {
    const W = 200, H = 60, upto = G.revealed ? IS + OOS : IS;
    const pts = st.eq.slice(0, upto + 1);
    const lo = Math.min(...pts), hi = Math.max(...pts);
    const X = (i) => (i / (IS + OOS)) * W, Y = (v) => 4 + (1 - (v - lo) / (hi - lo || 1)) * (H - 8);
    const d = (a, off) => a.map((v, i) => (i ? "L" : "M") + X(i + off).toFixed(1) + " " + Y(v).toFixed(1)).join("");
    let s = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><line class="sp-split" x1="${X(IS)}" x2="${X(IS)}" y1="0" y2="${H}"/><path class="sp-in" vector-effect="non-scaling-stroke" d="${d(st.eq.slice(0, IS + 1), 0)}"/>`;
    if (G.revealed) s += `<path class="sp-out" vector-effect="non-scaling-stroke" d="${d(st.eq.slice(IS), IS)}"/>`;
    return s + "</svg>";
  }
  const srTxt = (v) => (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(2);
  function renderGame() {
    const grid = $("#game-grid"); if (!grid) return;
    grid.innerHTML = G.strats.map((st, i) => `<button type="button" class="strat" role="radio" aria-checked="${i === G.pick}" data-i="${i}" aria-label="${st.name}, backtest Sharpe ${st.srIn.toFixed(2)}${G.revealed ? ", next two years " + st.srOut.toFixed(2) : ""}">
      <span class="sname">${st.name}</span>${spark(st)}
      <span class="ssr ${st.srIn >= 0 ? "pos" : "neg"}">Backtest ${srTxt(st.srIn)}</span>
      ${G.revealed ? `<span class="ssr ${st.srOut >= 0 ? "pos" : "neg"}">Next 2 yrs ${srTxt(st.srOut)}</span>` : ""}</button>`).join("");
  }
  function reveal() {
    G.revealed = true; renderGame();
    const p = G.strats[G.pick];
    const best = G.strats.reduce((a, b) => (b.srIn > a.srIn ? b : a));
    G.picks.push([p.srIn, p.srOut]);
    const avgIn = G.picks.reduce((a, x) => a + x[0], 0) / G.picks.length, avgOut = G.picks.reduce((a, x) => a + x[1], 0) / G.picks.length;
    $("#game-msg").innerHTML = `You funded ${p.name}: backtest Sharpe ${srTxt(p.srIn)}, next two years ${srTxt(p.srOut)}. The best-looking backtest, ${best.name}, went from ${srTxt(best.srIn)} to ${srTxt(best.srOut)}. <b>Every strategy here was a coin flip with zero expected return.</b> Picking the best of twelve finds luck, which is why my <a href="#bib-risks">Risks paper</a> declares every configuration tried.`;
    $("#game-score").textContent = `Your picks so far: ${G.picks.length} round${G.picks.length > 1 ? "s" : ""}, average backtest Sharpe ${srTxt(avgIn)}, average next-two-years Sharpe ${srTxt(avgOut)}.`;
    $("#game-next").textContent = "Deal a new round"; $("#game-next").disabled = false;
  }
  function game() {
    if (!$("#game-grid")) return;
    deal();
    $("#game-grid").addEventListener("click", (e) => {
      const b = e.target.closest(".strat"); if (!b || G.revealed) return;
      G.pick = +b.dataset.i; renderGame();
      $("#game-grid .strat[data-i='" + G.pick + "']").focus();
      $("#game-msg").textContent = `${G.strats[G.pick].name} it is, backtest Sharpe ${srTxt(G.strats[G.pick].srIn)}. Ready when you are.`;
      $("#game-next").disabled = false;
    });
    $("#game-next").addEventListener("click", () => { if (G.revealed) deal(); else if (G.pick >= 0) reveal(); });
    $("#game-listen").addEventListener("click", listen);
  }
  /* sonify: the equity curve sampled 48 times, mapped onto a C minor pentatonic over two octaves */
  function listen() {
    const btn = $("#game-listen");
    if (G.playing) { G.playing.close(); G.playing = null; btn.textContent = "Listen to it"; return; }
    let ac; try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { window.toast && window.toast("Sound isn’t available in this browser."); return; }
    const st = G.strats[G.pick >= 0 ? G.pick : 0];
    const upto = G.revealed ? IS + OOS : IS, N = 48;
    const pts = Array.from({ length: N }, (_, i) => st.eq[Math.round(i * upto / (N - 1))]);
    const lo = Math.min(...pts), hi = Math.max(...pts);
    const scale = [0, 3, 5, 7, 10, 12, 15, 17, 19, 22, 24];
    const t0 = ac.currentTime + 0.05, dur = 0.12;
    pts.forEach((v, i) => {
      const deg = scale[Math.round(((v - lo) / (hi - lo || 1)) * (scale.length - 1))];
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = i >= N * IS / upto && G.revealed ? "sawtooth" : "triangle";
      o.frequency.value = 220 * Math.pow(2, deg / 12);
      o.connect(g); g.connect(ac.destination);
      const t = t0 + i * dur;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.95);
      o.start(t); o.stop(t + dur);
    });
    G.playing = ac; btn.textContent = "Stop";
    setTimeout(() => { if (G.playing === ac) { ac.close(); G.playing = null; btn.textContent = "Listen to it"; } }, (N * dur + 0.3) * 1000);
    window.toast && window.toast(`Playing ${st.name}${G.revealed ? "; the buzzier notes are the out-of-sample years" : ""}.`);
  }

  /* ================= boot ================= */
  drawDXY(); readmit(); wiki(); mbta(); trace(); staticFigures(); game();
  let rz; window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(drawDXY, 120); });
})();
