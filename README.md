# AI-Powered QE Agent Demo

This repository contains a compact, end-to-end demo of an AI-assisted Quality Engineering agent workflow.

## What is included
- A browser-based demo UI for showing the workflow end to end
- A lightweight agent orchestration layer written in JavaScript
- A design document describing architecture, safety controls, and evaluation strategy
- Sample JSON outputs for planning, test generation, execution, and defect triage

## Demo flow
1. Review a product artifact (PRD/spec) in the UI.
2. Run the QE pipeline.
3. Inspect the generated test plan, executable tests, simulated execution results, and defect triage.

## Run locally
Option A: open the static page directly
- Open [demo-ui/public/index.html](demo-ui/public/index.html) in a browser.

Option B: serve the folder with Python
- From this folder, run:
  - `python -m http.server 8000 --directory demo-ui/public`
- Open `http://localhost:8000/`

## Deploy for demo (GitHub Pages)
This repository includes an auto-deploy workflow for the UI.

1. Push changes to the `main` branch.
2. GitHub Actions runs `.github/workflows/deploy-demo-ui.yml`.
3. Your public demo URL becomes:
   - `https://priyankamohanty06.github.io/QE-Agents-Demo/`

If it is your first Pages deployment, confirm in repository settings that Pages uses GitHub Actions.

## Generated outputs
Sample results are stored under [demo-ui/public/results](demo-ui/public/results).

## Notes
The demo uses a deterministic, heuristic agent loop so it runs without dependencies. It is structured so that a real LLM provider can be plugged in later with the same stage boundaries.
