import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const IGNORE_WARNINGS = [
  "a11y_click_events_have_key_events",
  "a11y_no_static_element_interactions",
  "a11y_label_has_associated_control",
];

/** @type {import("@sveltejs/vite-plugin-svelte").SvelteConfig} */
export default {
  preprocess: vitePreprocess(),
  onwarn(warning, defaultHandler) {
    if (IGNORE_WARNINGS.includes(warning.code)) return;
    defaultHandler(warning);
  },
};
