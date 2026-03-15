const reactRefreshPreamble = `
import { injectIntoGlobalHook } from "/@react-refresh";
injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;
`

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      title: 'GoRules Decision Manager',
      meta: [
        { name: 'description', content: 'Create and simulate business rules with GoRules' }
      ],
      script: process.env.NODE_ENV === 'development'
        ? [
            {
              type: 'module',
              innerHTML: reactRefreshPreamble,
            },
          ]
        : [],
    }
  },

  // Enable client-side only rendering for the editor
  ssr: false,

  experimental: {
    // Some experimental flags might help with module loading
  },

  // Try to use transformInclude if possible, but veaury is a plugin
  // Let's try to add it via a separate file and import it in a way that doesn't trigger jiti
  
  // Actually, let's try to fix the root cause: jiti v1 doesn't like import.meta in some contexts
  // We can try to force jiti to ignore the files that cause issues if possible
  
  // Another way: use a nuxt module to load the plugin
  modules: [
    './app/modules/veaury-fix'
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3001'
    }
  },

  css: [
    '~/assets/css/main.css',
    '@gorules/jdm-editor/dist/style.css'
  ],

  vite: {
    server: {
      hmr: false,
    },
  },
})
