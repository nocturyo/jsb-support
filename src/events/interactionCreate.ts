// src/events/interactionCreate.ts
import { Events, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import type ExtendedClient from '../lib/client.js';

export default (client: ExtendedClient) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;

    try {
      await cmd.execute(interaction as ChatInputCommandInteraction);
    } catch (err) {
      console.error('Command error:', err);
      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp({ content: 'Wystąpił błąd przy wykonaniu komendy.', flags: MessageFlags.Ephemeral });
        } else {
          await interaction.reply({ content: 'Wystąpił błąd przy wykonaniu komendy.', flags: MessageFlags.Ephemeral });
        }
      } catch {}
    }
  });
};
