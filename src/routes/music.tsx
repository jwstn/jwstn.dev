import { createFileRoute } from "@tanstack/react-router";
import { clsx } from "clsx";
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
      <h1 className="sr-only">Music</h1>

      {music.status === "unavailable" && !music.configured && (
        <section className="iso-slab iso-music-empty">
          <h2 className="iso-music-empty-title">Not connected yet</h2>
          <p>
            Listening stats appear once <code>LASTFM_API_KEY</code> is configured on the server.
          </p>
        </section>
      )}

      {music.status === "unavailable" && music.configured && (
        <section className="iso-slab iso-music-empty">
          <h2 className="iso-music-empty-title">Last.fm is out of reach</h2>
          <p>The stats could not be loaded right now. Try again in a few minutes.</p>
        </section>
      )}

      {music.status !== "unavailable" && (
        <>
          <section aria-labelledby="iso-top-artists">
            <h2 id="iso-top-artists" className="iso-sectionlabel">
              Top artists &mdash; last 30 days
            </h2>
            <ul className="iso-artists">
              {music.artists.map((artist) => (
                <li key={artist.name}>
                  <a className="iso-slab iso-artist" href={artist.url} target="_blank" rel="noopener noreferrer">
                    <span className="iso-artist-name">{artist.name}</span>
                    <span className="iso-artist-plays">{artist.playcount} plays</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="iso-scrobbles">
            <h2 id="iso-scrobbles" className="iso-sectionlabel">
              Recent scrobbles
            </h2>
            <ul className="iso-scrobbles">
              {music.tracks.map((track) => (
                <li
                  className={clsx("iso-scrobble", track.nowPlaying && "iso-scrobble--now")}
                  key={`${track.url}-${track.playedAt ?? "now"}`}
                >
                  <span className="iso-scrobble-body">
                    <span className="iso-scrobble-artist">{track.artist}</span>
                    <span className="iso-scrobble-sep" aria-hidden="true">
                      &mdash;
                    </span>
                    <a href={track.url} target="_blank" rel="noopener noreferrer" className="iso-scrobble-track">
                      {track.name}
                    </a>
                    {track.album && track.album !== track.name && (
                      <span className="iso-scrobble-album">on {track.album}</span>
                    )}
                  </span>
                  {track.nowPlaying && (
                    <span className="iso-eq ml-4" role="img" aria-label="Now playing">
                      <span className="iso-eq-bar"></span>
                      <span className="iso-eq-bar"></span>
                      <span className="iso-eq-bar"></span>
                      <span className="iso-eq-bar"></span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <p className="iso-attribution">
            Listening data from{" "}
            <a href={`https://www.last.fm/user/${music.username}`} target="_blank" rel="noopener noreferrer">
              Last.fm
            </a>
          </p>
        </>
      )}
    </div>
  );
}
