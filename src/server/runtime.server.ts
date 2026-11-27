import { Layer, Logger, ManagedRuntime } from "effect";
import { FetchHttpClient } from "effect/http";
import { layer as AppConfigLayer } from "./config.server";
import { layer as ContentLayer } from "./content.server";
import { layer as LastfmLayer } from "./lastfm.server";

const AppLayer = Layer.mergeAll(
  AppConfigLayer,
  ContentLayer,
  LastfmLayer.pipe(Layer.provide(Layer.merge(AppConfigLayer, FetchHttpClient.layer))),
  Logger.layer([Logger.consoleJson]),
);

type AppRuntime = ManagedRuntime.ManagedRuntime<Layer.Success<typeof AppLayer>, Layer.Error<typeof AppLayer>>;

const globalStore = globalThis as typeof globalThis & {
  __jwstnRuntime?: AppRuntime;
};

export const runtime: AppRuntime = globalStore.__jwstnRuntime ?? ManagedRuntime.make(AppLayer);
globalStore.__jwstnRuntime = runtime;

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    void runtime.dispose();
    delete globalStore.__jwstnRuntime;
  });
}
