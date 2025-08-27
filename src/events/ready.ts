import { Events } from 'discord.js';
import type ExtendedClient from '../lib/client.js';


export default (client: ExtendedClient) => {
client.once(Events.ClientReady, (c) => {
console.log(`✅ Zalogowano jako ${c.user.tag}`);
});
};