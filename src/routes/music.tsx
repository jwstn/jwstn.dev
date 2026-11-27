import { createFileRoute } from "@tanstack/react-router";
import type { MusicResult } from "#/lib/music";
import { buildHead } from "#/lib/site";
import { getMusic } from "#/server/functions";

export const Route = createFileRoute("/music")({
  headers: () => ({
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
  }),
  head: ({ match }) => buildHead({ title: "Music | jwstn.dev", pathname: match.pathname }),
  loader: () => getMusic(),
  component: Music,
});

function Music() {
  const music = Route.useLoaderData() as MusicResult;

  return (
    <div className="iso-shell iso-stack">
      <h1 className="iso-h1">Music</h1>

      {music.status === "unavailable" && !music.configured && (
        <p className="iso-hero-copy">
          Not connected yet. Listening stats appear once <code>LASTFM_API_KEY</code> is configured.
        </p>
      )}

      {music.status === "unavailable" && music.configured && (
        <p className="iso-hero-copy">Last.fm is out of reach. Try again in a few minutes.</p>
      )}

      {music.status !== "unavailable" && (
        <>
          <section>
            <h2 className="iso-sectionlabel">Top artists — last 30 days</h2>
            <ul className="iso-artists">
              {music.artists.map((artist) => (
                <li className="iso-slab iso-artist" key={artist.name}>
                  <span className="iso-artist-name">{artist.name}</span>
                  <span className="iso-artist-plays">{artist.playcount} plays</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="iso-sectionlabel">Recent scrobbles</h2>
            <ul className="iso-scrobbles">
              {music.tracks.map((track) => (
                <li className="iso-scrobble" key={`${track.url}-${track.playedAt ?? "now"}`}>
                  <span className="iso-scrobble-artist">{track.artist}</span>
                  <span className="iso-scrobble-sep" aria-hidden="true">
                    &mdash;
                  </span>
                  <a href={track.url} target="_blank" rel="noopener noreferrer" className="iso-scrobble-track">
                    {track.name}
                  </a>
                  {track.album && <span className="iso-scrobble-album">on {track.album}</span>}
                  {track.nowPlaying && <span className="iso-scrobble-album">now playing</span>}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
