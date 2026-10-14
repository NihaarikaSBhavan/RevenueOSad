import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// IBM Plex, self-hosted from Google Fonts (the render browser has no route to Google)
export const SANS = "IBM Plex Sans";
export const MONO = "IBM Plex Mono";
export const DEVA = "IBM Plex Sans Devanagari";

export const fontsReady = Promise.all([
  loadFont({ family: SANS, url: staticFile("fonts/PlexSans-var.woff2"), weight: "100 700" }),
  ...["400", "500", "600"].map((weight) =>
    loadFont({ family: MONO, url: staticFile(`fonts/PlexMono-${weight}.woff2`), weight }),
  ),
  ...["400", "500", "600"].map((weight) =>
    loadFont({ family: DEVA, url: staticFile(`fonts/PlexDeva-${weight}.woff2`), weight }),
  ),
]);

// Devanagari falls back per glyph from Plex Sans to Plex Sans Devanagari
export const sansStack = `"${SANS}", "${DEVA}", sans-serif`;
export const monoStack = `"${MONO}", monospace`;
