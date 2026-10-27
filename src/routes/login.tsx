import { Title } from "@solidjs/meta";
import { useSubmissions } from "@solidjs/router";
import { Show } from "solid-js";
import { MusicNote } from "../components/icons";
import { Button } from "../components/ui";
import { signIn } from "../lib/mutations";
import type { ActionResult } from "../lib/types";

export default function LoginPage() {
  const submissions = useSubmissions(signIn);
  const error = () => {
    const result = submissions.at(-1)?.result as ActionResult | undefined;
    return result && !result.ok ? result.error : undefined;
  };
  return (
    <div class="flex min-h-screen items-center justify-center px-4">
      <Title>Sign in · SolidBeats</Title>
      <div class="w-full max-w-sm">
        <div class="mb-6 flex items-center justify-center gap-2 text-2xl font-bold">
          <MusicNote class="text-accent" size={28} />
          <span>SolidBeats</span>
        </div>
        <form action={signIn} class="flex flex-col gap-3" method="post">
          <label class="text-muted text-sm" for="name">
            Sign in with a username
          </label>
          <input
            aria-describedby={error() ? "sign-in-error" : undefined}
            aria-invalid={error() ? "true" : undefined}
            autocomplete="username"
            autofocus
            id="name"
            name="name"
            placeholder="Ryan"
            required
            type="text"
          />
          <Show when={error()}>
            <p class="text-sm text-red-500" id="sign-in-error" role="alert">
              {error()}
            </p>
          </Show>
          <Button class="w-full" type="submit">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
