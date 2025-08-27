import 'dotenv/config';
import ExtendedClient from './lib/client.js';
import ready from './events/ready.js';
import interactionCreate from './events/interactionCreate.js';
import ping from './commands/ping.js';
import userinfo from './commands/userinfo.js';
import serverinfo from './commands/serverinfo.js';

const client = new ExtendedClient();

client.commands.set(ping.data.name, ping);
client.commands.set(userinfo.data.name, userinfo);
client.commands.set(serverinfo.data.name, serverinfo);

ready(client);
interactionCreate(client);

client.login(process.env.DISCORD_TOKEN);
