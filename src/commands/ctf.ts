import { SlashCommandBuilder, EmbedBuilder } from "@discordjs/builders";
import { InteractionResponseType } from "discord-interactions";

export const ctf = {
  data: new SlashCommandBuilder()
    .setName("ctf")
    .setDescription("Lists upcoming CTFs in 1 week range (max. 7)"),

  async execute(interaction: any) {
    const now = Math.floor(Date.now() / 1000);
    const url = `https://ctftime.org/api/v1/events/?limit=7&start=${now}&finish=${now + 604800}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'DiscordBot (https://github.com/your/repo, 1.0)'
      }
    });
    const data: any = await res.json();

    const embeds: any[] = [];

    if (res.ok) {
      const FMT: Intl.DateTimeFormatOptions = {
        dateStyle: "long",
        timeStyle: "short",
      };

      for (const event of data) {
        const start = new Date(event.start);
        const end = new Date(event.finish);

        const startWIB = new Date(start.getTime() + 7 * 60 * 60 * 1000);
        const endWIB = new Date(end.getTime() + 7 * 60 * 60 * 1000);

        const ctfDate =
          `${startWIB.toLocaleString("en-US", FMT)} WIB to ` +
          `${endWIB.toLocaleString("en-US", FMT)} WIB`;

        const embed = new EmbedBuilder()
          .setTitle(event.title)
          .setURL(event.ctftime_url)
          .setDescription(event.description || "No description")
          .setFooter({ text: ctfDate })
          .addFields(
            { name: "Format", value: event.format || "-", inline: true },
            { name: "Weight", value: String(event.weight), inline: true },
            {
              name: "Prize",
              value: event.prizes ? String(event.prizes).substring(0, 1024) : "Pengalaman",
              inline: false,
            }
          );

        if (event.logo) {
          embed.setThumbnail(event.logo);
        }

        embeds.push(embed.toJSON());
      }
    }

    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: embeds,
      },
    };
  },
};
