import { loadConfig } from 'unconfig'
import type { ExportConfig } from './types'
import { getAllConfig } from './config'
import { startOptimize } from './utils'

const { config } = await loadConfig<ExportConfig>({
  sources: [
    {
      files: 'tiny.config',
      extensions: ['ts', 'mts', 'cts', 'js', 'mjs', 'cjs', 'json'],
    },
  ],
})

const configs = getAllConfig(config)

startOptimize(configs, config.APIKey)
