import 'dotenv/config';
import ExtendedClient from './lib/client.js';
import ready from './events/ready.js';
import interactionCreate from './events/interactionCreate.js';
import ping from './commands/ping.js';
import userinfo from './commands/userinfo.js';
import serverinfo from './commands/serverinfo.js';


const client = new ExtendedClient();


// Rejestrujemy komendy w pamięci klienta
client.commands.set(ping.data.name, ping);
client.commands.set(userinfo.data.name, userinfo);
client.commands.set(serverinfo.data.name, serverinfo);


// Podpinamy eventy
ready(client);
interactionCreate(client);


// Logowanie bota
client.login(process.env.DISCORD_TOKEN);