import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "#/consts";

export { SITE_DESCRIPTION, SITE_TITLE, SITE_URL };

interface HeadInput {
  title: string;
  description?: string;
  pathname: string;
}

export function buildHead({ title, description = SITE_DESCRIPTION, pathname }: HeadInput) {
  const canonical = new URL(pathname, SITE_URL).toString();

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:url", content: canonical },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: canonical }],
  };
}
