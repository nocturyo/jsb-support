import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { Command } from '../types/Command.js';
import { readLevels } from '../lib/levelStore.js';
import { xpForLevel } from '../config/levels.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Pokazuje poziom i XP')
    .addUserOption(o =>
      o.setName('użytkownik').setDescription('Kogo sprawdzić (domyślnie Ty)').setRequired(false),
    ),
  async execute(interaction) {
    if (!interaction.inCachedGuild()) {
      await interaction.reply({ content: 'Tylko na serwerze.', ephemeral: true });
      return;
    }
    const target = interaction.options.getUser('użytkownik') ?? interaction.user;

    const data = await readLevels();
    const rec = data[interaction.guildId!]?.[target.id] ?? { xp: 0, level: 0, lastTs: 0 };

    const need = xpForLevel(rec.level);
    const embed = new EmbedBuilder()
      .setColor(0x0a59f6)
      .setAuthor({ name: `${target.tag}`, iconURL: target.displayAvatarURL() })
      .setTitle('📈 Rank')
      .addFields(
        { name: 'Poziom', value: `${rec.level}`, inline: true },
        { name: 'XP', value: `${rec.xp} / ${need}`, inline: true },
      );

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;

