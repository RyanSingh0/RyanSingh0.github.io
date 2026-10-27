/* site.js: the page furniture. Sources, theme, lens, résumés, search, small delights.
   No framework on purpose. Everything here should still make sense in a year. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode: fine */ } }
  };

  /* ---------- résumés ----------
     Drop fresh PDFs into the repo root with these names. Set `on: false` to hide one. */
  const RESUMES = [
    { label: "Data Analyst", file: "Aryan_Meena_Resume_DA.pdf", on: true, lens: ["da", "de"] },
    { label: "Data Scientist", file: "Aryan_Meena_Resume_DS.pdf", on: true, lens: ["ds", "ai", "research"] },
    { label: "Quant / Risk", file: "Aryan_Meena_Resume_QR.pdf", on: true, lens: ["quant"] }
  ];
  const SITE = "https://ryansingh0.github.io/";
  const resumeHref = (r) => (location.hostname.endsWith("github.io") ? "" : SITE) + r.file;
  function renderResumes() {
    const html = RESUMES.filter((r) => r.on)
      .map((r) => `<a href="${resumeHref(r)}" rel="noopener">${r.label} (PDF)</a>`).join(" ");
    $$("#resume-links, #resume-links-2").forEach((el) => { el.innerHTML = html; });
  }
  window.SITE_RESUMES = RESUMES;
  window.resumeHref = resumeHref;

  /* ---------- toast + copy ---------- */
  let toastT;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2600);
  }
  window.toast = toast;
  function copyText(text, okMsg) {
    const done = () => toast(okMsg || "Copied");
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      ta.remove();
      toast(ok ? (okMsg || "Copied") : "Select the text and copy it: " + text);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  }
  window.copyText = copyText;
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-copy]");
    if (b) copyText(b.dataset.copy, "Email copied: " + b.dataset.copy);
    const c = e.target.closest("[data-cite]");
    if (c) copyText(CITES[c.dataset.cite], "Citation copied (APA)");
  });

  const CITES = {
    risks: "Meena, A., & Pinsky, E. (2026). Two Blind Spots in Backtest Validation: From a Manufactured Dollar Index Anomaly to a Corrected Null Result. Risks, 14(11), 247. https://doi.org/10.3390/risks14110247",
    wikiflow: "Meena, A., Patel, K. M. K., & Alizadeh-Shabdiz, F. (2026). WikiFlow: Predicting Wikipedia Editor Dropout at Scale Using Distributed Machine Learning on Google Cloud. In Computer Science and Education in Computer Science (CSECS 2026), LNICST vol. 725, pp. 361–376. Springer. https://doi.org/10.1007/978-3-032-42320-7_22"
  };

  /* ---------- theme ---------- */
  const root = document.documentElement;
  const saved = store.get("theme");
  if (saved === "dark" || saved === "light") root.dataset.theme = saved;
  const isDark = () => root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  function syncThemeButton() {
    const b = $("#theme-toggle");
    b.setAttribute("aria-label", isDark() ? "Switch to light pages" : "Switch to dark pages");
  }
  function toggleTheme() {
    root.dataset.theme = isDark() ? "light" : "dark";
    store.set("theme", root.dataset.theme);
    syncThemeButton();
  }
  window.toggleTheme = toggleTheme;

  /* ---------- sources ----------
     Every [data-r] figure becomes a button with a numbered note. Numbers follow first appearance. */
  const REFS = {
    "bu": { t: "Boston University, MS Applied Data Analytics", d: "Metropolitan College, January 2025 to May 2026, GPA 3.75 of 4.0. Transcript available on request." },
    "risks": { t: "Meena & Pinsky (2026), Risks 14(11), 247", d: "Published 23 October 2026, MDPI. Open access.", u: "https://www.mdpi.com/2227-9091/14/11/247" },
    "risks-t2": { t: "Risks paper, scale-free decomposition table", d: "Overnight leg on the 3,793 sessions both series report: free spot-index feed Sharpe −1.358 ($100 → $61.68); ICE Dollar Index futures (Barchart) +0.252 ($100 → $108.08, p = 0.33).", u: "https://doi.org/10.3390/risks14110247" },
    "risks-spot": { t: "Risks paper, independent spot cross-check", d: "A synthetic DXY built with ICE’s formula from the free provider’s own six constituent spot bars has an overnight Sharpe of +0.22. The futures basis test, the open-location screen (204 opens at the low vs 82 at the high) and Federal Reserve H.10 closes (correlation 0.86) point to the recorded opens, not spot vs futures.", u: "https://doi.org/10.3390/risks14110247" },
    "risks-pbo": { t: "Risks paper, overfitting diagnostics", d: "Probability of backtest overfitting (CSCV) 0.02 on the corrupted free series vs 0.77 on exchange data. The standard test certified the artefact.", u: "https://doi.org/10.3390/risks14110247" },
    "risks-fast": { t: "Risks paper, Revision 1: fast search engine", d: "41 base signals built once, overlays in NumPy. Reproduces the original harness exactly on all 1,312 daily net return series; 1.0 s vs 17.3 s.", u: "https://github.com/RyanSingh0/dxy-fx-strategies/tree/main/src/revision" },
    "dxy-repo": { t: "RyanSingh0/dxy-fx-strategies, data files", d: "ICE Dollar Index futures from Barchart (data/futures/DX.csv) and the free redistribution of the ICE spot index (data/vendor/fx_ohlc_2010_2025.csv); FRED series in data/fred. This page recomputes both curves from those files, and the end values match the paper to the cent.", u: "https://github.com/RyanSingh0/dxy-fx-strategies/tree/main/data" },
    "feeds": { t: "Backtest Reality Check, data-quality view", d: "Open-location screen run on 37 OHLC price series; 10 fail (including the free dollar-index feed). Published in a 12-table SQLite star schema with a live dashboard.", u: "https://ryansingh0.github.io/backtest-reality-check/" },
    "wikiflow": { t: "Meena, Patel & Alizadeh-Shabdiz (2026), Springer LNICST 725", d: "About 60M revision events, 1,158,248 editors, 1+4 node Dataproc cluster. RDD logistic regression AUC 0.845 in 19.05 s; Elephas DNN 0.909 in 86.37 s.", u: "https://link.springer.com/chapter/10.1007/978-3-032-42320-7_22" },
    "svc-checks": { t: "ServiceOps validation record", d: "Sixteen shared integrity checks plus the cloud Spark SQL aggregation check must pass before a report is published.", u: "https://github.com/RyanSingh0/service-operations-analytics-portfolio/blob/main/docs/validation.md" },
    "svc-findings": { t: "ServiceOps findings", d: "105,372 consumed deliveries replayed; five invalid deliveries quarantined, the rest reconciled.", u: "https://github.com/RyanSingh0/service-operations-analytics-portfolio/blob/main/docs/findings.md" },
    "svc-cost": { t: "ServiceOps measured costs", d: "Two G.1X Glue workers for 132 seconds = 264 DPU-seconds, about $0.0323 per successful run at $0.44 per DPU-hour.", u: "https://github.com/RyanSingh0/service-operations-analytics-portfolio/blob/main/docs/costs.md" },
    "svc-tests": { t: "ServiceOps test suite", d: "pytest collects 81 tests across ingestion, forecasting, intervals, monitoring and the pipeline.", u: "https://github.com/RyanSingh0/service-operations-analytics-portfolio/tree/main/tests" },
    "ta": { t: "Graduate Teaching Assistant, Boston University", d: "January to May 2026. MET CS 767 Advanced Machine Learning and MET CS 577 Data Science with Python." },
    "readmit-repo": { t: "RyanSingh0/hospital-readmission", d: "UCI Diabetes 130-US Hospitals. LightGBM AUC 0.6888 (95% CI 0.6837–0.6936) vs the published 0.664, matched nested patient-grouped CV (5 outer × 3 inner).", u: "https://github.com/RyanSingh0/hospital-readmission" },
    "readmit-dash": { t: "Readmission care-transitions dashboard", d: "Out-of-fold predictions on 99,340 encounters (deaths and hospice excluded); 11,314 readmissions; AUC 0.68. The slider reads the exported capacity curve.", u: "https://ryansingh0.github.io/hospital-readmission/" },
    "mbta-repo": { t: "RyanSingh0/mbta-community-detection", d: "MBTA GTFS Spring 2025. 125 stations, 127 segments, 3 independent cycles, 110 articulation points. Closing Copley severs 56.1% of station pairs.", u: "https://github.com/RyanSingh0/mbta-community-detection" },
    "judge-pilot": { t: "JudgeGuard real-model pilot", d: "Local Qwen3-4B on 100 SQuAD-derived pairs from 28 articles: 96 correct rankings; article-cluster bootstrap 95% interval 92.45–99.03%. Raw responses published.", u: "https://github.com/RyanSingh0/judgeguard/blob/main/results/pilot_live.json" },
    "judge-lat": { t: "JudgeGuard latency findings", d: "Guard path measured against a 150 ms p99 budget, with a concurrency sweep showing where the budget holds.", u: "https://github.com/RyanSingh0/judgeguard/blob/main/docs/findings.md" },
    "commod": { t: "Meena & Pinsky, under review at Commodities (MDPI)", d: "15 Bloomberg commodity total-return futures (Jan 2008 – Sep 2026) and 6 Invesco DB commodity ETFs (2008–2025). ETF monthly winners $100 → $337 vs $121 equal weight and $86 DBC; futures semiannual median $170 vs $113–126 equal weight and $103 BCOM." },
    "risk-repo": { t: "RyanSingh0/multi-asset-risk-engine", d: "Dec 2010 – Dec 2025. One-month (21-day) 99% ES: 11.1% by block bootstrap vs 7.4% by Gaussian Monte Carlo. Bank-style backtest Nov 2014 – Dec 2025, 2,796 days, 8 models.", u: "https://github.com/RyanSingh0/multi-asset-risk-engine" },
    "retail": { t: "RyanSingh0/RetailPulse", d: "Olist public dataset. 98,199 valid orders, R$15.74M GMV, 94,983 customers. On-time 4.29 stars vs 2.57 late.", u: "https://github.com/RyanSingh0/RetailPulse" },
    "medai": { t: "RyanSingh0/medai-amyloid", d: "BU MedAI Hackathon, Spring 2026. Validation n = 500: MAE 7.31 CL, Pearson r 0.968.", u: "https://github.com/RyanSingh0/medai-amyloid" },
    "exo": { t: "RyanSingh0/ExoQuery-Bench", d: "Archive traps checked live against the NASA Exoplanet Archive TAP service on 7 October 2026.", u: "https://github.com/RyanSingh0/ExoQuery-Bench" }
  };
  const order = [];
  function buildRefs() {
    $$("[data-r]").forEach((el) => {
      const key = el.dataset.r;
      if (!REFS[key]) return;
      let n = order.indexOf(key);
      if (n < 0) { order.push(key); n = order.length - 1; }
      const b = document.createElement("button");
      b.type = "button"; b.className = "fig-n"; b.dataset.r = key;
      b.setAttribute("aria-haspopup", "dialog"); b.setAttribute("aria-expanded", "false");
      b.innerHTML = el.innerHTML + `<sup aria-hidden="true">${n + 1}</sup>`;
      b.setAttribute("aria-label", el.textContent + ", source note " + (n + 1));
      el.replaceWith(b);
    });
    $("#ref-list").innerHTML = order.map((k, i) => {
      const r = REFS[k];
      return `<li id="ref-${i + 1}"><b>${r.t}.</b> ${r.d}${r.u ? ` <a href="${r.u}" rel="noopener">Link</a>` : ""}</li>`;
    }).join("");
  }
  const pop = () => $("#pop");
  let popFrom = null;
  function openPop(btn) {
    const k = btn.dataset.r, r = REFS[k], p = pop();
    $("#pop-n").textContent = "Note " + (order.indexOf(k) + 1);
    $("#pop-t").textContent = r.t;
    $("#pop-d").textContent = r.d;
    const a = $("#pop-u");
    if (r.u) { a.href = r.u; a.hidden = false; } else { a.hidden = true; }
    p.hidden = false;
    const rect = btn.getBoundingClientRect();
    const w = p.offsetWidth, vw = document.documentElement.clientWidth;
    let left = rect.left + window.scrollX;
    left = Math.max(12 + window.scrollX, Math.min(left, window.scrollX + vw - w - 12));
    let top = rect.bottom + window.scrollY + 8;
    if (rect.bottom + p.offsetHeight + 16 > window.innerHeight && rect.top > p.offsetHeight + 16) top = rect.top + window.scrollY - p.offsetHeight - 8;
    p.style.left = left + "px"; p.style.top = top + "px";
    if (popFrom) popFrom.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-expanded", "true");
    popFrom = btn;
    $("#pop-x").focus({ preventScroll: true });
  }
  function closePop(returnFocus) {
    const p = pop(); if (p.hidden) return;
    p.hidden = true;
    if (popFrom) { popFrom.setAttribute("aria-expanded", "false"); if (returnFocus) popFrom.focus({ preventScroll: true }); }
    popFrom = null;
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".fig-n");
    if (b) { e.preventDefault(); if (popFrom === b) closePop(true); else openPop(b); return; }
    if (e.target.closest("#pop-x")) { closePop(true); return; }
    if (!e.target.closest("#pop")) closePop(false);
  });

  /* ---------- lens ---------- */
  const LENSES = {
    all: { order: ["s-dxy", "s-readmit", "s-svc", "s-wiki", "s-mbta", "s-judge", "s-commod", "s-risk", "s-retail", "s-medai", "s-exo"] },
    da: {
      name: "a data analyst or BI role",
      order: ["s-retail", "s-svc", "s-readmit", "s-dxy", "s-mbta", "s-wiki", "s-commod", "s-risk", "s-judge", "s-medai", "s-exo"],
      brief: "Start with RetailPulse (PostgreSQL star schema into a Power BI report with DAX) and the live AWS dashboard. Every number I publish passes checks first: 17 integrity gates in the pipeline, and 10 faulty feeds caught out of 37 in my research. I also make the Excel first pass before anything goes into Python.",
      links: [["Live Power BI report", "https://app.powerbi.com/view?r=eyJrIjoiYTBmMDI3ZWMtMDExZC00MmM0LTk5ZTYtYjY4YTlhNTk4N2EyIiwidCI6ImQ1N2QzMmNjLWMxMjEtNDg4Zi1iMDdiLWRmZTcwNTY4MGM3MSIsImMiOjN9&pageName=f28b4b4a651ff21ecd55"], ["Live AWS dashboard", "https://d17q1whdf7htno.cloudfront.net/"], ["Tableau readmission dashboard", "https://public.tableau.com/app/profile/aryan.meena2899/viz/ReadmissionOutreachCapacityandModelEvaluation/Readmissionoutreach"]]
    },
    ds: {
      name: "a data science or ML role",
      order: ["s-readmit", "s-wiki", "s-judge", "s-mbta", "s-svc", "s-dxy", "s-medai", "s-risk", "s-commod", "s-retail", "s-exo"],
      brief: "Start with the readmission study: AUC 0.689 against a published 0.664 under matched validation, then a call list a hospital could actually run. WikiFlow shows distributed ML on 60M events, and JudgeGuard shows how I evaluate models I don’t trust yet.",
      links: [["Readmission dashboard", "https://ryansingh0.github.io/hospital-readmission/"], ["WikiFlow on Springer", "https://link.springer.com/chapter/10.1007/978-3-032-42320-7_22"], ["JudgeGuard workbench", "https://huggingface.co/spaces/RugFace/judgeguard-app"]]
    },
    quant: {
      name: "a quant, risk or model-validation role",
      order: ["s-dxy", "s-commod", "s-risk", "s-svc", "s-readmit", "s-wiki", "s-mbta", "s-judge", "s-retail", "s-medai", "s-exo"],
      brief: "Start with the published Risks paper: a 15-year dollar anomaly traced to a bad data feed, and why standard overfitting checks certified it. Then the risk engine (8 VaR models backtested over 2,796 days) and a commodity paper under review. A year trading a funded FX account taught me drawdown limits from the inside.",
      links: [["Risks paper (open access)", "https://www.mdpi.com/2227-9091/14/11/247"], ["Backtest Reality Check dashboard", "https://ryansingh0.github.io/backtest-reality-check/"], ["Risk engine code", "https://github.com/RyanSingh0/multi-asset-risk-engine"]]
    },
    de: {
      name: "a data engineering role",
      order: ["s-svc", "s-wiki", "s-retail", "s-dxy", "s-judge", "s-readmit", "s-mbta", "s-risk", "s-commod", "s-medai", "s-exo"],
      brief: "Start with the AWS pipeline: incremental ingestion with duplicate, late and corrected deliveries, 17 integrity gates, 81 tests, OIDC releases, about $0.03 a run. WikiFlow moves 25 GB through Spark on Dataproc into BigQuery; RetailPulse goes raw to clean to mart in PostgreSQL.",
      links: [["Live AWS dashboard", "https://d17q1whdf7htno.cloudfront.net/"], ["Pipeline code", "https://github.com/RyanSingh0/service-operations-analytics-portfolio"], ["WikiFlow code", "https://github.com/RyanSingh0/wikiflow"]]
    },
    ai: {
      name: "an AI or LLM evaluation role",
      order: ["s-judge", "s-exo", "s-medai", "s-wiki", "s-readmit", "s-svc", "s-dxy", "s-mbta", "s-risk", "s-commod", "s-retail"],
      brief: "Start with JudgeGuard: it replays agent tool calls to catch the wrong step behind a right answer, and tests whether LLM judges hold up (96 of 100 on real Qwen3-4B pairs, raw responses published). ExoQuery-Bench is the benchmark I’m building next, for natural-language-to-ADQL assistants on NASA data.",
      links: [["JudgeGuard workbench", "https://huggingface.co/spaces/RugFace/judgeguard-app"], ["JudgeGuard code", "https://github.com/RyanSingh0/judgeguard"], ["ExoQuery-Bench", "https://github.com/RyanSingh0/ExoQuery-Bench"]]
    },
    research: {
      name: "a research role",
      order: ["s-dxy", "s-wiki", "s-commod", "s-readmit", "s-risk", "s-mbta", "s-svc", "s-judge", "s-medai", "s-exo", "s-retail"],
      brief: "Five first-author papers, two published this October (Risks and Springer LNICST), one under review at Commodities. My habit is the same in each: declare everything I tried, test against a noise ceiling, and publish code that rebuilds every table with one command.",
      links: [["Risks paper", "https://www.mdpi.com/2227-9091/14/11/247"], ["WikiFlow chapter", "https://link.springer.com/chapter/10.1007/978-3-032-42320-7_22"], ["ORCID", "https://orcid.org/0009-0005-6739-8265"]]
    }
  };
  window.LENSES = LENSES;
  function setLens(key, opts = {}) {
    if (!LENSES[key]) key = "all";
    const L = LENSES[key];
    $$(".lens-chips .chip").forEach((c) => c.setAttribute("aria-checked", String(c.dataset.lens === key)));
    // the first four in the chosen order are shown in full; the rest fold to their result
    L.order.forEach((id, i) => {
      const el = document.getElementById(id); if (!el) return;
      el.style.order = i;
      el.classList.toggle("is-compact", i >= 4);
      if (i < 4) el.classList.remove("is-open");
      const t = el.querySelector(".more-toggle"); if (t) t.setAttribute("aria-expanded", String(el.classList.contains("is-open")));
    });
    const brief = $("#lens-brief");
    if (key === "all") { brief.hidden = true; brief.innerHTML = ""; }
    else {
      const resume = RESUMES.filter((r) => r.on && r.lens.includes(key))[0] || RESUMES[1];
      brief.hidden = false;
      brief.innerHTML = `<div class="brief-text"><p class="brief-hand">Showing the work for ${L.name}</p><p>${L.brief}</p></div>
        <div class="brief-links">${L.links.map(([t, u]) => `<a href="${u}" rel="noopener">${t}</a>`).join("")}
        <a href="${resumeHref(resume)}" rel="noopener">${resume.label} résumé (PDF)</a>
        <button type="button" class="linkish" data-lens-reset>Show everything</button></div>`;
    }
    store.set("lens", key);
    if (!opts.silent) {
      try { history.replaceState(null, "", key === "all" ? location.pathname + location.search : "#for-" + key); } catch (e) { /* sandboxed */ }
    }
  }
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-lens-reset]")) setLens("all");
    const t = e.target.closest(".more-toggle");
    if (t) { const st = t.closest(".study"); const open = st.classList.toggle("is-open"); t.setAttribute("aria-expanded", String(open)); t.textContent = open ? "Show less" : "Show the full story"; }
  });
  window.setLens = setLens;
  $$(".lens-chips .chip").forEach((c) => c.addEventListener("click", () => setLens(c.dataset.lens)));
  $(".lens-chips").addEventListener("keydown", (e) => {
    if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) return;
    const chips = $$(".lens-chips .chip"); const i = chips.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    const j = (i + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1) + chips.length) % chips.length;
    chips[j].focus(); setLens(chips[j].dataset.lens);
  });

  /* ---------- running head ---------- */
  const head = $("#runhead");
  const onScroll = () => head.classList.toggle("is-stuck", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  if ("IntersectionObserver" in window) {
    const links = $$(".runhead-nav a");
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + en.target.id)));
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    ["story", "work", "papers", "experience", "side-b"].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  }

  /* ---------- command palette ---------- */
  function paletteItems() {
    const items = [
      ["My story", "Section", () => go("#story")], ["Papers", "Section", () => go("#papers")], ["Selected work", "Section", () => go("#work")],
      ["Experience", "Section", () => go("#experience")], ["Ask me a question", "Section", () => { if (window.askAryan && window.askAryan.open) window.askAryan.open(); }],
      ["Side B: Overfit me (game)", "Section", () => go("#side-b")], ["References", "Section", () => go("#references")],
      ["Copy email address", "Action", () => copyText("araj7042@gmail.com", "Email copied: araj7042@gmail.com")],
      ["Switch light or dark", "Action", toggleTheme]
    ];
    $$(".study").forEach((s) => items.push([$(".h3", s).textContent.replace("In progress", "").trim(), "Study", () => go("#" + s.id)]));
    $$(".bib").forEach((b) => items.push([$(".bib-title", b).textContent.replace(/\.$/, ""), "Paper", () => go("#" + b.id)]));
    Object.entries(LENSES).forEach(([k, L]) => { if (k !== "all") items.push(["Read as " + L.name.replace(/^an? /, ""), "Lens", () => { setLens(k); go("#lens"); }]); });
    RESUMES.filter((r) => r.on).forEach((r) => items.push([r.label + " résumé (PDF)", "Link", () => openLink(resumeHref(r))]));
    [["LinkedIn", "https://www.linkedin.com/in/aryan-meena-32685415a/"], ["GitHub", "https://github.com/RyanSingh0"], ["Live AWS dashboard", "https://d17q1whdf7htno.cloudfront.net/"], ["Readmission dashboard", "https://ryansingh0.github.io/hospital-readmission/"], ["JudgeGuard workbench", "https://huggingface.co/spaces/RugFace/judgeguard-app"], ["MBTA simulator", "https://ryansingh0.github.io/mbta-community-detection/"]]
      .forEach(([t, u]) => items.push([t, "Link", () => openLink(u)]));
    return items;
  }
  function openLink(u) { const a = document.createElement("a"); a.href = u; a.target = "_blank"; a.rel = "noopener"; document.body.appendChild(a); a.click(); a.remove(); }
  function go(hash) { const el = $(hash); if (el) el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }
  const dlg = $("#palette"); let items = [], shown = [], sel = 0;
  const score = (q, t) => {
    q = q.toLowerCase(); t = t.toLowerCase();
    if (!q) return 1;
    if (t.includes(q)) return 10 - t.indexOf(q) / 100;
    let i = 0; for (const ch of t) { if (ch === q[i]) i++; if (i === q.length) return 1; }
    return 0;
  };
  function renderPalette() {
    const q = $("#palette-q").value.trim();
    shown = items.map((it) => [score(q, it[0] + " " + it[1]), it]).filter((x) => x[0] > 0).sort((a, b) => b[0] - a[0]).map((x) => x[1]).slice(0, 12);
    if (q.toLowerCase().replace(/\s+/g, " ") === "sudo hire aryan") shown = [["Permission granted. Email araj7042@gmail.com to finish the job.", "root", () => copyText("araj7042@gmail.com", "Email copied. Over to you.")]];
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    $("#palette-list").innerHTML = shown.length ? shown.map((it, i) => `<li role="option" id="po-${i}" aria-selected="${i === sel}" data-i="${i}"><span>${it[0]}</span><span class="pk">${it[1]}</span></li>`).join("")
      : `<li aria-disabled="true"><span>Nothing matches. Try “SQL”, “paper” or “AWS”.</span></li>`;
    $("#palette-q").setAttribute("aria-activedescendant", shown.length ? "po-" + sel : "");
  }
  function openPalette() {
    items = paletteItems(); sel = 0; $("#palette-q").value = ""; renderPalette();
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    $("#palette-q").focus();
  }
  function runSel() { const it = shown[sel]; if (!it) return; dlg.close(); it[2](); }
  $("#open-palette").addEventListener("click", openPalette);
  $("#palette-q").addEventListener("input", () => { sel = 0; renderPalette(); });
  $("#palette-q").addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, shown.length - 1); renderPalette(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); renderPalette(); }
    else if (e.key === "Enter") { e.preventDefault(); runSel(); }
  });
  $("#palette-list").addEventListener("click", (e) => { const li = e.target.closest("li[data-i]"); if (li) { sel = +li.dataset.i; runSel(); } });
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  $("#palette-form").addEventListener("submit", (e) => e.preventDefault());

  /* ---------- keys: / to search, Esc closes notes, and one old cheat code ---------- */
  const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let kpos = 0;
  document.addEventListener("keydown", (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if (!typing && (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"))) { e.preventDefault(); openPalette(); return; }
    if (e.key === "Escape") closePop(true);
    if (typing) return;
    kpos = (e.key === KONAMI[kpos] || e.key.toLowerCase() === KONAMI[kpos]) ? kpos + 1 : (e.key === KONAMI[0] ? 1 : 0);
    if (kpos === KONAMI.length) { kpos = 0; konami(); }
  });
  function konami() {
    toast("Achievement unlocked: you read the source, didn’t you? +30 lives.");
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = "square"; o.frequency.value = f; o.connect(g); g.connect(ac.destination);
        const t = ac.currentTime + i * 0.09;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.08, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
        o.start(t); o.stop(t + 0.14);
      });
    } catch (e) { /* no sound, still a win */ }
  }


  /* ---------- get in touch: their own mail app, Gmail, Outlook, copy, LinkedIn ----------
     subject/body are pre-filled; the chat passes the role and company when it knows them */
  const EMAIL = "araj7042@gmail.com", LINKEDIN = "https://www.linkedin.com/in/aryan-meena-32685415a/";
  function mailParts(c = {}) {
    const what = [c.title || (c.label ? c.label + " role" : ""), c.company ? "at " + c.company : ""].filter(Boolean).join(" ");
    const subject = what ? `Interview: ${what}` : "Hello from your portfolio";
    const body = `Hi Aryan,\n\nI found your portfolio and would like to talk${what ? " about the " + what : " about a role"}.\n\nRole: ${c.title || ""}\nCompany: ${c.company || ""}\nBest time to talk: \n\nThanks,\n`;
    return { subject, body };
  }
  function contactLinks(c) {
    const { subject, body } = mailParts(c), e = encodeURIComponent;
    return [
      ["Email app", `mailto:${EMAIL}?subject=${e(subject)}&body=${e(body)}`, "Opens your default mail app"],
      ["Gmail", `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL}&su=${e(subject)}&body=${e(body)}`, "Opens a draft in Gmail"],
      ["Outlook", `https://outlook.office.com/mail/deeplink/compose?to=${EMAIL}&subject=${e(subject)}&body=${e(body)}`, "Opens a draft in Outlook on the web"],
      ["LinkedIn", LINKEDIN, "Message me on LinkedIn"]
    ];
  }
  function contactHTML(c, cls = "mail-links") {
    return `<span class="${cls}">` + contactLinks(c).map(([t, u, d]) => `<a href="${u}"${u.startsWith("mailto:") ? "" : ' target="_blank" rel="noopener"'} title="${d}">${t}</a>`).join("") +
      `<button type="button" class="linkish" data-copy="${EMAIL}">Copy address</button></span>`;
  }
  window.contactHTML = contactHTML;
  function renderContact() {
    document.querySelectorAll("[data-mail]").forEach((el) => {
      el.innerHTML = `<details class="mail-drop"><summary class="btn btn-quiet">Email me</summary><div class="mail-pop"><p class="mail-pop-h">Write to ${EMAIL}</p>${contactHTML({}, "mail-links mail-links-col")}</div></details>`;
    });
    document.querySelectorAll("[data-mail-inline]").forEach((el) => { el.innerHTML = contactHTML({}); });
  }
  document.addEventListener("click", (e) => { document.querySelectorAll(".mail-drop[open]").forEach((d) => { if (!d.contains(e.target)) d.removeAttribute("open"); }); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") document.querySelectorAll(".mail-drop[open]").forEach((d) => d.removeAttribute("open")); });

  /* ---------- boot ---------- */
  renderResumes();
  renderContact();
  buildRefs();
  syncThemeButton();
  $("#theme-toggle").addEventListener("click", toggleTheme);
  const hashLens = (location.hash.match(/^#for-(\w+)$/) || [])[1];
  setLens(hashLens || store.get("lens") || "all", { silent: !hashLens });
  onScroll();
  console.log("%cHi. You opened the console, so you’re my kind of reader. Try pressing / or typing the Konami code. araj7042@gmail.com", "font: 14px Georgia; color: #1c6a4c");
})();
