import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import type { Command } from '../types/Command.js';
import type ExtendedClient from '../lib/client.js';
import { logModAction } from '../lib/logger.js';
import { ts } from '../lib/time.js';

const COLOR = 0x0a59f6;

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Banuje użytkownika')
    .addUserOption(o => o.setName('użytkownik').setDescription('Kogo zbanować').setRequired(true))
    .addStringOption(o => o.setName('powód').setDescription('Powód bana').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),
  async execute(interaction) {
    const client = interaction.client as ExtendedClient;
    const target = interaction.options.getUser('użytkownik', true);
    const reason = interaction.options.getString('powód') ?? 'Brak powodu';
    const guild = interaction.guild!;

    // bezpieczniki
    if (target.id === interaction.user.id) {
      return interaction.reply({ content: 'Nie możesz zbanować siebie.', ephemeral: true });
    }
    if (target.id === guild.ownerId) {
      return interaction.reply({ content: 'Nie możesz zbanować właściciela serwera.', ephemeral: true });
    }

    const member = await guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ content: 'Nie znaleziono członka na serwerze.', ephemeral: true });

    // hierarchia ról
    const me = await guild.members.fetchMe();
    if (member.roles.highest.position >= me.roles.highest.position) {
      return interaction.reply({ content: 'Nie mam wystarczających uprawnień/pozycji roli, aby to zrobić.', ephemeral: true });
    }

    await member.ban({ reason });

    const embed = new EmbedBuilder()
      .setColor(COLOR)
      .setTitle('🔨 Użytkownik zbanowany')
      .addFields(
        { name: 'Użytkownik', value: `${target} (${target.id})`, inline: false },
        { name: 'Moderator', value: `${interaction.user}`, inline: true },
        { name: 'Kiedy', value: ts(Date.now(), 'F'), inline: true },
        { name: 'Powód', value: reason, inline: false },
      );

    await interaction.reply({ embeds: [embed], ephemeral: false });

    await logModAction(client, guild.id, {
      title: '🔨 Ban',
      fields: [
        { name: 'Użytkownik', value: `${target} (${target.id})`, inline: false },
        { name: 'Moderator', value: `${interaction.user}`, inline: true },
        { name: 'Powód', value: reason, inline: true },
        { name: 'Czas', value: ts(Date.now(), 'F'), inline: true },
      ],
    });
  },
};

export default command;
