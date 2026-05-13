# Aether on Oracle Cloud Always Free

Oracle Cloud is a strong free 24/7 hosting choice for Aether because a Discord bot needs a process that stays running. Oracle's Always Free resources can stay free when you stay inside the Always Free limits.

## Basic Steps

1. Create an Oracle Cloud account.
2. Create an Always Free eligible VM.
3. Use Ubuntu or Oracle Linux.
4. Open SSH to the VM.
5. Install Node.js 20 or newer.
6. Upload or clone this bot folder.
7. Create `.env` with your Discord bot token, client ID, and guild ID.
8. Run:

   ```bash
   npm install
   npm run deploy
   npm start
   ```

## Keep Aether Running

Use `pm2`:

```bash
npm install -g pm2
pm2 start src/index.js --name aether
pm2 save
pm2 startup
```

Useful commands:

```bash
pm2 status
pm2 logs aether
pm2 restart aether
```

## Important

- Keep your VM inside Always Free limits.
- Do not publish your `.env` file.
- Back up `data/db.json`; that file stores birthdays, XP, coins, pets, clans, notes, quotes, and config.
