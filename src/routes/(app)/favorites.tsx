import { Title } from "@solidjs/meta";
import { defineFileRoute } from "@solidjs/router/fs";
import { createMemo, Errored, Loading, Show } from "solid-js";
import { GenreGrid } from "../../components/genres";
import { AlbumGrid, AlbumGridSkeleton, TrackList, TrackListSkeleton } from "../../components/tracks";
import { EmptyState, ErrorFallback, PageWrapper } from "../../components/ui";
import { getDiscover, getFavorites, getGenres } from "../../lib/queries";

export const route = defineFileRoute("/favorites", {
  preload: () => [void getFavorites(), void getDiscover(8), void getGenres()],
});

export default function FavoritesPage() {
  const favorites = createMemo(() => getFavorites(), { name: "favorites" });
  const discover = createMemo(() => getDiscover(8), { name: "discover" });
  const genres = createMemo(() => getGenres(), { name: "genres" });

  return (
    <PageWrapper title="Liked Tracks">
      <Title>Liked Tracks · SolidBeats</Title>
      <Loading fallback={<TrackListSkeleton count={5} showIndex />}>
        <Show
          when={favorites().length > 0}
          fallback={<EmptyState body="Tap the heart on a track to save it here." title="No liked tracks yet" />}
        >
          <TrackList showIndex tracks={favorites()} />
        </Show>
      </Loading>
      <h2 class="mt-10 mb-4">You Might Also Like</h2>
      <Errored fallback={(_, reset) => <ErrorFallback reset={reset} title="Couldn't load recommendations" />}>
        <Loading fallback={<AlbumGridSkeleton />}>
          <AlbumGrid tracks={discover()} />
          <section class="mt-10">
            <h2 class="mb-4">Explore Genres</h2>
            <GenreGrid genres={genres().slice(0, 6)} />
          </section>
        </Loading>
      </Errored>
    </PageWrapper>
  );
}
