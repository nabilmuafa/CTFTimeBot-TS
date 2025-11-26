import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

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

    await interaction.reply({ embeds: [embed] });
  },
};
