import { SlashCommandBuilder, EmbedBuilder } from "@discordjs/builders";
import { InteractionResponseType } from "discord-interactions";

export const help = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Displays help menu"),

  async execute(interaction: any) {
    const embed = new EmbedBuilder()
      .setTitle("Bot usage")
      .setDescription(
        [
          "Available commands:",
          "/help – Show this help menu",
          "/ctf – List upcoming CTFs in 1 week range (max 7)",
        ].join("\n")
      );

    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [embed.toJSON()],
      },
    };
  },
};
