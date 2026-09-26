import { createAirspace, passwordSession } from "airspace";
import { workspace } from "#/collections.ts";

const session = await passwordSession({
  service: "http://localhost:2583",
  identifier: process.env.PDS_IDENTIFIER!,
  password: process.env.PDS_PASSWORD!,
});

export const airspace = createAirspace({
  // on a public PDS, your handle is enough: identity: 'you.example.com'
  identity: { did: process.env.PDS_DID!, service: "http://localhost:2583" },
  spaces: { workspace },
  session,
});
