import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types/Command.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Odpowiadam pong z opóźnieniem'),
  async execute(interaction) {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(`Pong! Opóźnienie: ${latency}ms`);
  },
};

export default command;
