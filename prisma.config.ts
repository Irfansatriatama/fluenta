import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7 moves the datasource connection out of schema.prisma.
// The CLI (migrate/introspect) uses this DIRECT (session-mode) connection;
// the runtime Prisma Client uses the pooled DATABASE_URL (see src/lib/prisma.ts).
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
});
