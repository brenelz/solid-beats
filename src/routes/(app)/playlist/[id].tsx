import { Title } from "@solidjs/meta";
import type { RouteProps } from "@solidjs/router";
import { defineFileRoute } from "@solidjs/router/fs";
import { createMemo, Errored, Loading, Show } from "solid-js";
import { NotFound } from "../../../components/not-found";
import {
  DeletePlaylistButton,
  PlaylistBrowse,
  PlaylistListSkeleton,
  PlaylistTrackList,
} from "../../../components/playlists";
import { PlayButton, TrackListSkeleton } from "../../../components/tracks";
import { AlbumArt, EmptyState, ErrorFallback, PageWrapper, Skeleton } from "../../../components/ui";
import { getPlaylist, getPlaylists } from "../../../lib/queries";
import type { PlaylistWithTracks } from "../../../lib/types";

export const route = defineFileRoute("/playlist/:id", {
  preload: ({ params }) => [void getPlaylist(params.id), void getPlaylists()],
});

export default function PlaylistPage(props: RouteProps<typeof route>) {
  const playlist = createMemo(() => getPlaylist(props.params.id), { name: "playlist" });
  const playlists = createMemo(() => getPlaylists(), { name: "playlists" });

  return (
    <PageWrapper>
      <Loading fallback={<PlaylistDetailSkeleton />}>
        <Show when={playlist()} fallback={<NotFound what="playlist" />}>
          {(p) => (
            <>
              <Title>{`${p().name} · SolidBeats`}</Title>
              <PlaylistDetail playlist={p()} />
              <section class="mt-10">
                <h2 class="mb-4">Other Playlists</h2>
                <Errored fallback={(_, reset) => <ErrorFallback reset={reset} title="Couldn't load other playlists" />}>
                  <Loading fallback={<PlaylistListSkeleton count={3} />}>
                    <PlaylistBrowse excludeId={p().id} playlists={playlists()} />
                  </Loading>
                </Errored>
              </section>
            </>
          )}
        </Show>
      </Loading>
    </PageWrapper>
  );
}

function PlaylistDetail(props: { playlist: PlaylistWithTracks }) {
  return (
    <>
      <div class="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:gap-6">
        <AlbumArt
          class="!h-40 !w-40 !rounded-md shadow-2xl sm:!h-48 sm:!w-48"
          coverColor={props.playlist.coverColor}
          size="lg"
        />
        <div class="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left">
          <span class="text-muted text-xs font-bold tracking-widest uppercase">Playlist</span>
          <h1 class="text-2xl font-black tracking-tight text-black sm:text-4xl dark:text-white">{props.playlist.name}</h1>
          <Show when={props.playlist.description}>
            <p class="text-muted text-xs sm:text-sm">{props.playlist.description}</p>
          </Show>
          <p class="text-muted text-xs">{props.playlist.trackCount} tracks</p>
        </div>
      </div>
      <div class="mb-6 flex items-center gap-4">
        <Show when={props.playlist.tracks[0]}>
          {(first) => (
            <PlayButton class="!h-14 !w-14 [&_svg]:!h-6 [&_svg]:!w-6" queue={props.playlist.tracks} track={first()} />
          )}
        </Show>
        <DeletePlaylistButton playlistId={props.playlist.id} size="lg" />
      </div>
      <Show
        when={props.playlist.tracks.length > 0}
        fallback={<EmptyState body="Add some tracks to get started." title="Empty playlist" />}
      >
        <PlaylistTrackList playlistId={props.playlist.id} tracks={props.playlist.tracks} />
      </Show>
    </>
  );
}

function PlaylistDetailSkeleton() {
  return (
    <>
      <div class="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:gap-6">
        <Skeleton class="skeleton-subtle h-40 w-40 shrink-0 rounded-md shadow-2xl sm:h-48 sm:w-48" />
        <div class="flex flex-col items-center gap-1 sm:items-start">
          <Skeleton class="h-3 w-16" />
          <Skeleton class="h-9 w-44 sm:h-11 sm:w-52" />
          <Skeleton class="h-4 w-40" />
          <Skeleton class="h-3.5 w-28" />
        </div>
      </div>
      <div class="mb-6 flex items-center gap-4">
        <Skeleton class="h-14 w-14 shrink-0 rounded-full" />
        <Skeleton class="h-8 w-8 shrink-0 rounded-full" />
      </div>
      <TrackListSkeleton count={4} showIndex />
    </>
  );
}
