// Evaluates the agent.
//   node eval/run-eval.mjs                      -> retrieval only, runs locally, free
//   node eval/run-eval.mjs --url https://...    -> the deployed worker: verified rate, facts, latency
import fs from "node:fs";
import { retrieve } from "../src/core.js";

const qs = JSON.parse(fs.readFileSync(new URL("./questions.json", import.meta.url)));
const i = process.argv.indexOf("--url"), url = i > 0 ? process.argv[i + 1] : null;
const origin = process.env.ORIGIN || "https://ryansingh0.github.io";
let hit1 = 0, hit4 = 0, verified = 0, factOk = 0, factN = 0, lat = [];
const misses = [];
for (const t of qs) {
  const ids = retrieve(t.q, {}, 4).map((c) => c.id);
  const h1 = t.expect.includes(ids[0]), h4 = ids.some((id) => t.expect.includes(id));
  hit1 += h1; hit4 += h4; if (!h4) misses.push(`${t.q}  ->  got ${ids.join(", ")}`);
  if (url) {
    const t0 = Date.now();
    const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json", Origin: origin }, body: JSON.stringify({ question: t.q, history: [], context: {} }) });
    const j = await r.json(); lat.push(Date.now() - t0);
    if (j.verified) verified++;
    if (t.facts.length) { factN++; if (j.answer && t.facts.every((f) => j.answer.replace(/,/g, "").includes(f.replace(/,/g, "")))) factOk++; }
  }
}
const pct = (a, b) => (100 * a / b).toFixed(0) + "%";
const lines = [`# Ask Aryan eval (${new Date().toISOString().slice(0, 10)})`, ``, `Questions: ${qs.length}`,
  `Retrieval: right note first ${pct(hit1, qs.length)}, in top 4 ${pct(hit4, qs.length)}`];
if (url) {
  lat.sort((a, b) => a - b);
  lines.push(`Answers passing the number check: ${pct(verified, qs.length)}`, `Answers containing the key fact: ${pct(factOk, factN)} (${factN} questions with a key number)`, `Median latency: ${lat[Math.floor(lat.length / 2)]} ms`);
}
if (misses.length) lines.push(``, `Retrieval misses:`, ...misses.map((m) => `- ${m}`));
const report = lines.join("\n");
fs.writeFileSync(new URL("./report.md", import.meta.url), report + "\n");
console.log(report);
