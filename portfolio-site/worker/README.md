# Ask Aryan: deploy the agent

A Cloudflare Worker that answers visitors in my voice using a free open model (Workers AI), grounded only in my notes.

1. **Retrieval.** The question is matched against 48 note chunks with BM25 (no vector database needed at this size). The website also sends the note it matched and the visitor's role and company, which the worker trusts first.
2. **Answer.** A small open model writes the reply from the top 4 chunks.
3. **Number check.** Every number in the answer must appear in those chunks. If one doesn't, the answer is blocked and the site shows my hand-written note instead.
4. **Optional escalation.** If you add a Claude API key, a blocked answer gets one retry with Claude, capped per day.
5. **Logging.** Every question is saved in a free Cloudflare D1 database (no IP addresses), so you can see what recruiters ask.
6. **Evaluation.** `eval/questions.json` holds 50 test questions. On the local run, retrieval puts the right note first 94% of the time and in the top 4 100% of the time.

The website works without any of this. Until `ASK_ENDPOINT` is set, it answers from the notes in `assets/ask.js`.

---

## Step by step (Windows, about 30 minutes)

### 0. One-time setup

1. Install **Node.js LTS** from nodejs.org. Check in PowerShell: `node -v`
2. Create a free account at **dash.cloudflare.com**.

### 1. Open the worker folder

```powershell
cd "C:\Users\Araj7\Desktop\Research Assistant\portfolio-site\worker"
```

### 2. Install Wrangler (Cloudflare's command-line tool) and log in

```powershell
npm install -g wrangler
wrangler login
```

A browser window opens; click **Allow**.

### 3. Create the question log

```powershell
wrangler d1 create ask-aryan
```

It prints a `database_id`. Open `wrangler.toml`, replace `PASTE-YOUR-DATABASE-ID-HERE` with it, and save. Then create the table:

```powershell
wrangler d1 execute ask-aryan --remote --file=schema.sql
```

### 4. Build the knowledge from the website's notes

```powershell
node build-knowledge.mjs
node eval/run-eval.mjs
```

The second command prints the retrieval score and writes `eval/report.md`.

### 5. Deploy

```powershell
wrangler deploy
```

Copy the URL it prints, for example `https://ask-aryan.<your-subdomain>.workers.dev`.

### 6. Test it from PowerShell

```powershell
$u = "https://ask-aryan.<your-subdomain>.workers.dev"
Invoke-RestMethod -Uri $u -Method Post -ContentType "application/json" `
  -Headers @{ Origin = "https://ryansingh0.github.io" } `
  -Body '{"question":"Why should we hire you?","context":{"role":"quant","title":"Quant Risk Analyst","company":"Citi","depth":1,"topic":"pitch-quant"}}'
```

You should get `verified: True` and an answer. If you see `fallback: True`, the model quoted a number not in the notes, and the site would show your note instead. That's the check working.

If the error says the model isn't found, pick any current text-generation model from Cloudflare's Workers AI catalog and put its name in `MODEL` in `wrangler.toml`, then `wrangler deploy` again.

### 7. Score the live agent

```powershell
node eval/run-eval.mjs --url $u
```

This reports the share of answers that pass the number check, the share that contain the key fact, and median latency. Put those real numbers on your résumé, not before.

### 8. Connect the website

In `..\assets\ask.js`, line 5:

```js
const ASK_ENDPOINT = "https://ask-aryan.<your-subdomain>.workers.dev";
```

Upload the site to your GitHub Pages repo. On the live site, AI answers carry the line "Written by an AI from my notes; every number was checked against them."

To test from your own computer first, add your local address to `ALLOWED_ORIGIN` in `wrangler.toml`, for example `"https://ryansingh0.github.io,http://localhost:8000"`, and redeploy.

### 9. Optional: Claude as a backup for hard questions

1. In the Anthropic Console, create an API key and set a monthly spend limit (for example $5).
2. Run `wrangler secret put ANTHROPIC_API_KEY` and paste it.
3. `ESCALATE_DAILY_MAX` in `wrangler.toml` caps how many questions a day may go to Claude (default 30).

---

## Day to day

**What are recruiters asking?**

```powershell
wrangler d1 execute ask-aryan --remote --command "SELECT ts, role, company, question, verified FROM asks ORDER BY id DESC LIMIT 20"
```

**Summary numbers** (no question text): open `https://ask-aryan.<your-subdomain>.workers.dev/stats`

**Live logs:** `wrangler tail`

**Changed an answer?** Edit `..\assets\ask.js`, then:

```powershell
node build-knowledge.mjs; node eval/run-eval.mjs; wrangler deploy
```

## Cost

Workers and Workers AI both have free daily allowances. On the free Workers plan, going past the allowance makes requests fail rather than bill you, and the website quietly falls back to your notes. The only paid part is the optional Claude backup, capped by your Anthropic spend limit and `ESCALATE_DAILY_MAX`.

## Files

| File | What it does |
|---|---|
| `src/index.js` | The worker: CORS, rate limits, model call, number check, escalation, logging, `/stats` |
| `src/core.js` | Retrieval (BM25), the number check and the prompt. No Cloudflare code, so it runs in Node tests |
| `src/knowledge.js` | Generated from `assets/ask.js` by `build-knowledge.mjs`. Don't edit by hand |
| `knowledge.md` | The same notes, readable |
| `schema.sql` | The question-log table |
| `eval/questions.json` | 50 test questions with the note each should use and its key fact |
| `eval/run-eval.mjs` | Local retrieval eval, or `--url` for the live agent |
| `wrangler.toml` | Worker settings: model, allowed site, database |

## The contract (if you swap in your own model later)

`POST {"question", "history":[{"q","a"}], "context":{"role","title","company","depth","topic"}}` returns `{"answer", "verified":true, "model", "sources"}`, or `{"answer":null, "verified":false, "fallback":true}` to make the site use its own note.
