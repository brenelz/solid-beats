export type CoverKind = "track" | "playlist" | "genre";
export type CoverShape = "square" | "thumb" | "banner" | "banner-thumb";

// Matches next-beats' generated-cover-version.ts so both sites request identical URLs.
const COVER_ASSET_VERSION = "ddfea88695bc";
const PLAYLIST_VARIANT_COUNT = 4;

const playlistMotifs: Record<string, number> = {
  myplaylist: 0,
  "high energy": 1,
  "morning vibes": 2,
  "late night coding": 3,
};

function assetKey(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-|-$/g, "") || "cover"
  );
}

function seedFraction(value: string) {
  let d = 0xdeadbeef;
  for (let index = 0; index < value.length; index += 1) d = Math.imul(d ^ value.charCodeAt(index), 3266489917);
  return (d >>> 0) / 4294967295;
}

function playlistVariant(seed: string, label: string) {
  return (
    playlistMotifs[label.toLowerCase()] ??
    Math.min(PLAYLIST_VARIANT_COUNT - 1, Math.floor(seedFraction(seed) * PLAYLIST_VARIANT_COUNT))
  );
}

export function coverSrc(seed: string, label: string, kind: CoverKind, shape: CoverShape) {
  const path =
    kind === "genre"
      ? `/covers/genres/${assetKey(label)}-${shape}.static.webp`
      : kind === "playlist"
        ? `/covers/playlists/${playlistVariant(seed, label)}-${shape}.static.webp`
        : `/covers/tracks/${assetKey(seed)}-${shape}.static.webp`;
  return `${path}?v=${COVER_ASSET_VERSION}`;
}
