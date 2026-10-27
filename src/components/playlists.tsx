import { action, createOptimistic, createSignal, For, Repeat, Show } from "solid-js";
import { createPlaylist, deletePlaylist, removeFromPlaylist } from "../lib/mutations";
import type { ActionResult, PlaylistSummary, Track } from "../lib/types";
import { Trash2Icon, XIcon } from "./icons";
import { toast } from "./toaster";
import { TrackRow } from "./tracks";
import { Button, EmptyState, gridClass, NoteGlyph, Skeleton, Spinner } from "./ui";

export function PlaylistCard(props: { playlist: PlaylistSummary }) {
  return (
    <a
      class="group bg-card/50 hover:bg-card dark:bg-card-dark/50 dark:hover:bg-card-dark flex flex-col gap-3 rounded-lg p-3 transition-colors"
      href={`/playlist/${props.playlist.id}`}
      preload="viewport"
    >
      <div
        class={[
          "flex aspect-square w-full items-center justify-center rounded-md bg-gradient-to-br shadow-lg",
          props.playlist.coverColor,
        ]}
      >
        <NoteGlyph class="h-1/3 w-1/3 text-white/50" />
      </div>
      <div class="flex min-w-0 flex-col gap-0.5">
        <span class="truncate text-sm font-semibold text-black dark:text-white">{props.playlist.name}</span>
        <span class="text-muted truncate text-xs">
          {props.playlist.trackCount} {props.playlist.trackCount === 1 ? "track" : "tracks"}
        </span>
      </div>
    </a>
  );
}

export function PlaylistList(props: { playlists: PlaylistSummary[] }) {
  return (
    <div class={gridClass}>
      <For each={props.playlists} keyed={(p) => p.id}>
        {(p) => <PlaylistCard playlist={p()} />}
      </For>
    </div>
  );
}

/** All playlists, or all but `excludeId`; with nothing to show, an empty state (or nothing, when excluding). */
export function PlaylistBrowse(props: { playlists: PlaylistSummary[]; excludeId?: string }) {
  const shown = () => (props.excludeId ? props.playlists.filter((p) => p.id !== props.excludeId) : props.playlists);
  return (
    <Show
      when={shown().length > 0}
      fallback={props.excludeId ? null : <EmptyState body="Create your first playlist." title="No playlists" />}
    >
      <PlaylistList playlists={shown()} />
    </Show>
  );
}

export function PlaylistListSkeleton(props: { count?: number }) {
  return (
    <div class={gridClass}>
      <Repeat count={props.count ?? 3}>
        {() => (
          <div class="rounded-lg p-3">
            <Skeleton class="skeleton-subtle aspect-square w-full rounded-md" />
          </div>
        )}
      </Repeat>
    </div>
  );
}

export function CreatePlaylistForm() {
  createPlaylist.onSettled((submission) => {
    const result = submission.result as ActionResult | undefined;
    if (result?.ok) toast.success("Playlist created");
    else if (result) toast.error(result.error);
  });
  return (
    <form
      action={createPlaylist}
      class="flex gap-2"
      method="post"
      // Clear after the router has read the form data.
      onSubmit={(e) => {
        const form = e.currentTarget;
        setTimeout(() => form.reset());
      }}
    >
      <input autocomplete="off" class="flex-1" data-1p-ignore name="name" placeholder="New playlist name…" required />
      <Button size="sm" type="submit">
        Create
      </Button>
    </form>
  );
}

export function RemoveFromPlaylistButton(props: { playlistId: string; trackId: string }) {
  const [pending, setPending] = createOptimistic(false);
  const remove = action(function* () {
    setPending(true);
    const result: ActionResult = yield removeFromPlaylist(props.playlistId, props.trackId);
    if (!result.ok) toast.error(result.error);
  });
  return (
    <button
      aria-label="Remove from playlist"
      class="text-gray hover:text-danger rounded-full p-1.5 transition-colors"
      data-pending={pending() || undefined}
      disabled={pending()}
      onClick={() => void remove()}
      type="button"
    >
      <XIcon class="h-4 w-4" />
    </button>
  );
}

export function PlaylistTrackList(props: { playlistId: string; tracks: Track[] }) {
  return (
    <div class="flex flex-col gap-0.5">
      <For each={props.tracks} keyed={(t) => t.id}>
        {(track, i) => (
          <div class="flex items-center transition-opacity has-data-pending:opacity-30">
            <div class="min-w-0 flex-1">
              <TrackRow index={i()} queue={props.tracks} track={track()} />
            </div>
            <RemoveFromPlaylistButton playlistId={props.playlistId} trackId={track().id} />
          </div>
        )}
      </For>
    </div>
  );
}

export function DeletePlaylistButton(props: { playlistId: string; size?: "sm" | "lg" }) {
  let dialog: HTMLDialogElement | undefined;
  const [pending, setPending] = createSignal(false);

  async function confirm() {
    setPending(true);
    try {
      // Success is a redirect to /playlist, which the router follows; the call itself resolves without a value.
      const result = await deletePlaylist(props.playlistId);
      if (result && !result.ok) {
        toast.error(result.error);
        return;
      }
      dialog?.close();
      toast.success("Playlist deleted");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        aria-label="Delete playlist"
        class="text-gray hover:text-danger rounded-full p-1.5 transition-colors"
        onClick={() => dialog?.showModal()}
        type="button"
      >
        <Trash2Icon class={props.size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      </button>
      <dialog
        class="border-divider dark:border-divider-dark fixed top-1/2 left-1/2 m-0 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-white p-6 text-black shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm dark:bg-black dark:text-white"
        closedby="any"
        onCancel={(e) => pending() && e.preventDefault()}
        ref={(el) => (dialog = el)}
      >
        <h2 class="text-lg font-bold">Delete playlist?</h2>
        <p class="text-muted mt-2 text-sm">
          This playlist and all its track associations will be removed. This can't be undone.
        </p>
        <div class="mt-6 flex justify-end gap-3">
          <Button disabled={pending()} onClick={() => dialog?.close()} variant="secondary">
            Cancel
          </Button>
          <button
            class="inline-flex min-w-20 items-center justify-center rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={pending()}
            onClick={() => void confirm()}
            type="button"
          >
            <Show fallback="Delete" when={pending()}>
              <Spinner />
            </Show>
          </button>
        </div>
      </dialog>
    </>
  );
}
