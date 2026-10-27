import { query } from "@solidjs/router";
import * as db from "./server";
import { delay, getCurrentUserId, getCurrentUserName, isSlowEnabled } from "./server";

// Cached router queries. Each body is a server function: on the client it compiles to an RPC stub,
// so ./server (server-only) never reaches the browser. The delays mirror the original's, behind the Delays toggle.

export const getCurrentUser = query(async () => {
  "use server";
  return { name: getCurrentUserName() || "listener" };
}, "currentUser");

export const getSlowEnabled = query(async () => {
  "use server";
  return isSlowEnabled();
}, "slowEnabled");

export const getLibrary = query(async () => {
  "use server";
  await delay(400);
  return db.listLibrary();
}, "library");

export const getFavorites = query(async () => {
  "use server";
  await delay(500);
  return db.listFavorites(getCurrentUserId());
}, "favorites");

export const getRecentlyPlayed = query(async (limit: number) => {
  "use server";
  await delay(500);
  return db.listRecentlyPlayed(getCurrentUserId(), limit);
}, "recentlyPlayed");

export const getTrack = query(async (id: string) => {
  "use server";
  await delay(400);
  return db.findTrack(id, getCurrentUserId());
}, "track");

export const getMostPlayed = query(async (limit: number) => {
  "use server";
  await delay(700);
  return db.listMostPlayed(limit, getCurrentUserId());
}, "mostPlayed");

export const getDiscover = query(async (limit: number) => {
  "use server";
  await delay(1100);
  return db.listDiscover(getCurrentUserId(), limit);
}, "discover");

export const getRecommendedTracks = query(async (excludeId: string) => {
  "use server";
  await delay(900);
  return db.listRecommended(getCurrentUserId(), excludeId, 5);
}, "recommended");

export const getTracksByGenre = query(async (genre: string) => {
  "use server";
  await delay(900);
  return db.listByGenre(genre, getCurrentUserId());
}, "genreTracks");

export const getGenres = query(async () => {
  "use server";
  await delay(600);
  return db.listGenres();
}, "genres");

export const searchCatalog = query(async (q: string) => {
  "use server";
  await delay(800);
  return db.searchCatalog(q, getCurrentUserId());
}, "search");

export const getPlaylists = query(async () => {
  "use server";
  await delay(500);
  return db.listPlaylists(getCurrentUserId());
}, "playlists");

export const getPlaylist = query(async (id: string) => {
  "use server";
  await delay(500);
  return db.findPlaylist(id, getCurrentUserId());
}, "playlist");

export const getPlaylistMenuItems = query(async (trackId: string) => {
  "use server";
  return db.listPlaylistMenuItems(trackId, getCurrentUserId());
}, "playlistMenu");
