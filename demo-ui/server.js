const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const glob = require('glob');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const PROJECT_ROOT = path.join(__dirname, '..');

function findLatestResults() {
  const base = PROJECT_ROOT;
  const matches = glob.sync(path.join(base, 'qe-results-*'));
  if (!matches || matches.length === 0) return null;
  matches.sort((a,b) => fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs);
  return matches[matches.length-1];
}

app.post('/api/run', async (req, res) => {
  const { prd } = req.body || {};
  if (!prd || prd.trim().length === 0) return res.status(400).json({ error: 'PRD text required' });

  // If java + jar present, run the jar. Otherwise simulate results.
  const jarPath = path.join(PROJECT_ROOT, 'target', 'qe-agent-system.jar');
  const javaCmd = 'java';

  function respondWithResultsDir(dir) {
    if (!dir) return res.status(500).json({ error: 'No results produced' });
    return res.json({ resultsDir: path.relative(PROJECT_ROOT, dir) });
  }

  if (fs.existsSync(jarPath)) {
    // write PRD to file and run jar (jar reads sample PRD internally, but running will produce results)
    const tmpFile = path.join(PROJECT_ROOT, 'input-prd.txt');
    fs.writeFileSync(tmpFile, prd, 'utf8');

    const proc = spawn(javaCmd, ['-cp', jarPath, 'com.qeagent.Main'], { cwd: PROJECT_ROOT });
    proc.stdout.on('data', d => console.log('[jar]', d.toString()));
    proc.stderr.on('data', d => console.error('[jar:err]', d.toString()));
    proc.on('close', code => {
      console.log('jar exited', code);
      const dir = findLatestResults();
      respondWithResultsDir(dir);
    });

    res.json({ message: 'Started jar, awaiting results (check server logs for progress)' });
    return;
  }

  // Simulate pipeline and write sample files
  const timestamp = Date.now();
  const resultDir = path.join(PROJECT_ROOT, `qe-results-${timestamp}`);
  fs.mkdirSync(resultDir, { recursive: true });

  const executionContext = {
    contextId: `ctx-${timestamp}`,
    status: 'COMPLETED',
    testPlan: {
      planId: `TP-${timestamp}`,
      overallRisk: 'HIGH',
      testScenarios: [
        { id: 'TS-001', title: 'Happy path: registration', priority: 'CRITICAL' },
        { id: 'TS-002', title: 'Boundary: empty fields', priority: 'HIGH' }
      ]
    },
    generatedTests: [
      { testId: 'TEST-1', testName: 'Registration happy path', framework: 'TestNG', sanitizationStatus: 'APPROVED' }
    ],
    executionResults: [
      { testId: 'TEST-1', status: 'PASSED', executionTimeMs: 120 }
    ],
    triageDefects: [
      {
        defectId: 'DEF-1', title: 'API response parsing fails on null values', severity: 'HIGH', priority: 'P1', confidenceScore: 0.87, affectedTests: 2, flaky: false,
        rootCauseAnalysis: { hypothesis: 'Null pointer dereference in API response handler', recommendedInvestigation: 'Review APIParser.java lines 40-50' }
      }
    ],
    errorLog: []
  };

  fs.writeFileSync(path.join(resultDir, 'execution-context.json'), JSON.stringify(executionContext, null, 2));
  fs.writeFileSync(path.join(resultDir, 'test-plan.json'), JSON.stringify(executionContext.testPlan, null, 2));
  fs.writeFileSync(path.join(resultDir, 'defects.json'), JSON.stringify(executionContext.triageDefects, null, 2));

  res.json({ resultsDir: path.relative(PROJECT_ROOT, resultDir) });
});

app.get('/api/results/latest', (req, res) => {
  const dir = findLatestResults();
  if (!dir) return res.status(404).json({ error: 'No results found' });
  res.json({ dir: path.relative(PROJECT_ROOT, dir) });
});

app.get('/api/results/:file', (req, res) => {
  const dir = findLatestResults();
  if (!dir) return res.status(404).json({ error: 'No results found' });
  const file = path.join(dir, req.params.file);
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'File not found' });
  res.sendFile(file);
});

const port = process.env.PORT || 3333;
app.listen(port, () => console.log('Demo UI server listening on', port));
