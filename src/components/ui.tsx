import type { JSX } from "@solidjs/web";
import { Repeat, Show, type ParentProps } from "solid-js";
import { coverSrc, type CoverKind, type CoverShape } from "../lib/covers";
import { MusicIcon, TriangleAlertIcon } from "./icons";

type ArtSize = "sm" | "md" | "lg";
const artSizes: Record<ArtSize, string> = { lg: "h-24 w-24", md: "h-12 w-12", sm: "h-10 w-10" };

export function NoteGlyph(props: { class?: string }) {
  return (
    <svg
      aria-hidden="true"
      class={props.class ?? "h-1/3 w-1/3 text-white/60"}
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      viewBox="0 0 24 24"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

export function CoverImage(props: { seed: string; label: string; kind: CoverKind; shape: CoverShape; class?: string }) {
  return (
    <img
      alt=""
      class={props.class ?? "pointer-events-none absolute inset-0 block h-full w-full object-cover"}
      decoding="sync"
      loading="eager"
      src={coverSrc(props.seed, props.label, props.kind, props.shape)}
    />
  );
}

export function AlbumArt(props: {
  coverColor: string;
  coverSeed?: string;
  label?: string;
  kind?: Exclude<CoverKind, "genre">;
  size?: ArtSize;
  class?: string;
  style?: JSX.CSSProperties;
}) {
  return (
    <div
      class={[
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br",
        props.coverColor,
        artSizes[props.size ?? "md"],
        props.class,
      ]}
      style={props.style}
    >
      <Show when={props.coverSeed} fallback={<NoteGlyph />}>
        {(seed) => (
          <CoverImage
            kind={props.kind ?? "track"}
            label={props.label ?? seed()}
            seed={seed()}
            shape={props.size === "lg" ? "square" : "thumb"}
          />
        )}
      </Show>
    </div>
  );
}

export function Skeleton(props: { class?: JSX.HTMLAttributes<HTMLSpanElement>["class"] }) {
  return <span aria-hidden="true" class={["skeleton-animation block", props.class]} />;
}

export function Spinner(props: { class?: string }) {
  return (
    <svg aria-hidden="true" class={["h-4 w-4 animate-spin", props.class]} fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        class="opacity-75"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Equalizer(props: { size?: "sm" | "md" | "lg"; color?: string }) {
  const bar = () => (props.size === "lg" ? "w-1.5" : props.size === "md" ? "w-1" : "w-0.75");
  const gap = () => (props.size === "lg" ? "gap-1" : props.size === "md" ? "gap-[3px]" : "gap-0.5");
  const color = () => props.color ?? "bg-accent";
  return (
    <span class={["flex items-end", gap()]}>
      <span class={["inline-block animate-[eq1_0.8s_ease-in-out_infinite] rounded-sm", color(), bar()]} />
      <span class={["inline-block animate-[eq2_0.6s_ease-in-out_infinite_0.2s] rounded-sm", color(), bar()]} />
      <span class={["inline-block animate-[eq3_0.7s_ease-in-out_infinite_0.1s] rounded-sm", color(), bar()]} />
    </span>
  );
}

export function EmptyState(props: ParentProps<{ title: string; body?: string }>) {
  return (
    <div class="border-divider/70 dark:border-divider-dark/70 flex flex-col items-center gap-3 border-b px-5 py-16 text-center">
      <MusicIcon class="text-divider dark:text-divider-dark size-8" />
      <p class="text-sm font-medium text-black dark:text-white">{props.title}</p>
      {props.body ? <p class="text-gray max-w-xs text-sm">{props.body}</p> : null}
      {props.children}
    </div>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "default" | "sm" | "icon";
const buttonSizes: Record<ButtonSize, string> = {
  default: "px-5 py-2 text-sm",
  icon: "h-9 w-9 rounded-full",
  sm: "px-3 py-1.5 text-xs",
};
const buttonVariants: Record<ButtonVariant, string> = {
  ghost: "text-gray hover:bg-card hover:text-black dark:hover:bg-card-dark dark:hover:text-white",
  primary: "bg-accent text-white hover:bg-accent-hover",
  secondary:
    "border border-divider bg-white text-black hover:bg-card dark:border-divider-dark dark:bg-black dark:text-white dark:hover:bg-card-dark",
};

/** In a busy form (`aria-busy`, set by the router while its action runs) a submit button shows a spinner and disables. */
export function Button(
  props: ParentProps<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    class?: string;
    type?: "button" | "submit";
    disabled?: boolean;
    onClick?: (e: MouseEvent) => void;
  }>,
) {
  return (
    <button
      class={[
        "group/button inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        props.type === "submit" && "in-aria-busy:pointer-events-none in-aria-busy:opacity-50",
        buttonSizes[props.size ?? "default"],
        buttonVariants[props.variant ?? "primary"],
        props.class,
      ]}
      disabled={props.disabled}
      onClick={(e) => props.onClick?.(e)}
      type={props.type ?? "button"}
    >
      {props.type === "submit" ? <Spinner class="hidden in-aria-busy:block" /> : null}
      {props.children}
    </button>
  );
}

export function PageWrapper(props: ParentProps<{ title?: string }>) {
  return (
    <div class="px-6 py-6 sm:px-8">
      {props.title ? <h1 class="mb-6 text-3xl font-bold">{props.title}</h1> : null}
      {props.children}
    </div>
  );
}

export function Collapsible(props: ParentProps<{ showMoreLabel: string; showLessLabel?: string }>) {
  return (
    <details class="flex flex-col [&_summary_.label-less]:hidden [&[open]_summary_.label-less]:inline [&[open]_summary_.label-more]:hidden">
      <summary class="text-muted hover:text-accent order-2 mt-3 cursor-pointer list-none text-sm font-medium transition-colors">
        <span class="label-more">{props.showMoreLabel}</span>
        <span class="label-less">{props.showLessLabel ?? "Show less"}</span>
      </summary>
      <div class="order-1 mt-0.5 flex flex-col gap-0.5">{props.children}</div>
    </details>
  );
}

export function ErrorFallback(props: { title?: string; compact?: boolean; reset: () => void }) {
  return (
    <div
      class={
        props.compact
          ? "flex flex-col items-center gap-2 px-4 py-4 text-center"
          : "flex flex-col items-center gap-3 px-5 py-10 text-center"
      }
    >
      <TriangleAlertIcon class={props.compact ? "text-danger size-4" : "text-danger size-6"} />
      <p class={props.compact ? "text-gray text-xs" : "text-sm font-medium text-black dark:text-white"}>
        {props.title ?? "Something went wrong"}
      </p>
      <Button onClick={() => props.reset()} size="sm" variant="secondary">
        Try again
      </Button>
    </div>
  );
}

export const gridClass = "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";

export function SkeletonRepeat(props: { count: number; children: (i: number) => JSX.Element }) {
  return <Repeat count={props.count}>{(i) => props.children(i)}</Repeat>;
}
