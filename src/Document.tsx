import type { ParentProps } from "solid-js";
import { HydrationScript } from "@solidjs/web";
import geistLatin from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url";
import appCss from "./App.css?inline";

// Applies the saved theme before first paint, so dark mode never flashes light.
const themeScript = `(function(){try{var t=localStorage.getItem("theme")||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.dataset.theme=t}catch(e){}})()`;

export default function Document(props: ParentProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="preload" href={geistLatin} as="font" type="font/woff2" crossorigin="" />
        <style>{appCss}</style>
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
