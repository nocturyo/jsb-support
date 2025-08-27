import { Client, Collection, GatewayIntentBits } from 'discord.js';
import type { Command } from '../types/Command.js';

export default class ExtendedClient extends Client {
  public commands = new Collection<string, Command>();

  constructor() {
    // Dodany GuildMembers, żeby mieć dostęp do memberów/roli
    super({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
  }
}
