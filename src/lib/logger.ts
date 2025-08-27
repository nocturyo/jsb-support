import { ChannelType, EmbedBuilder, TextChannel } from 'discord.js';
import type ExtendedClient from './client.js';

const COLOR = 0x0a59f6;

export async function logModAction(
  client: ExtendedClient,
  guildId: string,
  opts: { title: string; description?: string; fields?: { name: string; value: string; inline?: boolean }[] },
) {
  const channelId = process.env.LOG_CHANNEL_ID;
  if (!channelId) return;

  try {
    const guild = await client.guilds.fetch(guildId);
    const ch = await guild.channels.fetch(channelId);
    if (!ch || ch.type !== ChannelType.GuildText) return;

    const embed = new EmbedBuilder()
      .setColor(COLOR)
      .setTitle(opts.title)
      .setDescription(opts.description ?? null)
      .addFields(opts.fields ?? [])
      .setTimestamp(new Date());

    await (ch as TextChannel).send({ embeds: [embed] });
  } catch {
    // ciche – brak uprawnień / złe ID / itp.
  }
}
