import { Events } from 'discord.js';
import type ExtendedClient from '../lib/client.js';

export default (client: ExtendedClient) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;

    try {
      await cmd.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({
          content: 'Wystąpił błąd przy wykonaniu komendy.',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'Wystąpił błąd przy wykonaniu komendy.',
          ephemeral: true,
        });
      }
    }
  });
};
