// Ask Aryan: a Cloudflare Worker. Free open model on Workers AI, answers grounded in my notes,
// and a number check that blocks any answer quoting a figure the notes don't contain.
import { retrieve, checkNumbers, buildMessages, SYSTEM } from "./core.js";

const json = (obj, status, headers) => new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json", ...headers } });
const cors = (origin, allowed) => ({ "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : allowed[0], "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "content-type", "Vary": "Origin" });
let memEscalations = { day: "", n: 0 };

// Try each model in order until one answers. A wrong or retired model name just falls through to the next.
const DEFAULT_MODELS = "@cf/meta/llama-3.3-70b-instruct-fp8-fast,@cf/mistralai/mistral-small-3.1-24b-instruct,@cf/meta/llama-3.1-8b-instruct-fp8";
async function workersAI(env, messages) {
  const models = String(env.MODEL || DEFAULT_MODELS).split(",").map((m) => m.trim()).filter(Boolean);
  const errors = [];
  for (const model of models) {
    try {
      const r = await env.AI.run(model, { messages, max_tokens: 450, temperature: 0.4 });
      const text = (r && (r.response || r.result?.response || r.choices?.[0]?.message?.content) || "").trim();
      if (text) return { text, model };
      errors.push(model + ": empty reply");
    } catch (e) { errors.push(model + ": " + String(e && e.message || e).slice(0, 120)); }
  }
  throw new Error(errors.join(" | "));
}
async function claude(env, messages) {
  const system = messages[0].content, rest = messages.slice(1);
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: env.CLAUDE_MODEL || "claude-haiku-5-5", max_tokens: 450, system, messages: rest })
  });
  if (!r.ok) throw new Error("claude " + r.status);
  const d = await r.json();
  return { text: (d.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n").trim(), model: env.CLAUDE_MODEL || "claude-haiku-5-5" };
}
async function canEscalate(env) {
  if (!env.ANTHROPIC_API_KEY) return false;
  const max = +(env.ESCALATE_DAILY_MAX || 30), day = new Date().toISOString().slice(0, 10);
  if (env.DB) {
    const row = await env.DB.prepare("SELECT COUNT(*) AS n FROM asks WHERE escalated = 1 AND substr(ts, 1, 10) = ?").bind(day).first();
    return (row?.n || 0) < max;
  }
  if (memEscalations.day !== day) memEscalations = { day, n: 0 };
  return memEscalations.n < max;
}

export default {
  async fetch(request, env, ctx) {
    const allowed = (env.ALLOWED_ORIGIN || "https://ryansingh0.github.io").split(",").map((s) => s.trim());
    const origin = request.headers.get("Origin") || "";
    const h = cors(origin, allowed);
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: h });

    if (request.method === "GET" && url.pathname === "/health") return json({ ok: true }, 200, h);
    if (request.method === "GET" && url.pathname === "/stats") {
      if (!env.DB) return json({ error: "no database bound" }, 404, h);
      const s = await env.DB.prepare(`SELECT COUNT(*) AS questions, AVG(verified) AS verified_rate, AVG(fallback) AS fallback_rate, AVG(escalated) AS escalated_rate, AVG(latency_ms) AS avg_latency_ms FROM asks`).first();
      const roles = await env.DB.prepare(`SELECT role, COUNT(*) AS n FROM asks WHERE role IS NOT NULL GROUP BY role ORDER BY n DESC`).all();
      return json({ ...s, roles: roles.results }, 200, h);
    }
    if (request.method !== "POST") return json({ error: "POST only" }, 405, h);
    if (!allowed.includes(origin)) return json({ error: "origin not allowed" }, 403, h);
    if (env.RATE_LIMITER) {
      const { success } = await env.RATE_LIMITER.limit({ key: request.headers.get("CF-Connecting-IP") || "anon" });
      if (!success) return json({ error: "slow down" }, 429, h);
    }

    let body; try { body = await request.json(); } catch { return json({ error: "bad json" }, 400, h); }
    const question = String(body.question || "").slice(0, 300).trim();
    if (!question) return json({ error: "empty question" }, 400, h);
    const c = body.context && typeof body.context === "object" ? body.context : {};
    const context = { role: c.role || null, title: c.title ? String(c.title).slice(0, 80) : null, company: c.company ? String(c.company).slice(0, 80) : null, depth: Number(c.depth) || 0, topic: c.topic || null };
    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];

    const t0 = Date.now();
    const chunks = retrieve(question, context, 5);
    const messages = buildMessages(question, history, context, chunks);
    const extra = question + " " + (context.title || "") + " " + (context.company || "");
    let out = { answer: null, verified: false, model: null, escalated: false, reason: null };
    try {
      let a = await workersAI(env, messages);
      let chk = checkNumbers(a.text, chunks, extra);
      if (!chk.ok) {
        // one self-correction pass before giving up
        const fix = messages.concat([{ role: "assistant", content: a.text }, { role: "user", content: `Rewrite that answer. These numbers are not in the notes: ${chk.bad.join(", ")}. Use only numbers that appear in the notes, or no numbers. Keep the same voice.` }]);
        a = await workersAI(env, fix);
        chk = checkNumbers(a.text, chunks, extra);
      }
      out = { answer: a.text, verified: chk.ok && !!a.text, model: a.model, escalated: false, bad: chk.bad, reason: chk.ok ? null : "numbers not in notes: " + chk.bad.join(", ") };
    } catch (e) { out.reason = "model error: " + String(e && e.message || e).slice(0, 300); }
    if (!out.verified && await canEscalate(env)) {
      try {
        const b = await claude(env, messages);
        const chk = checkNumbers(b.text, chunks, extra);
        memEscalations.n += 1;
        out = { answer: b.text, verified: chk.ok && !!b.text, model: b.model, escalated: true, bad: chk.bad, reason: chk.ok ? null : "numbers not in notes: " + chk.bad.join(", ") };
      } catch (e) { out.reason = (out.reason ? out.reason + " | " : "") + "claude error: " + String(e && e.message || e).slice(0, 120); }
    }
    const latency = Date.now() - t0;
    if (env.DB) {
      ctx.waitUntil(env.DB.prepare("INSERT INTO asks (ts, question, role, title, company, depth, sources, model, verified, escalated, fallback, bad_numbers, latency_ms, country) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
        .bind(new Date().toISOString(), question, context.role, context.title, context.company, context.depth, chunks.map((x) => x.id).join(","), out.model, out.verified ? 1 : 0, out.escalated ? 1 : 0, out.verified ? 0 : 1, out.reason || (out.bad || []).join(","), latency, request.cf?.country || null)
        .run().catch(() => {}));
    }
    if (!out.verified) return json({ answer: null, verified: false, fallback: true, reason: out.reason, sources: chunks.map((x) => x.id) }, 200, h);
    return json({ answer: out.answer, verified: true, model: out.model, sources: chunks.map((x) => x.id) }, 200, h);
  }
};
export { SYSTEM };
