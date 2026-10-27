import { defineFileRoute } from "@solidjs/router/fs";
import type { ParentProps } from "solid-js";
import { DemoToolbar, MobileTabBar, NowPlayingBar, Sidebar } from "../components/chrome";
import { PlayerProvider } from "../components/player";
import { getCurrentUser, getPlaylists, getSlowEnabled } from "../lib/queries";

export const route = defineFileRoute("/(app)", {
  preload: () => [void getPlaylists(), void getCurrentUser(), void getSlowEnabled()],
});

export default function AppLayout(props: ParentProps) {
  return (
    <PlayerProvider>
      <div class="flex min-h-0 flex-1">
        <Sidebar />
        <main class="min-w-0 flex-1 overflow-y-auto pb-24 sm:pb-0">{props.children}</main>
      </div>
      <NowPlayingBar />
      <MobileTabBar />
      <DemoToolbar />
    </PlayerProvider>
  );
}
