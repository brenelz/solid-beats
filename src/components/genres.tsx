import { For, Repeat } from "solid-js";
import type { GenreSummary } from "../lib/types";
import { Skeleton } from "./ui";

const genreColors: Record<string, string> = {
  electronic: "from-pink-400/80 to-rose-500/80",
  "hip-hop": "from-rose-300/80 to-pink-400/80",
  indie: "from-pink-300/80 to-rose-400/80",
  "lo-fi": "from-rose-400/80 to-pink-600/80",
  pop: "from-pink-200/80 to-rose-300/80",
  synthwave: "from-rose-500/80 to-pink-700/80",
};

export function GenrePill(props: { genre: string }) {
  return (
    <a
      class="bg-accent/10 text-accent hover:bg-accent/20 rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors"
      href={`/genre/${props.genre}`}
    >
      {props.genre}
    </a>
  );
}

export function GenreCard(props: { genre: GenreSummary }) {
  return (
    <a
      class="group relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02]"
      href={`/genre/${props.genre.genre}`}
      preload="viewport"
    >
      <div class={["flex h-28 items-end bg-gradient-to-br p-4", genreColors[props.genre.genre] ?? "from-gray-500 to-gray-700"]}>
        <div>
          <span class="text-lg font-bold text-white capitalize drop-shadow-md">{props.genre.genre}</span>
          <p class="text-xs text-white/70">{props.genre.count} tracks</p>
        </div>
      </div>
    </a>
  );
}

export function GenreGrid(props: { genres: GenreSummary[] }) {
  return (
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <For each={props.genres} keyed={(g) => g.genre}>
        {(g) => <GenreCard genre={g()} />}
      </For>
    </div>
  );
}

export function GenreGridSkeleton() {
  return (
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <Repeat count={6}>{() => <Skeleton class="skeleton-subtle h-28 rounded-lg" />}</Repeat>
    </div>
  );
}
