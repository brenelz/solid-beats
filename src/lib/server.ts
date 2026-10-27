// The in-memory database, as a server-only module. It resets when the server restarts.
import "server-only";
import { getRequestEvent, parseCookieHeader, redirect } from "@solidjs/web";
import { PLAYLISTS, TRACKS, type SeedTrack } from "./seed";
import type { GenreSummary, PlaylistMenuItem, PlaylistSummary, PlaylistWithTracks, Track } from "./types";
import { SEED_PLAYLIST_IDS, SESSION_COOKIE, SLOW_COOKIE } from "./utils";

type Playlist = {
  id: string;
  name: string;
  description: string;
  coverColor: string;
  userId: string | null;
  createdAt: number;
  trackIds: string[];
};

const tracks = new Map<string, SeedTrack>(TRACKS.map((t) => [t.id, { ...t }]));
const playlists = new Map<string, Playlist>(
  PLAYLISTS.map((p, i) => [p.id, { ...p, trackIds: [...p.trackIds], userId: null, createdAt: i }]),
);
/** userId -> trackId -> addedAt */
const favorites = new Map<string, Map<string, number>>();
/** userId -> trackId -> lastPlayedAt */
const plays = new Map<string, Map<string, number>>();

const playlistColors = [
  "from-violet-500 to-purple-600",
  "from-purple-400 to-violet-500",
  "from-fuchsia-500 to-purple-600",
  "from-purple-500 to-violet-700",
  "from-violet-400 to-purple-500",
  "from-fuchsia-400 to-violet-500",
];

function cookies() {
  return parseCookieHeader(getRequestEvent()?.request.headers.get("cookie"));
}

/** Demo toggle: artificial latency is off unless the `slow` cookie is set. */
export function isSlowEnabled() {
  return SLOW_COOKIE in cookies();
}

export function delay(ms: number) {
  if (!isSlowEnabled()) return Promise.resolve();
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// The session cookie holds the display name; the name is the account, like the original's upsert by name.
export function getCurrentUserName() {
  return cookies()[SESSION_COOKIE]?.trim() ?? "";
}

export function getCurrentUserId() {
  return getCurrentUserName().toLowerCase();
}

export function verifyAuth() {
  const userId = getCurrentUserId();
  if (!userId) throw redirect("/login");
  return userId;
}

function bucket(map: Map<string, Map<string, number>>, userId: string) {
  let m = map.get(userId);
  if (!m) map.set(userId, (m = new Map()));
  return m;
}

function toTrack(row: SeedTrack, userId?: string): Track {
  return {
    album: row.album,
    artist: row.artist,
    coverColor: row.coverColor,
    duration: row.duration,
    genre: row.genre,
    id: row.id,
    isFavorite: userId ? (favorites.get(userId)?.has(row.id) ?? false) : false,
    playCount: row.playCount,
    title: row.title,
  };
}

const byPlayCount = (a: SeedTrack, b: SeedTrack) => b.playCount - a.playCount;

function visiblePlaylists(userId: string) {
  return [...playlists.values()]
    .filter((p) => p.userId === null || p.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

function toSummary(p: Playlist): PlaylistSummary {
  return {
    coverColor: p.coverColor,
    description: p.description,
    id: p.id,
    name: p.name,
    trackCount: p.trackIds.length,
  };
}

// Reads

export function listLibrary(): Track[] {
  return [...tracks.values()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map((t) => toTrack(t));
}

export function listFavorites(userId: string): Track[] {
  const mine = favorites.get(userId);
  if (!mine) return [];
  return [...mine.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => tracks.get(id))
    .filter((t) => t !== undefined)
    .map((t) => toTrack(t, userId));
}

export function listRecentlyPlayed(userId: string, limit: number): Track[] {
  const mine = plays.get(userId);
  if (!mine) return [];
  return [...mine.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => tracks.get(id))
    .filter((t) => t !== undefined)
    .map((t) => toTrack(t, userId));
}

export function findTrack(id: string, userId: string): Track | undefined {
  const row = tracks.get(id);
  return row && toTrack(row, userId);
}

export function listMostPlayed(limit: number, userId: string): Track[] {
  return [...tracks.values()]
    .filter((t) => t.playCount > 0)
    .sort(byPlayCount)
    .slice(0, limit)
    .map((t) => toTrack(t, userId));
}

function unheard(userId: string) {
  const liked = favorites.get(userId);
  const played = plays.get(userId);
  return [...tracks.values()].filter((t) => !liked?.has(t.id) && !played?.has(t.id)).sort(byPlayCount);
}

export function listDiscover(userId: string, limit: number): Track[] {
  return unheard(userId)
    .slice(0, limit)
    .map((t) => toTrack(t, userId));
}

export function listRecommended(userId: string, excludeId: string, limit: number): Track[] {
  return unheard(userId)
    .filter((t) => t.id !== excludeId)
    .slice(0, limit)
    .map((t) => toTrack(t, userId));
}

export function listByGenre(genre: string, userId: string): Track[] {
  return [...tracks.values()]
    .filter((t) => t.genre === genre)
    .sort(byPlayCount)
    .map((t) => toTrack(t, userId));
}

export function listGenres(): GenreSummary[] {
  const counts = new Map<string, number>();
  for (const t of tracks.values()) counts.set(t.genre, (counts.get(t.genre) ?? 0) + 1);
  return [...counts.entries()].map(([genre, count]) => ({ count, genre })).sort((a, b) => b.count - a.count);
}

export function searchCatalog(query: string, userId: string) {
  const needle = query.trim().toLowerCase();
  const found = [...tracks.values()]
    .filter((t) => [t.title, t.artist, t.album].some((f) => f.toLowerCase().includes(needle)))
    .sort(byPlayCount)
    .slice(0, 30)
    .map((t) => toTrack(t, userId));
  const lists = visiblePlaylists(userId)
    .filter((p) => p.name.toLowerCase().includes(needle))
    .map(toSummary);
  return { playlists: lists, tracks: found };
}

export function listPlaylists(userId: string): PlaylistSummary[] {
  return visiblePlaylists(userId).map(toSummary);
}

export function findPlaylist(id: string, userId: string): PlaylistWithTracks | undefined {
  const p = playlists.get(id);
  if (!p || (p.userId !== null && p.userId !== userId)) return undefined;
  return {
    ...toSummary(p),
    tracks: p.trackIds
      .map((tid) => tracks.get(tid))
      .filter((t) => t !== undefined)
      .map((t) => toTrack(t, userId)),
  };
}

export function listPlaylistMenuItems(trackId: string, userId: string): PlaylistMenuItem[] {
  return visiblePlaylists(userId).map((p) => ({
    active: p.trackIds.includes(trackId),
    label: p.name,
    value: p.id,
  }));
}

// Writes

export function toggleFavoriteInDb(userId: string, trackId: string) {
  if (!tracks.has(trackId)) return false;
  const mine = bucket(favorites, userId);
  if (mine.has(trackId)) mine.delete(trackId);
  else mine.set(trackId, Date.now());
  return true;
}

export function recordPlayInDb(userId: string, trackId: string) {
  const row = tracks.get(trackId);
  if (!row) return;
  row.playCount += 1;
  bucket(plays, userId).set(trackId, Date.now());
}

export function createPlaylistInDb(userId: string, name: string) {
  const playlist: Playlist = {
    coverColor: playlistColors[Math.floor(Math.random() * playlistColors.length)],
    createdAt: Date.now(),
    description: "",
    id: crypto.randomUUID(),
    name,
    trackIds: [],
    userId,
  };
  playlists.set(playlist.id, playlist);
  return playlist.id;
}

function ownPlaylist(userId: string, playlistId: string) {
  const p = playlists.get(playlistId);
  if (!p || (p.userId !== null && p.userId !== userId)) return { error: "Playlist not found" } as const;
  if (SEED_PLAYLIST_IDS.has(playlistId)) return { error: "Can't modify a demo playlist" } as const;
  return { playlist: p } as const;
}

export function addToPlaylistInDb(userId: string, playlistId: string, trackId: string): string | undefined {
  const found = ownPlaylist(userId, playlistId);
  if ("error" in found) return found.error;
  if (found.playlist.trackIds.includes(trackId)) return "Already in this playlist";
  found.playlist.trackIds.push(trackId);
}

export function removeFromPlaylistInDb(userId: string, playlistId: string, trackId: string): string | undefined {
  const found = ownPlaylist(userId, playlistId);
  if ("error" in found) return found.error;
  found.playlist.trackIds = found.playlist.trackIds.filter((id) => id !== trackId);
}

export function deletePlaylistInDb(userId: string, playlistId: string): string | undefined {
  const found = ownPlaylist(userId, playlistId);
  if ("error" in found) return found.error === "Can't modify a demo playlist" ? "Can't delete a demo playlist" : found.error;
  playlists.delete(playlistId);
}
