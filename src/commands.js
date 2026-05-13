import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder
} from "discord.js";
import path from "node:path";
import { addCoins, ensureGuild, ensureMember, formatCoins, getDb, saveDb, xpNeeded } from "./storage.js";

const ASSET_ROOT = path.resolve("assets");

const GIFS = {
  hug: [
    "https://media.tenor.com/9e1aE_xBLCsAAAAC/anime-hug.gif",
    "https://media.tenor.com/0vl21YIsGvgAAAAC/hug-anime.gif",
    "https://media.tenor.com/1T1B8HcWalQAAAAC/anime-hug.gif"
  ],
  pat: [
    "https://media.tenor.com/Av63tpJLwJYAAAAC/pat-head.gif",
    "https://media.tenor.com/DCMl9bvSDSwAAAAC/pat-head-anime.gif"
  ],
  slap: [
    "https://media.tenor.com/Ws6Dm1ZW_vMAAAAC/girl-slap.gif",
    "https://media.tenor.com/PeJyQRCSHHkAAAAC/slap-anime.gif"
  ],
  cry: [
    "https://media.tenor.com/RG0kR_4_2xMAAAAC/anime-cry.gif",
    "https://media.tenor.com/X3x3Y2mp2W8AAAAC/anime-crying.gif"
  ],
  dance: [
    "https://media.tenor.com/X_3j1qkD1qUAAAAC/anime-dance.gif",
    "https://media.tenor.com/2roX3uxz_68AAAAC/anime-dance.gif"
  ],
  highfive: [
    "https://media.tenor.com/0VaE-6Gz3kQAAAAC/high-five-anime.gif",
    "https://media.tenor.com/rF8KszP4fbQAAAAC/high-five.gif"
  ],
  wave: [
    "https://media.tenor.com/z0GkYH9w3GQAAAAC/anime-wave.gif",
    "https://media.tenor.com/5bS2tZ9qfPAAAAAC/wave-anime.gif"
  ],
  cheer: [
    "https://media.tenor.com/xAvA6cV79uMAAAAC/anime-cheer.gif",
    "https://media.tenor.com/96q6zZJe5KAAAAAC/anime-happy.gif"
  ],
  boop: [
    "https://media.tenor.com/HZC8J3Z2d2MAAAAC/anime-boop.gif",
    "https://media.tenor.com/kU91Z9e3wRIAAAAC/anime-poke.gif"
  ],
  poke: [
    "https://media.tenor.com/3cJtD4GZb2kAAAAC/anime-poke.gif",
    "https://media.tenor.com/BX7OQ1GNnWAAAAAC/poke-anime.gif"
  ],
  smile: [
    "https://media.tenor.com/6JptszQgCnkAAAAC/anime-smile.gif",
    "https://media.tenor.com/LQv1r8XzA8cAAAAC/anime-happy.gif"
  ],
  laugh: [
    "https://media.tenor.com/bM8uY4bHf2QAAAAC/anime-laugh.gif",
    "https://media.tenor.com/H5xHPR8J8GkAAAAC/anime-laughing.gif"
  ]
};

const MEMES = [
  "https://i.imgflip.com/30b1gx.jpg",
  "https://i.imgflip.com/1bij.jpg",
  "https://i.imgflip.com/26am.jpg",
  "https://i.imgflip.com/4t0m5.jpg"
];

const TRIVIA = [
  { q: "What does CPU stand for?", a: "central processing unit" },
  { q: "How many bits are in one byte?", a: "8" },
  { q: "What planet is known as the Red Planet?", a: "mars" },
  { q: "What is the capital city of Japan?", a: "tokyo" },
  { q: "Which ocean is the largest?", a: "pacific" }
];

const PET_TYPES = ["cat", "dog", "dragon", "fox", "wolf", "panda", "phoenix", "griffin", "kirin", "hydra"];
const PET_COSTS = { cat: 300, dog: 300, fox: 450, wolf: 600, panda: 800, dragon: 1500, phoenix: 2200, griffin: 2400, kirin: 2600, hydra: 3000 };
const PET_ATTACKS = {
  cat: { name: "Whisker Blitz", verb: "dashes in with a tiny paw combo", item: "cat charm", color: 0xffb6c1 },
  dog: { name: "Bark Burst", verb: "launches a heroic bark wave", item: "dog medal", color: 0xf1c40f },
  dragon: { name: "Ember Nova", verb: "breathes a sparkling ember storm", item: "dragon scale", color: 0xe74c3c },
  fox: { name: "Clever Flash", verb: "vanishes and returns with a tricky tail swipe", item: "fox tail ribbon", color: 0xe67e22 },
  wolf: { name: "Moon Howl", verb: "calls a moonlit howl that shakes the arena", item: "wolf fang token", color: 0x95a5a6 },
  panda: { name: "Bamboo Bonk", verb: "bonks the training dummy with bamboo power", item: "bamboo badge", color: 0x2ecc71 },
  phoenix: { name: "Solar Rebirth", verb: "sweeps forward in a warm solar arc", item: "phoenix feather", color: 0xff6b35 },
  griffin: { name: "Skyguard Dive", verb: "dives from above with a gusting wing strike", item: "griffin plume", color: 0xf7c948 },
  kirin: { name: "Moonlit Charge", verb: "charges with gentle moonlight energy", item: "kirin moon shard", color: 0xc084fc },
  hydra: { name: "Triple Tide", verb: "summons three ancient water bursts", item: "hydra scale", color: 0x00d1ff }
};
const MAGIC_8 = ["Yes.", "No.", "Maybe.", "Absolutely.", "Ask again later.", "Very likely.", "I would not bet on it.", "The signs point to yes."];
const WORK_REPLIES = ["coded a plugin", "moderated a chaotic chat", "delivered snacks", "fixed a broken server", "won a tiny tournament", "cleaned the command list"];
const COMPLIMENTS = [
  "Your timing is suspiciously excellent.",
  "You bring main-character helpfulness today.",
  "Your vibe passed the quality check.",
  "Aether has reviewed the data and decided you are neat.",
  "You make the server brighter without touching the settings."
];
const JOKES = [
  "Why did the bot bring a ladder? To reach higher permissions.",
  "I tried to organize my commands alphabetically. Then I remembered chaos is also a feature.",
  "Why was the server calm? The mods had slowmode and snacks.",
  "A slash command walked into chat. Everyone finally knew what it wanted."
];
const FACTS = [
  "Octothorpe is another name for the # symbol.",
  "Discord launched in 2015.",
  "A day on Venus is longer than a year on Venus.",
  "The first computer bug was an actual moth found in a relay."
];
const LOOT_TABLE = [
  { item: "common gem", coins: 60, weight: 45 },
  { item: "silver key", coins: 120, weight: 30 },
  { item: "golden badge", coins: 250, weight: 15 },
  { item: "aether crystal", coins: 600, weight: 8 },
  { item: "mythic token", coins: 1200, weight: 2 }
];
const MYTHICAL_BEASTS = [
  { name: "Ancient Phoenix", file: "ancient-phoenix", hp: 470, reward: 680, item: "phoenix ember", color: 0xff6b35 },
  { name: "Crystal Hydra", file: "crystal-hydra", hp: 520, reward: 750, item: "hydra crystal", color: 0x00d1ff },
  { name: "Storm Gryphon", file: "storm-gryphon", hp: 430, reward: 620, item: "gryphon feather", color: 0xf1c40f },
  { name: "Moon Kirin", file: "moon-kirin", hp: 380, reward: 560, item: "moon horn shard", color: 0xc084fc },
  { name: "Rune Titan", file: "rune-titan", hp: 620, reward: 850, item: "rune core", color: 0x5f8269 },
  { name: "Void Leviathan", file: "void-leviathan", hp: 700, reward: 980, item: "void pearl", color: 0x4b4191 }
];
const SHOP_ITEMS = [
  { name: "cat", price: PET_COSTS.cat, desc: "Starter pet" },
  { name: "dog", price: PET_COSTS.dog, desc: "Starter pet" },
  { name: "fox", price: PET_COSTS.fox, desc: "Pet" },
  { name: "wolf", price: PET_COSTS.wolf, desc: "Pet" },
  { name: "panda", price: PET_COSTS.panda, desc: "Rare pet" },
  { name: "dragon", price: PET_COSTS.dragon, desc: "Legendary pet" },
  { name: "phoenix", price: PET_COSTS.phoenix, desc: "Mythical pet" },
  { name: "griffin", price: PET_COSTS.griffin, desc: "Mythical pet" },
  { name: "kirin", price: PET_COSTS.kirin, desc: "Mythical pet" },
  { name: "hydra", price: PET_COSTS.hydra, desc: "Mythical pet" },
  { name: "clan", price: 1000, desc: "Create a clan" },
  { name: "lootbox", price: 200, desc: "Open with /lootbox" }
];
const AETHER_REPLIES = [
  "Aether online. What are we building today?",
  "You called Aether. I brought commands and questionable confidence.",
  "Aether is here. Try `/help` if you want the big menu.",
  "Ping received. Tiny sparkle noise, very official.",
  "Aether heard the summon. No cape, still useful.",
  "Ready when you are. Administration, games, pets, clans, wallets: I have pockets.",
  "Aether reporting in. The command engine is humming.",
  "Hello hello. I am awake and pretending I was not napping."
];
const ACTION_COMMANDS = ["hug", "pat", "slap", "cry", "dance", "highfive", "wave", "cheer", "boop", "poke", "smile", "laugh"];

const data = [
  new SlashCommandBuilder().setName("help").setDescription("Show all Aether command categories."),
  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member.")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((o) => o.setName("member").setDescription("Member to kick").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Reason")),
  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a member.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((o) => o.setName("member").setDescription("Member to ban").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Reason")),
  new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a member.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) => o.setName("member").setDescription("Member to timeout").setRequired(true))
    .addIntegerOption((o) => o.setName("minutes").setDescription("Timeout minutes").setRequired(true).setMinValue(1).setMaxValue(10080))
    .addStringOption((o) => o.setName("reason").setDescription("Reason")),
  new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete recent messages.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((o) => o.setName("amount").setDescription("1-100 messages").setRequired(true).setMinValue(1).setMaxValue(100)),
  new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Set channel slowmode.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addIntegerOption((o) => o.setName("seconds").setDescription("0-21600 seconds").setRequired(true).setMinValue(0).setMaxValue(21600)),
  new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock the current text channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Unlock the current text channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a member.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) => o.setName("member").setDescription("Member to warn").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Reason").setRequired(true)),
  new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("View member warnings.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) => o.setName("member").setDescription("Member").setRequired(true)),
  new SlashCommandBuilder()
    .setName("clearwarnings")
    .setDescription("Clear all warnings for a member.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) => o.setName("member").setDescription("Member").setRequired(true)),
  new SlashCommandBuilder()
    .setName("untimeout")
    .setDescription("Remove a member's timeout.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) => o.setName("member").setDescription("Member").setRequired(true)),
  new SlashCommandBuilder()
    .setName("hug")
    .setDescription("Send a hug GIF.")
    .addUserOption((o) => o.setName("member").setDescription("Who gets the hug?")),
  new SlashCommandBuilder()
    .setName("pat")
    .setDescription("Send a pat GIF.")
    .addUserOption((o) => o.setName("member").setDescription("Who gets the pat?")),
  new SlashCommandBuilder()
    .setName("slap")
    .setDescription("Send a slap GIF.")
    .addUserOption((o) => o.setName("member").setDescription("Who gets slapped?")),
  new SlashCommandBuilder().setName("cry").setDescription("Send a crying GIF."),
  new SlashCommandBuilder().setName("dance").setDescription("Send a dance GIF."),
  new SlashCommandBuilder()
    .setName("highfive")
    .setDescription("Send a high-five GIF.")
    .addUserOption((o) => o.setName("member").setDescription("Who gets the high-five?")),
  new SlashCommandBuilder()
    .setName("wave")
    .setDescription("Send a wave GIF.")
    .addUserOption((o) => o.setName("member").setDescription("Who gets the wave?")),
  new SlashCommandBuilder()
    .setName("cheer")
    .setDescription("Send a cheering GIF.")
    .addUserOption((o) => o.setName("member").setDescription("Who gets cheered on?")),
  new SlashCommandBuilder()
    .setName("boop")
    .setDescription("Send a boop GIF.")
    .addUserOption((o) => o.setName("member").setDescription("Who gets booped?")),
  new SlashCommandBuilder()
    .setName("poke")
    .setDescription("Send a poke GIF.")
    .addUserOption((o) => o.setName("member").setDescription("Who gets poked?")),
  new SlashCommandBuilder()
    .setName("smile")
    .setDescription("Send a smile GIF.")
    .addUserOption((o) => o.setName("member").setDescription("Who gets a smile?")),
  new SlashCommandBuilder()
    .setName("laugh")
    .setDescription("Send a laugh GIF.")
    .addUserOption((o) => o.setName("member").setDescription("Who are you laughing with?")),
  new SlashCommandBuilder().setName("meme").setDescription("Show a random meme."),
  new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Show a member's Aether profile.")
    .addUserOption((o) => o.setName("member").setDescription("Member")),
  new SlashCommandBuilder()
    .setName("birthday")
    .setDescription("Manage birthdays.")
    .addSubcommand((s) => s.setName("set").setDescription("Save your birthday").addStringOption((o) => o.setName("date").setDescription("MM-DD, for example 09-18").setRequired(true)))
    .addSubcommand((s) => s.setName("view").setDescription("View a birthday").addUserOption((o) => o.setName("member").setDescription("Member")))
    .addSubcommand((s) => s.setName("remove").setDescription("Remove your birthday"))
    .addSubcommand((s) => s.setName("today").setDescription("Show today's birthdays")),
  new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Show a member's level.")
    .addUserOption((o) => o.setName("member").setDescription("Member")),
  new SlashCommandBuilder().setName("leaderboard").setDescription("Show the XP leaderboard."),
  new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Flip a coin.")
    .addStringOption((o) => o.setName("choice").setDescription("Heads or tails").addChoices({ name: "Heads", value: "heads" }, { name: "Tails", value: "tails" })),
  new SlashCommandBuilder()
    .setName("dice")
    .setDescription("Roll dice.")
    .addIntegerOption((o) => o.setName("sides").setDescription("Number of sides").setMinValue(2).setMaxValue(100).setRequired(false)),
  new SlashCommandBuilder()
    .setName("rps")
    .setDescription("Play rock paper scissors.")
    .addStringOption((o) => o.setName("choice").setDescription("Your choice").setRequired(true).addChoices(
      { name: "Rock", value: "rock" },
      { name: "Paper", value: "paper" },
      { name: "Scissors", value: "scissors" }
    )),
  new SlashCommandBuilder().setName("trivia").setDescription("Answer a quick trivia question."),
  new SlashCommandBuilder()
    .setName("guess")
    .setDescription("Number guessing game.")
    .addSubcommand((s) => s.setName("start").setDescription("Start a 1-100 guessing game"))
    .addSubcommand((s) => s.setName("try").setDescription("Make a guess").addIntegerOption((o) => o.setName("number").setDescription("Your guess").setRequired(true).setMinValue(1).setMaxValue(100))),
  new SlashCommandBuilder().setName("balance").setDescription("Show your coin balance."),
  new SlashCommandBuilder().setName("daily").setDescription("Claim daily coins."),
  new SlashCommandBuilder().setName("work").setDescription("Work for coins."),
  new SlashCommandBuilder()
    .setName("bet")
    .setDescription("Gamble coins on a coinflip.")
    .addIntegerOption((o) => o.setName("amount").setDescription("Coins to bet").setRequired(true).setMinValue(1))
    .addStringOption((o) => o.setName("choice").setDescription("Heads or tails").setRequired(true).addChoices({ name: "Heads", value: "heads" }, { name: "Tails", value: "tails" })),
  new SlashCommandBuilder()
    .setName("slots")
    .setDescription("Play slots.")
    .addIntegerOption((o) => o.setName("amount").setDescription("Coins to bet").setRequired(true).setMinValue(1)),
  new SlashCommandBuilder()
    .setName("blackjack")
    .setDescription("Play quick blackjack.")
    .addIntegerOption((o) => o.setName("amount").setDescription("Coins to bet").setRequired(true).setMinValue(1)),
  new SlashCommandBuilder()
    .setName("pet")
    .setDescription("Adopt and care for a pet.")
    .addSubcommand((s) => s.setName("adopt").setDescription("Adopt a pet").addStringOption((o) => o.setName("type").setDescription("Pet type").setRequired(true).addChoices(...PET_TYPES.map((type) => ({ name: type, value: type }))).setRequired(true)).addStringOption((o) => o.setName("name").setDescription("Pet name").setRequired(true).setMaxLength(24)))
    .addSubcommand((s) => s.setName("profile").setDescription("View your pet"))
    .addSubcommand((s) => s.setName("feed").setDescription("Feed your pet"))
    .addSubcommand((s) => s.setName("play").setDescription("Play with your pet"))
    .addSubcommand((s) => s.setName("train").setDescription("Train your pet for XP"))
    .addSubcommand((s) => s.setName("adventure").setDescription("Send your pet on an adventure"))
    .addSubcommand((s) => s.setName("attack").setDescription("Use your pet's special attack").addUserOption((o) => o.setName("target").setDescription("Optional playful target")))
    .addSubcommand((s) => s.setName("rename").setDescription("Rename your pet").addStringOption((o) => o.setName("name").setDescription("New pet name").setRequired(true).setMaxLength(24)))
    .addSubcommand((s) => s.setName("leaderboard").setDescription("Show top pets")),
  new SlashCommandBuilder()
    .setName("beast")
    .setDescription("Fight random mythical beast encounters.")
    .addSubcommand((s) => s.setName("status").setDescription("Show the active mythical beast"))
    .addSubcommand((s) => s.setName("attack").setDescription("Attack the active mythical beast with your pet")),
  new SlashCommandBuilder()
    .setName("clan")
    .setDescription("Create and manage clans.")
    .addSubcommand((s) => s.setName("create").setDescription("Create a clan for 1000 coins").addStringOption((o) => o.setName("name").setDescription("Clan name").setRequired(true).setMinLength(3).setMaxLength(24)))
    .addSubcommand((s) => s.setName("join").setDescription("Join a clan").addStringOption((o) => o.setName("name").setDescription("Clan name").setRequired(true).setMaxLength(24)))
    .addSubcommand((s) => s.setName("leave").setDescription("Leave your clan"))
    .addSubcommand((s) => s.setName("profile").setDescription("View a clan").addStringOption((o) => o.setName("name").setDescription("Clan name").setMaxLength(24)))
    .addSubcommand((s) => s.setName("deposit").setDescription("Donate coins to your clan").addIntegerOption((o) => o.setName("amount").setDescription("Coins").setRequired(true).setMinValue(1)))
    .addSubcommand((s) => s.setName("leaderboard").setDescription("Show top clans")),
  new SlashCommandBuilder()
    .setName("utility")
    .setDescription("Useful server tools.")
    .addSubcommand((s) => s.setName("ping").setDescription("Check bot latency"))
    .addSubcommand((s) => s.setName("avatar").setDescription("Show a user's avatar").addUserOption((o) => o.setName("member").setDescription("Member")))
    .addSubcommand((s) => s.setName("userinfo").setDescription("Show user information").addUserOption((o) => o.setName("member").setDescription("Member")))
    .addSubcommand((s) => s.setName("serverinfo").setDescription("Show server information"))
    .addSubcommand((s) => s.setName("choose").setDescription("Choose between options separated by commas").addStringOption((o) => o.setName("options").setDescription("pizza, burger, noodles").setRequired(true)))
    .addSubcommand((s) => s.setName("say").setDescription("Make the bot say something").addStringOption((o) => o.setName("message").setDescription("Message").setRequired(true).setMaxLength(1000))),
  new SlashCommandBuilder()
    .setName("config")
    .setDescription("Configure Aether server automation.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((s) => s.setName("view").setDescription("View current server config"))
    .addSubcommand((s) => s.setName("welcome").setDescription("Set the welcome channel").addChannelOption((o) => o.setName("channel").setDescription("Welcome channel").addChannelTypes(ChannelType.GuildText).setRequired(true)))
    .addSubcommand((s) => s.setName("logs").setDescription("Set the moderation/log channel").addChannelOption((o) => o.setName("channel").setDescription("Log channel").addChannelTypes(ChannelType.GuildText).setRequired(true)))
    .addSubcommand((s) => s.setName("birthdays").setDescription("Set the birthday announcement channel").addChannelOption((o) => o.setName("channel").setDescription("Birthday channel").addChannelTypes(ChannelType.GuildText).setRequired(true)))
    .addSubcommand((s) => s.setName("xp").setDescription("Enable or disable passive chat XP").addStringOption((o) => o.setName("mode").setDescription("XP mode").setRequired(true).addChoices(
      { name: "Enable", value: "enable" },
      { name: "Disable", value: "disable" }
    )))
    .addSubcommand((s) => s.setName("disable").setDescription("Disable one automation").addStringOption((o) => o.setName("feature").setDescription("Feature").setRequired(true).addChoices(
      { name: "Welcome", value: "welcome" },
      { name: "Logs", value: "logs" },
      { name: "Birthdays", value: "birthdays" }
    ))),
  new SlashCommandBuilder()
    .setName("social")
    .setDescription("Social and fun profile commands.")
    .addSubcommand((s) => s.setName("8ball").setDescription("Ask the magic 8-ball").addStringOption((o) => o.setName("question").setDescription("Question").setRequired(true)))
    .addSubcommand((s) => s.setName("friendship").setDescription("Calculate a kid-safe friendship score").addUserOption((o) => o.setName("first").setDescription("First member").setRequired(true)).addUserOption((o) => o.setName("second").setDescription("Second member")))
    .addSubcommand((s) => s.setName("compliment").setDescription("Send a compliment").addUserOption((o) => o.setName("member").setDescription("Member")))
    .addSubcommand((s) => s.setName("joke").setDescription("Tell a random joke"))
    .addSubcommand((s) => s.setName("fact").setDescription("Share a random fact"))
    .addSubcommand((s) => s.setName("rate").setDescription("Rate anything").addStringOption((o) => o.setName("thing").setDescription("Thing to rate").setRequired(true).setMaxLength(80)))
    .addSubcommand((s) => s.setName("reverse").setDescription("Reverse text").addStringOption((o) => o.setName("text").setDescription("Text").setRequired(true).setMaxLength(500)))
    .addSubcommand((s) => s.setName("afk").setDescription("Set your AFK status").addStringOption((o) => o.setName("reason").setDescription("Reason").setMaxLength(160))),
  new SlashCommandBuilder()
    .setName("wallet")
    .setDescription("Wallet, coins, and economy commands.")
    .addSubcommand((s) => s.setName("view").setDescription("View a wallet").addUserOption((o) => o.setName("member").setDescription("Member")))
    .addSubcommand((s) => s.setName("leaderboard").setDescription("Show richest members"))
    .addSubcommand((s) => s.setName("daily").setDescription("Claim daily coins"))
    .addSubcommand((s) => s.setName("work").setDescription("Work for coins"))
    .addSubcommand((s) => s.setName("pay").setDescription("Send coins").addUserOption((o) => o.setName("member").setDescription("Member").setRequired(true)).addIntegerOption((o) => o.setName("amount").setDescription("Coins").setRequired(true).setMinValue(1))),
  new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Create a quick yes/no poll.")
    .addStringOption((o) => o.setName("question").setDescription("Poll question").setRequired(true).setMaxLength(200)),
  new SlashCommandBuilder()
    .setName("buttonpoll")
    .setDescription("Create an interactive two-option button poll.")
    .addStringOption((o) => o.setName("question").setDescription("Question").setRequired(true).setMaxLength(160))
    .addStringOption((o) => o.setName("option_a").setDescription("First option").setRequired(true).setMaxLength(80))
    .addStringOption((o) => o.setName("option_b").setDescription("Second option").setRequired(true).setMaxLength(80)),
  new SlashCommandBuilder()
    .setName("wyr")
    .setDescription("Create an interactive would-you-rather vote.")
    .addStringOption((o) => o.setName("option_a").setDescription("First option").setRequired(true).setMaxLength(80))
    .addStringOption((o) => o.setName("option_b").setDescription("Second option").setRequired(true).setMaxLength(80)),
  new SlashCommandBuilder()
    .setName("remind")
    .setDescription("Create a simple reminder.")
    .addIntegerOption((o) => o.setName("minutes").setDescription("Minutes from now").setRequired(true).setMinValue(1).setMaxValue(10080))
    .addStringOption((o) => o.setName("text").setDescription("Reminder text").setRequired(true).setMaxLength(200)),
  new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Create a private support ticket channel."),
  new SlashCommandBuilder()
    .setName("note")
    .setDescription("Private notes saved by Aether.")
    .addSubcommand((s) => s.setName("add").setDescription("Add a private note").addStringOption((o) => o.setName("text").setDescription("Note").setRequired(true).setMaxLength(200)))
    .addSubcommand((s) => s.setName("list").setDescription("List your private notes"))
    .addSubcommand((s) => s.setName("remove").setDescription("Remove a note by number").addIntegerOption((o) => o.setName("number").setDescription("Note number").setRequired(true).setMinValue(1))),
  new SlashCommandBuilder()
    .setName("quote")
    .setDescription("Save and show server quotes.")
    .addSubcommand((s) => s.setName("add").setDescription("Add a quote").addStringOption((o) => o.setName("text").setDescription("Quote").setRequired(true).setMaxLength(300)))
    .addSubcommand((s) => s.setName("random").setDescription("Show a random quote"))
    .addSubcommand((s) => s.setName("list").setDescription("List recent quotes")),
  new SlashCommandBuilder().setName("inventory").setDescription("Show your collected items."),
  new SlashCommandBuilder()
    .setName("item")
    .setDescription("Use inventory items.")
    .addSubcommand((s) => s.setName("use").setDescription("Use an item by name").addStringOption((o) => o.setName("name").setDescription("Item name").setRequired(true).setMaxLength(80)))
    .addSubcommand((s) => s.setName("list").setDescription("List your items")),
  new SlashCommandBuilder().setName("fish").setDescription("Go fishing for coins and items."),
  new SlashCommandBuilder().setName("mine").setDescription("Mine for coins and items."),
  new SlashCommandBuilder().setName("hunt").setDescription("Go on a safe treasure hunt."),
  new SlashCommandBuilder().setName("lootbox").setDescription("Open a 200 coin lootbox."),
  new SlashCommandBuilder()
    .setName("pay")
    .setDescription("Send coins to another member.")
    .addUserOption((o) => o.setName("member").setDescription("Member").setRequired(true))
    .addIntegerOption((o) => o.setName("amount").setDescription("Coins").setRequired(true).setMinValue(1)),
  new SlashCommandBuilder()
    .setName("rob")
    .setDescription("Try to steal coins from another member.")
    .addUserOption((o) => o.setName("member").setDescription("Member").setRequired(true)),
  new SlashCommandBuilder().setName("shop").setDescription("View purchasable items.")
];

export const commands = data.map((command) => command.toJSON());

export async function handleCommand(interaction) {
  const name = interaction.commandName;
  if (!interaction.inGuild()) return interaction.reply({ content: "Use this command in a server.", ephemeral: true });

  if (ACTION_COMMANDS.includes(name)) return actionGif(interaction, name);
  if (name === "meme") return meme(interaction);
  if (name === "help") return help(interaction);
  if (name === "profile") return profile(interaction);
  if (["kick", "ban", "timeout", "untimeout", "purge", "slowmode", "lock", "unlock", "warn", "warnings", "clearwarnings"].includes(name)) return moderation(interaction);
  if (name === "birthday") return birthday(interaction);
  if (["rank", "leaderboard"].includes(name)) return levels(interaction);
  if (["coinflip", "dice", "rps", "trivia", "guess"].includes(name)) return games(interaction);
  if (["balance", "daily", "work", "bet", "slots", "blackjack", "pay", "rob", "shop"].includes(name)) return economy(interaction);
  if (name === "pet") return pets(interaction);
  if (name === "beast") return beasts(interaction);
  if (name === "clan") return clans(interaction);
  if (name === "utility") return utility(interaction);
  if (name === "config") return config(interaction);
  if (name === "social") return social(interaction);
  if (name === "wallet") return wallet(interaction);
  if (name === "poll") return poll(interaction);
  if (["buttonpoll", "wyr"].includes(name)) return interactivePoll(interaction);
  if (name === "remind") return remind(interaction);
  if (name === "ticket") return ticket(interaction);
  if (name === "note") return notes(interaction);
  if (name === "quote") return quotes(interaction);
  if (name === "item") return items(interaction);
  if (["inventory", "fish", "mine", "hunt", "lootbox"].includes(name)) return activities(interaction);
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function percentFromText(text) {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % 101;
}

function clanKey(name) {
  return name.trim().toLowerCase();
}

function addInventoryItem(guildId, userId, item, amount = 1) {
  const guild = ensureGuild(guildId);
  guild.inventories[userId] ??= {};
  guild.inventories[userId][item] = (guild.inventories[userId][item] ?? 0) + amount;
  return guild.inventories[userId];
}

function pickWeighted(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items.at(-1);
}

function checkCooldown(guild, userId, key, ms) {
  guild.cooldowns[userId] ??= {};
  const last = guild.cooldowns[userId][key] ?? 0;
  const remaining = ms - (Date.now() - last);
  if (remaining > 0) return Math.ceil(remaining / 1000);
  guild.cooldowns[userId][key] = Date.now();
  return 0;
}

function addPetXp(pet, amount) {
  pet.xp += amount;
  let leveled = false;
  while (pet.xp >= 100) {
    pet.xp -= 100;
    pet.level += 1;
    leveled = true;
  }
  return leveled;
}

function petGrade(level) {
  if (level >= 20) return "mythic";
  if (level >= 12) return "gold";
  if (level >= 6) return "silver";
  return "bronze";
}

function petImage(pet) {
  return `attachment://${petImageName(pet)}`;
}

function petImageName(pet) {
  return `pet-${pet.type}-${petGrade(pet.level)}.png`;
}

function petAttachment(pet) {
  return new AttachmentBuilder(path.join(ASSET_ROOT, "pets", petImageName(pet)), { name: petImageName(pet) });
}

function petGradeName(level) {
  const grade = petGrade(level);
  return grade[0].toUpperCase() + grade.slice(1);
}

function spawnBeast(guild, channelId) {
  const base = pick(MYTHICAL_BEASTS);
  const beast = {
    ...base,
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    maxHp: base.hp,
    hp: base.hp,
    channelId,
    spawnedAt: Date.now(),
    attackers: {}
  };
  guild.activeBeast = beast;
  return beast;
}

function beastEmbed(beast) {
  return new EmbedBuilder()
    .setColor(beast.color)
    .setTitle(`${beast.name} appeared`)
    .setDescription(`HP: **${Math.max(0, beast.hp)}/${beast.maxHp}**\nUse **/beast attack** with your pet to defeat it for rewards.`)
    .setImage(`attachment://${beastImageName(beast)}`);
}

function beastImageName(beast) {
  return `beast-${beast.file}.png`;
}

function beastAttachment(beast) {
  return new AttachmentBuilder(path.join(ASSET_ROOT, "beasts", beastImageName(beast)), { name: beastImageName(beast) });
}

async function help(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0x2f80ed)
    .setTitle("Aether Commands")
    .addFields(
      { name: "Administration", value: "`/kick` `/ban` `/timeout` `/untimeout` `/purge` `/slowmode` `/lock` `/unlock` `/warn` `/warnings` `/clearwarnings`" },
      { name: "Fun and GIFs", value: "`/hug` `/pat` `/slap` `/cry` `/dance` `/highfive` `/wave` `/cheer` `/boop` `/poke` `/smile` `/laugh` `/meme`" },
      { name: "Birthdays", value: "`/birthday set` `/birthday view` `/birthday remove` `/birthday today`" },
      { name: "Levels", value: "`/rank` `/leaderboard`" },
      { name: "Games", value: "`/coinflip` `/dice` `/rps` `/trivia` `/guess start` `/guess try`" },
      { name: "Gambling", value: "`/balance` `/daily` `/work` `/bet` `/slots` `/blackjack` `/pay` `/rob` `/shop`" },
      { name: "Pets and Clans", value: "`/pet adopt` `/pet train` `/pet adventure` `/pet attack` `/beast status` `/beast attack` `/clan create` `/clan join`" },
      { name: "Utilities", value: "`/utility ping` `/utility avatar` `/utility userinfo` `/utility serverinfo` `/utility choose` `/utility say` `/config`" },
      { name: "Profiles and Wallet", value: "`/profile` `/wallet view` `/wallet leaderboard` `/wallet daily` `/wallet work` `/wallet pay`" },
      { name: "Interactive", value: "`/buttonpoll` `/wyr` `/fish` `/mine` `/hunt` `/lootbox` `/inventory`" },
      { name: "More", value: "`/social 8ball` `/social friendship` `/social compliment` `/social joke` `/social fact` `/social rate` `/social reverse` `/social afk` `/poll` `/remind` `/ticket` `/note` `/quote`" }
    );
  await interaction.reply({ embeds: [embed] });
}

async function moderation(interaction) {
  const reason = interaction.options.getString("reason") ?? "No reason provided";
  const member = interaction.options.getMember("member");

  if (interaction.commandName === "kick") {
    if (!member) return interaction.reply({ content: "I could not find that member in this server.", ephemeral: true });
    if (!member?.kickable) return interaction.reply({ content: "I cannot kick that member.", ephemeral: true });
    await member.kick(reason);
    return interaction.reply(`Kicked ${member.user.tag}. Reason: ${reason}`);
  }

  if (interaction.commandName === "ban") {
    if (!member) return interaction.reply({ content: "I could not find that member in this server.", ephemeral: true });
    if (!member?.bannable) return interaction.reply({ content: "I cannot ban that member.", ephemeral: true });
    await member.ban({ reason });
    return interaction.reply(`Banned ${member.user.tag}. Reason: ${reason}`);
  }

  if (interaction.commandName === "timeout") {
    if (!member) return interaction.reply({ content: "I could not find that member in this server.", ephemeral: true });
    if (!member?.moderatable) return interaction.reply({ content: "I cannot timeout that member.", ephemeral: true });
    const minutes = interaction.options.getInteger("minutes");
    await member.timeout(minutes * 60_000, reason);
    return interaction.reply(`Timed out ${member.user.tag} for ${minutes} minute(s). Reason: ${reason}`);
  }

  if (interaction.commandName === "untimeout") {
    if (!member) return interaction.reply({ content: "I could not find that member in this server.", ephemeral: true });
    if (!member?.moderatable) return interaction.reply({ content: "I cannot update that member.", ephemeral: true });
    await member.timeout(null, reason);
    return interaction.reply(`Removed timeout from ${member.user.tag}.`);
  }

  if (interaction.commandName === "purge") {
    const amount = interaction.options.getInteger("amount");
    const deleted = await interaction.channel.bulkDelete(amount, true);
    return interaction.reply({ content: `Deleted ${deleted.size} message(s).`, ephemeral: true });
  }

  if (interaction.commandName === "slowmode") {
    const seconds = interaction.options.getInteger("seconds");
    await interaction.channel.setRateLimitPerUser(seconds);
    return interaction.reply(`Slowmode set to ${seconds} second(s).`);
  }

  if (interaction.commandName === "lock" || interaction.commandName === "unlock") {
    if (interaction.channel.type !== ChannelType.GuildText) return interaction.reply({ content: "This only works in text channels.", ephemeral: true });
    const locked = interaction.commandName === "lock";
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: locked ? false : null
    });
    return interaction.reply(locked ? "Channel locked." : "Channel unlocked.");
  }

  if (interaction.commandName === "warn") {
    if (!member) return interaction.reply({ content: "I could not find that member in this server.", ephemeral: true });
    const guild = ensureGuild(interaction.guildId);
    guild.warnings[member.id] ??= [];
    guild.warnings[member.id].push({
      reason,
      moderatorId: interaction.user.id,
      at: Date.now()
    });
    await saveDb();
    return interaction.reply(`Warned ${member.user.tag}. Reason: ${reason}`);
  }

  if (interaction.commandName === "warnings") {
    if (!member) return interaction.reply({ content: "I could not find that member in this server.", ephemeral: true });
    const guild = ensureGuild(interaction.guildId);
    const warnings = guild.warnings[member.id] ?? [];
    if (!warnings.length) return interaction.reply(`${member.user.tag} has no warnings.`);
    const lines = warnings.map((w, i) => `${i + 1}. ${w.reason} by <@${w.moderatorId}> <t:${Math.floor(w.at / 1000)}:R>`);
    return interaction.reply({ content: lines.join("\n"), ephemeral: true });
  }

  if (interaction.commandName === "clearwarnings") {
    if (!member) return interaction.reply({ content: "I could not find that member in this server.", ephemeral: true });
    const guild = ensureGuild(interaction.guildId);
    const count = guild.warnings[member.id]?.length ?? 0;
    delete guild.warnings[member.id];
    await saveDb();
    return interaction.reply(`Cleared ${count} warning(s) for ${member.user.tag}.`);
  }
}

async function actionGif(interaction, action) {
  const target = interaction.options.getUser("member");
  const embed = new EmbedBuilder().setColor(0xf06da8).setImage(pick(GIFS[action]));
  if (target) embed.setDescription(`${interaction.user} ${action}s ${target}`);
  else embed.setDescription(`${interaction.user} ${action}s`);
  await interaction.reply({ embeds: [embed] });
}

async function meme(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0xffcc4d)
    .setTitle("Random Meme")
    .setImage(pick(MEMES));
  await interaction.reply({ embeds: [embed] });
}

async function profile(interaction) {
  const user = interaction.options.getUser("member") ?? interaction.user;
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);
  const guild = ensureGuild(interaction.guildId);
  const { level, economy } = ensureMember(interaction.guildId, user.id);
  const pet = guild.pets[user.id];
  const clanKeyForUser = guild.clansByMember[user.id];
  const clan = clanKeyForUser ? guild.clans[clanKeyForUser] : null;
  const birthday = guild.birthdays[user.id] ?? "Not set";
  const warnings = guild.warnings[user.id]?.length ?? 0;

  const embed = new EmbedBuilder()
    .setColor(0x7c5cff)
    .setTitle(`${user.username}'s Aether Profile`)
    .setThumbnail(user.displayAvatarURL())
    .addFields(
      { name: "Level", value: `${level.level} (${level.xp}/${xpNeeded(level.level)} XP)`, inline: true },
      { name: "Wallet", value: formatCoins(economy.coins), inline: true },
      { name: "Birthday", value: birthday, inline: true },
      { name: "Pet", value: pet ? `${pet.name} the ${pet.type}, level ${pet.level}` : "No pet", inline: true },
      { name: "Clan", value: clan ? clan.name : "No clan", inline: true },
      { name: "Warnings", value: String(warnings), inline: true },
      { name: "Joined", value: member?.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>` : "Unknown", inline: true }
    );

  await interaction.reply({ embeds: [embed] });
}

async function birthday(interaction) {
  const guild = ensureGuild(interaction.guildId);
  const sub = interaction.options.getSubcommand();

  if (sub === "set") {
    const date = interaction.options.getString("date");
    if (!/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(date)) {
      return interaction.reply({ content: "Use `MM-DD`, for example `09-18`.", ephemeral: true });
    }
    guild.birthdays[interaction.user.id] = date;
    await saveDb();
    return interaction.reply({ content: `Saved your birthday as ${date}.`, ephemeral: true });
  }

  if (sub === "view") {
    const user = interaction.options.getUser("member") ?? interaction.user;
    const date = guild.birthdays[user.id];
    return interaction.reply(date ? `${user}'s birthday is ${date}.` : `${user} has no birthday saved.`);
  }

  if (sub === "remove") {
    delete guild.birthdays[interaction.user.id];
    await saveDb();
    return interaction.reply({ content: "Removed your birthday.", ephemeral: true });
  }

  if (sub === "today") {
    const now = new Date();
    const today = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const users = Object.entries(guild.birthdays).filter(([, date]) => date === today).map(([id]) => `<@${id}>`);
    return interaction.reply(users.length ? `Today's birthdays: ${users.join(", ")}` : "No birthdays saved for today.");
  }
}

async function levels(interaction) {
  const guild = ensureGuild(interaction.guildId);
  if (interaction.commandName === "rank") {
    const user = interaction.options.getUser("member") ?? interaction.user;
    const { level } = ensureMember(interaction.guildId, user.id);
    return interaction.reply(`${user} is level ${level.level} with ${level.xp}/${xpNeeded(level.level)} XP.`);
  }

  const top = Object.entries(guild.levels)
    .sort(([, a], [, b]) => b.level - a.level || b.xp - a.xp)
    .slice(0, 10)
    .map(([id, value], index) => `${index + 1}. <@${id}> - level ${value.level}, ${value.xp} XP`);
  return interaction.reply(top.length ? top.join("\n") : "No XP yet. Start chatting.");
}

async function games(interaction) {
  if (interaction.commandName === "coinflip") {
    const result = Math.random() < 0.5 ? "heads" : "tails";
    const choice = interaction.options.getString("choice");
    const suffix = choice ? (choice === result ? " You won." : " You lost.") : "";
    return interaction.reply(`The coin landed on **${result}**.${suffix}`);
  }

  if (interaction.commandName === "dice") {
    const sides = interaction.options.getInteger("sides") ?? 6;
    return interaction.reply(`You rolled **${Math.floor(Math.random() * sides) + 1}** on a d${sides}.`);
  }

  if (interaction.commandName === "rps") {
    const choices = ["rock", "paper", "scissors"];
    const user = interaction.options.getString("choice");
    const bot = pick(choices);
    const win = (user === "rock" && bot === "scissors") || (user === "paper" && bot === "rock") || (user === "scissors" && bot === "paper");
    const result = user === bot ? "Tie." : win ? "You win." : "I win.";
    return interaction.reply(`You chose **${user}**, I chose **${bot}**. ${result}`);
  }

  if (interaction.commandName === "trivia") {
    const item = pick(TRIVIA);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`trivia:${interaction.user.id}:${item.a}`).setLabel("Show Answer").setStyle(ButtonStyle.Primary)
    );
    return interaction.reply({ content: `Trivia: **${item.q}**`, components: [row] });
  }

  if (interaction.commandName === "guess") {
    const guild = ensureGuild(interaction.guildId);
    const sub = interaction.options.getSubcommand();
    if (sub === "start") {
      guild.numberGames[interaction.user.id] = { number: Math.floor(Math.random() * 100) + 1, tries: 0 };
      await saveDb();
      return interaction.reply("I picked a number from 1 to 100. Use `/guess try`.");
    }
    const game = guild.numberGames[interaction.user.id];
    if (!game) return interaction.reply({ content: "Start a game first with `/guess start`.", ephemeral: true });
    const guess = interaction.options.getInteger("number");
    game.tries += 1;
    if (guess === game.number) {
      delete guild.numberGames[interaction.user.id];
      addCoins(interaction.guildId, interaction.user.id, 75);
      await saveDb();
      return interaction.reply(`Correct in ${game.tries} tries. You won 75 coins.`);
    }
    await saveDb();
    return interaction.reply(guess < game.number ? "Higher." : "Lower.");
  }
}

async function economy(interaction) {
  const { economy: wallet } = ensureMember(interaction.guildId, interaction.user.id);

  if (interaction.commandName === "balance") {
    return interaction.reply(`You have ${formatCoins(wallet.coins)}.`);
  }

  if (interaction.commandName === "daily") {
    const day = 24 * 60 * 60 * 1000;
    if (Date.now() - wallet.lastDaily < day) return interaction.reply({ content: "You already claimed daily coins. Try again later.", ephemeral: true });
    wallet.lastDaily = Date.now();
    wallet.coins += 500;
    await saveDb();
    return interaction.reply(`Claimed 500 coins. Balance: ${formatCoins(wallet.coins)}.`);
  }

  if (interaction.commandName === "work") {
    const amount = 50 + Math.floor(Math.random() * 151);
    wallet.coins += amount;
    await saveDb();
    return interaction.reply(`You ${pick(WORK_REPLIES)} and earned ${formatCoins(amount)}. Balance: ${formatCoins(wallet.coins)}.`);
  }

  if (interaction.commandName === "shop") {
    const lines = SHOP_ITEMS.map((item) => `**${item.name}** - ${formatCoins(item.price)}: ${item.desc}`);
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x2ecc71).setTitle("Shop").setDescription(lines.join("\n"))] });
  }

  if (interaction.commandName === "pay") {
    const target = interaction.options.getUser("member");
    const amount = interaction.options.getInteger("amount");
    if (target.bot || target.id === interaction.user.id) return interaction.reply({ content: "Choose another human member.", ephemeral: true });
    if (wallet.coins < amount) return interaction.reply({ content: "You do not have enough coins.", ephemeral: true });
    const { economy: targetWallet } = ensureMember(interaction.guildId, target.id);
    wallet.coins -= amount;
    targetWallet.coins += amount;
    await saveDb();
    return interaction.reply(`Sent ${formatCoins(amount)} to ${target}. Your balance: ${formatCoins(wallet.coins)}.`);
  }

  if (interaction.commandName === "rob") {
    const target = interaction.options.getUser("member");
    if (target.bot || target.id === interaction.user.id) return interaction.reply({ content: "Choose another human member.", ephemeral: true });
    const { economy: targetWallet } = ensureMember(interaction.guildId, target.id);
    if (targetWallet.coins < 100) return interaction.reply({ content: "That member does not have enough coins to rob.", ephemeral: true });
    const success = Math.random() < 0.35;
    const amount = success ? Math.min(targetWallet.coins, 50 + Math.floor(Math.random() * 201)) : 75 + Math.floor(Math.random() * 126);
    if (success) {
      targetWallet.coins -= amount;
      wallet.coins += amount;
    } else {
      wallet.coins = Math.max(0, wallet.coins - amount);
    }
    await saveDb();
    return interaction.reply(success ? `You stole ${formatCoins(amount)} from ${target}.` : `Robbery failed and you paid ${formatCoins(amount)} as a fine.`);
  }

  const amount = interaction.options.getInteger("amount");
  if (wallet.coins < amount) return interaction.reply({ content: "You do not have enough coins.", ephemeral: true });

  if (interaction.commandName === "bet") {
    const choice = interaction.options.getString("choice");
    const result = Math.random() < 0.5 ? "heads" : "tails";
    const won = choice === result;
    wallet.coins += won ? amount : -amount;
    await saveDb();
    return interaction.reply(`Coin landed **${result}**. ${won ? `You won ${formatCoins(amount)}.` : `You lost ${formatCoins(amount)}.`} Balance: ${formatCoins(wallet.coins)}.`);
  }

  if (interaction.commandName === "slots") {
    const icons = ["cherry", "lemon", "diamond", "seven"];
    const roll = [pick(icons), pick(icons), pick(icons)];
    const multiplier = roll.every((x) => x === roll[0]) ? 5 : new Set(roll).size === 2 ? 2 : 0;
    wallet.coins += multiplier ? amount * multiplier : -amount;
    await saveDb();
    return interaction.reply(`Slots: **${roll.join(" | ")}**. ${multiplier ? `You won ${formatCoins(amount * multiplier)}.` : `You lost ${formatCoins(amount)}.`} Balance: ${formatCoins(wallet.coins)}.`);
  }

  if (interaction.commandName === "blackjack") {
    const draw = () => Math.min(10, Math.floor(Math.random() * 13) + 1);
    const player = draw() + draw();
    const dealer = draw() + draw();
    const won = player <= 21 && (dealer > 21 || player > dealer);
    const tied = player === dealer;
    wallet.coins += tied ? 0 : won ? amount : -amount;
    await saveDb();
    return interaction.reply(`Blackjack: you **${player}**, dealer **${dealer}**. ${tied ? "Push." : won ? `You won ${formatCoins(amount)}.` : `You lost ${formatCoins(amount)}.`} Balance: ${formatCoins(wallet.coins)}.`);
  }
}

async function pets(interaction) {
  const guild = ensureGuild(interaction.guildId);
  const sub = interaction.options.getSubcommand();
  const pet = guild.pets[interaction.user.id];

  if (sub === "adopt") {
    if (pet) return interaction.reply({ content: "You already have a pet. Use `/pet profile`.", ephemeral: true });
    const type = interaction.options.getString("type");
    const name = interaction.options.getString("name").trim();
    const cost = PET_COSTS[type];
    const { economy: wallet } = ensureMember(interaction.guildId, interaction.user.id);
    if (wallet.coins < cost) return interaction.reply({ content: `A ${type} costs ${formatCoins(cost)}. You need more coins.`, ephemeral: true });
    wallet.coins -= cost;
    guild.pets[interaction.user.id] = {
      name,
      type,
      level: 1,
      xp: 0,
      hunger: 70,
      happiness: 70,
      attacksUsed: 0,
      adoptedAt: Date.now()
    };
    await saveDb();
    const embed = new EmbedBuilder()
      .setColor(PET_ATTACKS[type].color)
      .setTitle(`You adopted ${name} the ${type}`)
      .setDescription(`Grade: **Bronze**\nSpecial attack: **${PET_ATTACKS[type].name}**\nBalance: ${formatCoins(wallet.coins)}`)
      .setImage(petImage(guild.pets[interaction.user.id]));
    return interaction.reply({ embeds: [embed], files: [petAttachment(guild.pets[interaction.user.id])] });
  }

  if (!pet) return interaction.reply({ content: "You do not have a pet yet. Use `/pet adopt`.", ephemeral: true });

  if (sub === "profile") {
    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle(`${pet.name} the ${pet.type}`)
      .setImage(petImage(pet))
      .addFields(
        { name: "Grade", value: petGradeName(pet.level), inline: true },
        { name: "Level", value: String(pet.level), inline: true },
        { name: "XP", value: `${pet.xp}/100`, inline: true },
        { name: "Hunger", value: `${pet.hunger}/100`, inline: true },
        { name: "Happiness", value: `${pet.happiness}/100`, inline: true },
        { name: "Special Attack", value: PET_ATTACKS[pet.type]?.name ?? "Mystery Move", inline: true },
        { name: "Attacks Used", value: String(pet.attacksUsed ?? 0), inline: true },
        { name: "Adopted", value: `<t:${Math.floor(pet.adoptedAt / 1000)}:R>`, inline: true }
      );
    return interaction.reply({ embeds: [embed], files: [petAttachment(pet)] });
  }

  if (sub === "feed" || sub === "play" || sub === "train" || sub === "adventure") {
    if (sub === "feed") pet.hunger = Math.min(100, pet.hunger + 25);
    if (sub === "play") pet.happiness = Math.min(100, pet.happiness + 25);
    if (sub === "train") {
      pet.hunger = Math.max(0, pet.hunger - 10);
      pet.happiness = Math.max(0, pet.happiness - 5);
    }
    if (sub === "adventure") {
      pet.hunger = Math.max(0, pet.hunger - 15);
      pet.happiness = Math.max(0, pet.happiness - 10);
      const reward = 40 + Math.floor(Math.random() * 121);
      addCoins(interaction.guildId, interaction.user.id, reward);
      if (Math.random() < 0.25) addInventoryItem(interaction.guildId, interaction.user.id, "pet souvenir");
    }
    addPetXp(pet, sub === "train" ? 35 : sub === "adventure" ? 30 : 20);
    await saveDb();
    if (sub === "feed") return interaction.reply(`You fed **${pet.name}**. Level ${pet.level}, XP ${pet.xp}/100.`);
    if (sub === "play") return interaction.reply(`You played with **${pet.name}**. Level ${pet.level}, XP ${pet.xp}/100.`);
    if (sub === "train") return interaction.reply(`You trained **${pet.name}**. Level ${pet.level}, XP ${pet.xp}/100.`);
    return interaction.reply(`**${pet.name}** went adventuring and came back stronger. Level ${pet.level}, XP ${pet.xp}/100.`);
  }

  if (sub === "attack") {
    const cooldown = checkCooldown(guild, interaction.user.id, "petAttack", 45_000);
    if (cooldown) return interaction.reply({ content: `Your pet needs ${cooldown}s to recharge their special attack.`, ephemeral: true });

    const target = interaction.options.getUser("target");
    const attack = PET_ATTACKS[pet.type] ?? PET_ATTACKS.cat;
    const power = Math.floor(20 + pet.level * 7 + Math.random() * 45);
    const reward = 25 + Math.floor(power / 2);
    pet.hunger = Math.max(0, pet.hunger - 8);
    pet.happiness = Math.min(100, pet.happiness + 6);
    pet.attacksUsed = (pet.attacksUsed ?? 0) + 1;
    const leveled = addPetXp(pet, 28);
    addCoins(interaction.guildId, interaction.user.id, reward);
    if (Math.random() < 0.2) addInventoryItem(interaction.guildId, interaction.user.id, attack.item);
    await saveDb();

    const targetText = target ? ` toward ${target}` : " at the training dummy";
    const embed = new EmbedBuilder()
      .setColor(attack.color)
      .setTitle(`${pet.name} used ${attack.name}`)
      .setDescription(`**${pet.name}** ${attack.verb}${targetText}.\nPower: **${power}**\nReward: ${formatCoins(reward)}${leveled ? `\nLevel up. ${pet.name} is now level ${pet.level} and ${petGradeName(pet.level)} grade.` : ""}`)
      .setImage(petImage(pet));
    return interaction.reply({ embeds: [embed], files: [petAttachment(pet)] });
  }

  if (sub === "rename") {
    pet.name = interaction.options.getString("name").trim();
    await saveDb();
    return interaction.reply(`Your pet is now named **${pet.name}**.`);
  }

  if (sub === "leaderboard") {
    const top = Object.entries(guild.pets)
      .sort(([, a], [, b]) => b.level - a.level || b.xp - a.xp)
      .slice(0, 10)
      .map(([id, value], i) => `${i + 1}. <@${id}> - **${value.name}** the ${value.type}, level ${value.level}`);
    return interaction.reply(top.length ? top.join("\n") : "No pets yet.");
  }
}

async function beasts(interaction) {
  const guild = ensureGuild(interaction.guildId);
  const sub = interaction.options.getSubcommand();
  const beast = guild.activeBeast;

  if (sub === "status") {
    if (!beast) return interaction.reply("No mythical beast is active right now. Keep chatting and one may appear.");
    return interaction.reply({ embeds: [beastEmbed(beast)], files: [beastAttachment(beast)] });
  }

  if (!beast) return interaction.reply({ content: "There is no mythical beast to attack right now.", ephemeral: true });

  const pet = guild.pets[interaction.user.id];
  if (!pet) return interaction.reply({ content: "You need a pet first. Use `/pet adopt`.", ephemeral: true });

  const cooldown = checkCooldown(guild, interaction.user.id, "beastAttack", 30_000);
  if (cooldown) return interaction.reply({ content: `Your pet needs ${cooldown}s before attacking a beast again.`, ephemeral: true });

  const attack = PET_ATTACKS[pet.type] ?? PET_ATTACKS.cat;
  const gradeBonus = { bronze: 1, silver: 1.2, gold: 1.45, mythic: 1.8 }[petGrade(pet.level)];
  const damage = Math.floor((35 + pet.level * 8 + Math.random() * 55) * gradeBonus);
  beast.hp -= damage;
  beast.attackers[interaction.user.id] = (beast.attackers[interaction.user.id] ?? 0) + damage;
  pet.hunger = Math.max(0, pet.hunger - 12);
  pet.happiness = Math.min(100, pet.happiness + 5);
  const leveled = addPetXp(pet, 34);

  if (beast.hp > 0) {
    await saveDb();
    const embed = new EmbedBuilder()
      .setColor(beast.color)
      .setTitle(`${pet.name} used ${attack.name}`)
      .setDescription(`Damage: **${damage}**\n${beast.name} HP: **${beast.hp}/${beast.maxHp}**${leveled ? `\n${pet.name} leveled up to ${pet.level} and is ${petGradeName(pet.level)} grade.` : ""}`)
      .setImage(petImage(pet));
    return interaction.reply({ embeds: [embed], files: [petAttachment(pet)] });
  }

  const contributors = Object.entries(beast.attackers).sort(([, a], [, b]) => b - a);
  const totalDamage = contributors.reduce((sum, [, dealt]) => sum + dealt, 0) || 1;
  for (const [userId, dealt] of contributors) {
    const share = Math.max(60, Math.floor(beast.reward * (dealt / totalDamage)));
    addCoins(interaction.guildId, userId, share);
    addInventoryItem(interaction.guildId, userId, beast.item);
  }
  const winnerLines = contributors.slice(0, 5).map(([userId, dealt], index) => `${index + 1}. <@${userId}> - ${dealt} damage`);
  guild.activeBeast = null;
  await saveDb();

  const embed = new EmbedBuilder()
    .setColor(beast.color)
    .setTitle(`${beast.name} defeated`)
    .setDescription(`Final hit by ${interaction.user} using **${pet.name}**.\nRewards: coins split by damage and **${beast.item}** for contributors.\n\n${winnerLines.join("\n")}`)
    .setImage(`attachment://${beastImageName(beast)}`);
  return interaction.reply({ embeds: [embed], files: [beastAttachment(beast)] });
}

async function clans(interaction) {
  const guild = ensureGuild(interaction.guildId);
  const sub = interaction.options.getSubcommand();
  const currentClan = guild.clansByMember[interaction.user.id];

  if (sub === "create") {
    if (currentClan) return interaction.reply({ content: "Leave your current clan first.", ephemeral: true });
    const name = interaction.options.getString("name").trim();
    const key = clanKey(name);
    if (guild.clans[key]) return interaction.reply({ content: "A clan with that name already exists.", ephemeral: true });
    const { economy: wallet } = ensureMember(interaction.guildId, interaction.user.id);
    if (wallet.coins < 1000) return interaction.reply({ content: "Creating a clan costs 1,000 coins.", ephemeral: true });
    wallet.coins -= 1000;
    guild.clans[key] = { name, ownerId: interaction.user.id, members: [interaction.user.id], bank: 0, xp: 0, createdAt: Date.now() };
    guild.clansByMember[interaction.user.id] = key;
    await saveDb();
    return interaction.reply(`Created clan **${name}**.`);
  }

  if (sub === "join") {
    if (currentClan) return interaction.reply({ content: "Leave your current clan first.", ephemeral: true });
    const key = clanKey(interaction.options.getString("name"));
    const clan = guild.clans[key];
    if (!clan) return interaction.reply({ content: "I could not find that clan.", ephemeral: true });
    clan.members.push(interaction.user.id);
    guild.clansByMember[interaction.user.id] = key;
    await saveDb();
    return interaction.reply(`Joined clan **${clan.name}**.`);
  }

  if (sub === "leave") {
    if (!currentClan) return interaction.reply({ content: "You are not in a clan.", ephemeral: true });
    const clan = guild.clans[currentClan];
    clan.members = clan.members.filter((id) => id !== interaction.user.id);
    delete guild.clansByMember[interaction.user.id];
    if (!clan.members.length) delete guild.clans[currentClan];
    else if (clan.ownerId === interaction.user.id) clan.ownerId = clan.members[0];
    await saveDb();
    return interaction.reply(`Left clan **${clan.name}**.`);
  }

  if (sub === "deposit") {
    if (!currentClan) return interaction.reply({ content: "You are not in a clan.", ephemeral: true });
    const amount = interaction.options.getInteger("amount");
    const { economy: wallet } = ensureMember(interaction.guildId, interaction.user.id);
    if (wallet.coins < amount) return interaction.reply({ content: "You do not have enough coins.", ephemeral: true });
    wallet.coins -= amount;
    guild.clans[currentClan].bank += amount;
    guild.clans[currentClan].xp += Math.floor(amount / 10);
    await saveDb();
    return interaction.reply(`Deposited ${formatCoins(amount)} to **${guild.clans[currentClan].name}**.`);
  }

  if (sub === "profile") {
    const requested = interaction.options.getString("name");
    const key = requested ? clanKey(requested) : currentClan;
    if (!key || !guild.clans[key]) return interaction.reply({ content: "Clan not found.", ephemeral: true });
    const clan = guild.clans[key];
    const embed = new EmbedBuilder()
      .setColor(0xe67e22)
      .setTitle(clan.name)
      .addFields(
        { name: "Owner", value: `<@${clan.ownerId}>`, inline: true },
        { name: "Members", value: String(clan.members.length), inline: true },
        { name: "Bank", value: formatCoins(clan.bank), inline: true },
        { name: "XP", value: String(clan.xp), inline: true }
      )
      .setDescription(clan.members.slice(0, 20).map((id) => `<@${id}>`).join(", "));
    return interaction.reply({ embeds: [embed] });
  }

  if (sub === "leaderboard") {
    const top = Object.values(guild.clans)
      .sort((a, b) => b.xp - a.xp || b.bank - a.bank)
      .slice(0, 10)
      .map((clan, i) => `${i + 1}. **${clan.name}** - ${clan.xp} XP, ${formatCoins(clan.bank)}, ${clan.members.length} member(s)`);
    return interaction.reply(top.length ? top.join("\n") : "No clans yet.");
  }
}

async function utility(interaction) {
  const sub = interaction.options.getSubcommand();

  if (sub === "ping") return interaction.reply(`Pong. WebSocket latency: ${interaction.client.ws.ping}ms.`);

  if (sub === "avatar") {
    const user = interaction.options.getUser("member") ?? interaction.user;
    return interaction.reply(user.displayAvatarURL({ size: 1024 }));
  }

  if (sub === "userinfo") {
    const member = interaction.options.getMember("member") ?? interaction.member;
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(member.user.tag)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: "ID", value: member.id, inline: true },
        { name: "Account Created", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:D>`, inline: true },
        { name: "Joined Server", value: member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>` : "Unknown", inline: true }
      );
    return interaction.reply({ embeds: [embed] });
  }

  if (sub === "serverinfo") {
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(interaction.guild.name)
      .setThumbnail(interaction.guild.iconURL())
      .addFields(
        { name: "Members", value: String(interaction.guild.memberCount), inline: true },
        { name: "Channels", value: String(interaction.guild.channels.cache.size), inline: true },
        { name: "Roles", value: String(interaction.guild.roles.cache.size), inline: true },
        { name: "Created", value: `<t:${Math.floor(interaction.guild.createdTimestamp / 1000)}:D>`, inline: true }
      );
    return interaction.reply({ embeds: [embed] });
  }

  if (sub === "choose") {
    const options = interaction.options.getString("options").split(",").map((x) => x.trim()).filter(Boolean);
    if (options.length < 2) return interaction.reply({ content: "Give me at least two comma-separated options.", ephemeral: true });
    return interaction.reply(`I choose: **${pick(options)}**`);
  }

  if (sub === "say") {
    const message = interaction.options.getString("message");
    await interaction.reply({ content: "Sent.", ephemeral: true });
    return interaction.channel.send(message);
  }
}

async function config(interaction) {
  const guild = ensureGuild(interaction.guildId);
  const sub = interaction.options.getSubcommand();

  if (sub === "view") {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Aether Config")
      .addFields(
        { name: "Welcome", value: guild.config.welcomeChannelId ? `<#${guild.config.welcomeChannelId}>` : "Disabled", inline: true },
        { name: "Logs", value: guild.config.logChannelId ? `<#${guild.config.logChannelId}>` : "Disabled", inline: true },
        { name: "Birthdays", value: guild.config.birthdayChannelId ? `<#${guild.config.birthdayChannelId}>` : "Disabled", inline: true },
        { name: "Passive Chat XP", value: guild.config.messageXpEnabled ? "Enabled" : "Disabled", inline: true }
      );
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (sub === "welcome" || sub === "logs" || sub === "birthdays") {
    const channel = interaction.options.getChannel("channel");
    const key = sub === "welcome" ? "welcomeChannelId" : sub === "logs" ? "logChannelId" : "birthdayChannelId";
    guild.config[key] = channel.id;
    await saveDb();
    return interaction.reply({ content: `${sub} channel set to ${channel}.`, ephemeral: true });
  }

  if (sub === "xp") {
    const mode = interaction.options.getString("mode");
    guild.config.messageXpEnabled = mode === "enable";
    await saveDb();
    return interaction.reply({ content: `Passive chat XP ${guild.config.messageXpEnabled ? "enabled" : "disabled"}.`, ephemeral: true });
  }

  if (sub === "disable") {
    const feature = interaction.options.getString("feature");
    const key = feature === "welcome" ? "welcomeChannelId" : feature === "logs" ? "logChannelId" : "birthdayChannelId";
    guild.config[key] = null;
    await saveDb();
    return interaction.reply({ content: `${feature} automation disabled.`, ephemeral: true });
  }
}

async function social(interaction) {
  const sub = interaction.options.getSubcommand();

  if (sub === "8ball") return interaction.reply(pick(MAGIC_8));

  if (sub === "friendship") {
    const first = interaction.options.getUser("first");
    const second = interaction.options.getUser("second") ?? interaction.user;
    const score = percentFromText([first.id, second.id].sort().join(":"));
    return interaction.reply(`${first} and ${second}: **${score}%** friendship energy.`);
  }

  if (sub === "compliment") {
    const user = interaction.options.getUser("member") ?? interaction.user;
    return interaction.reply(`${user}, ${pick(COMPLIMENTS)}`);
  }

  if (sub === "joke") return interaction.reply(pick(JOKES));

  if (sub === "fact") return interaction.reply(pick(FACTS));

  if (sub === "rate") {
    const thing = interaction.options.getString("thing");
    return interaction.reply(`I rate **${thing}** ${percentFromText(thing)}/100.`);
  }

  if (sub === "reverse") {
    const text = interaction.options.getString("text");
    return interaction.reply([...text].reverse().join(""));
  }

  if (sub === "afk") {
    const guild = ensureGuild(interaction.guildId);
    guild.afk[interaction.user.id] = { reason: interaction.options.getString("reason") ?? "AFK", at: Date.now() };
    await saveDb();
    return interaction.reply({ content: "AFK status set.", ephemeral: true });
  }
}

async function wallet(interaction) {
  const sub = interaction.options.getSubcommand();
  const guild = ensureGuild(interaction.guildId);
  const { economy } = ensureMember(interaction.guildId, interaction.user.id);

  if (sub === "view") {
    const user = interaction.options.getUser("member") ?? interaction.user;
    const { economy: walletToView } = ensureMember(interaction.guildId, user.id);
    return interaction.reply(`${user} has ${formatCoins(walletToView.coins)}.`);
  }

  if (sub === "leaderboard") {
    const top = Object.entries(guild.economy)
      .sort(([, a], [, b]) => b.coins - a.coins)
      .slice(0, 10)
      .map(([id, value], i) => `${i + 1}. <@${id}> - ${formatCoins(value.coins)}`);
    return interaction.reply(top.length ? top.join("\n") : "No wallet data yet.");
  }

  if (sub === "daily") {
    const day = 24 * 60 * 60 * 1000;
    if (Date.now() - economy.lastDaily < day) return interaction.reply({ content: "You already claimed daily coins. Try again later.", ephemeral: true });
    economy.lastDaily = Date.now();
    economy.coins += 500;
    await saveDb();
    return interaction.reply(`Claimed 500 coins. Balance: ${formatCoins(economy.coins)}.`);
  }

  if (sub === "work") {
    const amount = 50 + Math.floor(Math.random() * 151);
    economy.coins += amount;
    await saveDb();
    return interaction.reply(`You ${pick(WORK_REPLIES)} and earned ${formatCoins(amount)}. Balance: ${formatCoins(economy.coins)}.`);
  }

  if (sub === "pay") {
    const target = interaction.options.getUser("member");
    const amount = interaction.options.getInteger("amount");
    if (target.bot || target.id === interaction.user.id) return interaction.reply({ content: "Choose another human member.", ephemeral: true });
    if (economy.coins < amount) return interaction.reply({ content: "You do not have enough coins.", ephemeral: true });
    const { economy: targetWallet } = ensureMember(interaction.guildId, target.id);
    economy.coins -= amount;
    targetWallet.coins += amount;
    await saveDb();
    return interaction.reply(`Sent ${formatCoins(amount)} to ${target}. Your balance: ${formatCoins(economy.coins)}.`);
  }
}

async function poll(interaction) {
  const question = interaction.options.getString("question");
  const message = await interaction.reply({ content: `Poll: **${question}**\nReact with yes or no.`, fetchReply: true });
  await message.react("👍");
  await message.react("👎");
}

async function interactivePoll(interaction) {
  const guild = ensureGuild(interaction.guildId);
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  const isWyr = interaction.commandName === "wyr";
  const question = isWyr ? "Would you rather..." : interaction.options.getString("question");
  const optionA = interaction.options.getString("option_a");
  const optionB = interaction.options.getString("option_b");

  guild.buttonPolls[id] = {
    question,
    optionA,
    optionB,
    votes: {},
    createdBy: interaction.user.id,
    createdAt: Date.now()
  };
  await saveDb();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`poll:${id}:a`).setLabel(optionA).setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`poll:${id}:b`).setLabel(optionB).setStyle(ButtonStyle.Secondary)
  );
  await interaction.reply({ embeds: [pollEmbed(guild.buttonPolls[id])], components: [row] });
}

function pollEmbed(pollData) {
  const votes = Object.values(pollData.votes);
  const aVotes = votes.filter((vote) => vote === "a").length;
  const bVotes = votes.filter((vote) => vote === "b").length;
  const total = votes.length || 1;
  return new EmbedBuilder()
    .setColor(0x00a8ff)
    .setTitle(pollData.question)
    .setDescription(`A: **${pollData.optionA}** - ${aVotes} vote(s), ${Math.round((aVotes / total) * 100)}%\nB: **${pollData.optionB}** - ${bVotes} vote(s), ${Math.round((bVotes / total) * 100)}%`)
    .setFooter({ text: "Click a button to vote. You can change your vote." });
}

async function remind(interaction) {
  const minutes = interaction.options.getInteger("minutes");
  const text = interaction.options.getString("text");
  const guild = ensureGuild(interaction.guildId);
  guild.reminders.push({ userId: interaction.user.id, channelId: interaction.channelId, text, dueAt: Date.now() + minutes * 60_000 });
  await saveDb();
  return interaction.reply({ content: `Reminder set for ${minutes} minute(s) from now.`, ephemeral: true });
}

async function ticket(interaction) {
  const name = `ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 90);
  const channel = await interaction.guild.channels.create({
    name,
    type: ChannelType.GuildText,
    permissionOverwrites: [
      { id: interaction.guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] }
    ]
  });
  await interaction.reply({ content: `Created ${channel}.`, ephemeral: true });
  await channel.send(`${interaction.user}, your ticket is ready. A staff member can join this channel if permissions allow it.`);
}

async function notes(interaction) {
  const guild = ensureGuild(interaction.guildId);
  const sub = interaction.options.getSubcommand();
  guild.notes[interaction.user.id] ??= [];
  const userNotes = guild.notes[interaction.user.id];

  if (sub === "add") {
    userNotes.push({ text: interaction.options.getString("text"), at: Date.now() });
    await saveDb();
    return interaction.reply({ content: `Saved note #${userNotes.length}.`, ephemeral: true });
  }

  if (sub === "list") {
    if (!userNotes.length) return interaction.reply({ content: "You do not have any notes.", ephemeral: true });
    const lines = userNotes.map((note, index) => `${index + 1}. ${note.text}`);
    return interaction.reply({ content: lines.join("\n"), ephemeral: true });
  }

  if (sub === "remove") {
    const index = interaction.options.getInteger("number") - 1;
    if (!userNotes[index]) return interaction.reply({ content: "That note number does not exist.", ephemeral: true });
    userNotes.splice(index, 1);
    await saveDb();
    return interaction.reply({ content: "Note removed.", ephemeral: true });
  }
}

async function quotes(interaction) {
  const guild = ensureGuild(interaction.guildId);
  const sub = interaction.options.getSubcommand();

  if (sub === "add") {
    guild.quotes.push({ text: interaction.options.getString("text"), authorId: interaction.user.id, at: Date.now() });
    await saveDb();
    return interaction.reply("Quote saved.");
  }

  if (sub === "random") {
    if (!guild.quotes.length) return interaction.reply("No quotes saved yet.");
    const quote = pick(guild.quotes);
    return interaction.reply(`"${quote.text}"\n- added by <@${quote.authorId}>`);
  }

  if (sub === "list") {
    if (!guild.quotes.length) return interaction.reply("No quotes saved yet.");
    const lines = guild.quotes.slice(-10).map((quote, index) => `${index + 1}. "${quote.text}"`);
    return interaction.reply(lines.join("\n"));
  }
}

async function items(interaction) {
  const guild = ensureGuild(interaction.guildId);
  const sub = interaction.options.getSubcommand();
  guild.inventories[interaction.user.id] ??= {};
  const inventory = guild.inventories[interaction.user.id];

  if (sub === "list") {
    const entries = Object.entries(inventory).filter(([, count]) => count > 0);
    if (!entries.length) return interaction.reply({ content: "Your inventory is empty.", ephemeral: true });
    return interaction.reply(entries.map(([item, count]) => `**${item}** x${count}`).join("\n"));
  }

  const item = interaction.options.getString("name").trim().toLowerCase();
  if (!inventory[item]) return interaction.reply({ content: `You do not have **${item}**.`, ephemeral: true });

  const pet = guild.pets[interaction.user.id];
  const { level, economy } = ensureMember(interaction.guildId, interaction.user.id);
  const consume = () => {
    inventory[item] -= 1;
    if (inventory[item] <= 0) delete inventory[item];
  };

  if (item === "common gem") {
    consume();
    economy.coins += 150;
    await saveDb();
    return interaction.reply(`Used **common gem** and gained ${formatCoins(150)}.`);
  }

  if (item === "silver key") {
    consume();
    const reward = pickWeighted(LOOT_TABLE);
    economy.coins += reward.coins;
    addInventoryItem(interaction.guildId, interaction.user.id, reward.item);
    await saveDb();
    return interaction.reply(`Used **silver key** and found **${reward.item}** plus ${formatCoins(reward.coins)}.`);
  }

  if (item === "golden badge") {
    consume();
    level.xp += 160;
    let leveled = false;
    while (level.xp >= xpNeeded(level.level)) {
      level.xp -= xpNeeded(level.level);
      level.level += 1;
      leveled = true;
    }
    await saveDb();
    return interaction.reply(`Used **golden badge** for 160 profile XP.${leveled ? ` You are now level ${level.level}.` : ""}`);
  }

  if (item === "mythic token") {
    if (guild.activeBeast) return interaction.reply({ content: "A mythical beast is already active.", ephemeral: true });
    consume();
    const beast = spawnBeast(guild, interaction.channelId);
    await saveDb();
    return interaction.reply({ content: "The mythic token cracked open a rift.", embeds: [beastEmbed(beast)], files: [beastAttachment(beast)] });
  }

  if (item === "aether crystal" || item === "pet souvenir" || item.endsWith("charm") || item.endsWith("medal") || item.endsWith("badge") || item.includes("scale") || item.includes("feather") || item.includes("shard") || item.includes("plume") || item.includes("token")) {
    if (!pet) return interaction.reply({ content: "You need a pet to use that item.", ephemeral: true });
    consume();
    pet.hunger = Math.min(100, pet.hunger + 10);
    pet.happiness = Math.min(100, pet.happiness + 15);
    const leveled = addPetXp(pet, item === "aether crystal" ? 120 : item === "mythic token" ? 160 : 70);
    await saveDb();
    return interaction.reply(`Used **${item}** on **${pet.name}**. ${pet.name} gained pet XP.${leveled ? ` New level: ${pet.level}, grade: ${petGradeName(pet.level)}.` : ""}`);
  }

  consume();
  economy.coins += 75;
  await saveDb();
  return interaction.reply(`Used **${item}** and converted its old magic into ${formatCoins(75)}.`);
}

async function activities(interaction) {
  const guild = ensureGuild(interaction.guildId);
  const { economy } = ensureMember(interaction.guildId, interaction.user.id);
  const name = interaction.commandName;

  if (name === "inventory") {
    const inventory = guild.inventories[interaction.user.id] ?? {};
    const entries = Object.entries(inventory).filter(([, count]) => count > 0);
    if (!entries.length) return interaction.reply({ content: "Your inventory is empty. Try `/fish`, `/mine`, `/hunt`, or `/lootbox`.", ephemeral: true });
    return interaction.reply(entries.map(([item, count]) => `**${item}** x${count}`).join("\n"));
  }

  if (name === "lootbox") {
    if (economy.coins < 200) return interaction.reply({ content: "A lootbox costs 200 coins.", ephemeral: true });
    economy.coins -= 200;
    const reward = pickWeighted(LOOT_TABLE);
    economy.coins += reward.coins;
    addInventoryItem(interaction.guildId, interaction.user.id, reward.item);
    await saveDb();
    return interaction.reply(`Lootbox opened: **${reward.item}** and ${formatCoins(reward.coins)}. Balance: ${formatCoins(economy.coins)}.`);
  }

  const cooldown = checkCooldown(guild, interaction.user.id, name, 60_000);
  if (cooldown) return interaction.reply({ content: `Try again in ${cooldown}s.`, ephemeral: true });

  const outcomes = {
    fish: ["river fish", "shiny scale", "tiny pearl"],
    mine: ["iron chunk", "glowing ore", "rough diamond"],
    hunt: ["treasure map", "ancient coin", "lucky charm"]
  };
  const item = pick(outcomes[name]);
  const coins = 35 + Math.floor(Math.random() * 116);
  economy.coins += coins;
  addInventoryItem(interaction.guildId, interaction.user.id, item);
  await saveDb();
  return interaction.reply(`You found **${item}** and earned ${formatCoins(coins)}. Balance: ${formatCoins(economy.coins)}.`);
}

export async function handleButton(interaction) {
  if (interaction.customId.startsWith("trivia:")) {
    const [, userId, answer] = interaction.customId.split(":");
    if (interaction.user.id !== userId) return interaction.reply({ content: "This trivia question belongs to someone else.", ephemeral: true });
    return interaction.reply({ content: `Answer: **${answer}**`, ephemeral: true });
  }

  if (interaction.customId.startsWith("poll:")) {
    const [, pollId, vote] = interaction.customId.split(":");
    const guild = ensureGuild(interaction.guildId);
    const pollData = guild.buttonPolls[pollId];
    if (!pollData) return interaction.reply({ content: "That poll no longer exists.", ephemeral: true });
    pollData.votes[interaction.user.id] = vote;
    await saveDb();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`poll:${pollId}:a`).setLabel(pollData.optionA).setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`poll:${pollId}:b`).setLabel(pollData.optionB).setStyle(ButtonStyle.Secondary)
    );
    await interaction.update({ embeds: [pollEmbed(pollData)], components: [row] });
  }
}

export async function handleAetherMention(message) {
  if (!message.guild || message.author.bot) return false;
  const content = message.content.toLowerCase();
  const mentionedBot = message.mentions.users.has(message.client.user.id);
  const saidAether = /\baether\b/.test(content);
  if (!mentionedBot && !saidAether) return false;

  await message.reply(pick(AETHER_REPLIES));
  return true;
}

async function sendConfiguredLog(guild, title, description) {
  const storedGuild = ensureGuild(guild.id);
  if (!storedGuild.config.logChannelId) return;
  try {
    const channel = await guild.channels.fetch(storedGuild.config.logChannelId);
    if (!channel?.isTextBased()) return;
    const embed = new EmbedBuilder().setColor(0x95a5a6).setTitle(title).setDescription(description).setTimestamp();
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Log send failed:", error);
  }
}

export async function handleGuildMemberAdd(member) {
  const guild = ensureGuild(member.guild.id);
  if (guild.config.welcomeChannelId) {
    try {
      const channel = await member.guild.channels.fetch(guild.config.welcomeChannelId);
      if (channel?.isTextBased()) await channel.send(`Welcome ${member} to **${member.guild.name}**. Try /help to meet Aether.`);
    } catch (error) {
      console.error("Welcome send failed:", error);
    }
  }
  await sendConfiguredLog(member.guild, "Member Joined", `${member.user.tag} joined the server.`);
}

export async function handleMessageDelete(message) {
  if (!message.guild || message.author?.bot) return;
  const content = message.content ? message.content.slice(0, 1000) : "No cached message content.";
  await sendConfiguredLog(message.guild, "Message Deleted", `Author: ${message.author?.tag ?? "Unknown"}\nChannel: ${message.channel}\nContent: ${content}`);
}

export async function awardMessageXp(message) {
  if (!message.guild || message.author.bot) return;
  const guild = ensureGuild(message.guild.id);
  let changed = false;

  if (guild.afk[message.author.id]) {
    delete guild.afk[message.author.id];
    changed = true;
    await message.reply("Welcome back. I removed your AFK status.");
  }

  const mentionedAfk = message.mentions.users
    .filter((user) => guild.afk[user.id])
    .map((user) => `${user.tag}: ${guild.afk[user.id].reason}`);
  if (mentionedAfk.length) {
    await message.reply(`AFK:\n${mentionedAfk.join("\n")}`);
  }

  const beastRecentlySpawned = guild.activeBeast && Date.now() - guild.activeBeast.spawnedAt < 20 * 60_000;
  if (!beastRecentlySpawned && Math.random() < 0.012) {
    const beast = spawnBeast(guild, message.channel.id);
    changed = true;
    await message.channel.send({ content: "A mythical beast has appeared.", embeds: [beastEmbed(beast)], files: [beastAttachment(beast)] });
  }

  if (!guild.config.messageXpEnabled) {
    if (changed) await saveDb();
    return;
  }

  const { level } = ensureMember(message.guild.id, message.author.id);
  const now = Date.now();
  if (now - level.lastXpAt < 60_000) {
    if (changed) await saveDb();
    return;
  }

  level.lastXpAt = now;
  level.xp += 15 + Math.floor(Math.random() * 11);

  let leveled = false;
  while (level.xp >= xpNeeded(level.level)) {
    level.xp -= xpNeeded(level.level);
    level.level += 1;
    leveled = true;
  }

  await saveDb();
  if (leveled) {
    await message.channel.send(`${message.author} leveled up to level ${level.level}.`);
  }
}

export async function processReminders(client) {
  const db = getDb();
  const now = Date.now();
  let changed = false;

  for (const [guildId, guild] of Object.entries(db.guilds)) {
    guild.reminders ??= [];
    const due = guild.reminders.filter((reminder) => reminder.dueAt <= now);
    guild.reminders = guild.reminders.filter((reminder) => reminder.dueAt > now);
    if (due.length) changed = true;

    for (const reminder of due) {
      try {
        const channel = await client.channels.fetch(reminder.channelId);
        await channel?.send(`<@${reminder.userId}> reminder: ${reminder.text}`);
      } catch (error) {
        console.error(`Reminder failed in guild ${guildId}:`, error);
      }
    }
  }

  if (changed) await saveDb();
}

export async function processBirthdays(client) {
  const db = getDb();
  const now = new Date();
  const today = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  for (const [guildId, guild] of Object.entries(db.guilds)) {
    ensureGuild(guildId);
    if (!guild.config?.birthdayChannelId || guild.config.lastBirthdayDate === today) continue;
    const birthdayUsers = Object.entries(guild.birthdays ?? {}).filter(([, date]) => date === today).map(([id]) => `<@${id}>`);
    guild.config.lastBirthdayDate = today;
    if (!birthdayUsers.length) {
      await saveDb();
      continue;
    }

    try {
      const channel = await client.channels.fetch(guild.config.birthdayChannelId);
      if (channel?.isTextBased()) await channel.send(`Happy birthday ${birthdayUsers.join(", ")}. Aether brought cake, spiritually.`);
    } catch (error) {
      console.error(`Birthday send failed in guild ${guildId}:`, error);
    }
    await saveDb();
  }
}
