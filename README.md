# ReLeaf · Biomanufacturing reports

Working site for the ReLeaf (iGEM 2026) Biomanufacturing page.

- **Overview** — the eight reports industry reads, which four go on our page, and the weekend plan.
- **Case 1 · Artemisinin** — process performance and techno-economic analysis, with sourced numbers.
- **Case 2 · Leghemoglobin** — product specification and biosafety dossier, with sourced numbers.
- **Bioreactor Report** — a form for the ReLeaf Bioreactor System specs and metrics. Everything typed stays in your own browser; Export PDF prints a formatted report, Export .json saves a file you can share and re-import.

Static HTML, no build step and no network calls. Open `index.html`, or serve the folder:

```
python3 -m http.server 8765
```

Numbers in the two case pages carry their sources at the foot of each page.
