import { Title } from "@solidjs/meta";
import { defineFileRoute } from "@solidjs/router/fs";
import { createMemo, Loading } from "solid-js";
import { CreatePlaylistForm, PlaylistBrowse, PlaylistListSkeleton } from "../../../components/playlists";
import { PageWrapper } from "../../../components/ui";
import { getPlaylists } from "../../../lib/queries";

export const route = defineFileRoute("/playlist", {
  preload: () => void getPlaylists(),
});

export default function PlaylistsPage() {
  const playlists = createMemo(() => getPlaylists(), { name: "playlists" });
  return (
    <PageWrapper title="Playlists">
      <Title>Playlists · SolidBeats</Title>
      <div class="mb-6 max-w-md">
        <CreatePlaylistForm />
      </div>
      <Loading fallback={<PlaylistListSkeleton count={3} />}>
        <PlaylistBrowse playlists={playlists()} />
      </Loading>
    </PageWrapper>
  );
}
