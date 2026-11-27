import type { Album, Post, Project } from "#/lib/content";

// The component returned by astro:content's render() — an Astro component that
// renders the entry's markdown. It is passed from the route pages into theme
// components as a plain prop and rendered as <Content />.
export type ContentComponent = (props?: Record<string, unknown>) => unknown;

export interface LayoutProps {
  title: string;
  description?: string;
}

export type HomeProps = {};

export interface ProjectsProps {
  projects: Project[];
}

export interface ProjectProps {
  project: Project;
  Content: ContentComponent;
}

export interface BlogProps {
  posts: Post[];
}

export interface PostProps {
  post: Post;
  Content: ContentComponent;
}

export interface GalleryProps {
  albums: Album[];
}

export interface AlbumProps {
  album: Album;
}
