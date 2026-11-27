import path from "node:path";
import { type AnyContent, defineCollection, defineConfig, type Meta, type WriterHook } from "@content-collections/core";
import { compileMarkdown } from "@content-collections/markdown";
import rehypeShiki from "@shikijs/rehype";
import { Schema } from "effect";
import sharp from "sharp";

type ImageRef = {
  readonly key: string;
  readonly width: number;
  readonly height: number;
};

const assetsRoot = path.resolve("src/assets");

async function resolveImage(value: string, meta: Meta, directory: string): Promise<ImageRef> {
  const absolute = path.resolve(directory, path.dirname(meta.filePath), value);

  if (!absolute.startsWith(`${assetsRoot}${path.sep}`)) {
    throw new Error(`Image "${value}" in ${meta.filePath} resolves outside src/assets`);
  }

  const metadata = await sharp(absolute).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error(`Image "${value}" in ${meta.filePath} has no intrinsic dimensions`);
  }

  return {
    key: `/${path.relative(process.cwd(), absolute).split(path.sep).join("/")}`,
    width: metadata.width,
    height: metadata.height,
  };
}

type MarkdownOptions = NonNullable<Parameters<typeof compileMarkdown>[2]>;

const markdownOptions: MarkdownOptions = {
  rehypePlugins: [[rehypeShiki, { theme: "tokyo-night" }]],
};

const blog = defineCollection({
  name: "blog",
  directory: "src/content/blog",
  include: "**/*.md",
  parser: "frontmatter",
  schema: Schema.toStandardSchemaV1(
    Schema.Struct({
      title: Schema.String,
      description: Schema.String,
      pubDate: Schema.DateFromString,
      updatedDate: Schema.optionalKey(Schema.DateFromString),
      heroImage: Schema.optionalKey(Schema.String),
      content: Schema.String,
    }),
  ),
  transform: async (doc, context) => {
    const { content: _content, ...rest } = doc;

    return {
      ...rest,
      heroImage: doc.heroImage ? await resolveImage(doc.heroImage, doc._meta, "src/content/blog") : undefined,
      html: await compileMarkdown(context, doc, markdownOptions),
    };
  },
});

const projects = defineCollection({
  name: "projects",
  directory: "src/content/projects",
  include: "**/*.md",
  parser: "frontmatter",
  schema: Schema.toStandardSchemaV1(
    Schema.Struct({
      title: Schema.String,
      description: Schema.String,
      pubDate: Schema.DateFromString,
      href: Schema.String,
      tags: Schema.Array(Schema.String),
      content: Schema.String,
    }),
  ),
  transform: async (doc, context) => {
    const { content: _content, ...rest } = doc;

    return {
      ...rest,
      html: await compileMarkdown(context, doc, markdownOptions),
    };
  },
});

const gallery = defineCollection({
  name: "gallery",
  directory: "src/content/gallery",
  include: "**/*.json",
  parser: "json",
  schema: Schema.toStandardSchemaV1(
    Schema.Struct({
      title: Schema.String,
      pubDate: Schema.DateFromString,
      slug: Schema.String,
      photos: Schema.Array(
        Schema.Struct({
          image: Schema.String,
          title: Schema.String,
          caption: Schema.optionalKey(Schema.String),
        }),
      ),
    }),
  ),
  transform: async (album) => ({
    ...album,
    photos: await Promise.all(
      album.photos.map(async (photo) => ({
        ...photo,
        image: await resolveImage(photo.image, album._meta, "src/content/gallery"),
      })),
    ),
  }),
});

const serverOnlyHook: WriterHook = async ({ fileType, content }) => {
  if (fileType === "typeDefinition") return { content };
  return { content: `import "@tanstack/react-start/server-only";\n\n${content}` };
};

const content = [blog, projects, gallery] satisfies AnyContent[];

export default defineConfig({
  content,
  hooks: {
    writer: [serverOnlyHook],
  },
});
