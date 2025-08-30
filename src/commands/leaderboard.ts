import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { Command } from '../types/Command.js';
import { readLevels } from '../lib/levelStore.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Topka poziomów na serwerze'),
  async execute(interaction) {
    if (!interaction.inCachedGuild()) {
      await interaction.reply({ content: 'Tylko na serwerze.', ephemeral: true });
      return;
    }

    const data = await readLevels();
    const map = data[interaction.guildId!] ?? {};

    // sortuj po levelu, potem xp
    const entries = Object.entries(map)
      .sort((a, b) => (b[1].level - a[1].level) || (b[1].xp - a[1].xp))
      .slice(0, 10);

    if (entries.length === 0) {
      await interaction.reply('Brak danych na tym serwerze.');
      return;
    }

    const lines = await Promise.all(entries.map(async ([uid, rec], i) => {
      const user = await interaction.client.users.fetch(uid).catch(() => null);
      const name = user?.tag ?? `Użytkownik ${uid}`;
      return `**${i + 1}.** ${name} — Poziom **${rec.level}**, XP: ${rec.xp}`;
    }));

    const embed = new EmbedBuilder()
      .setColor(0x0a59f6)
      .setTitle('🏆 Leaderboard')
      .setDescription(lines.join('\n'));

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
