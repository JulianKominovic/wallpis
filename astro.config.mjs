import { defineConfig } from "astro/config";
import react from "@astrojs/react";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://wallpis.jkominovic.dev",
  prefetch: { defaultStrategy: "hover", prefetchAll: false },
  devToolbar: { enabled: false },
  integrations: [react(), tailwind()],
});
