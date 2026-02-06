import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export const OUTPUTS_DIR = process.env.OUTPUTS_DIR || 'outputs';

function isValidSha256(hash: string): boolean {
  return /^[a-f0-9]{64}$/i.test(hash);
}

function getOutputPath(hash: string): string {
  return path.join(OUTPUTS_DIR, `${hash}.html`);
}

async function ensureOutputDir(): Promise<void> {
  await fs.promises.mkdir(OUTPUTS_DIR, { recursive: true });
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function saveHtmlOutput(htmlContent: string): Promise<string> {
  await ensureOutputDir();
  const hash = crypto.createHash('sha256').update(htmlContent).digest('hex');
  const filePath = getOutputPath(hash);

  if (!await fileExists(filePath)) {
    await fs.promises.writeFile(filePath, htmlContent, 'utf8');
  }

  return hash;
}

export async function getHtmlOutput(sha256: string): Promise<string | null> {
  if (!isValidSha256(sha256)) {
    return null;
  }

  await ensureOutputDir();
  const filePath = getOutputPath(sha256);

  try {
    return await fs.promises.readFile(filePath, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}
