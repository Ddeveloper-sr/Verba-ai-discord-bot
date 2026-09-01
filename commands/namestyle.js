import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextDisplayBuilder,
} from "discord.js";

export const nameStyleCommand = new SlashCommandBuilder()
  .setName("namestyle")
  .setDescription("Customize the bot's Discord display name style in this server")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild.toString());

export const FONT_OPTIONS = [
  ["Bangers", "1"], ["BioRhyme", "2"], ["Cherry Bomb", "3"], ["Chicle", "4"],
  ["Compagnon", "5"], ["Museo Moderno", "6"], ["Neo-Castel", "7"], ["Pixelify Sans", "8"],
  ["Ribes", "9"], ["Sinistre", "10"], ["GG Sans", "11"], ["Zilla Slab", "12"],
];

export const EFFECT_OPTIONS = [
  ["Solid", "1"], ["Gradient", "2"], ["Neon", "3"], ["Toon", "4"], ["Pop", "5"], ["Glow", "6"],
];

export function createNameStylePanel(state) {
  const fontSelect = new StringSelectMenuBuilder()
    .setCustomId("namestyle:font")
    .setPlaceholder("Choose a font")
    .addOptions(FONT_OPTIONS.map(([label, value]) =>
      new StringSelectMenuOptionBuilder().setLabel(label).setValue(value).setDefault(value === String(state.font))
    ));

  const effectSelect = new StringSelectMenuBuilder()
    .setCustomId("namestyle:effect")
    .setPlaceholder("Choose an effect")
    .addOptions(EFFECT_OPTIONS.map(([label, value]) =>
      new StringSelectMenuOptionBuilder().setLabel(label).setValue(value).setDefault(value === String(state.effect))
    ));

  const colors = state.colors.map((color) => `#${color.toString(16).padStart(6, "0").toUpperCase()}`);

  return new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent("## Bot Name Style\nCustomize this bot's Discord display name style for this server.")
    )
    .addActionRowComponents(new ActionRowBuilder().addComponents(fontSelect))
    .addActionRowComponents(new ActionRowBuilder().addComponents(effectSelect))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**Colors:** ${colors.join(" + ")}\nGradient uses two colors; other effects use the first color.`)
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("namestyle:color1").setLabel("Color 1").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("namestyle:color2").setLabel("Color 2").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("namestyle:apply").setLabel("Apply").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("namestyle:reset").setLabel("Reset").setStyle(ButtonStyle.Danger),
      )
    );
}

export const nameStyleFlags = MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral;
