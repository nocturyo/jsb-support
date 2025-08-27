import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { Command } from '../types/Command.js';
import type ExtendedClient from '../lib/client.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Pokazuje listę dostępnych komend'),
  async execute(interaction) {
    const client = interaction.client as ExtendedClient;

    // Zbieramy wszystkie komendy zarejestrowane w kliencie
    const lines = [...client.commands.values()]
      .map((cmd) => {
        const name = (cmd.data as any).name ?? 'unknown';
        const desc = (cmd.data as any).description ?? '—';
        return `/${name} — ${desc}`;
      })
      .sort();

    const embed = new EmbedBuilder()
      .setColor(0x0a59f6)
      .setTitle('📖 Lista komend')
      .setDescription(lines.join('\n'));

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
