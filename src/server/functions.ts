import { createServerFn } from "@tanstack/react-start";
import { Effect, Option } from "effect";
import { AppConfig } from "./config.server";
import { runtime } from "./runtime.server";

export const getScaffoldStatus = createServerFn({ method: "GET" }).handler(() =>
  runtime.runPromise(
    Effect.gen(function* () {
      const config = yield* AppConfig;

      return {
        lastfmConfigured: Option.isSome(config.lastfmApiKey),
        node: process.version,
      };
    }),
  ),
);
