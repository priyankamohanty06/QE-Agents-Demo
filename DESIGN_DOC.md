# Design Document: AI-Powered QE Agent Demo UI
Version: 1.1
Date: July 10, 2026
Author: Priyanka Mohanty
Status: Complete & Demonstrated
## 1. Goal
Provide a clear front-end experience for the QE workflow that can:
- accept a PRD or API spec,
- visualize the four QE stages end to end,
- expose execution artifacts and metrics in a demo-friendly format,
- optionally connect to the Java backend service for real workflow execution.

## 2. UI Architecture
The repository now includes two complementary UI experiences.

1. Main studio page: [demo-ui/public/index.html](demo-ui/public/index.html)
   - Uses [demo-ui/public/app.js](demo-ui/public/app.js) and [demo-ui/public/styles.css](demo-ui/public/styles.css)
   - Supports both PRD and API Spec sample inputs
   - Shows explicit stage badges for planning, generation, execution, and triage
   - Renders plan, tests, execution evidence, defects, metrics, and reasoning trace

2. Backend-connected demo page: [demo-ui/public/demo_static.html](demo-ui/public/demo_static.html)
   - Targets the Java backend workflow server on `http://127.0.0.1:8081`
   - Displays a backend connected/disconnected badge in the page header
   - Accepts LLM configuration, HITL controls, and backend URL overrides
   - Falls back to local simulation when the backend is unavailable

The UI treats the workflow output as a single execution context with nested sections for planning, generation, execution, and triage.

## 3. Interaction Model
### Main studio page
- Artifact type: PRD , API Spec, User story
- Sample loaders for all artifact types
- Per-stage badge progression:
  - Pending
  - Running
  - Completed
- Result cards:
  - Risk-based plan
  - Generated tests and data
  - Execution results
  - Defect triage output
  - Evaluation metrics
  - Reasoning and tradeoffs

### Backend-connected page
- Backend URL input
- Health polling and status badge
- LLM mode/model/base URL/API key inputs
- HITL mode and approval token inputs
- Export and raw JSON viewing support

## 4. Design Choices
### Why keep a client-side simulation path
- The demo stays usable without backend availability.
- It is easier to present in interview/demo situations.
- It keeps the UI independently testable.

### Why add backend-first mode separately
- The Java service has richer orchestration and defect triage behavior.
- Keeping backend mode in a separate page avoids overloading the main studio with transport concerns.
- It allows explicit visibility into backend health, HITL controls, and live/fallback behavior.

### Why emphasize stage visibility
- QE workflows are easier to trust when each stage is visible.
- The stage badges make the pipeline understandable to non-engineering reviewers.
- The metrics and trace panels help explain tradeoffs rather than only showing final JSON.

## 5. Safety and Trustworthiness
- Inputs are sanitized before client-side simulation.
- The UI does not perform destructive actions.
- Backend mode surfaces failure and fallback status instead of hiding it.
- Exported JSON keeps the workflow auditable.
- Defect rendering explicitly shows owner, severity, priority, and confidence so triage is actionable.

## 6. QE Depth Demonstrated in the UI
- Risk-based planning rather than flat test enumeration
- Positive, negative, boundary, and retry-oriented scenarios
- Execution evidence with retry/flaky visibility
- Actionable defect output with ownership and root-cause hypothesis
- Evaluation summary for coverage and triage quality

## 7. What Changed in This Iteration
- Added PRD/API-spec switching in the main studio page.
- Added stage badges and richer summary panels.
- Added execution and metrics sections to the main UI.
- Added backend connection status, LLM controls, and HITL controls in the backend-connected page.
- Improved exported execution context fidelity for downstream inspection.

## 8. Next Steps
- Unify the two UI modes behind a single polished shell if desired.
- Add structured API response viewers for backend runs.
- Add lightweight regression checks for front-end rendering and export behavior.
