import { defineFileRoute } from "@solidjs/router/fs";
import { createMemo, Loading } from "solid-js";
import { GenreGrid } from "../../components/genres";
import { PlaylistBrowse } from "../../components/playlists";
import { AlbumGrid, AlbumGridSkeleton, QuickPlayGrid, QuickPlayGridSkeleton } from "../../components/tracks";
import { PageWrapper } from "../../components/ui";
import { getGenres, getMostPlayed, getPlaylists, getRecentlyPlayed } from "../../lib/queries";

export const route = defineFileRoute("/", {
  preload: () => [void getRecentlyPlayed(6), void getMostPlayed(8), void getPlaylists(), void getGenres()],
});

export default function HomePage() {
  const recent = createMemo(() => getRecentlyPlayed(6), { name: "recentlyPlayed" });
  const mostPlayed = createMemo(() => getMostPlayed(8), { name: "mostPlayed" });
  const playlists = createMemo(() => getPlaylists(), { name: "playlists" });
  const genres = createMemo(() => getGenres(), { name: "genres" });

  return (
    <PageWrapper title="Welcome back">
      <h2 class="mb-4">Recently Played</h2>
      <Loading fallback={<QuickPlayGridSkeleton />}>
        <QuickPlayGrid tracks={recent()} />
      </Loading>
      <h2 class="mt-10 mb-4">Most Played</h2>
      <Loading fallback={<AlbumGridSkeleton count={8} />}>
        <AlbumGrid tracks={mostPlayed()} />
        <section class="mt-10">
          <h2 class="mb-4">Your Playlists</h2>
          <PlaylistBrowse playlists={playlists()} />
        </section>
        <section class="mt-10">
          <h2 class="mb-4">Browse Genres</h2>
          <GenreGrid genres={genres().slice(0, 6)} />
        </section>
      </Loading>
    </PageWrapper>
  );
}
