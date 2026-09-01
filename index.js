import {
  ActionRowBuilder,
  Client,
  GatewayIntentBits,
  ModalBuilder,
  Partials,
  TextInputBuilder,
  TextInputStyle,
  MessageFlags,
} from "discord.js";
import { showBanner, logger } from "./logger.js";
import { addMemory, closeDatabase, getMemories, getSession, saveSession } from "./database.js";
import { generateReply } from "./verba.js";
import { applyNameStyle, resetNameStyle } from "./name-style.js";
import { createNameStylePanel, nameStyleCommand, nameStyleFlags } from "./commands/namestyle.js";

for (const key of ["DISCORD_TOKEN", "VERBA_API_KEY", "VERBA_CHARACTER"]) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

const styleStates = new Map();

function styleKey(interaction) {
  return `${interaction.guildId}:${interaction.user.id}`;
}

function defaultStyleState() {
  return { font: 11, effect: 1, colors: [0x5865f2, 0xeb459e] };
}

function getStyleState(interaction) {
  if (!styleStates.has(styleKey(interaction))) {
    styleStates.set(styleKey(interaction), defaultStyleState());
  }
  return styleStates.get(styleKey(interaction));
}

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
    case "VERBA_UNAVAILABLE": return "The AI service is temporarily unavailable. Please try again in a moment.";
    case "VERBA_RATE_LIMIT": return "The AI service is handling too many requests. Please try again shortly.";
    case "VERBA_QUEUE_FULL": return "The AI service is currently busy. Please try again in a moment.";
    case "VERBA_NETWORK_ERROR": return "The bot could not reach the AI service. Please try again shortly.";
    case "VERBA_AUTH_ERROR": return "The AI service is temporarily misconfigured. Please tell a server administrator.";
    case "VERBA_PLAN_ERROR": return "The configured AI service plan cannot process this request.";
    default: return "The AI service could not generate a reply right now. Please try again.";
  }
}

client.once("ready", async () => {
  showBanner(client.user);
  logger.success(`Logged in as ${client.user.tag}`);

  try {
    await client.application.commands.set([nameStyleCommand.toJSON()]);
    logger.success("Registered /namestyle");
  } catch (error) {
    logger.error(`Command registration failed: ${error.message}`);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand() && interaction.commandName === "namestyle") {
    if (!interaction.guildId) {
      await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
      return;
    }

    const state = getStyleState(interaction);
    await interaction.reply({ flags: nameStyleFlags, components: [createNameStylePanel(state)] });
    return;
  }

  if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit()) return;
  if (!interaction.customId.startsWith("namestyle:")) return;
  if (!interaction.guildId) return;

  const state = getStyleState(interaction);

  try {
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === "namestyle:font") state.font = Number(interaction.values[0]);
      if (interaction.customId === "namestyle:effect") state.effect = Number(interaction.values[0]);
      await interaction.update({ flags: nameStyleFlags, components: [createNameStylePanel(state)] });
      return;
    }

    if (interaction.isButton()) {
      if (interaction.customId === "namestyle:color1" || interaction.customId === "namestyle:color2") {
        const index = interaction.customId.endsWith("color1") ? 0 : 1;
        const modal = new ModalBuilder()
          .setCustomId(`namestyle:color-modal:${index}`)
          .setTitle(`Set Color ${index + 1}`)
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("hex")
                .setLabel("Hex color")
                .setPlaceholder("#5865F2")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setValue(`#${state.colors[index].toString(16).padStart(6, "0")}`)
            )
          );
        await interaction.showModal(modal);
        return;
      }

      if (interaction.customId === "namestyle:apply") {
        const colors = state.effect === 2 ? state.colors : [state.colors[0]];
        await applyNameStyle(client, interaction.guildId, { font: state.font, effect: state.effect, colors });
        await interaction.reply({ content: "Name style applied to this server.", ephemeral: true });
        return;
      }

      if (interaction.customId === "namestyle:reset") {
        await resetNameStyle(client, interaction.guildId);
        styleStates.delete(styleKey(interaction));
        await interaction.reply({ content: "Name style reset for this server.", ephemeral: true });
        return;
      }
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith("namestyle:color-modal:")) {
      const index = Number(interaction.customId.split(":").pop());
      const value = interaction.fields.getTextInputValue("hex").trim();
      const hex = value.replace(/^#/, "");
      if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
        await interaction.reply({ content: "Invalid color. Use a 6-digit hex color such as #5865F2.", ephemeral: true });
        return;
      }
      state.colors[index] = Number.parseInt(hex, 16);
      await interaction.reply({ content: `Color ${index + 1} updated to #${hex.toUpperCase()}.`, ephemeral: true });
    }
  } catch (error) {
    logger.error(`Name style interaction failed: ${error.message}`);
    const message = error?.status === 403
      ? "I cannot change my name style here. Make sure I have the Change Nickname permission."
      : "I couldn't update the name style. Please check my permissions and try again.";
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: message, ephemeral: true }).catch(() => {});
    } else {
      await interaction.reply({ content: message, ephemeral: true }).catch(() => {});
    }
  }
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

    await message.reply({ content: result.content, allowedMentions: { repliedUser: false } });
  } catch (error) {
    logger.error(`AI request failed: ${error.message}`);
    await message.reply({ content: userFacingError(error), allowedMentions: { repliedUser: false } }).catch(() => {});
  }
});

process.on("SIGINT", () => { closeDatabase(); process.exit(0); });
process.on("SIGTERM", () => { closeDatabase(); process.exit(0); });

client.login(process.env.DISCORD_TOKEN).catch((error) => {
  logger.error(`Discord login failed: ${error.message}`);
  closeDatabase();
  process.exit(1);
});
