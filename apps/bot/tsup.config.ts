import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  outDir: "dist",
  splitting: false,
  // Bundle workspace packages inline — their "main" points to .ts source
  // which Node.js can't execute at runtime without tsx
  noExternal: [/^@odin\//],
});
