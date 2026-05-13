# Aether Discord Bot

Aether includes:

- Administration: kick, ban, timeout, untimeout, purge, slowmode, lock/unlock, warn, warnings, clear warnings
- Fun: hug, pat, slap, cry, dance, highfive, wave, cheer, boop, poke, smile, laugh, meme
- Birthdays: set, view, remove, list today's birthdays, automatic birthday announcements
- Leveling: XP from chat, rank cards, leaderboard
- Games: coinflip, dice, rock-paper-scissors, trivia, number guessing
- Gambling: balance, daily, work, bet, slots, blackjack
- Pets: adopt, feed, play, rename, profile, leaderboard, local ancient-style pet images, level grades
- Mythical pets: phoenix, griffin, kirin, and hydra
- Clans: create, join, leave, deposit, profile, leaderboard
- Pets: train, adventure, and special attack commands with XP, coin rewards, grade-up media, and inventory drops
- Mythical beasts: random chat encounters with shared HP, `/beast status`, `/beast attack`, and contributor rewards
- Items: `/item list` and `/item use` for drops, keys, crystals, beast items, and mythic tokens
- Interactive: button polls, would-you-rather votes, fishing, mining, treasure hunts, lootboxes, inventory
- Utility: ping, avatar, user info, server info, choose, say, poll, reminders, tickets, AFK, notes, quotes
- Server automation: configurable welcome channel, log channel, birthday channel, member welcome messages, delete logs
- Social: 8-ball, friendship score, rate, reverse text
- Social extras: compliment, joke, fact
- Profiles and wallet: profile cards, wallet view, wallet leaderboard, wallet daily, wallet work, wallet pay
- Aether mention replies: Aether responds with changing fun messages when mentioned or named in chat

## Setup

1. Install Node.js 20 or newer from <https://nodejs.org/>.
2. In this folder, install packages:

   ```powershell
   npm.cmd install
   ```

3. Copy `.env.example` to `.env` and fill in:

   ```env
   DISCORD_TOKEN=your_bot_token
   CLIENT_ID=your_application_client_id
   GUILD_ID=your_test_server_id
   ```

4. Register slash commands:

   ```powershell
   npm.cmd run deploy
   ```

5. Start the bot:

   ```powershell
   npm.cmd start
   ```

## Required Discord Developer Portal Settings

In Aether's bot settings, enable these privileged gateway intents:

- Server Members Intent
- Message Content Intent

Invite Aether with these scopes:

- `bot`
- `applications.commands`

Recommended bot permissions:

- Administrator while testing, or choose the permissions needed for moderation commands.

## Notes

- Data is stored locally in `data/db.json`.
- Reminders are checked by the running bot every 30 seconds.
- Birthday announcements are checked hourly.
- Configure automation with `/config welcome`, `/config logs`, and `/config birthdays`.
- Passive chat XP is disabled by default to keep free hosting lighter. Enable it with `/config xp mode:Enable`.
- Global slash commands can take time to update. Put your server ID in `GUILD_ID` while testing for instant updates.
- Moderation commands also depend on the bot's role being above the target user's role.
