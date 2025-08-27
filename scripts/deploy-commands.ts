import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import ping from '../src/commands/ping.js';
import userinfo from '../src/commands/userinfo.js';
import serverinfo from '../src/commands/serverinfo.js';

const TOKEN = process.env.DISCORD_TOKEN!;
const CLIENT_ID = process.env.CLIENT_ID!;
const GUILD_ID = process.env.GUILD_ID!;

const commands = [ping.data.toJSON(), userinfo.data.toJSON(), serverinfo.data.toJSON()];

const rest = new REST({ version: '10' }).setToken(TOKEN);

async function main() {
  try {
    console.log(`Rejestruję ${commands.length} komend na GUILD ${GUILD_ID}...`);
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log('✅ Komendy zarejestrowane (GUILD).');
  } catch (error) {
    console.error('❌ Błąd rejestracji komend:', error);
  }
}

main();
