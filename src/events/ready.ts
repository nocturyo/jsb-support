import { Events, ActivityType } from 'discord.js';
import type ExtendedClient from '../lib/client.js';

// Listę aktywności możesz zmienić według uznania
const activities = [
  { type: ActivityType.Watching, name: 'Twoje komendy ✨' },
  { type: ActivityType.Listening, name: '/help' },
  { type: ActivityType.Playing, name: 'z API Discord' },
];

export default (client: ExtendedClient) => {
  client.once(Events.ClientReady, (c) => {
    console.log(`✅ Zalogowano jako ${c.user.tag}`);

    let i = 0;
    const set = () => {
      const a = activities[i % activities.length];
      c.user.setPresence({
        activities: [{ name: a.name, type: a.type }],
        status: 'online', // 'online' | 'idle' | 'dnd' | 'invisible'
      });
      i++;
    };

    set();
    setInterval(set, 60_000); // zmiana co 60s
  });
};
