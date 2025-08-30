import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'levels-config.json');

/** Struktura: { [guildId]: { levelUpChannelId?: string } } */
export type LevelsCfg = Record<string, { levelUpChannelId?: string }>;

export async function readLevelsCfg(): Promise<LevelsCfg> {
  try {
    const raw = await fs.readFile(FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function writeLevelsCfg(cfg: LevelsCfg) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(cfg, null, 2), 'utf8');
}
