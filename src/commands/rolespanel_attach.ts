import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  ChannelType,
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

// Wyciąga messageId z surowego ID lub linku do wiadomości
function extractMessageId(input: string): string | null {
  // Przykładowy link: https://discord.com/channels/<guildId>/<channelId>/<messageId>
  const m = input.match(/\/channels\/\d+\/\d+\/(\d+)/);
  if (m) return m[1];
  return /^\d{10,}$/.test(input) ? input : null;
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('rolespanel_attach')
    .setDescription('Dołącza reakcje panelu ról do istniejącej wiadomości (po ID/linku)')
    .addStringOption(o =>
      o
        .setName('wiadomość')
        .setDescription('ID wiadomości lub link do wiadomości')
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction) {
    if (!interaction.inCachedGuild()) {
      await interaction.reply({ content: 'Ta komenda działa tylko na serwerze.', flags: MessageFlags.Ephemeral });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const raw = interaction.options.getString('wiadomość', true);
    const messageId = extractMessageId(raw);
    if (!messageId) {
      await interaction.editReply('❌ Podaj poprawne **ID** wiadomości lub **link** do wiadomości.');
      return;
    }

    const channel = interaction.channel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.editReply('❌ Użyj tej komendy w **kanale tekstowym** z daną wiadomością.');
      return;
    }

    // pobierz wiadomość
    const msg = await channel.messages.fetch(messageId).catch(() => null);
    if (!msg) {
      await interaction.editReply('❌ Nie znaleziono wiadomości o tym ID w tym kanale.');
      return;
    }

    const guild = interaction.guild!;

    // dodaj reakcje (obsługa unicode i custom emoji-ID)
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

    // zapisz panel (handler reakcji będzie działał dla tej wiadomości)
    await savePanelMessageId(msg.id, msg.channelId, guild.id);

    await interaction.editReply('✅ Reakcje dodane do istniejącej wiadomości i panel zapisany.');
  },
};

export default command;
