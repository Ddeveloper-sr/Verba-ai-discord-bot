import {
  ContainerBuilder,
  MessageFlags,
  SlashCommandBuilder,
  TextDisplayBuilder,
} from "discord.js";

export const pingCommand = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Show the bot's latency and infrastructure timings");

export function createPingPanel({ botName, userId, websocket, response, database }) {
  return new ContainerBuilder()
    .setAccentColor(0x5865f2)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${botName}'s Latency\nRequested by <@${userId}> • <t:${Math.floor(Date.now() / 1000)}:R>`),
      new TextDisplayBuilder().setContent(
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
        "• **Core Latency**  ::\n" +
        `  └  Websocket       :  ${websocket}ms\n` +
        `  └  Response        :  ${response}ms\n\n` +
        "• **Infrastructure**  ::\n" +
        `  └  Database        :  ${database}ms`
      )
    );
}

export const pingFlags = MessageFlags.IsComponentsV2;
