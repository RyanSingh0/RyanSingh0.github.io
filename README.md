# ryansingh0.github.io

Portfolio of Aryan Meena: data scientist and analyst, Boston.

Plain HTML, CSS and JavaScript, no build step. Open `index.html` or serve the folder (`python -m http.server`).

- `assets/data.js`: data behind the live figures, exported from the public project repos (DXY feeds, MBTA network, readmission capacity curve).
- `assets/site.js`: sources and notes, theme, role lens, search (press `/`), résumé links.
- `assets/demos.js`: Figure 1, the readmission slider, the MBTA closure simulator, the JudgeGuard trace, and the Side B game.
- `assets/ask.js`: the "Ask me" notes. Set `ASK_ENDPOINT` to switch on the Claude worker in `worker/`.
- Résumés: drop `Aryan_Meena_Resume_DA.pdf`, `Aryan_Meena_Resume_DS.pdf` (and optionally `Aryan_Meena_Resume_QR.pdf`, then set `on: true` for it in `assets/site.js`) in the repo root.
