import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import ping from '../src/commands/ping.js';
import userinfo from '../src/commands/userinfo.js';
import serverinfo from '../src/commands/serverinfo.js';
import help from '../src/commands/help.js';
import ban from '../src/commands/ban.js';
import kick from '../src/commands/kick.js';
import timeout from '../src/commands/timeout.js';
import clear from '../src/commands/clear.js';
import testwelcome from '../src/commands/testwelcome.js';
import rolespanel from '../src/commands/rolespanel.js';
import rolespanel_attach from '../src/commands/rolespanel_attach.js';
import ticketpanel from '../src/commands/ticketpanel.js';
import rank from '../src/commands/rank.js';
import leaderboard from '../src/commands/leaderboard.js';
import addxp from '../src/commands/addxp.js';
import setlevelchannel from '../src/commands/setlevelchannel.js';

const TOKEN = process.env.DISCORD_TOKEN!;
const CLIENT_ID = process.env.CLIENT_ID!;
const GUILD_ID = process.env.GUILD_ID!;

const commands = [
  ping.data.toJSON(),
  userinfo.data.toJSON(),
  serverinfo.data.toJSON(),
  help.data.toJSON(),
  ban.data.toJSON(),
  kick.data.toJSON(),
  timeout.data.toJSON(),
  clear.data.toJSON(),
  testwelcome.data.toJSON(),
  rolespanel.data.toJSON(),
  rolespanel_attach.data.toJSON(),
  ticketpanel.data.toJSON(),
  rank.data.toJSON(),
  leaderboard.data.toJSON(),
  addxp.data.toJSON(),
  setlevelchannel.data.toJSON(),
];
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

