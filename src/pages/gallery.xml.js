import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { SITE_DESCRIPTION, SITE_TITLE } from "#/consts";

export async function GET(context) {
  const images = await getCollection("gallery");
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: images.map((image) => ({
      ...image.data,
      link: `/gallery/${image.id}`,
    })),
  });
}
