import { airspace } from "#/notes.ts";

await airspace.notes.create({
  title: "Hello",
  body: "# hello\n\nfrom my own repo.",
  createdAt: new Date().toISOString(),
});

for (const note of await airspace.notes.list()) {
  console.log(note.rkey, note.value.title);
}
