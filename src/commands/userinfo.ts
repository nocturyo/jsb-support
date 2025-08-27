import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { Command } from '../types/Command.js';

function ts(date: Date | number) {
  const d = typeof date === 'number' ? date : date.getTime();
  return `<t:${Math.floor(d / 1000)}:f>`;
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Pokazuje informacje o użytkowniku w ładnym embedzie')
    .addUserOption((opt) =>
      opt
        .setName('użytkownik')
        .setDescription('Użytkownik, którego chcesz sprawdzić')
        .setRequired(false),
    ),
  async execute(interaction) {
    const user = interaction.options.getUser('użytkownik') ?? interaction.user;
    const guild = interaction.guild!;

    // fetch member, żeby mieć role i joinedAt
    let member = null as any;
    try {
      member = await guild.members.fetch(user.id);
    } catch {}

    const roles = member
      ? member.roles.cache
          .filter((r: any) => r.name !== '@everyone')
          .sort((a: any, b: any) => b.position - a.position)
          .map((r: any) => r.toString())
          .slice(0, 10)
      : [];

    const embed = new EmbedBuilder()
      .setColor(0x0a59f6)
      .setAuthor({ name: `${user.tag}`, iconURL: user.displayAvatarURL() })
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        { name: 'Konto utworzone', value: ts(user.createdAt), inline: true },
        { name: '\u200b', value: '\u200b', inline: true },
        ...(member
          ? [
              {
                name: 'Dołączono na serwer',
                value: ts(member.joinedAt ?? new Date()),
                inline: true,
              },
              { name: 'Najwyższa rola', value: member.roles.highest.toString(), inline: true },
              { name: 'Bot?', value: user.bot ? 'Tak' : 'Nie', inline: true },
            ]
          : [
              {
                name: 'Informacja',
                value: 'Nie udało się pobrać danych członka (sprawdź uprawnienia/intenty).',
                inline: false,
              },
            ]),
        {
          name: `Role (${roles.length})`,
          value: roles.length ? roles.join(', ') : 'Brak lub ukryte',
          inline: false,
        },
      );

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
