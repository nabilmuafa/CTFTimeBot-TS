import "dotenv/config";
import { Client, GatewayIntentBits, Collection } from "discord.js";
import { ctf } from "./commands/ctf.js";
import { help } from "./commands/help.js";
import { logger } from "./logger.js";

const TOKEN = process.env.DISCORD_TOKEN!;
const GUILD = process.env.DISCORD_GUILD!;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ],
});

client.commands = new Collection();
client.commands.set(ctf.data.name, ctf);
client.commands.set(help.data.name, help);

client.once("clientReady", () => {
  logger.info(`${client.user?.tag} connected.`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  logger.info({
    user: interaction.user.tag,
    command: interaction.commandName,
  });


  try {
    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;

    await cmd.execute(interaction);
  } catch (err) {
    logger.error(err);
    interaction.reply({ content: "Error executing command", flags: 64 });
  }
});

client.login(TOKEN);
