export interface MusicArtist {
  readonly name: string;
  readonly playcount: string;
  readonly url: string;
}

export interface MusicTrack {
  readonly name: string;
  readonly artist: string;
  readonly album?: string;
  readonly url: string;
  readonly nowPlaying: boolean;
  readonly playedAt?: string;
}

export interface MusicResult {
  readonly status: "live" | "stale" | "unavailable";
  readonly configured: boolean;
  readonly username: string;
  readonly artists: ReadonlyArray<MusicArtist>;
  readonly tracks: ReadonlyArray<MusicTrack>;
}
