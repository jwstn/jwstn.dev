import { Config, Context, Effect, Layer, type Option, type Redacted } from "effect";

export interface AppConfigShape {
  readonly lastfmApiKey: Option.Option<Redacted.Redacted<string>>;
  readonly lastfmUsername: string;
}

export class AppConfig extends Context.Service<AppConfig, AppConfigShape>()("AppConfig") {}

export const layer = Layer.effect(
  AppConfig,
  Effect.gen(function* () {
    const lastfmApiKey = yield* Config.option(Config.Redacted("LASTFM_API_KEY"));
    const lastfmUsername = yield* Config.String("LASTFM_USERNAME").pipe(Config.withDefault("jwstn"));

    return AppConfig.of({ lastfmApiKey, lastfmUsername });
  }),
);
