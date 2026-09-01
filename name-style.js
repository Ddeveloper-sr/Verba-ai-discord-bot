import { Routes } from "discord.js";

export const FONTS = {
  BANGERS: 1,
  BIO_RHYME: 2,
  CHERRY_BOMB: 3,
  CHICLE: 4,
  COMPAGNON: 5,
  MUSEO_MODERNO: 6,
  NEO_CASTEL: 7,
  PIXELIFY_SANS: 8,
  RIBES: 9,
  SINISTRE: 10,
  GG_SANS: 11,
  ZILLA_SLAB: 12,
};

export const EFFECTS = {
  SOLID: 1,
  GRADIENT: 2,
  NEON: 3,
  TOON: 4,
  POP: 5,
  GLOW: 6,
};

export function hexToDecimal(value) {
  const hex = String(value).trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    throw new Error("Invalid color. Use a 6-digit hex color such as #5865F2.");
  }
  return Number.parseInt(hex, 16);
}

export async function applyNameStyle(client, guildId, { font, effect, colors }) {
  const normalizedColors = colors.map((color) =>
    typeof color === "number" ? color : hexToDecimal(color)
  );

  if (![1, 2, 3, 4, 5, 6].includes(Number(effect))) {
    throw new Error("Invalid name style effect.");
  }

  if (![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].includes(Number(font))) {
    throw new Error("Invalid name style font.");
  }

  if (Number(effect) === EFFECTS.GRADIENT && normalizedColors.length !== 2) {
    throw new Error("Gradient requires two colors.");
  }

  if (Number(effect) !== EFFECTS.GRADIENT && normalizedColors.length !== 1) {
    throw new Error("This effect requires one color.");
  }

  return client.rest.patch(Routes.guildMember(guildId, "@me"), {
    body: {
      display_name_font_id: Number(font),
      display_name_effect_id: Number(effect),
      display_name_colors: normalizedColors,
    },
  });
}

export async function resetNameStyle(client, guildId) {
  return client.rest.patch(Routes.guildMember(guildId, "@me"), {
    body: {
      display_name_font_id: null,
      display_name_effect_id: null,
      display_name_colors: null,
    },
  });
}
