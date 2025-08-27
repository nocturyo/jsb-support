import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import type { Command } from '../types/Command.js';
import type ExtendedClient from '../lib/client.js';
import { logModAction } from '../lib/logger.js';
import { ts } from '../lib/time.js';

const COLOR = 0x0a59f6;
const minutesToMs = (m: number) => m * 60 * 1000; // ms dla GuildMember#timeout

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Nakłada timeout na użytkownika')
    .addUserOption((o) => o.setName('użytkownik').setDescription('Kogo uciszyć').setRequired(true))
    .addIntegerOption((o) =>
      o
        .setName('minuty')
        .setDescription('Czas timeoutu (1–10080)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(10080),
    )
    .addStringOption((o) =>
      o.setName('powód').setDescription('Powód (opcjonalnie)').setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const client = interaction.client as ExtendedClient;
    const target = interaction.options.getUser('użytkownik', true);
    const minutes = interaction.options.getInteger('minuty', true);
    const reason = interaction.options.getString('powód') ?? 'Brak powodu';
    const guild = interaction.guild!;

    const member = await guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      await interaction.reply({ content: 'Nie znaleziono członka.', ephemeral: true });
      return;
    }

    const me = await guild.members.fetchMe();
    if (member.roles.highest.position >= me.roles.highest.position) {
      await interaction.reply({
        content: 'Moja rola jest zbyt nisko, nie mogę nałożyć timeoutu.',
        ephemeral: true,
      });
      return;
    }

    await member.timeout(minutesToMs(minutes), reason);

    const embed = new EmbedBuilder()
      .setColor(COLOR)
      .setTitle('⏱️ Timeout nałożony')
      .addFields(
        { name: 'Użytkownik', value: `${target} (${target.id})` },
        { name: 'Moderator', value: `${interaction.user}`, inline: true },
        { name: 'Czas', value: `${minutes} min`, inline: true },
        { name: 'Powód', value: reason, inline: false },
        { name: 'Do', value: ts(Date.now() + minutesToMs(minutes), 'F'), inline: true },
      );

    await interaction.reply({ embeds: [embed] });

    await logModAction(client, guild.id, {
      title: '⏱️ Timeout',
      fields: [
        { name: 'Użytkownik', value: `${target} (${target.id})` },
        { name: 'Moderator', value: `${interaction.user}`, inline: true },
        { name: 'Czas', value: `${minutes} min`, inline: true },
        { name: 'Powód', value: reason, inline: true },
      ],
    });
  },
};

export default command;
