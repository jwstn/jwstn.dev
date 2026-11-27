import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";

export function CassetteScene() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let cancelled = false;
    let teardown: (() => void) | undefined;

    void import("./three/mount")
      .then(({ mount }) => {
        if (cancelled) return;

        teardown = mount(stage, {
          onFallback: () => setIsFallback(true),
          reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        });
      })
      .catch((error) => {
        console.warn("[cassette] scene failed to start:", error);
        setIsFallback(true);
      });

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, []);

  return (
    <figure className={clsx("iso-cassette", isFallback && "is-fallback")} data-cassette>
      <div
        ref={stageRef}
        className="iso-cassette-stage"
        data-cassette-stage
        role="img"
        aria-label="Interactive 3D model of a blue cassette player beside a wooden shelf of eight mixtapes. Drag a tape into the player, or drag empty space to orbit."
      >
        <p className="iso-cassette-fallback">3D view unavailable — this browser has no WebGL.</p>
      </div>
    </figure>
  );
}
