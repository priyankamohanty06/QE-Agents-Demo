# Deliverables Profile

## 1) Running demo
Use any of these options:

- Main studio page
  - Open [demo-ui/public/index.html](demo-ui/public/index.html) in a browser.
  - Best for a self-contained walkthrough with stage badges, execution metrics, and exportable JSON.

- Local server mode
  - Run: `python -m http.server 8000 --directory demo-ui/public`
  - Open: `http://localhost:8000/`

- Backend-connected mode
  - Start the companion Java backend on `http://127.0.0.1:8081`.
  - Open [demo-ui/public/demo_static.html](demo-ui/public/demo_static.html).
  - Use this mode to demonstrate backend health status, LLM settings, HITL controls, and backend-first workflow execution.

- Public hosted mode
  - Push to `main` and wait for GitHub Actions deployment.
  - Open: `https://priyankamohanty06.github.io/QE-Agents-Demo/`

## 2) Source code + README
- Main workflow studio: [demo-ui/public/index.html](demo-ui/public/index.html)
- Backend-connected demo page: [demo-ui/public/demo_static.html](demo-ui/public/demo_static.html)
- Client-side workflow logic: [demo-ui/public/app.js](demo-ui/public/app.js)
- Visual styling: [demo-ui/public/styles.css](demo-ui/public/styles.css)
- Sample outputs: [demo-ui/public/results](demo-ui/public/results)
- Usage guide: [README.md](README.md)

## 3) Design doc
- UI architecture, stage visibility model, backend-integration rationale, and trust/safety notes: [DESIGN_DOC.md](DESIGN_DOC.md)

## 4) End-to-end demo storyline
1. Choose PRD or API Spec input.
2. Load a sample artifact or paste a custom one.
3. Run the workflow and show the stage badges progressing across all four QE phases.
4. Review the risk-based test plan.
5. Review generated tests and execution evidence.
6. Review defect triage with severity, priority, owner, and root-cause hints.
7. Export the execution context JSON.
8. Optionally switch to the backend-connected page and show live backend execution plus fallback behavior.

## 5) Evidence of QE depth
- Risk-first scenario planning
- Positive, negative, boundary, and retry-aware coverage
- Execution evidence and lightweight flaky/retry visibility
- Actionable defect summaries with ownership metadata
- Reasoning trace and evaluation metrics for explainability

## 6) Safety and trustworthiness controls
- Prompt-injection sanitization for client-side simulation
- Safe, non-destructive demo execution
- Explicit fallback behavior when backend or LLM path is unavailable
- Exportable execution context for auditability
- Human-in-the-loop controls exposed in backend-connected mode
