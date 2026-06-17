import { defineConfig, globalIgnores } from "eslint/config";
import nextPlugin from "eslint-config-next";

const eslintConfig = defineConfig([
  ...nextPlugin,
  {
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react/no-unescaped-entities': 'warn',
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "tests/load/**",
    "src/app/(hotel-admin)/hotel/dashboard/page.tsx",
    "src/app/(hotel-admin)/hotel/staff/page.tsx",
  ]),
]);

export default eslintConfig;