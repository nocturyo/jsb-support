import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const TICKETS_FILE = path.join(DATA_DIR, 'tickets.json');

type TicketsMap = Record<string, string>; // userId -> channelId

export async function readTickets(): Promise<TicketsMap> {
  try {
    const raw = await fs.readFile(TICKETS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function writeTickets(map: TicketsMap) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(TICKETS_FILE, JSON.stringify(map, null, 2), 'utf8');
}
