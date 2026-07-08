# QE Results Viewer

A small static HTML viewer for `qe-results-*` JSON outputs produced by the QE Agent System demo.

Place this folder under the project root (next to `pom.xml`) so the results can be copied or generated into the same folder.

Usage

1. After running the demo, copy `viewer.html` into the generated `qe-results-<timestamp>/` folder and open it in your browser, or serve the folder via HTTP and open the viewer.

Examples (PowerShell):

```powershell
# Find latest results folder and copy viewer there
$dir = (Get-ChildItem -Directory -Filter 'qe-results-*' | Sort-Object LastWriteTime | Select-Object -Last 1).FullName
Copy-Item -Path 'qe-results-viewer\viewer.html' -Destination $dir
Start-Process "$dir\viewer.html"
```

Or serve and open:

```powershell
Set-Location $dir
python -m http.server 8000
# open http://localhost:8000/viewer.html
```

Files

- `viewer.html` — static HTML viewer that fetches and pretty-prints JSON files:
  - `execution-context.json`
  - `test-plan.json`
  - `defects.json`

Enhancements

- The viewer includes:
  - a search/filter input (e.g. `severity:HIGH`),
  - a defect list panel that shows defects by severity,
  - a defect detail panel that displays root cause, investigation notes, confidence, and affected tests.

Commit instructions

If you want to add this viewer to the repository, run:

```bash
cd qe-agent-system
git checkout -b add/qe-results-viewer
mkdir -p qe-results-viewer
# copy the files into qe-results-viewer/
git add qe-results-viewer
git commit -m "Add QE results static viewer"
git push -u origin add/qe-results-viewer
```

License

Place files in the repo under the same license as the project (MIT).
