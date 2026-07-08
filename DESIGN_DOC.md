# Design Document: AI-Powered QE Agent System

## 1. Goal
Create a working slice of an AI-powered Quality Engineering workflow that can take a PRD or API spec, produce a risk-based test plan, generate tests, execute them safely, and triage defects into actionable work items.

## 2. Architecture
The workflow is implemented as a small agent graph with four stages:

1. Test Planning Agent
   - Reads an incoming PRD/spec
   - Identifies critical flows, risky behaviors, and ambiguous areas
   - Produces a risk-ranked test plan

2. Test Generation Agent
   - Converts the plan into concrete tests and test data
   - Emphasizes happy-path, negative, boundary, and security-style cases
   - Keeps tests maintainable rather than generating large volumes of low-value cases

3. Test Execution Agent
   - Executes tests in a sandboxed mode
   - Uses deterministic replay rules and simulated test data
   - Handles retries and flaky-test heuristics without destructive side effects

4. Defect Triage Agent
   - Converts failures into defects with severity, priority, confidence, root cause hints, and deduplication
   - Groups similar issues to avoid noise

The artifact flows through the system as a single execution context object with sections for plan, tests, results, and defects.

## 3. Why this framework choice
This demo uses a custom agent graph instead of a heavier framework such as LangGraph or AutoGen.

Why:
- It is easy to explain in a demo
- It runs without extra package installation
- It is simple to adapt to real LLM providers later
- It keeps the focus on the QE workflow rather than framework plumbing

If this were expanded into production, the same architecture could be moved onto LangGraph or OpenAI Agents SDK for orchestration and tool calling.

## 4. Why these models
For a working slice, the demo uses a deterministic heuristic engine by default.

Preferred production model choice:
- GPT-4.1-mini or equivalent for planning and triage because it balances cost, latency, and reasoning quality
- A smaller model for test-case drafting if cost matters
- A stronger model only for the triage stage where nuance matters

The design is provider-agnostic so the same workflow can call Azure OpenAI, OpenAI, or Anthropic APIs via a thin adapter layer.

## 5. Safety and trustworthiness
### Sandbox execution
- Tests run in a mock/simulated environment rather than against production systems
- No destructive writes or external payments are performed
- Each execution includes a sandbox policy object

### Prompt injection defense
- PRDs are treated as untrusted input
- The system strips obvious instruction-style content such as "ignore previous instructions"
- Agent instructions are separated from input content
- The planner is constrained to extract requirements, risks, and test ideas rather than execute arbitrary commands

### Hallucination control
- Each stage produces evidence-based reasoning and references the source requirement IDs
- The system marks confidence levels for generated tests and defects
- A human review checkpoint is included before anything is promoted to production test automation

## 6. QE depth demonstrated
The workflow intentionally focuses on quality over volume:
- Risk-based planning rather than exhaustive test generation
- Negative and boundary tests for validation failures
- Realistic defect triage with severity, deduplication, and root cause hints
- Handling ambiguity by surfacing assumptions and unresolved requirements

## 7. Evaluation strategy
The demo tracks simple proxy metrics:
- Requirement coverage: number of key requirements covered by test cases
- False positive rate: how often the triage stage marks a harmless issue as a defect
- Triage usefulness: whether the defect summary contains enough information for the next engineer to act
- Maintenance score: whether the generated test logic is readable and reusable

## 8. What comes next
- Replace the heuristic engine with a real LLM-backed agent loop
- Add a repository of test data and fixture generation
- Add actual API or UI automation for execution
- Move the sandbox to a containerized environment
- Add metrics dashboards for coverage and defect quality
