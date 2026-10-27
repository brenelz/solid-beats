import { Title } from "@solidjs/meta";
import type { RouteDefinition } from "@solidjs/router";
import { httpStatus } from "@solidjs/web";
import { NotFound } from "../../components/not-found";

// httpStatus() runs in preload so the 404 is set before the response head flushes (a no-op in the browser).
export const route = {
  preload: () => httpStatus(404),
} satisfies RouteDefinition;

export default function NotFoundPage() {
  return (
    <>
      <Title>Not Found · SolidBeats</Title>
      <NotFound />
    </>
  );
}
