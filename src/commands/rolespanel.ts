// src/commands/rolespanel.ts
import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
} from 'discord.js';
import type { Command } from '../types/Command.js';
import { REACTION_ROLES } from '../config/reaction-roles.js';
import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_PATH = path.resolve(process.cwd(), 'data');
const PANEL_FILE = path.join(DATA_PATH, 'roles-panel.json');

async function savePanelMessageId(messageId: string, channelId: string, guildId: string) {
  await fs.mkdir(DATA_PATH, { recursive: true });
  await fs.writeFile(PANEL_FILE, JSON.stringify({ messageId, channelId, guildId }), 'utf8');
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('rolespanel')
    .setDescription('Publikuje panel wyboru ról w tym kanale')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction) {
    if (!interaction.inCachedGuild()) {
      await interaction.reply({
        content: 'Ta komenda działa tylko na serwerze.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const guild = interaction.guild!;

    // 1) Zbuduj ładne linie: emoji + MENTION roli (pokazuje nazwę, jest klikalne)
    const lines = REACTION_ROLES.map((rr) => {
      const isCustomEmojiId = /^[0-9]{5,}$/.test(rr.emoji);
      const emojiDisplay = isCustomEmojiId
        ? guild.emojis.cache.get(rr.emoji)?.toString() ?? `<:${rr.emoji}>`
        : rr.emoji;

      const roleDisplay =
        guild.roles.cache.get(rr.roleId)?.toString() ?? `<@&${rr.roleId}>`;

      // Jeśli wolisz label zamiast mention, podmień na: `${emojiDisplay} — ${rr.label}`
      return `${emojiDisplay} — ${rr.label}`;

    }).join('\n');

    const embed = new EmbedBuilder()
      .setColor(0x0a59f6)
      .setTitle('🎮 Wybierz swoją rangę w Rainbow Six Siege!')
      .setDescription(
        [
          'Tutaj możesz przypisać sobie rolę odpowiadającą Twojej randze, żeby inni wiedzieli, na jakim poziomie grasz.',
          'Kliknij odpowiednią reakcję, aby dodać/zdjąć rolę z profilu.',
          '',
          lines,
        ].join('\n'),
      );

    // 2) Publikacja panelu
    const msg = await interaction.channel!.send({ embeds: [embed] });

    // 3) Dodaj reakcje — obsługa unicode i custom emoji
    for (const rr of REACTION_ROLES) {
      try {
        if (/^[0-9]{5,}$/.test(rr.emoji)) {
          const emojiObj = guild.emojis.cache.get(rr.emoji);
          await msg.react(emojiObj ?? rr.emoji);
        } else {
          await msg.react(rr.emoji);
        }
      } catch (e) {
        console.warn('Nie udało się dodać reakcji', rr.emoji, e);
      }
    }

    await savePanelMessageId(msg.id, msg.channelId, interaction.guildId!);

    await interaction.editReply('✅ Panel ról został opublikowany i zapisany.');
  },
};

export default command;
