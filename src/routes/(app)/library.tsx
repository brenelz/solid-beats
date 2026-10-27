import { Title } from "@solidjs/meta";
import { defineFileRoute } from "@solidjs/router/fs";
import { createMemo, Loading, Show } from "solid-js";
import { GenreGrid } from "../../components/genres";
import { PlusIcon } from "../../components/icons";
import { PlaylistBrowse } from "../../components/playlists";
import { AlbumGrid, AlbumGridSkeleton } from "../../components/tracks";
import { Collapsible, PageWrapper } from "../../components/ui";
import { getGenres, getLibrary, getPlaylists } from "../../lib/queries";

const INITIAL_VISIBLE = 20;

export const route = defineFileRoute("/library", {
  preload: () => [void getLibrary(), void getPlaylists(), void getGenres()],
});

export default function LibraryPage() {
  const library = createMemo(() => getLibrary(), { name: "library" });
  const playlists = createMemo(() => getPlaylists(), { name: "playlists" });
  const genres = createMemo(() => getGenres(), { name: "genres" });
  const overflow = () => library().slice(INITIAL_VISIBLE);

  return (
    <PageWrapper title="Library">
      <Title>Library · SolidBeats</Title>
      <h2 class="mb-4">All Tracks</h2>
      <Loading fallback={<AlbumGridSkeleton />}>
        <div class="mb-10">
          <AlbumGrid tracks={library().slice(0, INITIAL_VISIBLE)} />
          <Show when={overflow().length > 0}>
            <Collapsible showMoreLabel={`Show ${overflow().length} more`}>
              <AlbumGrid tracks={overflow()} />
            </Collapsible>
          </Show>
        </div>
        <section class="mb-10">
          <div class="mb-4 flex items-center gap-2">
            <h2>Your Playlists</h2>
            <a
              aria-label="Create playlist"
              class="text-gray rounded-full p-1 transition-colors hover:bg-black/10 hover:text-black dark:hover:bg-white/10 dark:hover:text-white"
              href="/playlist"
              title="Create playlist"
            >
              <PlusIcon class="h-5 w-5" />
            </a>
          </div>
          <PlaylistBrowse playlists={playlists()} />
        </section>
        <section>
          <h2 class="mb-4">Genres</h2>
          <GenreGrid genres={genres().slice(0, 6)} />
        </section>
      </Loading>
    </PageWrapper>
  );
}
