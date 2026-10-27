import { MusicIcon } from "./icons";

export function NotFound(props: { what?: string }) {
  return (
    <div class="flex flex-col items-center gap-3 px-5 py-16 text-center">
      <MusicIcon class="text-gray h-8 w-8" />
      <p class="text-sm font-medium text-black dark:text-white">
        {props.what ? `${props.what.charAt(0).toUpperCase()}${props.what.slice(1)} not found` : "Page not found"}
      </p>
      <p class="text-gray max-w-xs text-sm">The {props.what ?? "page"} you're looking for doesn't exist.</p>
      <a
        class="border-divider hover:bg-card dark:border-divider-dark dark:hover:bg-card-dark inline-flex items-center justify-center rounded-full border bg-white px-5 py-2 text-sm font-semibold text-black dark:bg-black dark:text-white"
        href="/"
      >
        Go home
      </a>
    </div>
  );
}
