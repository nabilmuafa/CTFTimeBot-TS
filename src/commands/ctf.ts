import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import fetch from "node-fetch";

export const ctf = {
  data: new SlashCommandBuilder()
    .setName("ctf")
    .setDescription("Lists upcoming CTFs in 1 week range (max. 7)"),

  async execute(interaction: any) {
    const now = Math.floor(Date.now() / 1000);
    const url = `https://ctftime.org/api/v1/events/?limit=7&start=${now}&finish=${now + 604800}`;

    const res = await fetch(url);
    const data = await res.json();

    const embeds: EmbedBuilder[] = [];

    if (res.ok) {
      const FMT: Intl.DateTimeFormatOptions = {
        dateStyle: "long",
        timeStyle: "short",
      };

      for (const ctf of data) {
        const start = new Date(ctf.start);
        const end = new Date(ctf.finish);

        // WIB = UTC+7
        const startWIB = new Date(start.getTime() + 7 * 60 * 60 * 1000);
        const endWIB = new Date(end.getTime() + 7 * 60 * 60 * 1000);

        const ctfDate =
          `${startWIB.toLocaleString("en-US", FMT)} WIB to ` +
          `${endWIB.toLocaleString("en-US", FMT)} WIB`;

        const embed = new EmbedBuilder()
          .setTitle(ctf.title)
          .setURL(ctf.ctftime_url)
          .setDescription(ctf.description || null)
          .setFooter({ text: ctfDate })
          .addFields(
            { name: "Format", value: ctf.format || "-" },
            { name: "Weight", value: String(ctf.weight) },
            {
              name: "Prize",
              value: ctf.prizes ? String(ctf.prizes) : "Pengalaman",
              inline: false,
            }
          )

        if (ctf.logo) {
          embed.setThumbnail(ctf.logo);
        }

        embeds.push(
          embed
        );
      }
    }

    await interaction.reply({ embeds });
  },
};
