// "Convert a custom catalog" — the After catalog (React tab), as published on
// https://docs.copilotkit.ai/claude-sdk-typescript/generative-ui/components/from-a2ui
// It uses `z`, `Airport` and `Arrow` without importing or defining them; the
// two marked lines supply them.
import {
  createGenerativeUI,
  standardUI,
} from "@copilotkit/react-core/v2/generative-ui";
import { z } from "zod"; // Repo-authored import.
import { Airport, Arrow } from "./scaffolding"; // Borrowed scaffolding (aws-strands-ts).

export const appUI = createGenerativeUI({
  id: "acme/flights@1",
  extends: [standardUI],
  components: {
    Airport: {
      component: Airport,
      description: "An airport by IATA code, with its city under it.",
      props: z.object({ code: z.string(), city: z.string() }),
    },
    Arrow: { component: Arrow, description: "An arrow between two airports." },
  },
});
