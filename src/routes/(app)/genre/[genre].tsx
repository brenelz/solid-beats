import { Title } from "@solidjs/meta";
import type { RouteProps } from "@solidjs/router";
import { defineFileRoute } from "@solidjs/router/fs";
import { createMemo, Errored, Loading, Show } from "solid-js";
import { GenreGrid, GenreGridSkeleton } from "../../../components/genres";
import { TrackList, TrackListSkeleton } from "../../../components/tracks";
import { EmptyState, ErrorFallback, PageWrapper, Skeleton } from "../../../components/ui";
import { getGenres, getTracksByGenre } from "../../../lib/queries";

export const route = defineFileRoute("/genre/:genre", {
  preload: ({ params }) => [void getTracksByGenre(decodeURIComponent(params.genre)), void getGenres()],
});

export default function GenrePage(props: RouteProps<typeof route>) {
  const label = () => decodeURIComponent(props.params.genre);
  const tracks = createMemo(() => getTracksByGenre(label()), { name: "genreTracks" });
  const genres = createMemo(() => getGenres(), { name: "genres" });

  return (
    <PageWrapper>
      <Title>{`${label().charAt(0).toUpperCase()}${label().slice(1)} · SolidBeats`}</Title>
      <Loading
        fallback={
          <>
            <Skeleton class="mb-6 h-9 w-40" />
            <TrackListSkeleton count={5} showIndex showMore />
          </>
        }
      >
        <h1 class="mb-6 text-3xl font-bold capitalize">{label()}</h1>
        <Show when={tracks().length > 0} fallback={<EmptyState body={`No tracks in ${label()} yet.`} title="No tracks" />}>
          <TrackList collapseAfter={5} showIndex tracks={tracks()} />
        </Show>
      </Loading>
      <section class="mt-10">
        <h2 class="mb-4">Explore Other Genres</h2>
        <Errored fallback={(_, reset) => <ErrorFallback reset={reset} title="Couldn't load other genres" />}>
          <Loading fallback={<GenreGridSkeleton />}>
            <GenreGrid genres={genres().slice(0, 6)} />
          </Loading>
        </Errored>
      </section>
    </PageWrapper>
  );
}
