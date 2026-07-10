# AI-Powered QE Agent Demo

This repository contains the browser UI for the QE Agent demo. It now supports both a fully client-side walkthrough and a backend-connected demo experience that can call the Java workflow service running on port 8081.

## What is included
- A polished end-to-end studio UI for PRD,User story and API-spec driven QE walkthroughs
- A backend-connected demo page for invoking the Java workflow service
- A lightweight JavaScript simulation flow for offline/demo fallback runs
- A design document describing UI architecture, safety boundaries, and tradeoffs
- Deliverables documentation for the interview/demo package

## UI entry points
- [demo-ui/public/index.html](demo-ui/public/index.html)
  - Main studio experience
  - Supports PRD,user story and API Spec sample inputs
  - Shows per-stage pipeline status, risk-based plan, generated tests, execution results, defect triage, and evaluation metrics
  - Uses [demo-ui/public/app.js](demo-ui/public/app.js) and [demo-ui/public/styles.css](demo-ui/public/styles.css)

- [demo-ui/public/demo_static.html](demo-ui/public/demo_static.html)
  - Backend-first demo page
  - Can call the Java backend at `http://127.0.0.1:8081`
  - Includes LLM mode inputs, HITL controls, backend URL field, health badge, and local simulation fallback if the backend is unavailable

## Demo flow
1. Paste a PRD or API spec or user story into the UI.
2. Run the QE workflow.
3. Review the risk-based test plan.
4. Inspect generated tests and execution evidence.
5. Review defect triage output with severity, priority, ownership, and root-cause hints.
6. Export the resulting execution context as JSON.

## Run locally
Option A: open the static studio directly
- Open [demo-ui/public/index.html](demo-ui/public/index.html) in a browser.

Option B: serve the UI with Python
- From this folder, run:
  - `python -m http.server 8000 --directory demo-ui/public`
- Open `http://localhost:8000/`

Option C: use the backend-connected demo page
- Start the Java backend from the companion repository with server mode enabled on port `8081`.
- Open [demo-ui/public/demo_static.html](demo-ui/public/demo_static.html) or serve it over HTTP.
- Confirm the header badge shows backend connected.

## Deploy for demo (GitHub Pages)
This repository includes an auto-deploy workflow for the UI.

1. Push changes to the `main` branch.
2. GitHub Actions runs `.github/workflows/deploy-demo-ui.yml`.
3. The public demo URL becomes:
   - `https://priyankamohanty06.github.io/QE-Agents-Demo/`

If it is your first Pages deployment, confirm in repository settings that Pages uses GitHub Actions.

If Pages has never been enabled for the repository, you have two options:
- Enable Pages manually in GitHub repository settings and choose GitHub Actions as the source.
- Or add a repository secret named `PAGES_ENABLEMENT_TOKEN` containing a Personal Access Token with repository admin/pages permissions so the workflow can enable Pages automatically.

## Generated outputs
- Static sample outputs are stored under [demo-ui/public/results](demo-ui/public/results).
- Live backend runs return execution context, test plan, generated tests, execution results, and triaged defects through the backend API.

## Notes
- The studio page keeps a deterministic client-side flow so the demo remains usable offline.
- The backend-connected page is designed to pair with the Java workflow service for richer end-to-end validation.
- The UI intentionally emphasizes explainability: visible stage progression, exportable JSON, and explicit defect ownership/triage data.
