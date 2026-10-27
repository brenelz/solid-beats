import { formAction } from "@solidjs/router";
import { getRequestEvent, redirect, respond, serializeCookie } from "@solidjs/web";
import * as v from "valibot";
import {
  getDiscover,
  getFavorites,
  getLibrary,
  getMostPlayed,
  getPlaylist,
  getPlaylistMenuItems,
  getPlaylists,
  getRecentlyPlayed,
  getRecommendedTracks,
  getTrack,
  getTracksByGenre,
  searchCatalog,
} from "./queries";
import {
  addToPlaylistInDb,
  createPlaylistInDb,
  deletePlaylistInDb,
  delay,
  recordPlayInDb,
  removeFromPlaylistInDb,
  toggleFavoriteInDb,
  verifyAuth,
} from "./server";
import type { ActionResult } from "./types";
import { SESSION_COOKIE, SLOW_COOKIE } from "./utils";

// Every track list carries `isFavorite`, so a like touches each list that renders hearts.
const trackListKeys = [
  getTrack.key,
  getFavorites.key,
  getDiscover.key,
  getRecommendedTracks.key,
  getLibrary.key,
  getMostPlayed.key,
  getRecentlyPlayed.key,
  getTracksByGenre.key,
  searchCatalog.key,
  getPlaylist.key,
];
const playlistKeys = [getPlaylists.key, getPlaylist.key, getPlaylistMenuItems.key, searchCatalog.key];

function setCookie(name: string, value: string, maxAge: number) {
  getRequestEvent()?.response.headers.append(
    "Set-Cookie",
    serializeCookie(name, value, { maxAge, path: "/", sameSite: "lax" }),
  );
}

const nameSchema = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(1, "Name is required"),
  v.maxLength(50, "Name must be 50 characters or fewer"),
);

export const signIn = formAction(async (form: FormData) => {
  "use server";
  const parsed = v.safeParse(nameSchema, form.get("name") ?? "");
  if (!parsed.success) return { ok: false, error: parsed.issues[0].message } satisfies ActionResult;
  setCookie(SESSION_COOKIE, parsed.output, 60 * 60 * 24 * 30);
  return redirect("/");
}, "sign-in");

export const signOut = formAction(async () => {
  "use server";
  setCookie(SESSION_COOKIE, "", 0);
  return redirect("/login");
}, "sign-out");

export async function toggleFavorite(trackId: string) {
  "use server";
  const userId = verifyAuth();
  await delay(200);
  toggleFavoriteInDb(userId, trackId);
  return respond({ ok: true } as ActionResult, { revalidate: trackListKeys });
}

/** Counts a play. Called from the player, not a form; only the play-driven lists refresh. */
export async function recordPlay(trackId: string) {
  "use server";
  const userId = verifyAuth();
  recordPlayInDb(userId, trackId);
  return respond(null, { revalidate: [getRecentlyPlayed.key, getDiscover.key, getRecommendedTracks.key] });
}

const playlistNameSchema = v.pipe(v.string(), v.trim(), v.minLength(1, "Name is required"), v.maxLength(100));

export const createPlaylist = formAction(async (form: FormData) => {
  "use server";
  const userId = verifyAuth();
  await delay(300);
  const parsed = v.safeParse(playlistNameSchema, form.get("name") ?? "");
  if (!parsed.success) return respond({ ok: false, error: parsed.issues[0].message } as ActionResult, { revalidate: "" });
  createPlaylistInDb(userId, parsed.output);
  return respond({ ok: true } as ActionResult, { revalidate: playlistKeys });
}, "create-playlist");

export async function addToPlaylist(playlistId: string, trackId: string) {
  "use server";
  const userId = verifyAuth();
  await delay(200);
  const error = addToPlaylistInDb(userId, playlistId, trackId);
  if (error) return respond({ ok: false, error } as ActionResult, { revalidate: "" });
  return respond({ ok: true } as ActionResult, { revalidate: playlistKeys });
}

export async function removeFromPlaylist(playlistId: string, trackId: string) {
  "use server";
  const userId = verifyAuth();
  await delay(200);
  const error = removeFromPlaylistInDb(userId, playlistId, trackId);
  if (error) return respond({ ok: false, error } as ActionResult, { revalidate: "" });
  return respond({ ok: true } as ActionResult, { revalidate: playlistKeys });
}

export async function deletePlaylist(playlistId: string) {
  "use server";
  const userId = verifyAuth();
  await delay(300);
  const error = deletePlaylistInDb(userId, playlistId);
  if (error) return respond({ ok: false, error } as ActionResult, { revalidate: "" });
  return redirect("/playlist", { revalidate: playlistKeys });
}

/** Demo toolbar: turn the fake query latency on or off. */
export async function setSlowEnabled(enabled: boolean) {
  "use server";
  setCookie(SLOW_COOKIE, enabled ? "1" : "", enabled ? 60 * 60 * 24 * 30 : 0);
  return respond(null, { revalidate: "" });
}
