import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import type { Command } from '../types/Command.js';
import type ExtendedClient from '../lib/client.js';
import { logModAction } from '../lib/logger.js';

const COLOR = 0x0a59f6;

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Usuwa ostatnie wiadomości z bieżącego kanału')
    .addIntegerOption(o => o.setName('ilość').setDescription('Ile wiadomości (1–100)').setRequired(true).setMinValue(1).setMaxValue(100))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),
  async execute(interaction) {
    if (!interaction.inCachedGuild()) {
      return interaction.reply({ content: 'Ta komenda działa tylko na serwerze.', ephemeral: true });
    }

    const count = interaction.options.getInteger('ilość', true);
    const deleted = await interaction.channel!.bulkDelete(count, true).catch(() => null);

    const embed = new EmbedBuilder()
      .setColor(COLOR)
      .setTitle('🧹 Wyczyść kanał')
      .setDescription(`Usunięto **${deleted?.size ?? 0}** wiadomości.`);

    await interaction.reply({ embeds: [embed], ephemeral: true });

    const client = interaction.client as ExtendedClient;
    await logModAction(client, interaction.guildId!, {
      title: '🧹 Clear',
      fields: [
        { name: 'Kanał', value: `${interaction.channel}` },
        { name: 'Moderator', value: `${interaction.user}`, inline: true },
        { name: 'Ilość', value: `${count}`, inline: true },
      ],
    });
  },
};

export default command;
