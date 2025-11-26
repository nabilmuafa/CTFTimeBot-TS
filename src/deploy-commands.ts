import "dotenv/config";
import { REST, Routes } from "discord.js";
import { ctf } from "./commands/ctf.js";
import { help } from "./commands/help.js";

const TOKEN = process.env.DISCORD_TOKEN!;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const GUILD_ID = process.env.DISCORD_GUILD_ID!;

const rest = new REST({ version: "10" }).setToken(TOKEN);

async function deploy() {
  const commands = [ctf.data.toJSON(), help.data.toJSON()];

  try {
    console.log("Deploying slash commands...");
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });
    console.log("Done.");
  } catch (err) {
    console.error(err);
  }
}

deploy();
