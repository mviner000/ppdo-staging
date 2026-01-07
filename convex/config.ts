// convex/config.ts

import { query } from "./_generated/server";

export const getEnvironment = query({
  args: {},
  handler: async (ctx) => {
    // Get environment from Convex environment variable
    const env = process.env.APP_ENV || "production";
    return env as "production" | "staging" | "development";
  },
});