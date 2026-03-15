import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  setup(options, nuxt) {
    nuxt.hook('vite:extendConfig', async (config) => {
      const veauryVite = await import('veaury/vite/index.js').then(m => m.default || m)

      config.plugins = config.plugins || []

      // Nuxt already provides the Vue SFC plugin, so Veaury must run in Nuxt mode
      // and its returned plugin list needs to be flattened into Vite's plugin array.
      config.plugins.push(
        ...veauryVite({
          isNuxt: true,
          type: 'vue',
          reactOptions: {
            fastRefresh: false,
          },
        })
      )
    })

    nuxt.options.ssr = false
  }
})
