import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import type { Command } from '../types/Command.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('ticketpanel')
    .setDescription('Publikuje panel tworzenia ticketów w tym kanale')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction) {
    if (!interaction.inCachedGuild()) {
      await interaction.reply({ content: 'Ta komenda działa tylko na serwerze.', flags: MessageFlags.Ephemeral });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const embed = new EmbedBuilder()
      .setColor(0x0a59f6)
      .setTitle('🎟️ Centrum wsparcia')
      .setDescription([
        'Kliknij poniżej, aby **utworzyć prywatny ticket** ze wsparciem.',
        '',
        '• W tickecie odpowie Ci zespół supportu.',
        '• Gdy sprawa zostanie załatwiona, zamknij ticket przyciskiem.',
      ].join('\n'));

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket:create')
        .setLabel('Utwórz ticket')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎟️'),
    );

    await interaction.channel!.send({ embeds: [embed], components: [row] });
    await interaction.editReply('✅ Panel ticketów został opublikowany.');
  },
};

export default command;
