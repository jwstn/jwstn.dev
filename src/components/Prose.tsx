export function Prose({ html }: { html: string }) {
  return <div className="iso-prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
