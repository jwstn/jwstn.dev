import { expect, it } from "@effect/vitest";
import { ConfigProvider, Effect, Option } from "effect";
import { AppConfig, layer as AppConfigLayer } from "./config.server";

const provider = (env: Record<string, string>) => ConfigProvider.layer(ConfigProvider.fromUnknown(env));

it.effect("reads a configured Last.fm key", () =>
  Effect.gen(function* () {
    const config = yield* AppConfig;

    expect(Option.isSome(config.lastfmApiKey)).toBe(true);
    expect(config.lastfmUsername).toBe("jwstn");
  }).pipe(Effect.provide(AppConfigLayer), Effect.provide(provider({ LASTFM_API_KEY: "test-key" }))),
);

it.effect("degrades when the key is absent", () =>
  Effect.gen(function* () {
    const config = yield* AppConfig;

    expect(Option.isNone(config.lastfmApiKey)).toBe(true);
    expect(config.lastfmUsername).toBe("alice");
  }).pipe(Effect.provide(AppConfigLayer), Effect.provide(provider({ LASTFM_USERNAME: "alice" }))),
);
