import { createSignal, For } from "solid-js";
import { CheckIcon, TriangleAlertIcon } from "./icons";

type Toast = { id: number; message: string; kind: "default" | "success" | "error" };

const [toasts, setToasts] = createSignal<Toast[]>([]);
let nextId = 0;

function push(message: string, kind: Toast["kind"], duration = 4000) {
  const id = ++nextId;
  setToasts((list) => [...list.slice(-2), { id, kind, message }]);
  setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), duration);
}

/** A small stand-in for sonner: `toast()`, `toast.success()`, `toast.error()`. */
export const toast = Object.assign((message: string, opts?: { duration?: number }) => push(message, "default", opts?.duration), {
  error: (message: string) => push(message, "error"),
  success: (message: string) => push(message, "success"),
});

export function Toaster() {
  return (
    <ol
      aria-live="polite"
      class="pointer-events-none fixed right-4 bottom-24 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:bottom-24"
    >
      <For each={toasts()}>
        {(t) => (
          <li class="border-divider dark:border-divider-dark pointer-events-auto flex animate-[toast-in_200ms_ease-out] items-center gap-2 rounded-lg border bg-white px-4 py-3 text-sm text-black shadow-lg dark:bg-[#181818] dark:text-white">
            {t.kind === "success" ? <CheckIcon class="text-success size-4 shrink-0" /> : null}
            {t.kind === "error" ? <TriangleAlertIcon class="text-danger size-4 shrink-0" /> : null}
            <span>{t.message}</span>
          </li>
        )}
      </For>
    </ol>
  );
}
