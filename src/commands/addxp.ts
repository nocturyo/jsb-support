import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags, User } from 'discord.js';
import type { Command } from '../types/Command.js';
import { readLevels, writeLevels } from '../lib/levelStore.js';
import { xpForLevel } from '../config/levels.js';

const COLOR = 0x0a59f6;

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('addxp')
    .setDescription('Dodaje XP użytkownikowi (admin)')
    .addUserOption(o =>
      o.setName('użytkownik').setDescription('Komu dodać XP').setRequired(true),
    )
    .addIntegerOption(o =>
      o.setName('ilość').setDescription('Ile XP dodać (≥1)').setRequired(true).setMinValue(1),
    )
    .addStringOption(o =>
      o.setName('powód').setDescription('Powód (opcjonalnie)').setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction) {
    if (!interaction.inCachedGuild()) {
      await interaction.reply({ content: 'Ta komenda działa tylko na serwerze.', flags: MessageFlags.Ephemeral });
      return;
    }

    const target = interaction.options.getUser('użytkownik', true) as User;
    const amount = interaction.options.getInteger('ilość', true);
    const reason = interaction.options.getString('powód') ?? '—';

    const guildId = interaction.guildId!;
    const data = await readLevels();
    data[guildId] ??= {};
    const rec = (data[guildId][target.id] ??= { xp: 0, level: 0, lastTs: 0 });

    const before = { level: rec.level, xp: rec.xp };

    // dodaj XP
    rec.xp += amount;

    // awanse (może być kilka leveli naraz)
    let leveled = 0;
    while (rec.xp >= xpForLevel(rec.level)) {
      rec.xp -= xpForLevel(rec.level);
      rec.level++;
      leveled++;
    }

    await writeLevels(data);

    const need = xpForLevel(rec.level);
    const embed = new EmbedBuilder()
      .setColor(COLOR)
      .setTitle('✅ XP dodane')
      .setDescription(
        [
          `Użytkownik: ${target} \`${target.tag}\``,
          `Dodano XP: **+${amount}**`,
          `Powód: ${reason}`,
        ].join('\n'),
      )
      .addFields(
        { name: 'Przed', value: `Poziom **${before.level}**, XP: **${before.xp}**`, inline: true },
        { name: 'Po', value: `Poziom **${rec.level}**, XP: **${rec.xp} / ${need}**`, inline: true },
        ...(leveled > 0
          ? [{ name: 'Awans', value: `🎉 +${leveled} poziom(y)` }]
          : []),
      );

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};

export default command;
