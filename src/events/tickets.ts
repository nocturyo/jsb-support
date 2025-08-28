import {
  ChannelType,
  Events,
  OverwriteType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import type ExtendedClient from '../lib/client.js';
import { TICKETS_CATEGORY_ID, SUPPORT_ROLE_ID, TICKET_CHANNEL_PREFIX } from '../config/tickets.js';
import { readTickets, writeTickets } from '../lib/store.js';

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 20);
}

export default (client: ExtendedClient) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    // CREATE
    if (interaction.customId === 'ticket:create') {
      if (!interaction.inCachedGuild()) {
        await interaction.reply({ content: 'Ta akcja działa tylko na serwerze.', flags: MessageFlags.Ephemeral });
        return;
      }

      const guild = interaction.guild;
      if (!guild) return;

      // sprawdź kategorię
      const category = await guild.channels.fetch(TICKETS_CATEGORY_ID).catch(() => null);
      if (!category || category.type !== ChannelType.GuildCategory) {
        await interaction.reply({ content: '❌ Nieprawidłowe ID kategorii ticketów w konfiguracji.', flags: MessageFlags.Ephemeral });
        return;
      }

      // sprawdź, czy user nie ma już otwartego ticketa
      const map = await readTickets();
      const existingId = map[interaction.user.id];
      if (existingId) {
        const existing = await guild.channels.fetch(existingId).catch(() => null);
        if (existing) {
          await interaction.reply({ content: `Masz już otwarty ticket: ${existing}`, flags: MessageFlags.Ephemeral });
          return;
        } else {
          delete map[interaction.user.id];
          await writeTickets(map);
        }
      }

      // tworzymy kanał
      const baseName = `${TICKET_CHANNEL_PREFIX}-${slugify(interaction.user.username)}`;
      const name = baseName;

      const chan = await guild.channels.create({
        name,
        type: ChannelType.GuildText,
        parent: category.id,
        topic: `Ticket użytkownika ${interaction.user.tag} | UID: ${interaction.user.id}`,
        permissionOverwrites: [
          { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel], type: OverwriteType.Role },
          { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory], type: OverwriteType.Member },
          { id: SUPPORT_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory], type: OverwriteType.Role },
          { id: client.user!.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages], type: OverwriteType.Member },
        ],
      });

      // zapisz w store
      map[interaction.user.id] = chan.id;
      await writeTickets(map);

      // powitalna wiadomość w tickecie + przycisk zamknięcia
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId('ticket:close').setLabel('Zamknij ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
      );

      const embed = new EmbedBuilder()
        .setColor(0x0a59f6)
        .setTitle('🎟️ Ticket utworzony')
        .setDescription([
          `Witaj ${interaction.user}! Opisz proszę swoją sprawę – wkrótce odezwie się support.`,
          'Użyj przycisku poniżej, gdy sprawa będzie załatwiona.',
        ].join('\n'));

      await chan.send({ content: `<@&${SUPPORT_ROLE_ID}> • ${interaction.user}`, embeds: [embed], components: [row] });
      await interaction.reply({ content: `✅ Utworzono ticket: ${chan}`, flags: MessageFlags.Ephemeral });
      return;
    }

    // CLOSE
    if (interaction.customId === 'ticket:close') {
      if (!interaction.inCachedGuild()) return;
      const channel = interaction.channel;
      if (!channel || channel.type !== ChannelType.GuildText) {
        await interaction.reply({ content: '❌ To nie jest kanał tekstowy.', flags: MessageFlags.Ephemeral });
        return;
      }

      // zablokuj pisanie i oznacz jako zamknięty
      const embed = new EmbedBuilder()
        .setColor(0x0a59f6)
        .setTitle('🔒 Ticket zamknięty')
        .setDescription('Kanał zostanie wkrótce usunięty.');

      // znajdź autora po topicu
      const topic = channel.topic ?? '';
      const uidMatch = topic.match(/UID:\s*(\d+)/);
      const uid = uidMatch?.[1];

      // cofamy dostęp autorowi (jeśli mamy UID)
      if (uid) {
        await channel.permissionOverwrites.edit(uid, { SendMessages: false, ViewChannel: false }).catch(() => null);
        // usuń ze store
        const map = await readTickets();
        if (map[uid]) {
          delete map[uid];
          await writeTickets(map);
        }
      }

      // zablokuj dla wszystkich poza supportem i botem
      await channel.permissionOverwrites.edit(channel.guild.roles.everyone.id, { ViewChannel: false }).catch(() => null);

      await interaction.reply({ embeds: [embed] });

      // usuń po 10 sekundach
      setTimeout(() => {
        channel.delete('Ticket zamknięty').catch(() => null);
      }, 10_000);

      return;
    }
  });
};
