import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import type { Command } from '../types/Command.js';

export default class ExtendedClient extends Client {
  public commands = new Collection<string, Command>();

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions, 
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.MessageContent,        
      ],
      partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember,
      ],
    });
  }
}
