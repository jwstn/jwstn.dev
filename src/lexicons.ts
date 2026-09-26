import { defineLexicons, field, space } from "airspace/lexicon";

export default defineLexicons("dev.blog", {
  note: {
    title: field.text({ max: 120 }),
    body: field.markdown(),
    createdAt: field.datetime(),
  },
  workspace: space(["note"]),
});
