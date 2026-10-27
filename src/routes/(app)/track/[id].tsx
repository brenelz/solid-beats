import { Title } from "@solidjs/meta";
import type { RouteProps } from "@solidjs/router";
import { defineFileRoute } from "@solidjs/router/fs";
import { createMemo, Errored, Loading, Show } from "solid-js";
import { GenrePill } from "../../../components/genres";
import { NotFound } from "../../../components/not-found";
import { AddToPlaylistMenu, FavoriteButton, PlayButton, TrackList, TrackListSkeleton } from "../../../components/tracks";
import { AlbumArt, ErrorFallback, PageWrapper, Skeleton } from "../../../components/ui";
import { getRecommendedTracks, getTrack } from "../../../lib/queries";
import { formatCount, formatDuration } from "../../../lib/utils";

export const route = defineFileRoute("/track/:id", {
  preload: ({ params }) => [void getTrack(params.id), void getRecommendedTracks(params.id)],
});

export default function TrackPage(props: RouteProps<typeof route>) {
  const track = createMemo(() => getTrack(props.params.id), { name: "track" });
  const recommended = createMemo(() => getRecommendedTracks(props.params.id), { name: "recommended" });

  return (
    <PageWrapper>
      <Loading fallback={<TrackHeaderSkeleton />}>
        <Show when={track()} fallback={<NotFound what="track" />}>
          {(t) => (
            <>
              <Title>{`${t().title} · SolidBeats`}</Title>
              <div class="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:gap-6">
                <AlbumArt
                  class="!h-40 !w-40 shrink-0 !rounded-md shadow-2xl lg:!h-48 lg:!w-48"
                  coverColor={t().coverColor}
                  coverSeed={t().id}
                  label={t().title}
                  size="lg"
                />
                <div class="flex min-w-0 flex-col items-center gap-1 text-center sm:items-start sm:text-left">
                  <span class="text-muted text-xs font-bold tracking-widest uppercase">Track</span>
                  <h1 class="text-2xl font-black tracking-tight text-black sm:text-3xl lg:text-4xl dark:text-white">
                    {t().title}
                  </h1>
                  <p class="text-muted text-xs sm:text-sm">
                    {t().artist} · {t().album} · {formatDuration(t().duration)} · {formatCount(t().playCount)} plays
                  </p>
                  <div class="mt-1">
                    <GenrePill genre={t().genre} />
                  </div>
                </div>
              </div>
              <div class="mb-8 flex items-center gap-4">
                <PlayButton class="!h-14 !w-14 [&_svg]:!h-6 [&_svg]:!w-6" track={t()} />
                <FavoriteButton isFavorite={t().isFavorite} size="lg" trackId={t().id} />
                <AddToPlaylistMenu size="lg" trackId={t().id} />
              </div>
            </>
          )}
        </Show>
      </Loading>
      <section>
        <h2 class="mb-4">More songs you might like</h2>
        <Errored fallback={(_, reset) => <ErrorFallback reset={reset} title="Couldn't load recommendations" />}>
          <Loading fallback={<TrackListSkeleton count={3} />}>
            <TrackList tracks={recommended()} />
          </Loading>
        </Errored>
      </section>
    </PageWrapper>
  );
}

function TrackHeaderSkeleton() {
  return (
    <>
      <div class="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:gap-6">
        <Skeleton class="skeleton-subtle h-40 w-40 shrink-0 rounded-md shadow-2xl lg:h-48 lg:w-48" />
        <div class="flex min-w-0 flex-1 flex-col items-center gap-1 sm:items-start">
          <Skeleton class="h-3 w-12" />
          <Skeleton class="h-8 w-52 sm:h-9 sm:w-60" />
          <Skeleton class="h-4 w-40" />
          <Skeleton class="mt-1 h-6 w-16 rounded-full" />
        </div>
      </div>
      <div class="mb-8 flex items-center gap-4">
        <Skeleton class="h-14 w-14 shrink-0 rounded-full" />
        <Skeleton class="h-8 w-8 shrink-0 rounded-full" />
        <Skeleton class="h-8 w-8 shrink-0 rounded-full" />
      </div>
    </>
  );
}
