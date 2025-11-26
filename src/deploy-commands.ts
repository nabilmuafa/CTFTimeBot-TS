import "dotenv/config";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { ctf } from "./commands/ctf.js";
import { help } from "./commands/help.js";

const TOKEN = process.env.DISCORD_TOKEN!;
const CLIENT_ID = process.env.DISCORD_APPLICATION_ID!;

const rest = new REST({ version: "10" }).setToken(TOKEN);

async function deploy() {
  const commands = [ctf.data.toJSON(), help.data.toJSON()];

  try {
    console.log("Deploying slash commands...");

    // This registers commands globally. It might take ~1 hour to cache.
    // For instant testing, you can use: .applicationGuildCommands(CLIENT_ID, "YOUR_GUILD_ID")
    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: commands,
    });

    console.log("Done! Commands registered.");
  } catch (err) {
    console.error("Error registering commands:", err);
  }
}

deploy();
