import "dotenv/config";
import { REST, Routes } from "discord.js";
import { commands } from "./commands.js";

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID) {
  throw new Error("Missing DISCORD_TOKEN or CLIENT_ID in .env");
}

const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

if (GUILD_ID) {
  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
  console.log(`Registered ${commands.length} guild command(s) for ${GUILD_ID}.`);
} else {
  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
  console.log(`Registered ${commands.length} global command(s).`);
}
