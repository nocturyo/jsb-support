import 'dotenv/config';
import ExtendedClient from './lib/client.js';
import ready from './events/ready.js';
import interactionCreate from './events/interactionCreate.js';
import ping from './commands/ping.js';
import userinfo from './commands/userinfo.js';
import serverinfo from './commands/serverinfo.js';
import help from './commands/help.js';
import ban from './commands/ban.js';
import kick from './commands/kick.js';
import timeout from './commands/timeout.js';
import clear from './commands/clear.js';
import guildMemberAdd from './events/guildMemberAdd.js';
import testwelcome from './commands/testwelcome.js';
import rolespanel from './commands/rolespanel.js';
import reactionRoles from './events/reactionRoles.js';
import rolespanel_attach from './commands/rolespanel_attach.js';
import ticketpanel from './commands/ticketpanel.js';
import tickets from './events/tickets.js';

const client = new ExtendedClient();

// Rejestrujemy komendy w pamięci klienta
client.commands.set(ping.data.name, ping);
client.commands.set(userinfo.data.name, userinfo);
client.commands.set(serverinfo.data.name, serverinfo);
client.commands.set(help.data.name, help);
client.commands.set(ban.data.name, ban);
client.commands.set(kick.data.name, kick);
client.commands.set(timeout.data.name, timeout);
client.commands.set(clear.data.name, clear);
client.commands.set(testwelcome.data.name, testwelcome);
client.commands.set(rolespanel.data.name, rolespanel);
client.commands.set(rolespanel_attach.data.name, rolespanel_attach);
client.commands.set(ticketpanel.data.name, ticketpanel);
// Podpinamy eventy
ready(client);
interactionCreate(client);
guildMemberAdd(client);
reactionRoles(client);
tickets(client);
// Logowanie bota
client.login(process.env.DISCORD_TOKEN);
