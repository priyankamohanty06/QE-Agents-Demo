const defaultPrd = `Product artifact: Checkout API
- Users can create an account with email and password.
- Customers may place an order using a card token and an optional coupon.
- The API must reject empty email, password shorter than 8 characters, and missing shipping address.
- The service must return 201 for successful order creation, 400 for validation issues, 409 for duplicate email, and 422 when the card token is malformed.
- The system must be idempotent for duplicate order submissions.
- If a coupon code is empty, the API should not crash and should return a validation error.
`;

const prdInput = document.getElementById('prdInput');
const runBtn = document.getElementById('runBtn');
const sampleBtn = document.getElementById('sampleBtn');
const downloadBtn = document.getElementById('downloadBtn');
const summaryBox = document.getElementById('summary');
const planView = document.getElementById('planView');
const testsView = document.getElementById('testsView');
const defectsView = document.getElementById('defectsView');
const traceView = document.getElementById('traceView');

prdInput.value = defaultPrd;

function sanitizeInput(text) {
  const normalized = text.trim().replace(/\s+/g, ' ');
  const blocked = ['ignore previous instructions', 'system prompt', 'override rules', 'act as admin'];
  const cleaned = blocked.reduce((acc, item) => acc.replace(new RegExp(item, 'gi'), ''), normalized);
  return cleaned;
}

function extractRequirements(text) {
  const requirements = [];
  const lines = text.split(/\n|\./).filter(Boolean);
  lines.forEach((line, idx) => {
    if (/must|should|reject|return|idempotent|create|place|customers|users/i.test(line)) {
      requirements.push({ id: `REQ-${idx + 1}`, text: line.trim() });
    }
  });
  return requirements.slice(0, 7);
}

function buildPlan(requirements) {
  const scenarios = [
    {
      id: 'SC-001',
      title: 'Happy path checkout',
      risk: 'CRITICAL',
      reason: 'Covers monetization and primary user journey',
      priority: 'P0'
    },
    {
      id: 'SC-002',
      title: 'Validation edge cases',
      risk: 'HIGH',
      reason: 'Protects against malformed input and empty optional fields',
      priority: 'P1'
    },
    {
      id: 'SC-003',
      title: 'Duplicate and retry behavior',
      risk: 'HIGH',
      reason: 'Ensures idempotency and safe retries',
      priority: 'P1'
    }
  ];

  const reasoning = [
    'The planner prioritizes checkout, validation, and retry risk because the PRD includes payment, identity, and idempotency requirements.',
    'Boundary and negative tests receive equal weight to the happy path to avoid false confidence.',
    'The plan intentionally avoids exhaustive volume and focuses on high-value scenarios that can reveal regressions quickly.'
  ];

  return {
    planId: 'QE-PLAN-001',
    overallRisk: 'HIGH',
    goals: ['Verify core checkout flows', 'Catch validation regressions', 'Protect duplicate-submission behavior'],
    scenarios,
    reasoning,
    requirementsCovered: requirements.length
  };
}

function generateTests(plan) {
  const tests = [
    {
      testId: 'T-101',
      title: 'Happy path order placement',
      class: 'happy-path',
      data: { email: 'demo@example.com', password: 'StrongPass1', cardToken: 'tok_abc123', coupon: '' },
      expectedResult: '201 Created and order persisted',
      oracle: 'Status code 201 and response contains order id'
    },
    {
      testId: 'T-102',
      title: 'Reject empty email',
      class: 'negative',
      data: { email: '', password: 'StrongPass1', cardToken: 'tok_abc123' },
      expectedResult: '400 validation error',
      oracle: 'Validation error mentions email'
    },
    {
      testId: 'T-103',
      title: 'Reject weak password',
      class: 'boundary',
      data: { email: 'demo@example.com', password: 'short', cardToken: 'tok_abc123' },
      expectedResult: '400 validation error',
      oracle: 'Validation error mentions password length'
    },
    {
      testId: 'T-104',
      title: 'Empty coupon should not crash',
      class: 'boundary',
      data: { email: 'demo@example.com', password: 'StrongPass1', cardToken: 'tok_abc123', coupon: '' },
      expectedResult: '400 or 201 with no coupon error',
      oracle: 'No server crash and response is well-formed'
    },
    {
      testId: 'T-105',
      title: 'Duplicate submission is idempotent',
      class: 'negative',
      data: { email: 'demo@example.com', password: 'StrongPass1', cardToken: 'tok_abc123' },
      expectedResult: 'Same outcome on retry',
      oracle: 'Duplicate order request returns the same order reference or a safe retry response'
    }
  ];

  return tests.map((test) => ({
    ...test,
    generatedFrom: plan.scenarios[0].id,
    maintainability: 'High, uses explicit assertions and realistic fixtures'
  }));
}

function executeTests(tests) {
  const results = [];
  const sandboxPolicy = {
    mode: 'simulated',
    externalCalls: 'disabled',
    dataIsolation: 'isolated fixtures',
    retries: 1,
    flakyHandling: 're-run once and mark suspect if outcome changes'
  };

  tests.forEach((test) => {
    const status = test.testId === 'T-104' ? 'FAILED' : 'PASSED';
    results.push({
      testId: test.testId,
      title: test.title,
      status,
      executionTimeMs: 110 + Math.round(Math.random() * 60),
      sandboxPolicy,
      notes: status === 'FAILED' ? 'Simulated defect: empty coupon caused a null reference in the response formatter' : 'Execution completed in sandbox'
    });
  });

  return { results, sandboxPolicy };
}

function triageDefects(executionResults) {
  const failed = executionResults.filter((result) => result.status === 'FAILED');
  const defects = failed.map((result, idx) => ({
    defectId: `DEF-${idx + 1}`,
    title: `${result.title} surfaced a defect`,
    severity: 'HIGH',
    priority: 'P1',
    confidenceScore: 0.9,
    affectedTests: 1,
    flaky: false,
    rootCauseAnalysis: {
      hypothesis: 'Null handling in the coupon response path',
      recommendedInvestigation: 'Review coupon normalization and response serialization for empty values'
    },
    deduped: false
  }));

  return defects;
}

function buildExecutionContext(prdText) {
  const sanitized = sanitizeInput(prdText);
  const requirements = extractRequirements(sanitized);
  const plan = buildPlan(requirements);
  const tests = generateTests(plan);
  const execution = executeTests(tests);
  const defects = triageDefects(execution.results);

  return {
    contextId: `ctx-${Date.now()}`,
    status: 'COMPLETED',
    inputSummary: {
      artifactType: 'PRD',
      requirementCount: requirements.length,
      sanitized: sanitized.length > 0,
      promptInjectionBlocked: sanitized !== prdText
    },
    testPlan: plan,
    generatedTests: tests,
    executionResults: execution.results,
    triageDefects: defects,
    evaluation: {
      requirementCoverage: `${Math.min(requirements.length, tests.length)}/${requirements.length}`,
      falsePositiveRisk: 'Low',
      triageAccuracyProxy: 'High',
      maintainability: 'High'
    },
    safety: {
      sandbox: execution.sandboxPolicy,
      humanInTheLoop: 'Recommended before production rollout',
      trustNotes: [
        'The workflow uses explicit evidence and confidence scores.',
        'Generated tests are reviewed for business meaning before automation.'
      ]
    },
    trace: [
      {
        stage: 'Planning',
        reasoning: 'Focused on critical payment and validation flows because the PRD highlights financial impact and explicit edge conditions.',
        tradeoffs: 'Preferred risk-based coverage over exhaustive test volume.'
      },
      {
        stage: 'Generation',
        reasoning: 'Produced a mix of happy-path, negative, boundary, and retry cases to keep the suite realistic and maintainable.',
        tradeoffs: 'Kept the generated suite small enough for demo clarity.'
      },
      {
        stage: 'Execution',
        reasoning: 'Ran tests in a simulated sandbox with retries and isolated fixtures.',
        tradeoffs: 'Used safe, non-destructive execution to avoid production side effects.'
      },
      {
        stage: 'Triage',
        reasoning: 'Converted the failing case into a defect with severity, priority, confidence, and root-cause hints.',
        tradeoffs: 'Used one defect to demonstrate actionable triage without amplifying noise.'
      }
    ]
  };
}

function renderContext(context) {
  summaryBox.innerHTML = `
    <div class="badge">Status: ${context.status}</div>
    <div class="badge">Overall risk: ${context.testPlan.overallRisk}</div>
    <div class="badge">Requirements: ${context.inputSummary.requirementCount}</div>
    <p><strong>Coverage proxy:</strong> ${context.evaluation.requirementCoverage}</p>
    <p><strong>Sandbox mode:</strong> ${context.safety.sandbox.mode}</p>
    <p class="muted">${context.safety.trustNotes.join(' ')}</p>
  `;

  planView.innerHTML = `
    <p><strong>Plan ID:</strong> ${context.testPlan.planId}</p>
    <p><strong>Goals:</strong> ${context.testPlan.goals.join(', ')}</p>
    <ul>${context.testPlan.scenarios.map((s) => `<li><strong>${s.id}</strong> ${s.title} - ${s.risk} (${s.priority})</li>`).join('')}</ul>
    <p class="muted">${context.testPlan.reasoning.join(' ')}</p>
  `;

  testsView.innerHTML = `
    <ul>${context.generatedTests.map((test) => `<li><strong>${test.testId}</strong> ${test.title} (${test.class})</li>`).join('')}</ul>
    <p class="muted">Example data: ${JSON.stringify(context.generatedTests[0].data)}</p>
  `;

  defectsView.innerHTML = `
    <ul>${context.triageDefects.map((defect) => `<li><strong>${defect.defectId}</strong> ${defect.title} - ${defect.severity} / ${defect.priority}</li>`).join('')}</ul>
    <p class="muted">${context.triageDefects.length ? context.triageDefects[0].rootCauseAnalysis.hypothesis : 'No defects triaged in this run.'}</p>
  `;

  traceView.innerHTML = context.trace.map((step) => `
    <div style="margin-bottom: 12px;">
      <strong>${step.stage}</strong>
      <div>${step.reasoning}</div>
      <div class="muted">Tradeoff: ${step.tradeoffs}</div>
    </div>
  `).join('');
}

function runWorkflow() {
  const context = buildExecutionContext(prdInput.value);
  renderContext(context);
  localStorage.setItem('qe-demo-context', JSON.stringify(context));
}

function downloadJson() {
  const text = localStorage.getItem('qe-demo-context') || JSON.stringify(buildExecutionContext(prdInput.value), null, 2);
  const blob = new Blob([text], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'qe-demo-output.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

runBtn.addEventListener('click', runWorkflow);
sampleBtn.addEventListener('click', () => {
  prdInput.value = defaultPrd;
  runWorkflow();
});
downloadBtn.addEventListener('click', downloadJson);

runWorkflow();
