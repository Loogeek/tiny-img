import type { Config, ExportConfig } from './types'

export const defineConfig = (config: ExportConfig): ExportConfig => config

export const getAllConfig = (config: ExportConfig) => config?.configs

