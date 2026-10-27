import type { StartMiddleware } from "@solidjs/vite-plugin";
import { parseCookieHeader, redirect } from "@solidjs/web";
import { SESSION_COOKIE } from "./lib/utils";

// Auth gate, like the original's proxy.ts: page requests without a session go to /login, and /login with one goes home.
const authGate: StartMiddleware = (event, next) => {
  const { request } = event;
  const url = new URL(request.url);
  const isPage = request.method === "GET" && request.headers.get("accept")?.includes("text/html");
  if (!isPage) return next();
  const authed = Boolean(parseCookieHeader(request.headers.get("cookie"))[SESSION_COOKIE]);
  if (url.pathname === "/login") {
    if (authed) throw redirect("/");
  } else if (!authed) {
    throw redirect("/login");
  }
  return next();
};

export default [authGate];
