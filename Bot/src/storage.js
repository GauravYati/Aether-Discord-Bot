import fs from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.resolve("data");
const DB_PATH = path.join(DATA_DIR, "db.json");

const DEFAULT_DB = {
  guilds: {},
  users: {}
};

let db = structuredClone(DEFAULT_DB);
let writeQueue = Promise.resolve();

export async function loadDb() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    db = { ...structuredClone(DEFAULT_DB), ...JSON.parse(raw) };
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await saveDb();
  }
}

export function getDb() {
  return db;
}

export function ensureGuild(guildId) {
  db.guilds[guildId] ??= {
    birthdays: {},
    warnings: {},
    levels: {},
    economy: {},
    numberGames: {},
    pets: {},
    clans: {},
    clansByMember: {},
    reminders: [],
    afk: {},
    starboard: {},
    notes: {},
    quotes: [],
    buttonPolls: {},
    inventories: {},
    cooldowns: {},
    activeBeast: null,
    config: {
      welcomeChannelId: null,
      logChannelId: null,
      birthdayChannelId: null,
      lastBirthdayDate: null,
      messageXpEnabled: false
    }
  };
  db.guilds[guildId].birthdays ??= {};
  db.guilds[guildId].warnings ??= {};
  db.guilds[guildId].levels ??= {};
  db.guilds[guildId].economy ??= {};
  db.guilds[guildId].numberGames ??= {};
  db.guilds[guildId].pets ??= {};
  db.guilds[guildId].clans ??= {};
  db.guilds[guildId].clansByMember ??= {};
  db.guilds[guildId].reminders ??= [];
  db.guilds[guildId].afk ??= {};
  db.guilds[guildId].starboard ??= {};
  db.guilds[guildId].notes ??= {};
  db.guilds[guildId].quotes ??= [];
  db.guilds[guildId].buttonPolls ??= {};
  db.guilds[guildId].inventories ??= {};
  db.guilds[guildId].cooldowns ??= {};
  db.guilds[guildId].activeBeast ??= null;
  db.guilds[guildId].config ??= {};
  db.guilds[guildId].config.welcomeChannelId ??= null;
  db.guilds[guildId].config.logChannelId ??= null;
  db.guilds[guildId].config.birthdayChannelId ??= null;
  db.guilds[guildId].config.lastBirthdayDate ??= null;
  db.guilds[guildId].config.messageXpEnabled ??= false;
  return db.guilds[guildId];
}

export function ensureMember(guildId, userId) {
  const guild = ensureGuild(guildId);
  guild.levels[userId] ??= { xp: 0, level: 0, lastXpAt: 0 };
  guild.economy[userId] ??= { coins: 250, lastDaily: 0 };
  return {
    level: guild.levels[userId],
    economy: guild.economy[userId]
  };
}

export async function saveDb() {
  writeQueue = writeQueue.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
  });
  return writeQueue;
}

export function xpNeeded(level) {
  return 100 + level * 75;
}

export function addCoins(guildId, userId, amount) {
  const { economy } = ensureMember(guildId, userId);
  economy.coins = Math.max(0, economy.coins + amount);
  return economy.coins;
}

export function formatCoins(amount) {
  return `${amount.toLocaleString("en-US")} coins`;
}
