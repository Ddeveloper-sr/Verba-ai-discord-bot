import {
  ContainerBuilder,
  MessageFlags,
  SlashCommandBuilder,
  TextDisplayBuilder,
} from "discord.js";

export const pingCommand = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Show the bot's latency and infrastructure timings");

export function createPingPanel({ botName, websocket, response, database }) {
  return new ContainerBuilder().addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `## ${botName}'s Latency\n` +
      `Requested by <@${arguments[0]?.userId || "0"}>\n\n` +
      `──────────────\n\n` +
      `• **Core Latency** ::\n` +
      `  └ Websocket     : ${websocket}ms\n` +
      `  └ Response      : ${response}ms\n\n` +
      `• **Infrastructure** ::\n` +
      `  └ Database      : ${database}ms`
    )
  );
}

export const pingFlags = MessageFlags.IsComponentsV2;
