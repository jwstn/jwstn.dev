import type { APIContext } from "astro";
import { getAlbumCover, getArtistPhoto } from "#/lib/artwork";

export async function GET({ url }: APIContext) {
  const artist = url.searchParams.get("artist")?.trim() ?? "";
  const album = url.searchParams.get("album")?.trim() ?? "";

  if (!artist || artist.length > 120 || album.length > 200) {
    return new Response(JSON.stringify({ artwork: null }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const artwork = album ? await getAlbumCover(artist, album) : await getArtistPhoto(artist);

  return new Response(JSON.stringify({ artwork }), {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
