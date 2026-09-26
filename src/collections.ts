import { defineCollections, defineSpace } from "airspace";
import lexicons from "#/lexicons";

export const { note: notes } = defineCollections(lexicons, {
  note: { sort: [["createdAt", "desc"]] },
});

export const workspace = defineSpace(lexicons.workspace, {
  collections: { notes },
});
