# ReLeaf · Biomanufacturing reports

Working site for the ReLeaf (iGEM 2026) Biomanufacturing page.

- **Overview** — the eight reports industry reads, which four go on our page, and the weekend plan.
- **Case 1 · Artemisinin** — process performance and techno-economic analysis, with sourced numbers.
- **Case 2 · Leghemoglobin** — product specification and biosafety dossier, with sourced numbers.
- **Bioreactor Report** — a form for the ReLeaf Bioreactor System specs and metrics, in nine sections with a progress meter and a section rail. Everything typed stays in your own browser. Preview shows the finished document before you print it; Export PDF prints it; Export .json (or Cmd/Ctrl + S) saves a file you can share and re-import.

The exported document is laid out the way technical and regulatory reports are: a cover with a document-control block, contents and revision history, numbered sections, numbered tables and figures with captions, and a signature block. Three figures are generated from what you type — the reactor schematic, start and end optical density per run, and the mix of evidence tiers across the report.

Static HTML, no build step and no network calls. Open `index.html`, or serve the folder:

```
python3 -m http.server 8765
```

Numbers in the two case pages carry their sources at the foot of each page.
