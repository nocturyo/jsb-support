import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'levels.json');

/** Struktura: guildId -> userId -> { xp, level, lastTs } */
export type LevelsData = Record<string, Record<string, { xp: number; level: number; lastTs: number }>>;

export async function readLevels(): Promise<LevelsData> {
  try {
    const raw = await fs.readFile(FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function writeLevels(data: LevelsData) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), 'utf8');
}
