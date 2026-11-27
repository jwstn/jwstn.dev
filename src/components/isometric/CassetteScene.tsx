export function CassetteScene() {
  return (
    <figure className="iso-cassette" data-cassette>
      <div
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
