import type { JSX } from "@solidjs/web";
import { action, createMemo, createOptimistic, createSignal, For, Loading, Repeat, Show } from "solid-js";
import { addToPlaylist, removeFromPlaylist, toggleFavorite } from "../lib/mutations";
import { getPlaylistMenuItems } from "../lib/queries";
import type { ActionResult, PlaylistMenuItem, Track } from "../lib/types";
import { formatCount, formatDuration } from "../lib/utils";
import { CheckIcon, HeartIcon, ListPlusIcon, MusicIcon, PlayIcon, PlusIcon } from "./icons";
import { usePlayer } from "./player";
import { toast } from "./toaster";
import { AlbumArt, Collapsible, Equalizer, gridClass, NoteGlyph, Skeleton } from "./ui";

/** Clicks on these inside a playable row belong to them, not to the row. */
const ownClick = (e: Event) => (e.target as Element).closest("a, button, [popover]") !== null;

export function PlayButton(props: { track: Track; queue?: Track[]; class?: string; size?: "sm" | "md" }) {
  const player = usePlayer();
  const playing = () => player.isPlaying && player.track?.id === props.track.id;
  return (
    <button
      aria-label={playing() ? `Pause ${props.track.title}` : `Play ${props.track.title}`}
      class={[
        "bg-accent flex items-center justify-center rounded-full text-white shadow-xl transition-transform hover:scale-105",
        props.size === "sm" ? "h-8 w-8" : "h-10 w-10",
        props.class,
      ]}
      data-playing={playing() || undefined}
      // Inside a card link: preventDefault keeps the click from navigating (the router skips prevented clicks).
      onClick={(e) => {
        e.preventDefault();
        player.toggle(props.track, props.queue);
      }}
      type="button"
    >
      <Show
        when={playing()}
        fallback={<PlayIcon class={["translate-x-[1px]", props.size === "sm" ? "h-4 w-4" : "h-5 w-5"]} fill="currentColor" />}
      >
        <Equalizer color="bg-white" size={props.size === "sm" ? "sm" : "md"} />
      </Show>
    </button>
  );
}

export function TrackPlayRow(props: { track: Track; queue?: Track[]; children: JSX.Element }) {
  const player = usePlayer();
  const current = () => player.track?.id === props.track.id;
  const playing = () => current() && player.isPlaying;
  return (
    <article
      aria-label={playing() ? `Pause ${props.track.title}` : `Play ${props.track.title}`}
      class={[
        "group/track cursor-pointer rounded-md transition-colors",
        current() ? "bg-card/40 dark:bg-card-dark/40" : "hover:bg-card/60 dark:hover:bg-card-dark/60",
      ]}
      onClick={(e) => {
        if (!ownClick(e)) player.toggle(props.track, props.queue);
      }}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
          e.preventDefault();
          player.toggle(props.track, props.queue);
        }
      }}
      role="button"
      tabindex="0"
    >
      {props.children}
    </article>
  );
}

export function NowPlayingTrackLink(props: { track: Track }) {
  const player = usePlayer();
  return (
    <a
      class={[
        "truncate text-sm font-medium hover:underline",
        player.track?.id === props.track.id ? "text-accent" : "text-black dark:text-white",
      ]}
      href={`/track/${props.track.id}`}
    >
      {props.track.title}
    </a>
  );
}

export function TrackIndexCell(props: { trackId: string; index?: number }) {
  const player = usePlayer();
  const current = () => player.track?.id === props.trackId;
  const hoverPlay = (
    <PlayIcon
      class="hidden h-3.5 w-3.5 text-black group-hover/track:inline dark:text-white [@media(hover:none)]:inline"
      fill="currentColor"
    />
  );
  return (
    <Show
      when={!(current() && player.isPlaying)}
      fallback={
        <span class="flex w-5 items-center justify-center">
          <Equalizer size="sm" />
        </span>
      }
    >
      <Show
        when={!current()}
        fallback={
          <span class="text-accent flex w-5 justify-center text-xs font-bold">
            {props.index !== undefined ? props.index + 1 : "•"}
          </span>
        }
      >
        <span class="w-5 text-right">
          <Show when={props.index !== undefined}>
            <span class="text-muted font-mono text-xs group-hover/track:hidden [@media(hover:none)]:hidden">
              {(props.index ?? 0) + 1}
            </span>
          </Show>
          {hoverPlay}
        </span>
      </Show>
    </Show>
  );
}

export function FavoriteButton(props: { trackId: string; isFavorite: boolean; size?: "sm" | "lg" }) {
  // Shows the new state at once; it reverts to the server's answer when the toggle and its revalidation land.
  const [favorite, setFavorite] = createOptimistic(() => props.isFavorite);
  const toggle = action(function* () {
    setFavorite((f) => !f);
    yield toggleFavorite(props.trackId);
  });
  return (
    <button
      aria-label={favorite() ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={favorite() ? "true" : "false"}
      class={[
        "rounded-full p-1.5 transition-colors",
        favorite() ? "text-accent hover:text-accent-hover" : "text-gray hover:text-black dark:hover:text-white",
      ]}
      onClick={() => void toggle()}
      type="button"
    >
      <HeartIcon class={props.size === "lg" ? "h-5 w-5" : "h-4 w-4"} fill={favorite() ? "currentColor" : "none"} />
    </button>
  );
}

export function AddToPlaylistMenu(props: { trackId: string; size?: "sm" | "lg" }) {
  let button: HTMLButtonElement | undefined;
  let menu: HTMLDivElement | undefined;
  const [open, setOpen] = createSignal(false);

  // The menu sits in the top layer (popover), so it is placed by hand under its button.
  const place = () => {
    if (!button || !menu) return;
    const r = button.getBoundingClientRect();
    const width = 224;
    menu.style.left = `${Math.max(8, Math.min(r.left, window.innerWidth - width - 8))}px`;
    const below = r.bottom + 8;
    const height = menu.offsetHeight;
    menu.style.top = `${below + height > window.innerHeight - 8 ? Math.max(8, r.top - height - 8) : below}px`;
  };

  return (
    <>
      <button
        aria-expanded={open() ? "true" : "false"}
        aria-haspopup="menu"
        aria-label="Add to playlist"
        class={[
          "text-gray rounded-full p-1.5 transition-colors hover:text-black dark:hover:text-white",
          open() && "text-accent dark:text-accent",
        ]}
        onClick={() => {
          if (!open()) menu?.showPopover();
          else menu?.hidePopover();
        }}
        ref={(el) => (button = el)}
        type="button"
      >
        <ListPlusIcon class={props.size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      </button>
      <div
        class="border-divider dark:border-divider-dark fixed m-0 w-56 rounded-xl border bg-white p-2 text-black shadow-xl dark:bg-black dark:text-white"
        onToggle={(e) => {
          const isOpen = (e as ToggleEvent).newState === "open";
          setOpen(isOpen);
          if (isOpen) queueMicrotask(place);
        }}
        popover="auto"
        ref={(el) => (menu = el)}
        role="menu"
      >
        <p class="text-muted mb-1 px-3 py-1 text-xs font-semibold">Add to Playlist</p>
        <Show when={open()}>
          <Loading fallback={<PlaylistMenuSkeleton />}>
            <PlaylistMenuItems trackId={props.trackId} />
          </Loading>
        </Show>
      </div>
    </>
  );
}

function PlaylistMenuSkeleton() {
  return (
    <div class="flex flex-col gap-0.5">
      <Repeat count={3}>
        {(i) => (
          <div class="flex items-center gap-2 rounded-md px-3 py-2">
            <Skeleton class="h-4 w-4 shrink-0" />
            <Skeleton class={["h-4", ["w-24", "w-20", "w-28"][i]]} />
          </div>
        )}
      </Repeat>
    </div>
  );
}

function PlaylistMenuItems(props: { trackId: string }) {
  const items = createMemo(() => getPlaylistMenuItems(props.trackId), { name: "playlistMenuItems" });
  return (
    <Show when={items().length > 0} fallback={<p class="text-muted px-3 py-2 text-xs">Create a playlist first.</p>}>
      <div class="flex flex-col gap-0.5">
        <For each={items()} keyed={(item) => item.value}>
          {(item) => <PlaylistToggleItem item={item()} trackId={props.trackId} />}
        </For>
      </div>
    </Show>
  );
}

function PlaylistToggleItem(props: { item: PlaylistMenuItem; trackId: string }) {
  const [active, setActive] = createOptimistic(() => props.item.active);
  const toggle = action(function* () {
    const wasActive = active();
    setActive(!wasActive);
    const result: ActionResult = yield (wasActive ? removeFromPlaylist : addToPlaylist)(props.item.value, props.trackId);
    if (!result.ok) toast.error(result.error);
    else toast.success(`${wasActive ? "Removed from" : "Added to"} ${props.item.label}`);
  });
  return (
    <button
      class={[
        "hover:bg-card dark:hover:bg-card-dark focus-visible:bg-card dark:focus-visible:bg-card-dark flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors outline-none",
        active() ? "text-accent" : "text-black dark:text-white",
      ]}
      onClick={() => void toggle()}
      role="menuitemcheckbox"
      aria-checked={active() ? "true" : "false"}
      type="button"
    >
      <Show when={active()} fallback={<PlusIcon class="h-4 w-4 shrink-0" />}>
        <CheckIcon class="h-4 w-4 shrink-0" />
      </Show>
      <span class="truncate">{props.item.label}</span>
    </button>
  );
}

export function TrackRow(props: { track: Track; index?: number; queue?: Track[]; showAlbum?: boolean; trailing?: JSX.Element }) {
  return (
    <TrackPlayRow queue={props.queue} track={props.track}>
      <div class="flex items-center gap-3 px-3 py-2">
        <TrackIndexCell index={props.index} trackId={props.track.id} />
        <AlbumArt coverColor={props.track.coverColor} size="sm" />
        <div class="flex min-w-0 flex-1 flex-col">
          <NowPlayingTrackLink track={props.track} />
          <span class="text-muted truncate text-xs">
            {props.track.artist}
            {props.showAlbum === false ? "" : ` · ${props.track.album}`}
          </span>
        </div>
        <span class="text-muted hidden text-xs sm:block">{formatCount(props.track.playCount)} plays</span>
        <span class="text-muted font-mono text-xs">{formatDuration(props.track.duration)}</span>
        <FavoriteButton isFavorite={props.track.isFavorite} trackId={props.track.id} />
        <AddToPlaylistMenu trackId={props.track.id} />
      </div>
    </TrackPlayRow>
  );
}

export function TrackList(props: { tracks: Track[]; showIndex?: boolean; collapseAfter?: number }) {
  const split = () => props.collapseAfter !== undefined && props.tracks.length > props.collapseAfter;
  const visible = () => (split() ? props.tracks.slice(0, props.collapseAfter) : props.tracks);
  const overflow = () => (split() ? props.tracks.slice(props.collapseAfter) : []);
  return (
    <>
      <div class="flex flex-col gap-0.5">
        <For each={visible()} keyed={(t) => t.id}>
          {(track, i) => <TrackRow index={props.showIndex ? i() : undefined} queue={props.tracks} track={track()} />}
        </For>
      </div>
      <Show when={overflow().length > 0}>
        <Collapsible showMoreLabel={`Show ${overflow().length} more`}>
          <For each={overflow()} keyed={(t) => t.id}>
            {(track, i) => (
              <TrackRow index={props.showIndex ? visible().length + i() : undefined} queue={props.tracks} track={track()} />
            )}
          </For>
        </Collapsible>
      </Show>
    </>
  );
}

export function TrackRowSkeleton(props: { showIndex?: boolean; index?: number }) {
  return (
    <div class="flex items-center gap-3 px-3 py-2">
      <Show when={props.showIndex} fallback={<span class="w-5" />}>
        <span class="text-muted w-5 text-right font-mono text-xs">{(props.index ?? 0) + 1}</span>
      </Show>
      <Skeleton class="h-10 w-10 shrink-0 rounded-md" />
      <div class="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton class="h-3.5 w-28" />
        <Skeleton class="h-3 w-20" />
      </div>
      <Skeleton class="hidden h-3 w-14 sm:block" />
      <Skeleton class="h-3 w-8" />
      <span class="p-1.5">
        <Skeleton class="h-4 w-4 rounded-full" />
      </span>
      <span class="p-1.5">
        <Skeleton class="h-4 w-4 rounded-full" />
      </span>
    </div>
  );
}

export function TrackListSkeleton(props: { count?: number; showIndex?: boolean; showMore?: boolean }) {
  return (
    <>
      <div class="flex flex-col gap-0.5">
        <Repeat count={props.count ?? 5}>{(i) => <TrackRowSkeleton index={i} showIndex={props.showIndex} />}</Repeat>
      </div>
      <Show when={props.showMore}>
        <Skeleton class="skeleton-subtle mt-3 h-5 w-24" />
      </Show>
    </>
  );
}

export function AlbumCard(props: { track: Track }) {
  const player = usePlayer();
  return (
    <a
      class="group bg-card/50 hover:bg-card dark:bg-card-dark/50 dark:hover:bg-card-dark flex flex-col gap-3 rounded-lg p-3 transition-colors"
      href={`/track/${props.track.id}`}
    >
      <div class="relative">
        <div
          class={[
            "flex aspect-square w-full items-center justify-center rounded-md bg-gradient-to-br shadow-lg",
            props.track.coverColor,
          ]}
        >
          <NoteGlyph class="h-1/3 w-1/3 text-white/50" />
        </div>
        <PlayButton class="card-play-btn absolute right-2 bottom-2" track={props.track} />
      </div>
      <div class="flex min-w-0 flex-col gap-0.5">
        <span
          class={[
            "truncate text-sm font-semibold",
            player.track?.id === props.track.id ? "text-accent" : "text-black dark:text-white",
          ]}
        >
          {props.track.title}
        </span>
        <span class="text-muted truncate text-xs">{props.track.artist}</span>
      </div>
    </a>
  );
}

export function AlbumGrid(props: { tracks: Track[] }) {
  return (
    <div class={gridClass}>
      <For each={props.tracks} keyed={(t) => t.id}>
        {(track) => <AlbumCard track={track()} />}
      </For>
    </div>
  );
}

export function AlbumCardSkeleton() {
  return (
    <div class="flex flex-col gap-3 rounded-lg p-3">
      <Skeleton class="skeleton-subtle aspect-square w-full rounded-md" />
      <div class="flex flex-col gap-1.5">
        <Skeleton class="skeleton-subtle h-4 w-3/4" />
        <Skeleton class="skeleton-subtle h-3 w-1/2" />
      </div>
    </div>
  );
}

export function AlbumGridSkeleton(props: { count?: number }) {
  return (
    <div class={gridClass}>
      <Repeat count={props.count ?? 5}>{() => <AlbumCardSkeleton />}</Repeat>
    </div>
  );
}

const SLOTS = 6;

/** Recently played, as the home page's quick-play grid. Empty slots keep the grid's height. */
export function QuickPlayGrid(props: { tracks: Track[] }) {
  return (
    <div class="relative grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      <For each={props.tracks} keyed={(t) => t.id}>
        {(track) => (
          <TrackPlayRow track={track()}>
            <div class="bg-card/60 hover:bg-card dark:bg-card-dark/60 dark:hover:bg-card-dark flex items-center gap-3 rounded-md px-3 py-2 transition-colors">
              <TrackIndexCell trackId={track().id} />
              <AlbumArt class="!h-10 !w-10 !rounded-md" coverColor={track().coverColor} size="sm" />
              <div class="flex min-w-0 flex-1 flex-col">
                <NowPlayingTrackLink track={track()} />
                <span class="text-muted truncate text-xs">{track().artist}</span>
              </div>
            </div>
          </TrackPlayRow>
        )}
      </For>
      <Repeat count={Math.max(0, SLOTS - props.tracks.length)}>
        {() => (
          <div aria-hidden="true" class="flex items-center gap-3 rounded-md px-3 py-2 opacity-0">
            <span class="w-5" />
            <span class="h-10 w-10 shrink-0 rounded-md" />
          </div>
        )}
      </Repeat>
      <Show when={props.tracks.length === 0}>
        <div class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
          <MusicIcon class="text-divider dark:text-divider-dark size-8" />
          <p class="text-sm font-medium text-black dark:text-white">Nothing played yet</p>
          <p class="text-gray max-w-xs text-sm">Play a track and it'll show up here.</p>
        </div>
      </Show>
    </div>
  );
}

export function QuickPlayGridSkeleton() {
  return (
    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      <Repeat count={SLOTS}>
        {() => (
          <div class="flex items-center gap-3 rounded-md px-3 py-2">
            <span class="w-5" />
            <Skeleton class="h-10 w-10 shrink-0 rounded-md" />
            <div class="flex min-w-0 flex-1 flex-col gap-1">
              <Skeleton class="h-4 w-24 rounded" />
              <Skeleton class="h-3 w-16 rounded" />
            </div>
          </div>
        )}
      </Repeat>
    </div>
  );
}
