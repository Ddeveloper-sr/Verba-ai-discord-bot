# Verba AI Discord Bot

A Bun-powered Discord AI bot using the Verba Public API and SQLite for persistent local memories.

## Requirements

- Bun 1.1+
- A Discord bot application with the **Message Content Intent** enabled
- A Verba API key
- A Verba character
- **Verba Pro or Ultra plan**: Verba API keys are available on Pro and Ultra plans.

## Setup

```bash
bun install
cp .env.example .env
bun run index.js
```

Set these values in `.env`:

```env
DISCORD_TOKEN=your_discord_bot_token
VERBA_API_KEY=vka_your_verba_api_key
VERBA_CHARACTER=your_character_slug
SQLITE_PATH=./memory.sqlite
```

The SQLite database is created automatically by Bun at the configured path. Do not commit `.env`, API keys, bot tokens, or the generated SQLite database.

## Reply behavior

The bot replies when:

1. A user replies directly to a message sent by the bot.
2. A user mentions the bot.
3. Otherwise, there is a 2% chance for the bot to reply.

Bot-authored messages are ignored to prevent bot-to-bot reply loops.

## Memory

SQLite stores recent user/assistant memories and Verba session IDs. Each memory scope is separated by guild, channel, and user. The bot sends a limited recent context to Verba so requests stay within the API message limits.

Verba's Public API uses `POST https://api.verba.ink/v1/response` and supports session IDs for continuing context.

## Commands

There are **no commands in this initial version**. When commands are added later, use Discord **Components V2** for command interfaces where appropriate.

## Logger

`logger.js` prints a large `Paimon` startup banner and a green `Online` status line.

## License

Use and modify this project according to the license you add to the repository.
