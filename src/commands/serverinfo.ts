import { SlashCommandBuilder, EmbedBuilder, ChannelType } from 'discord.js';
import type { Command } from '../types/Command.js';

function ts(date: Date | number) {
  const d = typeof date === 'number' ? date : date.getTime();
  return `<t:${Math.floor(d / 1000)}:f>`;
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Pokazuje informacje o tym serwerze w ładnym embedzie'),
  async execute(interaction) {
    const g = interaction.guild!;
    const owner = await g.fetchOwner().catch(() => null);

    const channels = g.channels.cache;
    const text = channels.filter((c) => c.type === ChannelType.GuildText).size;
    const voice = channels.filter((c) => c.type === ChannelType.GuildVoice).size;
    const categories = channels.filter((c) => c.type === ChannelType.GuildCategory).size;
    const threads = channels.filter((c) => c.isThread()).size;

    const embed = new EmbedBuilder()
      .setColor(0x0a59f6)
      .setAuthor({ name: g.name, iconURL: g.iconURL() ?? undefined })
      .setThumbnail(g.iconURL() ?? null)
      .addFields(
        { name: 'ID', value: g.id, inline: true },
        { name: 'Właściciel', value: owner ? owner.user.toString() : '—', inline: true },
        { name: 'Utworzony', value: ts(g.createdAt), inline: true },
        { name: 'Członkowie', value: `${g.memberCount}`, inline: true },
        {
          name: 'Poziom boostów',
          value: `${g.premiumTier} (${g.premiumSubscriptionCount ?? 0})`,
          inline: true,
        },
        { name: 'Weryfikacja', value: `${g.verificationLevel}`, inline: true },
        {
          name: 'Kanały',
          value: `Tekst: ${text} • Głos: ${voice} • Kategorie: ${categories} • Wątki: ${threads}`,
          inline: false,
        },
      );

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
