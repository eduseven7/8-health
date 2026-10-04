# Frontend Regression Coverage (8 Health)

Executed against: `https://workout-tracker-1784.preview.emergentagent.com`

## Covered flows
- Backup export/import via UI (`data-a="export"`, `#fileIn`, `data-testid="backup-file-input"`)
- Backup validation failures (invalid JSON, future version, duplicated IDs, invalid reference, >1 active session)
- Atomic restore rollback (`gravarBackupAtomico`) and injected `IDBObjectStore.add` failure during import
- Save flow with immediate persistence, reload resume, put-failure + retry (`data-testid="session-save-status"`, `session-save-retry`)
- Finalization blocked when pending save fails
- Progression rule matrix for `horaDeSubir` (1/4 null, 4/4 eligible, fail conditions)
- Increment 1.25 persistence and step button behavior (`increment-input-0`)
- Legacy v1 import migration + legacy `itemId` assignment on start
- Offline reload smoke with SW-cached scripts (`storage.js`, `progress.js`, `backup.js`)
- Mobile 390x844 overflow check with decimal loads and long suggestion

## Notes
- Tests were run in isolated browser contexts with IndexedDB reset between scenarios.
- One harness-level issue occurred when restoring monkey-patched native IndexedDB methods in a long script; scenarios were re-run in focused scripts and validated.
