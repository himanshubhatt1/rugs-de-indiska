import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      "@next/next/no-css-tags": "off",
      "@next/next/no-page-custom-font": "off"
    }
  },
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "public/**",
    "content/**",
    "backend-api/vendor/**",
    "backend-api/storage/**",
    "backend-api/bootstrap/cache/**"
  ])
]);
