import {
  ContainerBuilder,
  MessageFlags,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SlashCommandBuilder,
  TextDisplayBuilder,
} from "discord.js";

export const pingCommand = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Show the bot's latency and infrastructure timings");

const formatMs = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0ms";
  if (number < 1) return `${number.toFixed(3)}ms`;
  if (number < 10) return `${number.toFixed(2)}ms`;
  return `${Math.round(number)}ms`;
};

export function createPingPanel({
  botName = "Bot",
  userName = "Unknown User",
  requestedAt = Date.now(),
  websocket = 0,
  response = 0,
  database = 0,
}) {
  const requestedTime = Math.floor(Number(requestedAt) / 1000) || Math.floor(Date.now() / 1000);

  return new ContainerBuilder()
    .setAccentColor(0x5865f2)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${botName}'s Latency`),
      new TextDisplayBuilder().setContent(
        `Requested by ${userName} • <t:${requestedTime}:R>`
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setDivider(true)
        .setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "• **Core Latency**  ::\n" +
        `  └  Websocket       :  ${formatMs(websocket)}\n` +
        `  └  Response        :  ${formatMs(response)}\n\n` +
        "• **Infrastructure**  ::\n" +
        `  └  Database        :  ${formatMs(database)}`
      )
    );
}

export const pingFlags = MessageFlags.IsComponentsV2;
