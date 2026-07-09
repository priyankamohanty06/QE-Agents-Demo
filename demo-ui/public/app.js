const prdSample = `Product artifact: Checkout API
- Users can create an account with email and password.
- Customers may place an order using a card token and an optional coupon.
- The API must reject empty email, password shorter than 8 characters, and missing shipping address.
- The service must return 201 for successful order creation, 400 for validation issues, 409 for duplicate email, and 422 when the card token is malformed.
- The system must be idempotent for duplicate order submissions.
- If a coupon code is empty, the API should not crash and should return a validation error.
`;

const apiSpecSample = `openapi: 3.0.0
info:
  title: Order API
  version: 1.0.0
paths:
  /orders:
    post:
      summary: Create order
      requestBody:
        required: true
      responses:
        '201':
          description: Created
        '400':
          description: Validation error
        '422':
          description: Invalid card token
  /orders/{orderId}:
    get:
      summary: Get order by id
      responses:
        '200':
          description: Success
        '404':
          description: Not found
security:
  - bearerAuth: []
`;

const prdInput = document.getElementById('prdInput');
const artifactType = document.getElementById('artifactType');
const runBtn = document.getElementById('runBtn');
const samplePrdBtn = document.getElementById('samplePrdBtn');
const sampleApiBtn = document.getElementById('sampleApiBtn');
const downloadBtn = document.getElementById('downloadBtn');

const stagePlanning = document.getElementById('stagePlanning');
const stageGeneration = document.getElementById('stageGeneration');
const stageExecution = document.getElementById('stageExecution');
const stageTriaging = document.getElementById('stageTriaging');

const summaryBox = document.getElementById('summary');
const planView = document.getElementById('planView');
const testsView = document.getElementById('testsView');
const executionView = document.getElementById('executionView');
const defectsView = document.getElementById('defectsView');
const metricsView = document.getElementById('metricsView');
const traceView = document.getElementById('traceView');

const stageMap = {
  planning: stagePlanning,
  generation: stageGeneration,
  execution: stageExecution,
  triaging: stageTriaging
};

prdInput.value = prdSample;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resetStageBadges() {
  Object.values(stageMap).forEach((el) => {
    el.className = 'stage-badge pending';
    el.textContent = 'Pending';
  });
}

function setStageStatus(stage, status) {
  const el = stageMap[stage];
  if (!el) return;

  if (status === 'running') {
    el.className = 'stage-badge running';
    el.textContent = 'Running';
    return;
  }

  if (status === 'done') {
    el.className = 'stage-badge done';
    el.textContent = 'Completed';
  }
}

function sanitizeInput(text) {
  const normalized = text.trim().replace(/\s+/g, ' ');
  const blocked = ['ignore previous instructions', 'system prompt', 'override rules', 'act as admin'];
  return blocked.reduce((acc, item) => acc.replace(new RegExp(item, 'gi'), ''), normalized);
}

function extractRequirements(text) {
  const requirements = [];
  const lines = text.split(/\n|\./).filter(Boolean);

  lines.forEach((line, idx) => {
    if (/must|should|reject|return|idempotent|create|place|customers|users|responses|required|security/i.test(line)) {
      requirements.push({ id: `REQ-${idx + 1}`, text: line.trim() });
    }
  });

  return requirements.slice(0, 10);
}

function planTests(requirements, sourceType) {
  return {
    planId: 'QE-PLAN-001',
    sourceType,
    overallRisk: 'HIGH',
    coverageAreas: ['Core flow', 'Validation', 'Boundary behavior', 'Retry/idempotency', 'Error contracts'],
    entryCriteria: ['Artifact parsed', 'Test environment available', 'Data fixtures ready'],
    exitCriteria: ['Critical scenarios executed', 'No blocker defects open', 'Defect triage complete'],
    ambiguities: [
      'Expected behavior for empty coupon is partially ambiguous (validation vs ignore).',
      'Owner mapping rules for defects should be confirmed per service team.'
    ],
    scenarios: [
      {
        id: 'SC-001',
        title: 'Happy path checkout',
        risk: 'CRITICAL',
        reason: 'Revenue-critical primary flow',
        priority: 'P0'
      },
      {
        id: 'SC-002',
        title: 'Validation and boundary failures',
        risk: 'HIGH',
        reason: 'Most likely source of regressions',
        priority: 'P1'
      },
      {
        id: 'SC-003',
        title: 'Idempotent retry behavior',
        risk: 'HIGH',
        reason: 'Duplicate order risk and data integrity',
        priority: 'P1'
      }
    ],
    requirementsCovered: requirements.length
  };
}

function generateTests(plan) {
  const tests = [
    {
      testId: 'T-101',
      title: 'Create order happy path',
      class: 'happy-path',
      scenarioId: 'SC-001',
      data: { email: 'demo@example.com', password: 'StrongPass1', cardToken: 'tok_abc123', coupon: '' },
      expectedResult: '201 Created'
    },
    {
      testId: 'T-102',
      title: 'Reject empty email',
      class: 'negative',
      scenarioId: 'SC-002',
      data: { email: '', password: 'StrongPass1', cardToken: 'tok_abc123' },
      expectedResult: '400 validation error'
    },
    {
      testId: 'T-103',
      title: 'Reject short password',
      class: 'boundary',
      scenarioId: 'SC-002',
      data: { email: 'demo@example.com', password: 'short', cardToken: 'tok_abc123' },
      expectedResult: '400 validation error'
    },
    {
      testId: 'T-104',
      title: 'Malformed card token handling',
      class: 'negative',
      scenarioId: 'SC-002',
      data: { email: 'demo@example.com', password: 'StrongPass1', cardToken: 'bad' },
      expectedResult: '422 invalid token'
    },
    {
      testId: 'T-105',
      title: 'Duplicate submission remains idempotent',
      class: 'boundary',
      scenarioId: 'SC-003',
      data: { email: 'demo@example.com', password: 'StrongPass1', cardToken: 'tok_abc123' },
      expectedResult: 'Safe replay behavior'
    }
  ];

  return tests.map((test) => ({
    ...test,
    maintainability: 'Structured assertions and readable fixture data'
  }));
}

function executeTests(tests) {
  const sandboxPolicy = {
    mode: 'sandboxed-simulated',
    externalCalls: 'disabled',
    retries: 1,
    flakyDetection: 'rerun-on-failure',
    artifactLogging: 'enabled'
  };

  const executionResults = tests.map((test) => {
    const failed = test.testId === 'T-104';
    return {
      testId: test.testId,
      title: test.title,
      status: failed ? 'FAILED' : 'PASSED',
      executionTimeMs: 95 + Math.round(Math.random() * 120),
      retryCount: failed ? 1 : 0,
      flaky: false,
      logRef: `log-${test.testId.toLowerCase()}`,
      notes: failed ? 'Reproduced on retry; classified as stable failure' : 'Executed safely in sandbox'
    };
  });

  return { executionResults, sandboxPolicy };
}

function triageDefects(executionResults) {
  const failed = executionResults.filter((item) => item.status === 'FAILED');

  return failed.map((item, idx) => ({
    defectId: `DEF-${idx + 1}`,
    title: `${item.title} failure in execution`,
    severity: 'HIGH',
    priority: 'P1',
    classification: item.flaky ? 'Flaky' : 'Real Defect',
    confidenceScore: 0.9,
    clusterKey: 'token-validation-errors',
    likelyOwner: 'Checkout API Team',
    rootCauseAnalysis: {
      hypothesis: 'Missing token format validation guard before payment provider adapter call',
      recommendedInvestigation: 'Inspect request validator and payment adapter input contract'
    }
  }));
}

function buildContext(inputText, sourceType) {
  const sanitized = sanitizeInput(inputText);
  const requirements = extractRequirements(sanitized);
  const plan = planTests(requirements, sourceType);
  const generatedTests = generateTests(plan);
  const executionData = executeTests(generatedTests);
  const triageDefects = triageDefects(executionData.executionResults);

  return {
    contextId: `ctx-${Date.now()}`,
    status: 'COMPLETED',
    sourceType,
    inputSummary: {
      sanitized: sanitized.length > 0,
      promptInjectionBlocked: sanitized !== inputText,
      requirementCount: requirements.length
    },
    testPlan: plan,
    generatedTests,
    executionResults: executionData.executionResults,
    triageDefects,
    safety: {
      sandboxPolicy: executionData.sandboxPolicy,
      humanInTheLoop: 'Required before production rollout'
    },
    evaluation: {
      coverage: `${Math.min(generatedTests.length, requirements.length)}/${requirements.length}`,
      falsePositiveRisk: 'Low',
      triageAccuracy: 'High (proxy)',
      maintainability: 'High'
    },
    trace: [
      {
        stage: 'Planning',
        reasoning: 'Prioritized risk-heavy user and payment paths and highlighted ambiguities for clarification.',
        tradeoff: 'Focused on high-value coverage before exhaustive permutations.'
      },
      {
        stage: 'Generation',
        reasoning: 'Produced executable-style tests with negative and boundary emphasis.',
        tradeoff: 'Limited test count for maintainability and fast feedback.'
      },
      {
        stage: 'Execution',
        reasoning: 'Ran in sandbox mode with retries and artifact capture.',
        tradeoff: 'Safe simulation over full integration to prevent side effects during demo.'
      },
      {
        stage: 'Triaging',
        reasoning: 'Clustered failures and assigned severity, owner, and root-cause hints.',
        tradeoff: 'Used deterministic ownership mapping for clarity.'
      }
    ]
  };
}

function renderSummary(context) {
  summaryBox.innerHTML = `
    <div class="badge">Status: ${context.status}</div>
    <div class="badge">Risk: ${context.testPlan.overallRisk}</div>
    <div class="badge">Source: ${context.sourceType}</div>
    <p><strong>Requirements extracted:</strong> ${context.inputSummary.requirementCount}</p>
    <p><strong>Coverage proxy:</strong> ${context.evaluation.coverage}</p>
    <p><strong>Sandbox:</strong> ${context.safety.sandboxPolicy.mode}</p>
    <p class="muted">Prompt injection blocked: ${context.inputSummary.promptInjectionBlocked ? 'Yes' : 'No trigger detected'}</p>
  `;
}

function renderPlan(plan) {
  planView.innerHTML = `
    <p><strong>Plan ID:</strong> ${plan.planId}</p>
    <p><strong>Coverage Areas:</strong> ${plan.coverageAreas.join(', ')}</p>
    <p><strong>Entry Criteria:</strong> ${plan.entryCriteria.join(' | ')}</p>
    <p><strong>Exit Criteria:</strong> ${plan.exitCriteria.join(' | ')}</p>
    <ul>${plan.scenarios.map((s) => `<li><strong>${s.id}</strong> ${s.title} - ${s.risk} (${s.priority})</li>`).join('')}</ul>
    <p class="muted"><strong>Ambiguities:</strong> ${plan.ambiguities.join(' ')}</p>
  `;
}

function renderTests(tests) {
  testsView.innerHTML = `
    <ul>${tests.map((test) => `<li><strong>${test.testId}</strong> ${test.title} (${test.class})</li>`).join('')}</ul>
    <p class="muted">Sample data fixture: ${JSON.stringify(tests[0].data)}</p>
  `;
}

function renderExecution(context) {
  executionView.innerHTML = `
    <p><strong>Policy:</strong> retries=${context.safety.sandboxPolicy.retries}, flakyDetection=${context.safety.sandboxPolicy.flakyDetection}</p>
    <ul>${context.executionResults.map((r) => `<li><strong>${r.testId}</strong> ${r.status}, retry=${r.retryCount}, flaky=${r.flaky}</li>`).join('')}</ul>
    <p class="muted">Artifacts logged for each execution run.</p>
  `;
}

function renderDefects(defects) {
  defectsView.innerHTML = defects.length
    ? `
      <ul>${defects.map((d) => `<li><strong>${d.defectId}</strong> ${d.title} - ${d.severity}/${d.priority}</li>`).join('')}</ul>
      <p><strong>Owner:</strong> ${defects[0].likelyOwner}</p>
      <p class="muted">${defects[0].rootCauseAnalysis.hypothesis}</p>
    `
    : '<p class="muted">No defects found in this run.</p>';
}

function renderMetrics(context) {
  metricsView.innerHTML = `
    <p><strong>Coverage:</strong> ${context.evaluation.coverage}</p>
    <p><strong>False positive risk:</strong> ${context.evaluation.falsePositiveRisk}</p>
    <p><strong>Triage accuracy:</strong> ${context.evaluation.triageAccuracy}</p>
    <p><strong>Maintainability:</strong> ${context.evaluation.maintainability}</p>
  `;
}

function renderTrace(trace) {
  traceView.innerHTML = trace.map((step) => `
    <div style="margin-bottom: 12px;">
      <strong>${step.stage}</strong>
      <div>${step.reasoning}</div>
      <div class="muted">Tradeoff: ${step.tradeoff}</div>
    </div>
  `).join('');
}

async function runWorkflow() {
  resetStageBadges();

  setStageStatus('planning', 'running');
  await delay(500);

  const inputText = prdInput.value;
  const sourceType = artifactType.value;
  const context = buildContext(inputText, sourceType);

  renderSummary(context);
  renderPlan(context.testPlan);
  setStageStatus('planning', 'done');

  setStageStatus('generation', 'running');
  await delay(500);
  renderTests(context.generatedTests);
  setStageStatus('generation', 'done');

  setStageStatus('execution', 'running');
  await delay(500);
  renderExecution(context);
  setStageStatus('execution', 'done');

  setStageStatus('triaging', 'running');
  await delay(500);
  renderDefects(context.triageDefects);
  renderMetrics(context);
  renderTrace(context.trace);
  setStageStatus('triaging', 'done');

  localStorage.setItem('qe-demo-context', JSON.stringify(context, null, 2));
}

function exportContext() {
  const stored = localStorage.getItem('qe-demo-context');
  const text = stored || JSON.stringify(buildContext(prdInput.value, artifactType.value), null, 2);
  const blob = new Blob([text], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'qe-demo-output.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

samplePrdBtn.addEventListener('click', () => {
  artifactType.value = 'PRD';
  prdInput.value = prdSample;
});

sampleApiBtn.addEventListener('click', () => {
  artifactType.value = 'API_SPEC';
  prdInput.value = apiSpecSample;
});

runBtn.addEventListener('click', runWorkflow);
downloadBtn.addEventListener('click', exportContext);

runWorkflow();
