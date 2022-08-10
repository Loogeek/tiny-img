export interface Config {
  targetDir: string
}

export interface ExportConfig {
  configs: Config[]
  APIKey: string
}

export type RecordType = 'add' | 'remove'
