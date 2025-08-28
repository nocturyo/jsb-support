import { Events, AttachmentBuilder, ChannelType } from 'discord.js';
import type ExtendedClient from '../lib/client.js';
import { renderWelcomeCard } from '../lib/welcome-card.js';
import path from 'node:path';

export default (client: ExtendedClient) => {
  client.on(Events.GuildMemberAdd, async (member) => {
    try {
      console.log('[welcome] GuildMemberAdd fired for', member.user.tag, member.guild.id);

      const channelId = process.env.WELCOME_CHANNEL_ID;
      if (!channelId) {
        console.warn('[welcome] WELCOME_CHANNEL_ID nie ustawione w .env');
        return;
      }

      const channel = await member.guild.channels.fetch(channelId).catch(() => null);
      if (!channel) {
        console.warn('[welcome] Nie znalazłem kanału o ID:', channelId);
        return;
      }
      if (channel.type !== ChannelType.GuildText) {
        console.warn('[welcome] Kanał nie jest tekstowy:', channel.id);
        return;
      }

      const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 512 });
      // Absolutna ścieżka do assets
      const basePath = path.resolve(process.cwd(), 'assets', 'welcome_base.png');

      const buffer = await renderWelcomeCard({
        basePath,
        avatarURL,
        username: member.user.username,
        subtitle: 'WITAMY NA SERWERZE!',
      });

      const file = new AttachmentBuilder(buffer, { name: 'welcome.png' });

      await channel.send({ content: `Witaj ${member}!`, files: [file] });
      console.log('[welcome] Wysłano obraz powitalny dla', member.user.tag);
    } catch (err) {
      console.error('[welcome] Błąd generowania/wysyłki obrazu:', err);
      // awaryjnie wyślij prosty tekst
      try {
        const fallbackChannelId = process.env.WELCOME_CHANNEL_ID!;
        const ch = await member.guild.channels.fetch(fallbackChannelId).catch(() => null);
        if (ch && 'send' in ch) {
          await ch.send(`Witaj ${member}! (obrazek chwilowo niedostępny)`);
        }
      } catch {}
    }
  });
};
