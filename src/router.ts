import { pageRoutes } from "virtual:file-routes";
import { createRouter, intentPreload, pendingLinks, viewportPreload } from "@solidjs/router";
import { fileRoutes } from "@solidjs/router/fs";

export const Router = createRouter({
  routes: fileRoutes(pageRoutes),
  links: pendingLinks,
  // Like the original's partial prefetching: links marked preload="viewport" warm their data once visible,
  // and every link warms on hover, focus, or touch.
  preloadLinks: [intentPreload(), viewportPreload({ data: true })],
});

export const { paths } = Router;
