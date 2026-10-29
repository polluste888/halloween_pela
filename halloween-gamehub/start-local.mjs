import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const serverPath = fileURLToPath(new URL('./server.mjs', import.meta.url));
const vitePath = fileURLToPath(new URL('./node_modules/vite/bin/vite.js', import.meta.url));
const children = [
  spawn(process.execPath, [serverPath], { stdio: 'inherit' }),
  spawn(process.execPath, [vitePath, '--host', '0.0.0.0'], { stdio: 'inherit' }),
];
let stopping = false;

function stopChildren(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode === null && child.signalCode === null) child.kill();
  }
  process.exitCode = exitCode;
}

for (const child of children) {
  child.on('error', (error) => {
    console.error('Mängu käivitamine ebaõnnestus:', error);
    stopChildren(1);
  });
  child.on('exit', (code) => {
    if (!stopping) stopChildren(code ?? 1);
  });
}

process.on('SIGINT', () => stopChildren(0));
process.on('SIGTERM', () => stopChildren(0));
