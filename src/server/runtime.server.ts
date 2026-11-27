import { Layer, Logger, ManagedRuntime } from "effect";
import { layer as AppConfigLayer } from "./config.server";

const AppLayer = Layer.mergeAll(AppConfigLayer, Logger.layer([Logger.consoleJson]));

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
