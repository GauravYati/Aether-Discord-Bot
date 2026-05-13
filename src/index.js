import "dotenv/config";
import { Client, Events, GatewayIntentBits, Partials } from "discord.js";
import {
  awardMessageXp,
  handleAetherMention,
  handleButton,
  handleCommand,
  handleGuildMemberAdd,
  handleMessageDelete,
  processBirthdays,
  processReminders
} from "./commands.js";
import { loadDb } from "./storage.js";

const { DISCORD_TOKEN } = process.env;

if (!DISCORD_TOKEN) {
  throw new Error("Missing DISCORD_TOKEN in .env");
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration
  ],
  partials: [Partials.Channel, Partials.Message]
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
  setInterval(() => processReminders(readyClient), 30_000);
  setInterval(() => processBirthdays(readyClient), 60 * 60 * 1000);
  processBirthdays(readyClient);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) await handleCommand(interaction);
    if (interaction.isButton()) await handleButton(interaction);
  } catch (error) {
    console.error(error);
    const payload = { content: "Something went wrong while running that command.", ephemeral: true };
    if (interaction.deferred || interaction.replied) await interaction.followUp(payload);
    else await interaction.reply(payload);
  }
});

client.on(Events.MessageCreate, async (message) => {
  try {
    await handleAetherMention(message);
    await awardMessageXp(message);
  } catch (error) {
    console.error("XP error:", error);
  }
});

client.on(Events.GuildMemberAdd, async (member) => {
  try {
    await handleGuildMemberAdd(member);
  } catch (error) {
    console.error("Member join error:", error);
  }
});

client.on(Events.MessageDelete, async (message) => {
  try {
    await handleMessageDelete(message);
  } catch (error) {
    console.error("Message delete log error:", error);
  }
});

await loadDb();
await client.login(DISCORD_TOKEN);
