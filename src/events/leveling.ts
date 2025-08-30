import { Events } from 'discord.js';
import type ExtendedClient from '../lib/client.js';
import { XP, xpForLevel } from '../config/levels.js';
import { readLevels, writeLevels } from '../lib/levelStore.js';
import { readLevelsCfg } from '../lib/levelConfigStore.js'; 


/** Szybki cooldown w pamięci: guildId:userId -> timestamp(ms) ostatniej nagrody */
const lastAwardTs = new Map<string, number>();

/** Prosty helper: losowa liczba całkowita w [min, max] */
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** heurystyka: czy wiadomość to prawie na pewno link / śmieć */
function looksLikeOnlyUrl(content: string) {
  const trimmed = content.trim();
  // prosty regex na pojedynczy url bez dodatkowego tekstu
  return /^(https?:\/\/\S+)$/.test(trimmed);
}

/** czy kanał jest wykluczony (z .env) */
function isExcludedChannel(channelId: string) {
  const raw = process.env.LEVEL_EXCLUDED_CHANNELS; // np. "123,456,789"
  if (!raw) return false;
  const set = new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );
  return set.has(channelId);
}

export default (client: ExtendedClient) => {
  client.on(Events.MessageCreate, async (msg) => {
    try {
      if (!msg.inGuild()) return;
      if (msg.author.bot) return;

      // Filtry anty-spam / nie liczymy komend ani śmieci
      const content = msg.content ?? '';
      if (content.length < 3) return;
      if (content.startsWith('/') || content.startsWith('!')) return; // slash/command prefix
      if (looksLikeOnlyUrl(content)) return;
      if (isExcludedChannel(msg.channelId)) return;

      const guildId = msg.guildId!;
      const userId = msg.author.id;

      // Szybki cooldown w pamięci – najszybsza ścieżka „nic nie rób”
      const key = `${guildId}:${userId}`;
      const now = Date.now();
      const last = lastAwardTs.get(key) ?? 0;
      if (now - last < XP.cooldownSec * 1000) return;

      // W tej chwili wiemy, że warto sprawdzić/zapisać plik
      const data = await readLevels();
      data[guildId] ??= {};
      const rec = (data[guildId][userId] ??= { xp: 0, level: 0, lastTs: 0 });

      // Drugi bezpiecznik cooldown (persisted)
      if (now - rec.lastTs < XP.cooldownSec * 1000) {
        // uaktualnij cache, żeby nie czytać pliku ponownie przez ten okres
        lastAwardTs.set(key, rec.lastTs);
        return;
      }

      // Nalicz losowy XP
      const gain = randInt(XP.minPerMsg, XP.maxPerMsg);
      rec.xp += gain;
      rec.lastTs = now;
      lastAwardTs.set(key, now);

      // Sprawdź awans (może przeskoczyć kilka poziomów)
      let leveledUp = false;
      while (rec.xp >= xpForLevel(rec.level)) {
        rec.xp -= xpForLevel(rec.level);
        rec.level++;
        leveledUp = true;
      }

      // Zapis tylko gdy faktycznie coś zmieniliśmy
      await writeLevels(data);

      // Informacja o awansie – w wybranym kanale (fallback: aktualny)
      if (leveledUp) {
        try {
          const cfg = await readLevelsCfg();
          const chanId = cfg[guildId]?.levelUpChannelId;
          const targetChan = chanId ? await msg.guild!.channels.fetch(chanId).catch(() => null) : null;

          const text = `🎉 ${msg.author} wbił **poziom ${rec.level}**!`;

          if (targetChan && targetChan.isTextBased()) {
            await targetChan.send({ content: text }).catch(() => null);
          } else {
            await msg.channel.send({ content: text }).catch(() => null);
          }
        } catch {
          // cichy fallback
          await msg.channel.send({ content: `🎉 ${msg.author} wbił **poziom ${rec.level}**!` }).catch(() => null);
        }
      }
    } catch (e) {
      console.error('[leveling] error:', e);
    }
  });
};
