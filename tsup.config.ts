import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  target: "esnext",
  format: ["esm"],
  clean: true,
});
