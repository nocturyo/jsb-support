import { Events } from 'discord.js';
import type ExtendedClient from '../lib/client.js';
import { REACTION_ROLES } from '../config/reaction-roles.js';
import fs from 'node:fs/promises';
import path from 'node:path';

const PANEL_FILE = path.resolve(process.cwd(), 'data', 'roles-panel.json');

async function readPanel() {
  try {
    const raw = await fs.readFile(PANEL_FILE, 'utf8');
    return JSON.parse(raw) as { messageId: string; channelId: string; guildId: string };
  } catch {
    return null;
  }
}

function matchEmoji(input: string) {
  // input może być '👍' albo '<:name:123...>' – discord.js w reaction.emoji ma:
  // - .id dla custom emoji (string lub null)
  // - .name dla unicode (np. '👍')
  return (reactionEmojiName: string | null, reactionEmojiId: string | null) => {
    for (const rr of REACTION_ROLES) {
      // jeśli rr.emoji to ID (same cyfry), porównujemy z .id
      if (/^[0-9]{5,}$/.test(rr.emoji)) {
        if (reactionEmojiId && rr.emoji === reactionEmojiId) return rr;
      } else {
        // unicode
        if (reactionEmojiName && rr.emoji === reactionEmojiName) return rr;
      }
    }
    return null;
  };
}

export default (client: ExtendedClient) => {
  const getMatch = matchEmoji('');

  client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (user.bot) return;
    const panel = await readPanel();
    if (!panel) return;

    // dociągnij partiale
    if (reaction.partial) await reaction.fetch().catch(() => null);

    if (!reaction.message || reaction.message.id !== panel.messageId) return;
    const guild = reaction.message.guild;
    if (!guild) return;

    const rr = getMatch(reaction.emoji.name ?? null, reaction.emoji.id ?? null);
    if (!rr) return;

    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) return;

    await member.roles.add(rr.roleId).catch(() => null);
  });

  client.on(Events.MessageReactionRemove, async (reaction, user) => {
    if (user.bot) return;
    const panel = await readPanel();
    if (!panel) return;

    if (reaction.partial) await reaction.fetch().catch(() => null);

    if (!reaction.message || reaction.message.id !== panel.messageId) return;
    const guild = reaction.message.guild;
    if (!guild) return;

    const rr = matchEmoji('')(reaction.emoji.name ?? null, reaction.emoji.id ?? null);
    if (!rr) return;

    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) return;

    await member.roles.remove(rr.roleId).catch(() => null);
  });
};
