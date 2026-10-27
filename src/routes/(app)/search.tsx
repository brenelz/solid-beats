import { Title } from "@solidjs/meta";
import { useIsRouting, useNavigate, type RouteProps } from "@solidjs/router";
import { defineFileRoute } from "@solidjs/router/fs";
import { createMemo, Loading, Show, untrack } from "solid-js";
import { GenreGrid, GenreGridSkeleton } from "../../components/genres";
import { SearchIcon } from "../../components/icons";
import { PlaylistList } from "../../components/playlists";
import { TrackList, TrackListSkeleton } from "../../components/tracks";
import { EmptyState, PageWrapper, Spinner } from "../../components/ui";
import { getGenres, searchCatalog } from "../../lib/queries";

function searchQuery(query: Record<string, string | string[] | undefined>) {
  const value = query.q;
  return ((Array.isArray(value) ? value[0] : value) ?? "").trim();
}

export const route = defineFileRoute("/search", {
  preload: ({ location }) => {
    const q = searchQuery(location.query);
    if (q) void searchCatalog(q);
    else void getGenres();
  },
});

export default function SearchPage(props: RouteProps<typeof route>) {
  const q = () => searchQuery(props.location.query);
  const navigate = useNavigate();
  const isRouting = useIsRouting();

  return (
    <PageWrapper title="Search">
      <Title>{q() ? `${q()} · Search · SolidBeats` : "Search · SolidBeats"}</Title>
      <form class="relative mb-8 flex items-center" onSubmit={(e) => e.preventDefault()} role="search">
        <Show
          when={isRouting()}
          fallback={<SearchIcon class="text-gray pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />}
        >
          <Spinner class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 opacity-40" />
        </Show>
        <input
          aria-label="Search tracks"
          autocomplete="off"
          class="!rounded-full !py-3 !pr-4 !pl-12 !text-base"
          name="q"
          onInput={(e) => {
            const value = e.currentTarget.value.trim();
            navigate(value ? `/search?q=${encodeURIComponent(value)}` : "/search", { replace: true, scroll: false });
          }}
          placeholder="What do you want to listen to?"
          type="search"
          // Server-rendered initial value; afterwards the box is the source of the URL, not the other way round.
          value={untrack(q)}
        />
      </form>
      <div class={["transition-opacity duration-200 ease-out", isRouting() && "opacity-60"]}>
        <Show when={q()} fallback={<BrowseAll />}>
          {(query) => <SearchResults query={query()} />}
        </Show>
      </div>
    </PageWrapper>
  );
}

function BrowseAll() {
  const genres = createMemo(() => getGenres(), { name: "genres" });
  return (
    <>
      <h2 class="mb-4">Browse All</h2>
      <Loading fallback={<GenreGridSkeleton />}>
        <GenreGrid genres={genres()} />
      </Loading>
    </>
  );
}

function SearchResults(props: { query: string }) {
  const results = createMemo(() => searchCatalog(props.query), { name: "searchResults" });
  return (
    <Loading fallback={<TrackListSkeleton count={5} />}>
      <Show
        when={results().tracks.length > 0 || results().playlists.length > 0}
        fallback={<EmptyState body={`No tracks or playlists match "${props.query}".`} title="No results" />}
      >
        <div class="flex flex-col gap-10">
          <Show when={results().tracks.length > 0}>
            <section>
              <h2 class="mb-4">Tracks</h2>
              <TrackList tracks={results().tracks} />
            </section>
          </Show>
          <Show when={results().playlists.length > 0}>
            <section>
              <h2 class="mb-4">Playlists</h2>
              <PlaylistList playlists={results().playlists} />
            </section>
          </Show>
        </div>
      </Show>
    </Loading>
  );
}
