import { SlashCommandBuilder, ChannelType, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../types/Command.js';
import { readLevelsCfg, writeLevelsCfg } from '../lib/levelConfigStore.js'; // 👈 tutaj


const command: Command = {
  data: new SlashCommandBuilder()
    .setName('setlevelchannel')
    .setDescription('Ustawia kanał do ogłoszeń o level-up')
    .addChannelOption(o =>
      o.setName('kanał')
        .setDescription('Kanał tekstowy na ogłoszenia')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction) {
    if (!interaction.inCachedGuild()) {
      await interaction.reply({ content: 'Ta komenda działa tylko na serwerze.', flags: MessageFlags.Ephemeral });
      return;
    }

    const channel = interaction.options.getChannel('kanał', true);
    const cfg = await readLevelsCfg();
    cfg[interaction.guildId!] ??= {};
    cfg[interaction.guildId!].levelUpChannelId = channel.id;
    await writeLevelsCfg(cfg);

    await interaction.reply({
      content: `✅ Kanał ogłoszeń level-up ustawiony na: ${channel}`,
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default command;
