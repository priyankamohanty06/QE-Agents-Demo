# Deliverables Profile

## 1) Running demo
Use either option:

- Static mode (no Node.js required)
  - Open [demo-ui/public/index.html](demo-ui/public/index.html) in a browser.

- Local server mode
  - Run: `python -m http.server 8000 --directory demo-ui/public`
  - Open: `http://localhost:8000/`

- Public hosted mode (recommended for interviews)
  - Push to `main` and wait for GitHub Actions deployment.
  - Open: `https://priyankamohanty06.github.io/QE-Agents-Demo/`

## 2) Source code + README
- Main workflow UI: [demo-ui/public/index.html](demo-ui/public/index.html)
- Agent logic: [demo-ui/public/app.js](demo-ui/public/app.js)
- Visual styling: [demo-ui/public/styles.css](demo-ui/public/styles.css)
- Sample outputs: [demo-ui/public/results](demo-ui/public/results)
- Usage guide: [README.md](README.md)

## 3) Design doc
- Architecture, agent roles, safety model, tradeoffs, and future roadmap: [DESIGN_DOC.md](DESIGN_DOC.md)

## 4) One end-to-end demo storyline
1. Paste PRD content into the UI.
2. Click "Run QE workflow".
3. Show risk-based plan in the Test plan panel.
4. Show generated negative/boundary tests in the Generated tests panel.
5. Show simulated execution with one purposeful failure.
6. Show triaged defect with severity, confidence, and root-cause hint.
7. Download JSON output and show full execution context.

## 5) Evidence of QE depth
- Risk-first scenario ranking (P0/P1)
- Negative and boundary coverage in generated tests
- Retry/flaky handling policy in execution stage
- Actionable defect output with dedupe and hypothesis
- Ambiguity handling through explicit reasoning trace

## 6) Safety and trustworthiness controls
- Prompt-injection sanitization of artifact text
- Sandbox execution mode with no external calls
- Confidence-scored triage outputs
- Human-in-the-loop recommendation before production rollout
