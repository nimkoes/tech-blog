import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

const rootDir = process.cwd();
const outputDir = path.join(rootDir, 'out');

if (!fs.existsSync(path.join(outputDir, 'index.html'))) {
  console.error('out 디렉터리가 없습니다. 먼저 npm run build를 실행해 주세요.');
  process.exit(1);
}

const previewDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tech-blog-preview-'));
fs.symlinkSync(outputDir, path.join(previewDir, 'tech-blog'), 'dir');

const serveBin = path.join(rootDir, 'node_modules', '.bin', process.platform === 'win32' ? 'serve.cmd' : 'serve');
const child = spawn(serveBin, [previewDir, ...process.argv.slice(2)], {
  stdio: 'inherit',
});

function cleanup(signal) {
  if (signal && child.exitCode === null) child.kill(signal);
  fs.rmSync(previewDir, { recursive: true, force: true });
}

process.on('SIGINT', () => cleanup('SIGINT'));
process.on('SIGTERM', () => cleanup('SIGTERM'));
child.on('exit', code => {
  cleanup();
  process.exit(code ?? 0);
});
