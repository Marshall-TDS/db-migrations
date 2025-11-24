import { readdir } from 'fs/promises'
import path from 'path'
import { pathToFileURL } from 'url'
import type { Migration } from './Migration'

const versionsDir = path.resolve(__dirname, '../versions')

export const loadMigrations = async (): Promise<Migration[]> => {
  const dirEntries = await readdir(versionsDir, { withFileTypes: true }).catch(() => [])
  const versionDirs = dirEntries.filter((entry) => entry.isDirectory())

  const migrationsPerVersion = await Promise.all(
    versionDirs.map(async (versionDir) => {
      const migrationIndex = path.join(versionsDir, versionDir.name, 'index.ts')
      try {
        const moduleUrl = pathToFileURL(migrationIndex).href
        const module = await import(moduleUrl)
        return (module.migrations ?? []) as Migration[]
      } catch (error) {
        console.warn(`[MigrationLoader] Falha ao carregar version ${versionDir.name}:`, error)
        return []
      }
    }),
  )

  return migrationsPerVersion.flat().sort((a, b) => a.id.localeCompare(b.id))
}

