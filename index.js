import { Client, GatewayIntentBits, Partials } from "discord.js";
import { showBanner, logger } from "./logger.js";
import { addMemory, closeDatabase, getMemories, getSession, saveSession } from "./database.js";
import { generateReply } from "./verba.js";

for (const key of ["DISCORD_TOKEN", "VERBA_API_KEY", "VERBA_CHARACTER"]) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

async function shouldReply(message) {
  if (message.author.bot) return false;
  if (message.reference?.messageId) {
    const referenced = await message.fetchReference().catch(() => null);
    return referenced?.author?.id === message.client.user.id;
  }
  if (message.mentions.has(message.client.user)) return true;
  return Math.random() < 0.02;
}

function scopeFor(message) {
  return `${message.guildId || "dm"}:${message.channelId}:${message.author.id}`;
}

function userFacingError(error) {
  switch (error.message) {
    case "VERBA_UNAVAILABLE":
      return "Paimon is temporarily unavailable. Please try again in a moment.";
    case "VERBA_RATE_LIMIT":
      return "Paimon is handling too many requests right now. Please try again shortly.";
    case "VERBA_QUEUE_FULL":
      return "Paimon is currently busy. Please try again in a moment.";
    case "VERBA_NETWORK_ERROR":
      return "Paimon could not reach the AI service. Please try again shortly.";
    case "VERBA_AUTH_ERROR":
      return "Paimon is temporarily misconfigured. Please tell a server administrator.";
    case "VERBA_PLAN_ERROR":
      return "Paimon's AI service is not available on the configured plan.";
    default:
      return "Paimon couldn't generate a reply right now. Please try again.";
  }
}

client.once("ready", () => {
  showBanner();
  logger.success(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!(await shouldReply(message))) return;

  const scope = scopeFor(message);
  const previous = getMemories(scope, 20);
  const messages = [...previous, { role: "user", content: `${message.author.username}: ${message.content}` }];

  try {
    await message.channel.sendTyping();

    const result = await generateReply({
      apiKey: process.env.VERBA_API_KEY,
      character: process.env.VERBA_CHARACTER,
      sessionId: getSession(scope),
      messages
    });

    if (!result.content) return;
    if (result.sessionId) saveSession(scope, result.sessionId);
    addMemory(scope, "user", message.content);
    addMemory(scope, "assistant", result.content);

    await message.reply({
      content: result.content,
      allowedMentions: { repliedUser: false }
    });
  } catch (error) {
    logger.error(`AI request failed: ${error.message}`);

    await message.reply({
      content: userFacingError(error),
      allowedMentions: { repliedUser: false }
    }).catch(() => {});
  }
});

process.on("SIGINT", () => {
  closeDatabase();
  process.exit(0);
});

process.on("SIGTERM", () => {
  closeDatabase();
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN).catch((error) => {
  logger.error(`Discord login failed: ${error.message}`);
  closeDatabase();
  process.exit(1);
});
