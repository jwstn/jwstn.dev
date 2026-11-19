import { type CollectionEntry, getCollection, render } from "astro:content";

// Social links every theme must offer in header and/or footer.
export const SOCIALS = [
  { label: "GitHub", href: "https://github.com/jwstn" },
  { label: "Bluesky", href: "https://bsky.app/profile/jwstn.bsky.social" },
] as const;

export type Project = CollectionEntry<"projects">;
export type Post = CollectionEntry<"blog">;
export type Album = CollectionEntry<"gallery">;

export async function getProjects(): Promise<Project[]> {
  return (await getCollection("projects")).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getPosts(): Promise<Post[]> {
  return (await getCollection("blog")).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getAlbums(): Promise<Album[]> {
  return (await getCollection("gallery")).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return (await getCollection("projects")).find((p) => p.id === slug);
}

export async function getPost(slug: string): Promise<Post | undefined> {
  return (await getCollection("blog")).find((p) => p.id === slug);
}

export async function getAlbum(slug: string): Promise<Album | undefined> {
  return (await getCollection("gallery")).find((g) => g.data.slug === slug);
}

export async function renderEntry(entry: Project | Post) {
  return render(entry);
}
