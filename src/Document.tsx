import type { ParentProps } from "solid-js";
import { HydrationScript } from "@solidjs/web";

// Applies the saved theme before first paint, so dark mode never flashes light.
const themeScript = `(function(){try{var t=localStorage.getItem("theme")||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.dataset.theme=t}catch(e){}})()`;

export default function Document(props: ParentProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap"
        />
        <meta
          name="description"
          content="SolidBeats, a music player demo rebuilt with SolidJS 2 and Solid Router — a port of vercel-labs/next-beats."
        />
        <title>SolidBeats</title>
        <script>{themeScript}</script>
        <HydrationScript />
      </head>
      <body class="bg-surface dark:bg-surface-dark flex h-dvh flex-col text-black antialiased dark:text-white">
        {props.children}
      </body>
    </html>
  );
}
