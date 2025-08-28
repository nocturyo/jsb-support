import { SlashCommandBuilder, AttachmentBuilder, PermissionFlagsBits } from 'discord.js';
import type { Command } from '../types/Command.js';
import { renderWelcomeCard } from '../lib/welcome-card.js';
import path from 'node:path';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('testwelcome')
    .setDescription('Generuje testowy obraz powitalny (admin only)')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!interaction.inCachedGuild()) {
      await interaction.reply({ content: 'Ta komenda działa tylko na serwerze.', ephemeral: true });
      return;
    }
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply({ content: '❌ Tylko administrator może użyć tej komendy.', ephemeral: true });
      return;
    }

    const basePath = path.resolve(process.cwd(), 'assets', 'welcome_base.png');
    const avatarURL = interaction.user.displayAvatarURL({ extension: 'png', size: 512 });

    // 🔒 Pobierz pełnego członka i zbuduj pewny displayName
    const guild = interaction.guild!;
    const fetched = await guild.members.fetch(interaction.user.id).catch(() => null);
    const displayName =
      fetched?.displayName ??
      (typeof (interaction.member as any)?.nick === 'string' ? (interaction.member as any).nick : null) ??
      interaction.user.globalName ??
      interaction.user.username;

    const buffer = await renderWelcomeCard({
      basePath,
      avatarURL,
      displayName,
      memberNumber: guild.memberCount,
    });

    const file = new AttachmentBuilder(buffer, { name: 'welcome.png' });
    await interaction.reply({ content: '✅ Podgląd karty powitalnej:', files: [file] });
  },
};

export default command;
