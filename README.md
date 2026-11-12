# ryansingh0.github.io

Portfolio of Aryan Meena: data scientist and quant researcher, Boston.

Plain HTML, CSS and JavaScript, no build step. Open `index.html` or serve the folder (`python -m http.server`).

- `assets/data.js`: data behind the live figures, exported from the public project repos (DXY feeds, MBTA network, readmission capacity curve).
- `assets/site.js`: sources and notes, theme, role lens (also sets the hero title, so `ryansingh0.github.io/#for-da` opens as a data analyst page), search (press `/`), résumé link, photo slots.
- `assets/demos.js`: Figure 1, the readmission slider, the MBTA closure simulator, the JudgeGuard trace, and the Side B game.
- `assets/ask.js`: the "Ask me" notes. `ASK_ENDPOINT` points at the Cloudflare worker; if it fails, the page answers from these notes.
- Résumé: one general résumé, `Aryan_Meena_Resume.pdf` in the repo root. Replace the file with the same name to update it.
- Photos for "Wins and moments": drop JPGs (about 1200 x 800, under 300 KB) into `assets/photos/` with these names:
  `medai-hackathon.jpg`, `wikiflow-csecs.jpg`, `teaching-bu.jpg`, `risks-paper.jpg`, `funding-pips.jpg`, `bu-graduation.jpg`.
  Until a photo is there, its card shows a number tile, so nothing looks broken.
