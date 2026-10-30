import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const projectRoot = resolve(import.meta.dirname, '..');
const safeRoot = mkdtempSync(join(tmpdir(), 'f95zone-toolbox-'));

try {
  cpSync(`${projectRoot}/src`, `${safeRoot}/src`, { recursive: true });
  cpSync(`${projectRoot}/package.json`, `${safeRoot}/package.json`);
  symlinkSync(`${projectRoot}/node_modules`, `${safeRoot}/node_modules`, 'dir');

  const sourceRoot = `${safeRoot}/src/f95zone-toolbox`;
  const moduleFiles = readdirSync(`${sourceRoot}/modules`)
    .filter(file => file.endsWith('.js'))
    .sort();
  const imports = moduleFiles.map((file, index) => `import module${index} from './${file}';`).join('\n');
  const moduleExports = moduleFiles.map((_, index) => `module${index}`).join(',\n  ');
  writeFileSync(`${sourceRoot}/modules/index.js`, `${imports}\n\nexport default [\n  ${moduleExports}\n];\n`);

  const dialogHtml = JSON.stringify(readFileSync(`${sourceRoot}/dialog.html`, 'utf8'));
  const dialogCss = JSON.stringify(readFileSync(`${sourceRoot}/dialog.css`, 'utf8'));
  writeFileSync(`${sourceRoot}/dialog-assets.js`, `export const dialogHtml = ${dialogHtml};\nexport const dialogCss = ${dialogCss};\n`);

  const command = process.argv[2] === '--watch' ? ['--watch'] : [];
  const result = spawnSync(`${safeRoot}/node_modules/.bin/bundlemonkey`, command, {
    cwd: safeRoot,
    stdio: 'inherit',
  });

  if (result.status === 0 && !command.length) {
    cpSync(`${safeRoot}/dist`, `${projectRoot}/dist`, { recursive: true });
  }

  process.exitCode = result.status ?? 1;
} finally {
  rmSync(safeRoot, { recursive: true, force: true });
}
