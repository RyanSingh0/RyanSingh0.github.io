/* ask.js: "Ask me". A small answer engine over notes I wrote and checked.
   It runs entirely in the browser. To switch on Claude later, deploy worker/ (see its README)
   and paste the worker URL into ASK_ENDPOINT. If the worker fails, the page falls back to these notes. */
(function () {
  "use strict";
  const ASK_ENDPOINT = "https://ask-aryan.aryanmeena.workers.dev"
  const $ = (s, r = document) => r.querySelector(s);
  const L = {
    risks: ["Risks paper", "https://www.mdpi.com/2227-9091/14/11/247"],
    wiki: ["WikiFlow on Springer", "https://link.springer.com/chapter/10.1007/978-3-032-42320-7_22"],
    aws: ["Live AWS dashboard", "https://d17q1whdf7htno.cloudfront.net/"],
    awsCode: ["Pipeline code", "https://github.com/RyanSingh0/service-operations-analytics-portfolio"],
    readmit: ["Readmission dashboard", "https://ryansingh0.github.io/hospital-readmission/"],
    tableau: ["Tableau dashboard", "https://public.tableau.com/app/profile/aryan.meena2899/viz/ReadmissionOutreachCapacityandModelEvaluation/Readmissionoutreach"],
    pbi: ["Power BI report", "https://app.powerbi.com/view?r=eyJrIjoiYTBmMDI3ZWMtMDExZC00MmM0LTk5ZTYtYjY4YTlhNTk4N2EyIiwidCI6ImQ1N2QzMmNjLWMxMjEtNDg4Zi1iMDdiLWRmZTcwNTY4MGM3MSIsImMiOjN9&pageName=f28b4b4a651ff21ecd55"],
    retail: ["RetailPulse code", "https://github.com/RyanSingh0/RetailPulse"],
    brc: ["Backtest Reality Check", "https://ryansingh0.github.io/backtest-reality-check/"],
    judge: ["JudgeGuard workbench", "https://huggingface.co/spaces/RugFace/judgeguard-app"],
    exo: ["ExoQuery-Bench", "https://github.com/RyanSingh0/ExoQuery-Bench"],
    mbta: ["MBTA simulator", "https://ryansingh0.github.io/mbta-community-detection/"],
    risk: ["Risk engine code", "https://github.com/RyanSingh0/multi-asset-risk-engine"],
    medai: ["MedAI code", "https://github.com/RyanSingh0/medai-amyloid"],
    li: ["LinkedIn", "https://www.linkedin.com/in/aryan-meena-32685415a/"],
    gh: ["GitHub", "https://github.com/RyanSingh0"],
    orcid: ["ORCID", "https://orcid.org/0009-0005-6739-8265"]
  };
  const sec = (id, t) => [t, "#" + id];

  /* Each note: k = phrases that point to it (a leading ! doubles the weight), a = answer, l = links, f = follow-ups. */
  const NOTES = [
    { id: "intro", k: ["!about yourself", "!who are you", "introduce", "introduction", "background", "summary", "elevator pitch", "tell me about you", "who is aryan", "what do you do"],
      a: "<p>I’m a data scientist and analyst in Boston (MS Applied Data Analytics, Boston University, May 2026, GPA 3.75). I got hooked on data at an ISRO internship, where I saw that something as simple as labelling decides whether a model works. Then I traded FX and commodities on prop-firm challenges, published five first-author papers, and came to Boston to learn how quant and risk teams build and test strategies.</p><p>My rule is simple: good data first. That’s how I found that a 15-year dollar pattern came from bad prices in a free data feed, now published in <i>Risks</i>.</p>",
      l: [L.risks, sec("story", "Read the full story")], f: ["What’s your story?", "Why should we hire you?", "Do you need sponsorship?"] },
    { id: "story", k: ["!your story", "!journey", "how did you get into", "why data", "into data", "got into data", "why usa", "why the us", "to the us", "come to the us", "came to the us", "to america", "why masters", "why a master", "why boston", "why quant", "motivation", "what drives you", "path"],
      a: "<p>It started with labels. At ISRO I learned that how you label data decides whether a model works, and my MAML thesis and computer vision work kept proving it: understand and clean the data before you run anything.</p><p>I wanted depth and the US tech hub, so I applied for a master’s. That year was hard, at home and in the job search, so I published two papers and taught myself to trade: EUR/USD, USD/JPY, USD/CAD, gold, silver and oil around the London and New York opens, backtesting every strategy and passing prop-firm challenges.</p><p>At BU I went back to those markets as a researcher, on free data, then exchange vendor data, then Bloomberg, to learn how quant and risk teams really test a strategy. The data lesson came back bigger, and it became my paper in <i>Risks</i>.</p>",
      l: [sec("story", "Full story on this page")], f: ["Tell me about your trading experience", "Tell me about the published paper", "What roles are you looking for?"] },
    { id: "why", k: ["!why should we hire", "!why hire", "why you", "stand out", "different from other", "strength", "strengths", "what value", "bring to the team", "best at", "unique"],
      a: "<ul><li><b>I catch wrong numbers before they ship.</b> My published paper exists because I didn’t trust a result that passed every standard check; in the same research my screen flagged 10 faulty price feeds out of 37 before anyone used them.</li><li><b>I finish things.</b> The work on this page is live: an AWS pipeline, a hospital call-list dashboard, a subway resilience simulator and an AI evaluation app.</li><li><b>I explain it plainly.</b> I taught machine learning to 60+ graduate students, and I build dashboards so people without code can check every number.</li></ul>",
      l: [L.aws, L.readmit], f: ["Tell me about the published paper", "How do you handle messy data?", "Tell me about a challenge you faced"] },
    { id: "roles", k: ["!what roles", "!looking for", "position", "positions", "job title", "kind of job", "type of role", "open to", "entry level", "seniority", "level"],
      a: "<p>My first choice is finance: quant research, trading analytics and risk at banks, quant firms and asset managers. I’m just as ready for data analyst, BI, data engineer, data scientist and research roles in any industry. Entry level (0–2 years), anywhere in the US. If you pick a role in the “Reading for a role?” bar above, the page reorders around it.</p>",
      l: [sec("lens", "Pick a role on this page")], f: ["Do you need sponsorship?", "Can you relocate?", "When can you start?"] },
    { id: "visa", k: ["!visa", "!sponsorship", "!sponsor", "h1b", "h-1b", "opt", "stem opt", "work authorization", "authorized", "authorised", "citizen", "green card", "f1", "f-1", "work permit", "eligible to work"],
      a: "<p>I’m authorized to work in the US on F-1 STEM OPT, so I can start now. I will need H-1B sponsorship later. I’m happy to walk through the timeline on a call.</p>",
      f: ["When can you start?", "Can you relocate?", "Why should we hire you?"] },
    { id: "where", k: ["!relocate", "relocation", "location", "where are you", "based", "remote", "hybrid", "onsite", "on-site", "in office", "move", "boston", "new york", "travel"],
      a: "<p>I’m in Boston and open to relocating anywhere in the US. On-site, hybrid or remote all work for me.</p>",
      f: ["When can you start?", "Do you need sponsorship?"] },
    { id: "start", k: ["!start date", "!when can you start", "available", "availability", "notice period", "join", "how soon", "full time", "full-time"],
      a: "<p>Now. I’ve finished my degree and I’m available full time.</p>", f: ["Do you need sponsorship?", "What roles are you looking for?"] },
    { id: "salary", k: ["!salary", "compensation", "pay", "expected ctc", "expectation", "how much money", "rate", "package"],
      a: "<p>I’d rather get there once we both know the role fits. I’m flexible for the right team and the right work. Email me and we’ll talk it through.</p>", f: ["What roles are you looking for?", "Why should we hire you?"] },
    { id: "sql", k: ["!sql", "postgres", "postgresql", "query", "queries", "database", "databases", "joins", "window function", "window functions", "cte", "ctes", "star schema", "sqlite", "bigquery", "athena", "data model", "data modeling", "dimensional"],
      a: "<p>A lot, in real projects:</p><ul><li><b>RetailPulse:</b> nine Olist tables into a PostgreSQL star schema (raw, clean, mart), with CTEs, window functions and NTILE for RFM segments and cohort retention over 98,199 orders.</li><li><b>Backtest Reality Check:</b> a 12-table SQLite star schema with 7 views, each answering one business question; every chart on the dashboard is a SQL query.</li><li><b>AWS pipeline:</b> Spark SQL in Glue and Athena to verify the published facts.</li><li><b>WikiFlow:</b> results published to BigQuery.</li></ul>",
      l: [L.pbi, L.brc, L.retail], f: ["Which BI tools have you used?", "How do you handle messy data?", "Tell me about the AWS project"] },
    { id: "python", k: ["!python", "pandas", "numpy", "scikit", "sklearn", "programming", "coding", "languages", "language", "code quality", "c++", "r programming", "rstudio", "ggplot", "tidyverse"],
      a: "<p>Python is my main language: pandas, NumPy, statsmodels, scikit-learn, LightGBM and XGBoost, PyTorch, PySpark and FastAPI. I also use R (the jet-engine and V2X studies are R only) and some C++. I write tests: the AWS pipeline has 81, and JudgeGuard uses Hypothesis property tests in CI.</p>",
      l: [L.gh], f: ["How much SQL have you written?", "Which ML models have you shipped?"] },
    { id: "excel", k: ["!excel", "spreadsheet", "spreadsheets", "pivot", "pivot table", "vlookup", "xlookup", "index match", "power query", "google sheets"],
      a: "<p>Yes. In my research assistantship Excel was the first pass on new data before the heavier Python work, and SQL was how results were published. Pivot tables, XLOOKUP, INDEX/MATCH and Power Query are everyday tools for me.</p>", f: ["How much SQL have you written?", "Which BI tools have you used?"] },
    { id: "bi", k: ["!power bi", "!tableau", "dashboard", "dashboards", "visualization", "visualisation", "dax", "reporting", "bi tools", "looker", "charts", "kpi", "storytelling"],
      a: "<p>Power BI (a four-page Power BI Service report with DAX measures for RetailPulse) and Tableau (a public readmission dashboard on outreach capacity and model evaluation). I also hand-build HTML dashboards when a team needs something anyone can open: the readmission call list, the MBTA simulator and the AWS incident dashboard. I haven’t shipped anything in Looker yet; the modelling underneath carries over.</p>",
      l: [L.pbi, L.tableau, L.readmit], f: ["How much SQL have you written?", "Tell me about RetailPulse"] },
    { id: "cloud", k: ["!aws", "!cloud", "s3", "glue", "lambda", "step functions", "cloudfront", "gcp", "google cloud", "azure", "snowflake", "databricks", "infrastructure"],
      a: "<p>AWS for the service-operations pipeline: S3, Step Functions, Glue with PySpark, Athena, Lambda, EventBridge, CloudWatch and CloudFront, released through GitHub Actions with a restricted OIDC role, at about $0.03 per processing run. Google Cloud for WikiFlow: a 5-node Dataproc cluster and BigQuery. I haven’t used Azure, Snowflake or Databricks in a project yet.</p>",
      l: [L.aws, L.awsCode], f: ["Tell me about the AWS project", "Have you worked with big data?"] },
    { id: "bigdata", k: ["!spark", "!pyspark", "big data", "distributed", "hadoop", "dataproc", "scale", "large data", "large datasets", "terabyte", "millions of rows"],
      a: "<p>WikiFlow is the clearest example: about 60 million revision events from 1,158,248 Wikipedia editors (25 GB compressed) processed with PySpark on a 5-node Google Cloud Dataproc cluster, for roughly $2.50 a full run. I wrote logistic regression from scratch on Spark RDDs (AUC 0.845 in 19 seconds) and distributed a Keras network with Elephas (AUC 0.909 in 86 seconds).</p>",
      l: [L.wiki], f: ["Tell me about the AWS project", "Which ML models have you shipped?"] },
    { id: "ml", k: ["!machine learning", "ml", "model", "models", "predictive", "prediction", "classification", "regression model", "xgboost", "lightgbm", "random forest", "gradient boosting", "feature engineering", "data science", "data scientist"],
      a: "<ul><li><b>Readmission:</b> LightGBM at AUC 0.689 vs a published 0.664 under matched nested cross-validation on 101,766 encounters, then a call list that reaches 3.0× more readmissions than random in the top 5%.</li><li><b>WikiFlow:</b> dropout prediction for 1.16M editors on Spark, AUC 0.909.</li><li><b>Drowsiness detection:</b> RetinaFace and a ResNet-18 keypoint model feeding a random forest, ROC-AUC 0.964.</li></ul><p>What I care about most is the validation: leakage checks, patient-grouped splits, calibration and subgroup audits.</p>",
      l: [L.readmit, L.wiki], f: ["Have you done deep learning?", "Tell me about the readmission project", "How do you validate a model?"] },
    { id: "dl", k: ["!deep learning", "neural", "neural network", "pytorch", "cnn", "computer vision", "vision", "tensorflow", "keras", "transformer", "image", "images"],
      a: "<p>Yes. At the BU MedAI Hackathon I led a team of six to a podium finish among 40+ teams with a 3D MedicalNet ResNet-34 and FiLM conditioning for four PET tracers (validation r 0.968). I’ve also done driver-drowsiness detection in PyTorch, road segmentation with U-Net and DeepLabV3+ at ISRO, and a published IEEE paper on speeding up CNN training with a genetic algorithm. In the readmission study I tested two Transformer models against gradient boosting and shipped the boosted trees, because they won at a fraction of the cost.</p>",
      l: [L.medai], f: ["Have you worked with LLMs?", "Which ML models have you shipped?"] },
    { id: "llm", k: ["!llm", "!llms", "!genai", "large language", "gen ai", "generative", "chatgpt", "gpt", "claude", "rag", "agent", "agents", "prompt", "evaluation", "evals", "judge", "hugging face", "nlp"],
      a: "<p>JudgeGuard is my LLM evaluation workbench, live on Hugging Face: it replays an agent’s tool calls to catch a wrong step behind a right answer, and tests LLM judges against source-supported answers. A local Qwen3-4B judge ranked the supported answer first on 96 of 100 pairs, with all raw responses published. Next is ExoQuery-Bench, a benchmark I’m building for assistants that turn plain English into NASA archive queries across prompts, RAG, agents and MCP tools.</p>",
      l: [L.judge, L.exo], f: ["What are you working on now?", "Which ML models have you shipped?"] },
    { id: "stats", k: ["!statistics", "!a/b", "ab test", "a/b test", "ab testing", "experiment", "experiments", "hypothesis", "causal", "p-value", "significance", "statistical", "bootstrap", "multiple testing", "validate a model", "validation"],
      a: "<p>For the <i>Risks</i> paper I implemented Newey-West HAC errors, White’s Reality Check, Hansen’s SPA, Romano-Wolf, the deflated Sharpe ratio and CSCV overfitting tests from scratch, plus block-bootstrap noise ceilings over a 1,312-configuration search. The same habits carry to A/B tests: decide the comparisons up front, correct for how many you ran, and check the data before the effect. I’ve also done ANOVA and ANCOVA in R, calibration and Brier scores, and fairness audits.</p>",
      l: [L.risks], f: ["Tell me about the published paper", "How do you handle messy data?"] },
    { id: "quant", k: ["!quant", "!trading", "finance", "financial", "markets", "market", "fx", "forex", "currency", "backtest", "backtesting", "sharpe", "alpha", "strategy", "strategies", "hedge fund", "asset management", "investment"],
      a: "<p>Finance is where I’m most at home. The published <i>Risks</i> paper shows two ways a backtest passes every standard check and is still wrong. A second paper, under review at <i>Commodities</i>, shows the same rotation rule giving opposite answers in commodity futures and ETFs (ETF monthly winners $100 → $337). I also wrote a multi-asset risk engine and traded a funded FX account for a year before the MS.</p>",
      l: [L.risks, L.brc, L.risk], f: ["Do you have risk modeling experience?", "Tell me about your trading experience", "Tell me about the commodities paper"] },
    { id: "risk", k: ["!value at risk", "!var model", "risk model", "risk modeling", "risk modelling", "expected shortfall", "model risk", "model validation", "sr 11-7", "sr 26-2", "garch", "stress test", "stress testing", "credit risk", "risk management", "drawdown"],
      a: "<p>My risk engine covers commodities, the S&amp;P 500, five CME currency futures and dollar-index futures from 2010 to 2025. I backtested 8 VaR models over 2,796 days the way a bank would; only DCC-GARCH with an empirical tail passed the full conditional-coverage test, holding about 13% less VaR than historical simulation. A block bootstrap showed the normal model understating one-month 99% expected shortfall by about a third (11.1% vs 7.4%). My validation work is aligned with SR 26-2 principles: out-of-sample testing, data-quality assessment, outcomes analysis and documented limitations.</p>",
      l: [L.risk, L.risks], f: ["Tell me about the published paper", "Tell me about your trading experience"] },
    { id: "trader", k: ["!funding pips", "!trader", "prop firm", "prop trading", "traded", "!trading experience", "funded account", "day trading", "intraday", "london open", "new york open", "gold", "oil"],
      a: "<p>From December 2023 to December 2024 I traded intraday: EUR/USD, USD/JPY, USD/CAD, gold, silver and oil. I read the higher timeframes every day and executed on the lower ones, mostly around the London and New York opens.</p><p>Every strategy was backtested, then traded live, then measured on win rate, maximum drawdown and pass rate, and I kept adjusting execution and how I read market and news sentiment. I passed prop-firm challenges at Funding Pips, hitting a profit target of at least 15% three times in a row without breaking the 10% total or 5% daily loss limits. That’s what sent me into quant research.</p>",
      f: ["What’s your story?", "Tell me about the published paper", "Do you have risk modeling experience?"] },
    { id: "health", k: ["!healthcare", "!hospital", "clinical", "patient", "patients", "medical", "health", "pharma", "payer", "health plan", "readmissions"],
      a: "<p>Two projects: the readmission study (AUC 0.689 vs a published 0.664 on 101,766 diabetes encounters, a call-list dashboard reaching 3.0× more readmissions than random in the top 5%, and an age-band fairness audit) and the MedAI hackathon, where my team’s 3D model read amyloid PET scans across four tracers. I also screened 7,439 children in NHIS 2024 data for learning difficulty with 36 model setups.</p>",
      l: [L.readmit, L.tableau], f: ["Tell me about the readmission project", "Have you done deep learning?"] },
    { id: "quality", k: ["!data quality", "!data cleaning", "cleaning", "wrangling", "messy", "bad data", "dirty data", "missing values", "outliers", "etl", "data validation", "reconcile", "reconciliation", "data integrity", "pipeline checks"],
      a: "<ul><li>My published paper started as a data-quality catch: a free feed’s opening prices were biased, and correcting them made a 15-year anomaly disappear. My one-line screen then flagged 10 of 37 price feeds before use.</li><li>The AWS pipeline won’t publish until 17 integrity checks pass, and it quarantined 5 bad deliveries out of 105,372.</li><li>In the MBTA project I found three pipeline defects that had dropped the Green Line and split the network into six pieces.</li></ul>",
      l: [L.brc, L.aws], f: ["Tell me about the AWS project", "Tell me about the published paper"] },
    { id: "papers", k: ["!papers", "!publications", "published", "publication", "research", "journal", "conference", "phd", "academic", "first author", "orcid"],
      a: "<p>Five as first author:</p><ul><li><i>Two Blind Spots in Backtest Validation</i>, Risks 14(11) 247, published 23 Oct 2026.</li><li><i>WikiFlow</i>, Springer LNICST vol. 725, published 19 Oct 2026.</li><li>A commodity-rotation paper under review at <i>Commodities</i> (MDPI).</li><li>IEEE IATMSI 2024 and ICADIE 2024 (Springer).</li></ul>",
      l: [L.risks, L.wiki, L.orcid], f: ["Tell me about the published paper", "Tell me about WikiFlow"] },
    { id: "dxy", k: ["!risks paper", "!two blind spots", "blind spot", "dollar", "dxy", "dollar index", "anomaly", "overnight", "!published paper", "pinsky"],
      a: "<p>My first-author paper in <i>Risks</i>, with Prof. Eugene Pinsky. On a free feed of the ICE U.S. Dollar Index (the spot index, which can’t be traded directly), holding the dollar only overnight lost money for 15 years (Sharpe −1.36), and standard overfitting tests rated it robust. On the ICE Dollar Index futures contract from Barchart over the same 3,793 nights there was nothing there (+0.25, not significant).</p><p>Spot and futures differ, so I didn’t stop there: an index rebuilt from the free feed’s own currency prices also showed nothing (+0.22), the gap opened overnight and closed by the next close (an open-price error, not carry), and Federal Reserve rates from FRED confirmed the closes. The cause was biased opening prices in the free feed. The second blind spot is an undeclared search: a strategy that looks strong with 6 variants reported doesn’t survive once all 216 tried are declared.</p>",
      l: [L.risks, ["Code and data", "https://github.com/RyanSingh0/dxy-fx-strategies"], sec("fig1", "Figure 1")], f: ["How do you handle messy data?", "Tell me about the commodities paper"] },
    { id: "wiki", k: ["!wikiflow", "wikipedia", "editor", "editors", "dropout", "churn", "retention"],
      a: "<p>WikiFlow predicts which new Wikipedia editors will quit, from their first ten edits. About 60M revision events and 1.16M editors on a 5-node Dataproc cluster; 13 leakage-free features chosen from about 40 (I dropped co-editor graph features because they leaked the label). AUC 0.845 for a from-scratch logistic regression in 19 s, 0.909 for a distributed neural net in 86 s, and four newcomer archetypes from clustering. Published by Springer with Kunj Patel and Prof. Farshid Alizadeh-Shabdiz.</p>",
      l: [L.wiki, ["Code", "https://github.com/RyanSingh0/wikiflow"]], f: ["Have you worked with big data?", "What are you working on now?"] },
    { id: "readmit", k: ["!readmission", "diabetes", "call list", "care team", "outreach"],
      a: "<p>I re-analysed a published 2026 benchmark on 101,766 diabetes encounters from 130 US hospitals. Under the same nested, patient-grouped cross-validation my LightGBM reached AUC 0.689 vs the published 0.664; the gain came from cohort construction and patient-history features. Then I turned it into a call list: phoning the riskiest 5% of discharges reaches 1,696 future readmissions, 3.0× what random calls reach. My subgroup audit found no gap by race or sex, but a drop from 0.73 to 0.63 across age bands.</p>",
      l: [L.readmit, L.tableau], f: ["Which ML models have you shipped?", "Do you have healthcare experience?"] },
    { id: "svc", k: ["!aws project", "!serviceops", "service operations", "incident", "incidents", "nyc 311", "311", "pipeline", "production", "deployed", "monitoring"],
      a: "<p>An AWS pipeline that replays 105,372 incident deliveries, handles duplicates, late arrivals and corrections, and publishes only after 17 integrity checks pass. A forced failure left the last good report up; a repeated request finished without rerunning compute. About $0.03 per run, 81 tests, GitHub Actions releases through a restricted OIDC role. The live site also forecasts NYC 311 demand for the five boroughs every day, with written rules before any new model replaces the current one.</p>",
      l: [L.aws, L.awsCode], f: ["Tell me about a challenge you faced", "Do you have forecasting experience?"] },
    { id: "forecast", k: ["!forecast", "!forecasting", "time series", "arima", "demand", "prophet", "predict demand", "seasonality"],
      a: "<p>The AWS project forecasts NYC 311 demand 14 days ahead for each borough, refreshed daily with no human in the loop. A challenger only replaces the current model if it wins on at least 2 of 3 walk-forward windows and lowers pooled error by at least 2%. In the risk engine I forecast volatility with GARCH and DCC models fitted by maximum likelihood and backtested the resulting VaR over 2,796 days.</p>",
      l: [["NYC 311 forecast", "https://d17q1whdf7htno.cloudfront.net/forecast/index.html"]], f: ["Tell me about the AWS project", "Do you have risk modeling experience?"] },
    { id: "mbta", k: ["!mbta", "subway", "transit", "graph", "network analysis", "networkx", "louvain", "community detection", "transport"],
      a: "<p>I rebuilt the MBTA’s Spring 2025 schedule into a 125-station network after fixing three defects that had dropped the Green Line. It has only three independent loops, so 110 of 125 stations are single points of failure; closing Copley alone cuts off 56% of station pairs. Louvain found communities with modularity 0.821 ± 0.004 across 25 seeds. There’s a live version of the closure simulator in the Work section.</p>",
      l: [sec("s-mbta", "Try the simulator here"), L.mbta], f: ["How do you handle messy data?", "Which ML models have you shipped?"] },
    { id: "retail", k: ["!retailpulse", "olist", "ecommerce", "e-commerce", "retail", "rfm", "cohort", "customer segmentation", "reviews"],
      a: "<p>About 100K Olist marketplace orders into a PostgreSQL star schema and a four-page Power BI Service report with DAX. Late deliveries drop reviews from 4.29 to 2.57 stars; only 3.0% of customers ever reorder; the top two RFM segments are 40% of customers and 74% of revenue. The takeaway for the business: fix delivery and spend on acquisition before loyalty programs.</p>",
      l: [L.pbi, L.retail], f: ["How much SQL have you written?", "Which BI tools have you used?"] },
    { id: "commod", k: ["!commodities paper", "!commodity", "commodities", "etf", "etfs", "futures", "momentum", "rotation", "bcom", "dbc"],
      a: "<p>Under review at <i>Commodities</i> (MDPI), with Prof. Pinsky. Across the 15 most liquid Bloomberg commodity futures, recent winners trailed equal weight at every holding period from a month to a year. Across six commodity ETFs, monthly winners turned $100 into $337 vs $121 for equal weight and $86 for DBC. Everything was tested against random portfolios and corrected for the number of strategies tried; weekly rotation breaks even at only 4–5 bp of cost.</p>",
      l: [sec("s-commod", "Summary on this page")], f: ["Do you have risk modeling experience?", "Tell me about the published paper"] },
    { id: "medai", k: ["!hackathon", "!medai", "amyloid", "pet scan", "alzheimer", "centiloid", "competition", "award", "awards"],
      a: "<p>At the BU MedAI Hackathon (Spring 2026) I was technical lead of a six-person team, and we finished on the podium among 40+ teams. Our 3D MedicalNet ResNet-34 used FiLM conditioning to read four PET tracers with one backbone: validation MAE 7.31 Centiloid, Pearson r 0.968 on 500 scans.</p>",
      l: [L.medai], f: ["Have you done deep learning?", "Have you led a team?"] },
    { id: "judge", k: ["!judgeguard"], a: null, alias: "llm" },
    { id: "team", k: ["!teamwork", "!leadership", "lead", "led", "leader", "team", "teaching", "teaching assistant", "ta", "mentor", "mentoring", "communicate", "communication", "stakeholder", "stakeholders", "non-technical", "presentation", "collaborate", "collaboration"],
      a: "<ul><li>Graduate teaching assistant for Advanced Machine Learning and Data Science with Python: 60+ students, weekly office hours, written feedback.</li><li>Technical lead of a six-person team at the MedAI hackathon, podium finish among 40+ teams.</li><li>Co-authored papers with two professors and a classmate; WikiFlow was a three-author paper.</li><li>Student manager at Boston University Dining Services.</li></ul>",
      f: ["Tell me about a challenge you faced", "Why should we hire you?"] },
    { id: "challenge", k: ["!challenge", "!weakness", "failure", "mistake", "conflict", "difficult", "hardest", "failed", "fail", "a time you", "learned from", "problem you solved", "went wrong", "tough", "pressure", "setback"],
      a: "<p>A real one: in October the coverage alarm on my live NYC 311 forecast fired. In Manhattan the 90% prediction band was holding only about 40% of actual days. I traced it to bands fitted on an older period, built a recalibrated candidate and tested it on four historical windows. It helped some boroughs but not consistently, so I kept the live model, put a warning on the dashboard, split results by model version and wrote promotion gates the next candidate has to clear. I didn’t loosen a threshold to make the alarm go away.</p><p>Ask me about weaknesses on a call; you’ll get a better answer than a canned one.</p>",
      l: [L.aws], f: ["Tell me about the AWS project", "Have you led a team?"] },
    { id: "edu", k: ["!education", "!gpa", "degree", "masters", "master's", "ms", "university", "boston university", "bu", "coursework", "courses", "btech", "iist", "undergrad", "college", "graduate", "study", "studied", "school", "graduated"],
      a: "<p>MS in Applied Data Analytics, Boston University, May 2026, GPA 3.75. Coursework in machine learning (foundations and advanced), big data analytics, data mining, algorithms, web mining and graph analytics, data science with Python, and visualization. Several class projects became real work: WikiFlow (big data, published by Springer), the readmission study, the MBTA network study and driver drowsiness detection.</p><p>Before that, a BTech in Electronics and Communication Engineering from IIST (2019–2023), with a thesis on meta-learning for blind super-resolution.</p>",
      f: ["What roles are you looking for?", "Tell me about your research"] },
    { id: "contact", k: ["!contact", "!email", "resume", "résumé", "cv", "phone", "reach you", "get in touch", "linkedin", "github", "call", "interview", "schedule"],
      a: "<p>Email is fastest: <b>araj7042@gmail.com</b>. Pick whatever’s easiest and it opens with a message ready to send. Résumés are below too.</p>",
      l: "resumes", f: ["When can you start?", "Do you need sponsorship?"] },
    { id: "fun", k: ["!hobbies", "!hobby", "!for fun", "fun", "games", "gaming", "music", "free time", "interests", "outside work", "weekend", "fifa", "ea fc", "fc 26", "football", "soccer"],
      a: "<p>Games, coding for fun and music. Games are how I switch off, so my side project audits EA FC 26’s player ratings against real match data. And Side B on this page has a little game about overfitting that can play a backtest as music.</p>",
      l: [sec("side-b", "Play Side B")], f: ["What are you working on now?", "Tell me about yourself"] },
    { id: "now", k: ["!working on now", "!currently", "next", "latest", "recent", "these days", "side project", "side projects", "building"],
      a: "<ul><li><b>ExoQuery-Bench:</b> an open benchmark for AI assistants that query NASA’s Exoplanet Archive.</li><li><b>WikiFlow, part two:</b> moving from predicting who quits to deciding which newcomers benefit most from early contact.</li><li><b>Two commodity manuscripts</b> with Prof. Pinsky.</li><li><b>FC 26 ratings audit</b>, for fun.</li></ul>",
      l: [L.exo], f: ["Have you worked with LLMs?", "What do you do for fun?"] },
    { id: "tools", k: ["!tech stack", "!skills", "tools", "technologies", "toolkit", "stack", "software"],
      a: "<p><b>Languages:</b> Python, SQL, R, C++. <b>Data:</b> PostgreSQL, BigQuery, SQLite, Excel, AWS (S3, Glue, Athena, Lambda, Step Functions, CloudFront), GCP Dataproc, Spark. <b>BI:</b> Power BI with DAX, Tableau. <b>ML:</b> scikit-learn, LightGBM, XGBoost, PyTorch, Keras. <b>Engineering:</b> FastAPI, Docker, GitHub Actions, pytest. <b>Statistics:</b> bootstrap methods, multiple-testing corrections, GARCH, VaR backtesting, calibration.</p>",
      f: ["How much SQL have you written?", "Which BI tools have you used?", "Have you worked with LLMs?"] },
    { id: "devops", k: ["!docker", "!ci/cd", "github actions", "devops", "mlops", "git", "testing", "unit tests", "pytest", "deployment", "deploy", "api", "fastapi"],
      a: "<p>JudgeGuard ships as a multi-stage, non-root Docker image behind FastAPI, with CI on Python 3.11 and 3.12 running ruff, mypy, Hypothesis property tests, a Python-to-JavaScript parity check and a container smoke test. The AWS pipeline has 81 tests and deploys through GitHub Actions with a restricted OIDC role.</p>",
      l: [["JudgeGuard code", "https://github.com/RyanSingh0/judgeguard"], L.awsCode], f: ["Tell me about the AWS project", "Have you worked with LLMs?"] },
    { id: "hello", k: ["!hello", "!hi", "hey", "good morning", "thanks", "thank you", "cool", "nice"],
      a: "<p>Hi! Ask me anything a screening call would cover: projects, tools, visa status, availability.</p>", f: ["Tell me about yourself", "Why should we hire you?", "Do you need sponsorship?"] }
  ];
  const BY = Object.fromEntries(NOTES.map((n) => [n.id, n]));
  /* ---------- "Why should we hire you?" ----------
     I ask for the role and company first, then make the case for that role.
     Each "tell me more" goes one level deeper (t1 -> t2 -> t3). Facts only from my verified notes. */
  const PITCH = {
    quant: {
      label: "quant, trading or risk",
      t1: ["<b>I’ve traded it.</b> A year of intraday FX and commodities (EUR/USD, USD/JPY, USD/CAD, gold, silver, oil) on prop-firm challenges: three 15% profit targets in a row, and never a breach of the 10% total or 5% daily loss limit.",
           "<b>I validate like a risk desk.</b> My first-author paper in <i>Risks</i> shows that a 15-year dollar pattern came from bad vendor data while standard overfitting tests called it robust. I implemented Newey-West, White’s Reality Check, Hansen’s SPA, Romano-Wolf, the deflated Sharpe ratio and CSCV from scratch.",
           "<b>I measure risk honestly.</b> My multi-asset risk engine backtested 8 VaR models over 2,796 days, and showed the normal model understating one-month 99% expected shortfall by about a third (11.1% vs 7.4%)."],
      t2: "<p>The project I’d walk you through first is the dollar paper. The free feed carries the ICE spot index; I compared it with ICE Dollar Index futures from Barchart and Federal Reserve rates from FRED. Spot and futures differ, so I also rebuilt the spot index from its six currencies (overnight Sharpe +0.22 against −1.36 on the free feed), ran a carry test and screened the opening prices: the error was in the recorded opens. I wrote a search engine that reproduces the original backtest on all 1,312 configurations about 17× faster, then reran the whole search 2,000 times against luck.</p><p>Then the commodities work: 15 Bloomberg futures and 6 ETFs, where the same rotation rule gives opposite answers (ETF monthly winners $100 → $337 against $121 for equal weight). That paper is under review at <i>Commodities</i>.</p>",
      t2l: [["Read the Risks paper", "https://www.mdpi.com/2227-9091/14/11/247"], ["SQL dashboard of the results", "https://ryansingh0.github.io/backtest-reality-check/"]]
    },
    da: {
      label: "data analyst or BI",
      t1: ["<b>I make numbers trustworthy before anyone reads a chart.</b> My AWS pipeline won’t publish until 17 integrity checks pass, and my screen caught 10 faulty price feeds out of 37 before they reached analysis.",
           "<b>I speak SQL and BI.</b> A PostgreSQL star schema with CTEs, window functions and RFM segmentation over 98,199 orders; a four-page Power BI report with DAX; a public Tableau dashboard.",
           "<b>I turn analysis into decisions.</b> Late deliveries cost 1.7 review stars; the top two customer segments hold 74% of revenue; a hospital call list reaches 3× more readmissions than random calls."],
      t2: "<p>Two projects show it best. In RetailPulse I cleaned nine messy Olist tables (string dates, duplicate reviews, multi-item orders) into raw, clean and mart layers in PostgreSQL, then built the Power BI report a marketplace manager would use: on-time orders average 4.29 stars against 2.57 when late, and only 3.0% of customers ever order again.</p><p>In my AWS project the pipeline replays 105,372 incident deliveries, handles duplicates, late arrivals and corrections, and keeps the last good report up if a run fails. It costs about $0.03 per processing run and has 81 automated tests.</p>",
      t2l: [["Live Power BI report", "https://app.powerbi.com/view?r=eyJrIjoiYTBmMDI3ZWMtMDExZC00MmM0LTk5ZTYtYjY4YTlhNTk4N2EyIiwidCI6ImQ1N2QzMmNjLWMxMjEtNDg4Zi1iMDdiLWRmZTcwNTY4MGM3MSIsImMiOjN9&pageName=f28b4b4a651ff21ecd55"], ["Live AWS dashboard", "https://d17q1whdf7htno.cloudfront.net/"]]
    },
    ds: {
      label: "data science or machine learning",
      t1: ["<b>I beat a published benchmark honestly.</b> AUC 0.689 against a published 0.664 on 101,766 hospital encounters, under the same nested, patient-grouped cross-validation.",
           "<b>I work at scale.</b> About 60 million Wikipedia edits on a 5-node Spark cluster, AUC 0.909, published by Springer.",
           "<b>I check models before I trust them.</b> Leakage checks, calibration and subgroup audits are routine for me, and JudgeGuard tests AI judges against real model responses (96 of 100 pairs)."],
      t2: "<p>The readmission study is the one I’d walk you through. The gain over the benchmark came from how I built the patient cohort and from patient-history features, not from a fancier model: two Transformer models lost to gradient boosting at up to 65 times the compute, so the simpler model shipped. My fairness audit found no gap by race or sex but a drop from 0.73 to 0.63 across age bands, and I turned the predictions into a call list: phoning the riskiest 5% reaches 1,696 future readmissions, 3.0× what random calls reach.</p><p>WikiFlow is the scale story: 13 leakage-free features from each editor’s first ten edits, logistic regression written from scratch on Spark RDDs (AUC 0.845 in 19 seconds) and a distributed neural network (0.909), for roughly $2.50 a full run.</p>",
      t2l: [["Readmission dashboard", "https://ryansingh0.github.io/hospital-readmission/"], ["WikiFlow on Springer", "https://link.springer.com/chapter/10.1007/978-3-032-42320-7_22"]]
    },
    de: {
      label: "data engineering",
      t1: ["<b>I build pipelines that refuse to publish bad data.</b> My AWS pipeline handles duplicate, late and corrected deliveries and blocks publication unless 17 integrity checks pass.",
           "<b>I ship like production.</b> 81 automated tests, releases through GitHub Actions with a restricted OIDC role, about $0.03 per processing run.",
           "<b>I’ve moved real volume.</b> 25 GB of Wikipedia history through PySpark on Google Cloud Dataproc into BigQuery, for roughly $2.50 a run."],
      t2: "<p>In the AWS project the stack is S3, Step Functions, Glue with PySpark and Spark SQL, Athena, Lambda and CloudFront. I forced a failure to prove the last good report stays up, and a repeated request finishes without rerunning compute. The live site adds a daily NYC 311 demand forecast for the five boroughs; a new model only replaces the current one after winning at least 2 of 3 walk-forward windows with at least 2% lower error.</p><p>When the forecast-coverage alarm fired for Manhattan, I traced the cause, tested a recalibrated band on four historical windows, and kept the live model until a challenger clears written gates. I didn’t loosen a threshold to make the alarm go away.</p>",
      t2l: [["Live AWS dashboard", "https://d17q1whdf7htno.cloudfront.net/"], ["Pipeline code", "https://github.com/RyanSingh0/service-operations-analytics-portfolio"]]
    },
    research: {
      label: "research",
      t1: ["<b>I publish.</b> Five first-author papers, two published in October 2026 (<i>Risks</i> and Springer LNICST) and one under review at <i>Commodities</i>.",
           "<b>I declare everything I tried.</b> Noise ceilings from 2,000 bootstrap replications, multiple-testing corrections, and code that rebuilds every table with one command.",
           "<b>I go from question to finding fast.</b> From a pattern that looked like money to a published explanation of why it wasn’t, with Prof. Eugene Pinsky."],
      t2: "<p>The dollar paper is my best example: two blind spots in backtest validation, bad input data and an undeclared search. A strategy that looks strong with 6 variants reported doesn’t survive once all 216 tried are declared. WikiFlow shows the other side of my research, distributed machine learning on 60 million Wikipedia edits, and my next step there is moving from predicting who quits to deciding which newcomers benefit most from early contact.</p>",
      t2l: [["Risks paper", "https://www.mdpi.com/2227-9091/14/11/247"], ["ORCID", "https://orcid.org/0009-0005-6739-8265"]]
    },
    ai: {
      label: "AI or LLM",
      t1: ["<b>I evaluate AI the way it should be evaluated.</b> JudgeGuard replays an agent’s tool calls and flags the exact wrong step behind a right answer.",
           "<b>I test with real models.</b> A local Qwen3-4B judge ranked the supported answer first on 96 of 100 pairs, with all 200 raw responses published.",
           "<b>I ship it.</b> FastAPI, Docker, Gradio on Hugging Face ZeroGPU, CI with property tests, and a 150 ms p99 latency budget on the guard path."],
      t2: "<p>JudgeGuard is live on Hugging Face. The demo opens with a trace where the final answer is right but a multiplication step recorded 115,500 instead of 119,700; a judge reading only the answer passes it, and JudgeGuard flags the step. Next I’m building ExoQuery-Bench, an open benchmark for assistants that turn plain English into NASA archive queries across prompts, RAG, agents and MCP tools.</p>",
      t2l: [["JudgeGuard workbench", "https://huggingface.co/spaces/RugFace/judgeguard-app"], ["ExoQuery-Bench", "https://github.com/RyanSingh0/ExoQuery-Bench"]]
    }
  };
  const ROLE_RE = [
    ["quant", /\b(quant\w*|trading|trader|risk|model validation|model risk|portfolio|investment|asset management|hedge|fx|commodit\w*|markets?|securities|derivatives?|bank(ing)?)\b/],
    ["ai", /\b(llm|genai|gen ai|ai engineer|ai evaluation|prompt|nlp engineer|ai)\b/],
    ["de", /\b(data engineer\w*|analytics engineer\w*|etl|pipelines?|platform engineer\w*)\b/],
    ["ds", /\b(data scien\w*|machine learning|ml|applied scien\w*|deep learning)\b/],
    ["research", /\b(research\w*)\b/],
    ["da", /\b(analyst|bi|business intelligence|analytics|reporting|insights|data analys\w*)\b/]
  ];
  const STOP_CO = /^(the|a|an|my|our|your|this|that|role|team|company|data|quant|risk|analyst|scientist|engineer|research)$/i;
  function parseHire(text, allowGuess) {
    const t = " " + text.toLowerCase() + " ";
    const fam = (ROLE_RE.find(([, re]) => re.test(t)) || [null])[0];
    const clean = text.replace(/^\s*(it[’']?s|this is|we[’']?re hiring( for)?|hiring( for)?|for|role:?)\s+(an?|the)?\s*/i, "");
    const tm = clean.match(/((?:senior |junior |associate |lead |entry[- ]level )?(?:[a-z\/&-]{2,} ){0,3}(?:analyst|scientist|engineer|researcher|associate|developer|strategist|quant|trader|intern|specialist|consultant))\b/i);
    const title = tm ? tm[1].trim().replace(/\b\w/g, (c) => c.toUpperCase()).replace(/^(As An?|For An?|For The|Hiring An?|Hiring|A|An|The) /, "") : null;
    let company = null;
    const cm = text.match(/(?:\bat|\bwith|\bfor|@|\bjoining|\bcompany is|\bfrom)\s+([A-Z0-9][\w&.'-]*(?:\s+(?:[A-Z0-9&][\w&.'-]*|of|and))*)/);
    if (cm) company = cm[1].replace(/\s+(of|and)$/i, "").trim();
    if (!company && allowGuess) { const caps = text.match(/\b([A-Z][a-zA-Z0-9&.'-]{1,}(?:\s+[A-Z][a-zA-Z0-9&.'-]+){0,3})\b/g) || []; company = caps.find((c) => !STOP_CO.test(c) && !ROLE_RE.some(([, re]) => re.test(" " + c.toLowerCase() + " ")) && !/^(I|It|Its|Hi|Hello|Hey|We|Our|Data|Senior|Junior|This|That|Hiring|Role|Just|Tell|Why|What)$/.test(c)) || null; }
    if (company && STOP_CO.test(company)) company = null;
    return { fam, title, company };
  }
  const MORE_RE = /^\s*(tell me more|more|go on|keep going|elaborate|continue|say more|more details?|details|and\??|go deeper|expand|explain more|what else)\b/i;
  /* "tell me more" after a normal answer: the deeper version, still from verified notes */
  const MORE = {
    dxy: PITCH.quant.t2,
    quant: PITCH.quant.t2,
    readmit: "<p>The gain over the benchmark came from how I built the patient cohort and from patient-history features, not from a fancier model. Two Transformer models lost to gradient boosting at up to 65 times the compute, so the simpler model shipped. My fairness audit found no gap by race or sex but a drop from 0.73 to 0.63 across age bands, which argues for age-aware thresholds. The dashboard lets a care team pick how many calls it can make: the top 20% of discharges hold 40% of all readmissions.</p>",
    wiki: "<p>I kept 13 features from each editor’s first ten edits, out of about 40 candidates, and dropped co-editor graph features because they quietly leaked the answer. Clustering found four kinds of newcomer: casual contributors (402,276), frustrated burst editors (308,377), focused bot-like editors (307,231) and power users on talk pages (140,364). The from-scratch logistic regression trains in 19 seconds; the neural network adds 6.4 AUC points for 4.5× the time, which is the trade-off a team would actually weigh.</p>",
    svc: PITCH.de.t2,
    trader: "<p>After that year I wanted to know how professionals test what I’d been doing by feel and by backtest. That’s what took me into quant research at Boston University: the same markets I’d traded, first on free data, then exchange vendor data, then Bloomberg, with the statistics a model-risk team would ask for.</p>",
    story: "<p>Where I want to go: my first choice is finance, in quant research, trading analytics or risk at a bank, a quant firm or an asset manager. The same habits work anywhere, though, and I’d be just as glad to join any company as a data analyst, data engineer, data scientist or researcher.</p>",
    intro: "<p>It started with labels. At ISRO I learned that how you label data decides whether a model works, and my MAML thesis and computer vision work kept proving it. I wanted depth and the US tech hub, so I applied for a master’s. That year was hard, so I published two papers and taught myself to trade FX and commodities around the London and New York opens. At BU I went back to those markets as a researcher, and the data lesson came back bigger: it became my paper in <i>Risks</i>.</p>",
    sql: "<p>The SQL I’m proudest of is in Backtest Reality Check: a 12-table SQLite star schema with 7 views, each answering one business question, such as how many of 1,372 strategies beat buy-and-hold as costs rise (39% at 0 bp, 28% at 5 bp). In RetailPulse the hard part was cleaning: string dates, Portuguese category names, duplicate review rows and multi-item orders, all handled in SQL before any chart.</p>",
    ml: "<p>One choice I like to explain: in driver drowsiness detection I chose a random forest over an LSTM that scored perfectly in validation but didn’t hold up on the test set. The random forest reached ROC-AUC 0.964 and F1 0.923. Picking the model that generalizes over the one that looks best is the same habit behind my research.</p>",
    mbta: "<p>The three defects: stop sequences sorted as text instead of numbers, direction-specific platform IDs that split the network into six pieces, and a route filter that silently dropped the Green Line. After fixing them I compared Louvain, spectral and METIS partitioning (METIS matched spectral’s edge cut at 1.05 size balance) and simulated every single-station closure.</p>",
    llm: PITCH.ai.t2,
    commod: "<p>In futures, the semiannual median strategy grew $100 to $170, against $113–126 for equal weight and $103 for the BCOM benchmark, and the annual median beat equal weight in 10 of 12 rebalancing months. In ETFs, monthly winners led. Every strategy was tested against random portfolios and corrected for the number tried, and the best slow strategies survive more than 60 basis points of trading cost.</p>",
    risk: "<p>DCC-GARCH with an empirical tail had 30 breaches against 28 expected (Kupiec p = 0.70) and was the only model to pass the full conditional-coverage test. The 40/30/30 book had a beta of −0.61 to the dollar, and average cross-asset correlation rose from 0.19 in calm markets to 0.25 in stressed ones.</p>",
    retail: PITCH.da.t2
  };
  const FAM_BEST = { quant: "dxy", da: "retail", ds: "readmit", de: "svc", research: "dxy", ai: "llm" };

  /* best-project questions depend on the role mentioned */
  const BEST = [
    [/\b(analyst|bi|sql|power ?bi|tableau|dashboard|reporting)\b/, "retail"],
    [/\b(quant|risk|trading|finance|financial|bank|validation)\b/, "dxy"],
    [/\b(engineer|engineering|pipeline|aws|cloud|etl)\b/, "svc"],
    [/\b(ai|llm|genai|agent)\b/, "llm"],
    [/\b(health|hospital|clinical)\b/, "readmit"],
    [/\b(scien|ml|machine)/, "readmit"]
  ];

  const norm = (s) => " " + s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9+#/&.\- ']/g, " ").replace(/\s+/g, " ").trim() + " ";
  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 1) return 2;
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  function match(q) {
    const t = norm(q), toks = t.trim().split(" ");
    if (/\b(best|strongest|favou?rite|proudest|most impressive|top) (project|work)/.test(t) || /which project/.test(t)) {
      const hit = BEST.find(([re]) => re.test(t));
      const id = hit ? hit[1] : "why";
      return { note: BY[id === "dxy" ? "dxy" : id], lead: hit ? "<p>For that kind of role, my strongest project is this one:</p>" : "" };
    }
    let best = null, bestS = 0;
    NOTES.forEach((n) => {
      let s = 0;
      n.k.forEach((kw) => {
        const strong = kw[0] === "!", k = strong ? kw.slice(1) : kw, w = (strong ? 2 : 1) * (1 + 0.4 * (k.split(" ").length - 1));
        if (t.includes(" " + k + " ") || (k.length > 4 && !k.includes(" ") && t.includes(" " + k))) s += w;
        else if (!k.includes(" ") && k.length >= 5 && toks.some((tk) => tk.length >= 4 && lev(tk, k) === 1)) s += w * 0.7;
      });
      if (s > bestS) { bestS = s; best = n; }
    });
    if (best && best.alias) best = BY[best.alias];
    return bestS >= 1 ? { note: best } : null;
  }

  /* ---------- UI ---------- */
  const log = $("#ask-log"), sugg = $("#ask-sugg"), form = $("#ask-form"), input = $("#ask-input");
  window.askAryan = { match, notes: NOTES, pitch: PITCH, more: MORE, parseHire };
  if (!log) return;
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function linksHTML(l) {
    if (l === "resumes") {
      const R = (window.SITE_RESUMES || []).filter((r) => r.on);
      l = R.map((r) => [r.label + " résumé (PDF)", window.resumeHref(r)]).concat([L.li, L.gh]);
    }
    if (!l || !l.length) return "";
    return `<p class="msg-links">${l.map(([t, u]) => `<a href="${u}"${u[0] === "#" ? "" : ' rel="noopener" target="_blank"'}>${t}</a>`).join("")}</p>`;
  }
  function chips(list) {
    sugg.innerHTML = list.map((q) => `<button type="button" class="chip" data-q="${esc(q)}">${esc(q)}</button>`).join("");
  }
  function add(html, who) {
    const d = document.createElement("div");
    d.className = "msg " + (who === "you" ? "msg-you" : "msg-me");
    d.innerHTML = html; log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }
  const history = [];
  const ctx = { fam: null, title: null, company: null, awaiting: null, last: null, depth: 0 };
  window.askAryan.ctx = ctx;
  const ul = (items) => `<ul>${items.map((x) => `<li>${x}</li>`).join("")}</ul>`;
  function noteOut(n, lead) { ctx.last = { kind: "note", note: n, more: false }; const mail = n.id === "contact" && window.contactHTML ? `<p class="msg-links">${window.contactHTML({ title: ctx.title, company: ctx.company, label: PITCH[ctx.fam] && PITCH[ctx.fam].label })}</p>` : ""; return { html: (lead || "") + n.a + mail + linksHTML(n.l), follow: n.f, src: n.id }; }
  function hireOut(depth) {
    const P = PITCH[ctx.fam], co = ctx.company ? esc(ctx.company) : null, ti = ctx.title ? esc(ctx.title) : null;
    ctx.last = { kind: "hire" };
    if (!P) {
      return { html: `<p>Here’s what I’d bring${co ? ` to <b>${co}</b>` : ""}:</p>` + BY.why.a + `<p class="msg-src">Which role is it? I’ll tailor this.</p>`,
        follow: ["It’s a data analyst role", "It’s a quant or risk role", "It’s a data scientist role", "It’s a data engineer role"], src: "why" };
    }
    if (depth <= 1) {
      const what = ti ? `the <b>${ti}</b> role` : `a ${P.label} role`;
      return { html: `<p>For ${what}${co ? ` at <b>${co}</b>` : ""}, here’s why I’d be a strong hire:</p>` + ul(P.t1) +
        `<p class="msg-src">${co ? `Tell me what the team at ${co} works on and I’ll point you to the closest project.` : "Tell me the company and I can make this sharper."}</p>`,
        follow: ["Tell me more", "Which project should I look at first?", "Do you need sponsorship?"], src: "pitch-" + ctx.fam };
    }
    if (depth === 2) return { html: P.t2 + linksHTML(P.t2l), follow: ["Tell me more", "When can you start?", "Do you need sponsorship?"], src: "pitch-" + ctx.fam };
    if (depth === 3) return { html: `<p>Here’s the rest of the picture${co ? ` for ${co}` : ""}:</p>` + ul([
        `My story, from labelling satellite images at ISRO to a trading desk of one, is <a href="#story">on this page</a>.`,
        `Every project below is told as problem, action, tools and result, with live demos you can try.`,
        `The fastest way to go deeper is a conversation: email me at <b>araj7042@gmail.com</b> and I’ll walk you through the code live.`]) + (window.contactHTML ? `<p class="msg-links">${window.contactHTML({ title: ctx.title, company: ctx.company, label: P.label })}</p>` : "") + linksHTML("resumes"),
      follow: ["What’s your story?", "When can you start?", "How do I contact you?"], src: "pitch-" + ctx.fam };
    return { html: `<p>That’s everything in my notes. The best next step is a conversation: <b>araj7042@gmail.com</b> <button class="linkish" type="button" data-copy="araj7042@gmail.com">copy</button></p>`, follow: ["How do I contact you?", "What’s your story?"], src: "contact" };
  }
  function askRole() {
    ctx.awaiting = "hire";
    return { kind: "clarify", html: `<p>Happy to make the case, and I’d rather make it specific. What’s the role, and which company? Something like “quant risk analyst at Citi” or “data analyst at Wayfair” works.</p>`,
      follow: ["Quant or risk analyst", "Data analyst", "Data scientist", "Data engineer", "Research analyst", "Just tell me in general"] };
  }
  function mergeHire(h) { if (h.fam) ctx.fam = h.fam; if (h.title) ctx.title = h.title; if (h.company) ctx.company = h.company; }
  function localAnswer(q) {
    const t = q.trim(), rest = t.replace(MORE_RE, "").replace(/^\s*(about|on)\s+/i, "").trim();
    const isMore = MORE_RE.test(t) && rest.length < 3;
    if (ctx.awaiting === "hire" && !isMore) {
      ctx.awaiting = null;
      if (/general|skip|not sure|doesn.t matter|any role/i.test(t)) return noteOut(BY.why, "<p>Here’s the general case:</p>");
      const h = parseHire(t, true); mergeHire(h);
      if (!h.fam && !h.company && !h.title) return noteOut(BY.why, "<p>Here’s the general case:</p>");
      ctx.depth = 1; return hireOut(1);
    }
    if (isMore) {
      if (ctx.last && ctx.last.kind === "hire") { ctx.depth += 1; return hireOut(ctx.depth); }
      if (ctx.last && ctx.last.kind === "note") {
        const n = ctx.last.note;
        if (MORE[n.id] && !ctx.last.more) { ctx.last.more = true; return { html: MORE[n.id], follow: n.f, src: n.id + "+" }; }
        return { html: "<p>That’s the full version in my notes. Want to go somewhere else, or ask me directly by email?</p>", follow: n.f || ["What’s your story?"], src: n.id };
      }
      return { html: "<p>Happy to. More about what?</p>", follow: ["Your story", "Your strongest project", "Your trading experience"] };
    }
    if (/which project|best project|strongest project|look at first|where should i start/i.test(t) && ctx.fam && !ROLE_RE.some(([, re]) => re.test(" " + t.toLowerCase() + " "))) {
      return noteOut(BY[FAM_BEST[ctx.fam]], `<p>For ${PITCH[ctx.fam].label} work, this is the one to start with:</p>`);
    }
    if (ctx.last && ctx.last.kind === "hire" && t.length < 70) {
      const h = parseHire(t);
      if ((h.fam || h.company) && !/sponsor|visa|start|relocat|salary|contact|email/i.test(t)) { mergeHire(h); ctx.depth = 1; return hireOut(1); }
    }
    const m = match(t);
    if (m && m.note.id === "why") {
      const h = parseHire(t); mergeHire(h);
      if (ctx.fam || ctx.company) { ctx.depth = 1; return hireOut(1); }
      return askRole();
    }
    if (m) {
      const out = noteOut(m.note, m.lead);
      if (MORE_RE.test(t) && MORE[m.note.id]) { ctx.last.more = true; out.html = m.note.a + MORE[m.note.id] + linksHTML(m.note.l); }
      return out;
    }
    ctx.last = null;
    return { html: `<p>That one’s outside my notes. Email me at <b>araj7042@gmail.com</b> <button class="linkish" type="button" data-copy="araj7042@gmail.com">copy</button> and I’ll answer it myself.</p><p>Or try one of these:</p>`,
      follow: ["Tell me about yourself", "Why should we hire you?", "What roles are you looking for?"], src: "none" };
  }
  const md = (s) => s.split(/\n{2,}/).map((p) => `<p>${esc(p).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+|#[\w-]+)\)/g, (m, t, u) => `<a href="${u}"${u[0] === "#" ? "" : ' target="_blank" rel="noopener"'}>${t}</a>`)}</p>`).join("");
  async function ask(q) {
    q = q.trim().slice(0, 300); if (!q) return;
    add(`<p>${esc(q)}</p>`, "you");
    input.value = "";
    const typing = add(`<p class="typing">writing…</p>`, "me");
    const local = localAnswer(q);
    let html = null;
    if (ASK_ENDPOINT && local.kind !== "clarify") {
      try {
        const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 15000);
        const r = await fetch(ASK_ENDPOINT, { method: "POST", headers: { "content-type": "application/json" }, signal: ctrl.signal,
          body: JSON.stringify({ question: q, history: history.slice(-6), context: { role: ctx.fam, title: ctx.title, company: ctx.company, depth: ctx.depth, topic: local.src || null } }) });
        clearTimeout(to);
        if (r.ok) {
          const j = await r.json();
          if (j && j.answer && j.verified) {
            html = md(j.answer) + `<p class="msg-src">Written by an AI from my notes; every number was checked against them. Questions are saved anonymously to improve answers.</p>`;
            history.push({ q, a: j.answer });
          }
        }
      } catch (e) { /* fall back to my notes */ }
    }
    if (!html) { await new Promise((r) => setTimeout(r, 320)); html = local.html; history.push({ q, a: local.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 1200) }); }
    typing.innerHTML = html;
    log.scrollTop = typing.offsetTop - 12;
    chips(local.follow || ["Why should we hire you?", "What are you working on now?", "How do I contact you?"]);
  }
  form.addEventListener("submit", (e) => { e.preventDefault(); ask(input.value); });
  /* role chips: the page reorders (site.js), and I say where to start */
  const chipsBox = document.querySelector(".lens-chips");
  if (chipsBox) chipsBox.addEventListener("click", (e) => {
    const c = e.target.closest(".chip"); if (!c) return;
    const k = c.dataset.lens, Ls = window.LENSES || {};
    if (PITCH[k]) { ctx.fam = k; ctx.last = { kind: "hire" }; ctx.depth = 0; }
    add(`<p>${esc(c.textContent)}</p>`, "you");
    if (k === "all" || !Ls[k]) {
      add(`<p>No problem. Ask me anything, or scroll down: the work starts with my four strongest projects, each told as problem, action, tools and result.</p>`, "me");
      chips(["Tell me about yourself", "What’s your story?", "Why should we hire you?"]);
      return;
    }
    const Lk = Ls[k];
    add(`<p>For ${Lk.name}, here’s where I’d start.</p><p>${Lk.brief}</p>` + linksHTML(Lk.links.concat([["Jump to the work", "#work"]])) + `<p class="msg-src">I’ve reordered the work section around this role.</p>`, "me");
    chips(["Why should we hire you?", "Do you need sponsorship?", "When can you start?"]);
  });

  /* the chat can follow you down the page */
  const box = document.getElementById("ask"), slot = document.getElementById("ask-slot"), fab = document.getElementById("ask-fab");
  const note = document.getElementById("ask-docked-note"), closeB = document.getElementById("ask-close");
  let slotVisible = true, slotBelow = false;
  function dock() { box.classList.add("docked"); note.hidden = false; closeB.hidden = false; fab.hidden = true; input.focus({ preventScroll: true }); }
  function undock() { box.classList.remove("docked"); note.hidden = true; closeB.hidden = true; fab.hidden = slotVisible || slotBelow; }
  function openChat() { if (slotVisible) { input.focus(); return; } dock(); }
  fab.addEventListener("click", dock);
  closeB.addEventListener("click", () => { undock(); fab.focus(); });
  document.getElementById("ask-undock").addEventListener("click", undock);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && box.classList.contains("docked")) undock(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => {
      slotVisible = en.isIntersecting;
      slotBelow = !en.isIntersecting && en.boundingClientRect.top > 0; // not reached yet
      if (!box.classList.contains("docked")) fab.hidden = slotVisible || slotBelow;
    }, { threshold: 0.15 }).observe(slot);
  }
  window.askAryan.open = openChat;

  sugg.addEventListener("click", (e) => { const b = e.target.closest("[data-q]"); if (b) ask(b.dataset.q); });
  chips(["Tell me about yourself", "Do you need sponsorship?", "How much SQL have you written?", "What’s your strongest project for a quant role?", "Why should we hire you?"]);
})();
