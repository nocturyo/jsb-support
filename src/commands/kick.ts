import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import type { Command } from '../types/Command.js';
import type ExtendedClient from '../lib/client.js';
import { logModAction } from '../lib/logger.js';
import { ts } from '../lib/time.js';

const COLOR = 0x0a59f6;

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Wyrzuca użytkownika z serwera')
    .addUserOption(o => o.setName('użytkownik').setDescription('Kogo wyrzucić').setRequired(true))
    .addStringOption(o => o.setName('powód').setDescription('Powód wyrzucenia').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false),
  async execute(interaction) {
    const client = interaction.client as any as ExtendedClient;
    const target = interaction.options.getUser('użytkownik', true);
    const reason = interaction.options.getString('powód') ?? 'Brak powodu';
    const guild = interaction.guild!;

    if (target.id === interaction.user.id) {
      return interaction.reply({ content: 'Nie możesz wyrzucić siebie.', ephemeral: true });
    }

    const member = await guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ content: 'Nie znaleziono członka na serwerze.', ephemeral: true });

    const me = await guild.members.fetchMe();
    if (member.roles.highest.position >= me.roles.highest.position) {
      return interaction.reply({ content: 'Nie mam wystarczających uprawnień/pozycji roli.', ephemeral: true });
    }

    await member.kick(reason);

    const embed = new EmbedBuilder()
      .setColor(COLOR)
      .setTitle('👢 Użytkownik wyrzucony')
      .addFields(
        { name: 'Użytkownik', value: `${target} (${target.id})` },
        { name: 'Moderator', value: `${interaction.user}`, inline: true },
        { name: 'Powód', value: reason, inline: true },
        { name: 'Czas', value: ts(Date.now(), 'F'), inline: true },
      );

    await interaction.reply({ embeds: [embed] });

    await logModAction(client, guild.id, {
      title: '👢 Kick',
      fields: [
        { name: 'Użytkownik', value: `${target} (${target.id})` },
        { name: 'Moderator', value: `${interaction.user}`, inline: true },
        { name: 'Powód', value: reason, inline: true },
        { name: 'Czas', value: ts(Date.now(), 'F'), inline: true },
      ],
    });
  },
};

export default command;
