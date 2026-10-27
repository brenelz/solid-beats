import { createMemo, createSignal, For, Loading, Match, onSettled, Repeat, Show, Switch } from "solid-js";
import { setSlowEnabled, signOut } from "../lib/mutations";
import { getCurrentUser, getPlaylists, getSlowEnabled } from "../lib/queries";
import { formatDuration } from "../lib/utils";
import {
  GitHubIcon,
  HeartIcon,
  HouseIcon,
  LibraryIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  MusicIcon,
  MusicNote,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  SearchIcon,
  SkipBackIcon,
  SkipForwardIcon,
  SunIcon,
  TimerIcon,
  TimerOffIcon,
  Volume1Icon,
  Volume2Icon,
  VolumeXIcon,
} from "./icons";
import { usePlayer } from "./player";
import { AlbumArt, Skeleton, Spinner } from "./ui";

// The router marks plain anchors: `data-active` when the URL is this page (the root only on an exact match).
const sidebarLink =
  "flex items-center justify-center gap-3 rounded-md p-2 text-sm tracking-tight transition-colors lg:justify-start lg:px-3 text-muted not-data-active:hover:text-black dark:not-data-active:hover:text-white data-active:bg-black/5 dark:data-active:bg-white/10 data-active:font-bold data-active:text-black dark:data-active:text-white data-active:[&_svg]:stroke-[2.5] data-pending:animate-pending";

const iconButtonLink =
  "text-gray rounded-full p-1 transition-colors hover:bg-black/10 hover:text-black dark:hover:bg-white/10 dark:hover:text-white";

export function Sidebar() {
  return (
    <aside class="hidden w-[4.5rem] flex-col gap-2 p-2 sm:flex lg:w-[17.5rem]">
      <div class="bg-card dark:bg-card-dark rounded-lg p-3 lg:p-4">
        <div class="mb-4 hidden items-center justify-between lg:flex">
          <a aria-label="SolidBeats home" class="text-accent inline-flex items-center gap-2 px-1 text-xl font-bold tracking-tight" href="/">
            <MusicNote class="text-accent" size={24} />
            <span>SolidBeats</span>
          </a>
          <a
            aria-label="View source on GitHub"
            class="text-gray rounded-full p-1.5 transition-colors hover:text-black dark:hover:text-white"
            href="https://github.com/brenelz/solid-beats"
            rel="noopener noreferrer"
            target="_blank"
          >
            <GitHubIcon class="h-4 w-4" />
          </a>
        </div>
        <nav class="flex flex-col gap-1 text-sm font-medium">
          <a aria-label="Home" class={sidebarLink} href="/" preload="viewport">
            <HouseIcon class="h-5 w-5" />
            <span class="hidden truncate lg:inline">Home</span>
          </a>
          <a aria-label="Search" class={sidebarLink} href="/search" preload="viewport">
            <SearchIcon class="h-5 w-5" />
            <span class="hidden truncate lg:inline">Search</span>
          </a>
          <a aria-label="Library" class={sidebarLink} href="/library" preload="viewport">
            <MusicIcon class="h-5 w-5" />
            <span class="hidden truncate lg:inline">Library</span>
          </a>
        </nav>
      </div>

      <div class="bg-card dark:bg-card-dark flex min-h-0 flex-1 flex-col rounded-lg">
        <div class="flex items-center gap-2 px-3 py-3 lg:px-4">
          <LibraryIcon class="text-gray h-5 w-5 shrink-0" />
          <span class="text-gray hidden text-sm font-bold lg:inline">Your Library</span>
          <a aria-label="Create playlist" class={[iconButtonLink, "ml-auto hidden lg:block"]} href="/playlist" title="Create playlist">
            <PlusIcon class="h-5 w-5" />
          </a>
        </div>
        <nav class="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-2">
          <a aria-label="Liked Tracks" class={sidebarLink} href="/favorites" preload="viewport">
            <HeartIcon class="h-4 w-4" />
            <span class="hidden truncate lg:inline">Liked Tracks</span>
          </a>
          <div class="border-divider dark:border-divider-dark my-1 hidden border-t lg:block" />
          <Loading fallback={<SidebarPlaylistsSkeleton />}>
            <SidebarPlaylists />
          </Loading>
        </nav>
        <div class="border-divider dark:border-divider-dark hidden items-center justify-between border-t px-3 py-2 lg:flex">
          <div class="flex items-center gap-2">
            <Loading fallback={<Skeleton class="h-8 w-8 rounded-full" />}>
              <CurrentUserAvatar />
            </Loading>
            <form action={signOut} class="group" method="post">
              <button
                aria-label="Sign out"
                class="text-gray rounded-full p-1.5 transition-colors hover:text-black group-aria-busy:opacity-60 dark:hover:text-white"
                title="Sign out"
                type="submit"
              >
                <LogOutIcon class="h-4 w-4 group-aria-busy:hidden" />
                <Spinner class="hidden h-4 w-4 group-aria-busy:block" />
              </button>
            </form>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}

function SidebarPlaylists() {
  const playlists = createMemo(() => getPlaylists(), { name: "sidebarPlaylists" });
  return (
    <div class="flex flex-col gap-0.5">
      {/* Hover and focus preload these; no viewport preload, so a long list doesn't wake the server on load. */}
      <For each={playlists()} keyed={(p) => p.id}>
        {(pl) => (
          <a aria-label={pl().name} class={sidebarLink} href={`/playlist/${pl().id}`}>
            <span class={["inline-block h-3 w-3 shrink-0 rounded-sm bg-gradient-to-br", pl().coverColor]} />
            <span class="hidden truncate lg:inline">{pl().name}</span>
          </a>
        )}
      </For>
    </div>
  );
}

function SidebarPlaylistsSkeleton() {
  return (
    <div class="flex flex-col gap-0.5">
      <Repeat count={3}>
        {() => (
          <div class="flex min-h-9 items-center gap-3 rounded-md p-2 lg:px-3">
            <Skeleton class="h-3 w-3 shrink-0 rounded-sm" />
          </div>
        )}
      </Repeat>
    </div>
  );
}

function CurrentUserAvatar() {
  const user = createMemo(() => getCurrentUser(), { name: "currentUser" });
  return (
    <div
      aria-hidden="true"
      class="bg-accent flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white uppercase"
      title={user().name}
    >
      {user().name.charAt(0)}
    </div>
  );
}

const mobileTab =
  "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors text-gray hover:text-black dark:hover:text-white data-active:text-accent data-active:font-bold data-active:[&_svg]:stroke-[2.5]";

export function MobileTabBar() {
  return (
    <nav
      aria-label="Primary"
      class="border-divider/70 dark:border-divider-dark/70 flex w-full shrink-0 border-t bg-white pb-[env(safe-area-inset-bottom)] sm:hidden dark:bg-[#181818]"
    >
      <a aria-label="Home" class={mobileTab} href="/">
        <HouseIcon class="h-5 w-5" />
        <span>Home</span>
      </a>
      <a aria-label="Search" class={mobileTab} href="/search">
        <SearchIcon class="h-5 w-5" />
        <span>Search</span>
      </a>
      <a aria-label="Library" class={mobileTab} href="/library">
        <LibraryIcon class="h-5 w-5" />
        <span>Library</span>
      </a>
      <a aria-label="Liked" class={mobileTab} href="/favorites">
        <HeartIcon class="h-5 w-5" />
        <span>Liked</span>
      </a>
    </nav>
  );
}

type Theme = "light" | "dark" | "system";

function applyTheme(theme: Theme) {
  const dark = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.dataset.theme = theme;
}

export function ThemeToggle() {
  // The server can't know the saved theme, so nothing is marked active until the client has read it.
  const [theme, setTheme] = createSignal<Theme | undefined>();
  onSettled(() => {
    setTheme((document.documentElement.dataset.theme as Theme | undefined) ?? "system");
    const media = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => theme() === "system" && applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  });
  const choose = (next: Theme) => {
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
    applyTheme(next);
  };
  const options = [
    { Icon: SunIcon, label: "Light mode", value: "light" },
    { Icon: MoonIcon, label: "Dark mode", value: "dark" },
    { Icon: MonitorIcon, label: "System theme", value: "system" },
  ] as const;
  return (
    <div class="inline-flex items-center gap-0.5">
      <For each={options}>
        {(o) => (
          <button
            aria-label={o.label}
            aria-pressed={theme() === o.value ? "true" : "false"}
            class={[
              "rounded-full p-1.5 text-sm transition-colors",
              theme() === o.value ? "bg-surface dark:bg-surface-dark text-black dark:text-white" : "text-gray hover:text-black dark:hover:text-white",
            ]}
            onClick={() => choose(o.value)}
            type="button"
          >
            <o.Icon class="size-4" />
          </button>
        )}
      </For>
    </div>
  );
}

export function NowPlayingBar() {
  const player = usePlayer();
  const elapsed = () => (player.track ? Math.floor((player.progress / 100) * player.track.duration) : 0);
  const total = () => player.track?.duration ?? 0;

  return (
    <>
      <Show when={player.track}>
        {(track) => (
          <div class="border-divider dark:border-divider-dark shrink-0 border-t bg-white px-4 py-2 sm:hidden dark:bg-[#181818]">
            <div class="flex items-center gap-3">
              <AlbumArt
                class="!h-12 !w-12 !rounded-sm"
                coverColor={track().coverColor}
                coverSeed={track().id}
                label={track().title}
                size="sm"
              />
              <TrackInfo subtitle={track().artist} title={track().title} />
              <div class="ml-auto flex items-center gap-3">
                <SkipButton direction="back" disabled={!player.hasQueue} onClick={player.previous} />
                <PlayPauseButton isPlaying={player.isPlaying} onClick={player.togglePlayPause} />
                <SkipButton direction="forward" disabled={!player.hasQueue} onClick={player.next} />
              </div>
            </div>
            <div class="mt-2 flex items-center gap-2">
              <span class="text-muted w-8 text-right text-[10px]">{formatDuration(elapsed())}</span>
              <div class="bg-divider dark:bg-divider-dark relative h-0.5 flex-1 rounded-full">
                <div class="bg-accent absolute top-0 left-0 h-full rounded-full" style={{ width: `${player.progress}%` }} />
              </div>
              <span class="text-muted w-8 text-[10px]">{formatDuration(total())}</span>
            </div>
          </div>
        )}
      </Show>

      <div class="border-divider dark:border-divider-dark hidden shrink-0 border-t bg-white px-4 py-2 sm:block dark:bg-[#181818]">
        <div class="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_2fr] items-center gap-4 lg:grid-cols-[minmax(0,1fr)_2fr_minmax(0,1fr)]">
          <div class="flex min-w-0 items-center gap-3">
            <AlbumArt
              class="!h-10 !w-10 !rounded-sm lg:!h-14 lg:!w-14"
              coverColor={player.track?.coverColor ?? "from-gray-400 to-gray-600"}
              coverSeed={player.track?.id}
              label={player.track?.title}
              size="sm"
            />
            <Show
              when={player.track}
              fallback={<TrackInfo subtitle="Select a track to play" title="No track playing" />}
            >
              {(track) => (
                <TrackInfo href={`/track/${track().id}`} subtitle={`${track().artist} · ${track().album}`} title={track().title} />
              )}
            </Show>
          </div>
          <div class="flex w-full flex-col items-center gap-1">
            <div class="flex items-center gap-5">
              <SkipButton direction="back" disabled={!player.track || !player.hasQueue} onClick={player.previous} />
              <PlayPauseButton disabled={!player.track} isPlaying={player.isPlaying} onClick={player.togglePlayPause} />
              <SkipButton direction="forward" disabled={!player.track || !player.hasQueue} onClick={player.next} />
            </div>
            <div class="flex w-full items-center gap-2">
              <span class="text-muted w-8 text-right text-[10px]">{formatDuration(elapsed())}</span>
              <SliderBar disabled label="Seek" value={player.progress} />
              <span class="text-muted w-8 text-[10px]">{formatDuration(total())}</span>
            </div>
          </div>
          <div class="hidden items-center justify-end gap-1.5 lg:flex">
            <button
              aria-label={player.volume === 0 ? "Unmute" : "Mute"}
              class="text-muted transition-colors hover:text-black dark:hover:text-white"
              onClick={() => player.setVolume(player.volume === 0 ? 75 : 0)}
              type="button"
            >
              <Switch fallback={<Volume2Icon class="h-3.5 w-3.5" />}>
                <Match when={player.volume === 0}>
                  <VolumeXIcon class="h-3.5 w-3.5" />
                </Match>
                <Match when={player.volume < 50}>
                  <Volume1Icon class="h-3.5 w-3.5" />
                </Match>
              </Switch>
            </button>
            <SliderBar class="w-20 flex-none" label="Volume" onInput={player.setVolume} value={player.volume} />
          </div>
        </div>
      </div>
    </>
  );
}

function SliderBar(props: { value: number; onInput?: (v: number) => void; class?: string; label: string; disabled?: boolean }) {
  return (
    <div class={["group/slider relative flex flex-1 items-center", props.class]}>
      <div class="bg-divider dark:bg-divider-dark relative h-0.5 w-full rounded-full transition-all group-hover/slider:h-1">
        <div
          class="group-hover/slider:bg-accent absolute top-0 left-0 h-full rounded-full bg-black/60 dark:bg-white/60"
          style={{ width: `${props.value}%` }}
        />
      </div>
      <input
        aria-label={props.label}
        class={[
          "absolute inset-0 m-0 h-full w-full appearance-none border-0 bg-transparent p-0 opacity-0",
          props.disabled ? "pointer-events-none" : "cursor-pointer",
        ]}
        disabled={props.disabled}
        max="100"
        min="0"
        onInput={(e) => props.onInput?.(Number(e.currentTarget.value))}
        type="range"
        value={props.value}
      />
    </div>
  );
}

function SkipButton(props: { direction: "back" | "forward"; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      aria-label={props.direction === "back" ? "Previous" : "Next"}
      class="text-muted p-1 transition-colors hover:text-black disabled:opacity-40 dark:hover:text-white"
      disabled={props.disabled}
      onClick={() => props.onClick()}
      type="button"
    >
      <Show when={props.direction === "back"} fallback={<SkipForwardIcon class="h-4 w-4" />}>
        <SkipBackIcon class="h-4 w-4" />
      </Show>
    </button>
  );
}

function PlayPauseButton(props: { isPlaying: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      aria-label={props.isPlaying ? "Pause" : "Play"}
      class="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-transform hover:scale-105 disabled:opacity-40 dark:bg-white dark:text-black"
      disabled={props.disabled}
      onClick={() => props.onClick()}
      type="button"
    >
      <Show when={props.isPlaying} fallback={<PlayIcon class="h-4 w-4 translate-x-[1px]" fill="currentColor" />}>
        <PauseIcon class="h-4 w-4" fill="currentColor" />
      </Show>
    </button>
  );
}

function TrackInfo(props: { title: string; subtitle: string; href?: string }) {
  return (
    <div class="flex min-w-0 flex-col">
      <Show when={props.href} fallback={<span class="truncate text-sm font-medium text-black dark:text-white">{props.title}</span>}>
        {(href) => (
          <a class="truncate text-sm font-medium text-black hover:underline dark:text-white" href={href()}>
            {props.title}
          </a>
        )}
      </Show>
      <span class="text-muted truncate text-xs">{props.subtitle}</span>
    </div>
  );
}

/** Floating demo controls, top right on desktop (like the original's toolbar). */
export function DemoToolbar() {
  return (
    <div class="fixed top-3 right-3 z-50 hidden items-end gap-2 sm:flex">
      <Loading fallback={<Skeleton class="h-8 w-24 rounded-full" />}>
        <DelaysToggle />
      </Loading>
    </div>
  );
}

function DelaysToggle() {
  const slow = createMemo(() => getSlowEnabled(), { name: "slowEnabled" });
  const [pending, setPending] = createSignal(false);
  // Like the original: persist the setting in a cookie, then reload so every query re-runs under it.
  const toggle = async () => {
    setPending(true);
    await setSlowEnabled(!slow());
    window.location.reload();
  };
  return (
    <div class="border-divider dark:border-divider-dark flex items-center overflow-hidden rounded-full border bg-white/80 text-xs shadow-sm backdrop-blur-md dark:bg-black/80">
      <button
        aria-label={`Delays ${slow() ? "on" : "off"}`}
        aria-pressed={slow() ? "true" : "false"}
        class={[
          "flex items-center gap-1.5 px-3 py-1.5 font-medium transition-colors",
          slow() ? "text-accent" : "text-gray hover:text-black dark:hover:text-white",
          pending() && "cursor-not-allowed opacity-70",
        ]}
        disabled={pending()}
        onClick={() => void toggle()}
        title="Simulate a slow database"
        type="button"
      >
        <Show when={slow()} fallback={<TimerOffIcon class="size-3.5" />}>
          <TimerIcon class="size-3.5" />
        </Show>
        <span>Delays</span>
      </button>
    </div>
  );
}
