import { databaseClient } from '../../../infra/database/connection'
import { loadMigrations } from '../../../infra/database/migrations'
import { MigrationRunner } from '../../../infra/database/migrations/migrationRunner'

export class MigrationService {
  async run(direction: 'up' | 'down') {
    const migrations = await loadMigrations()
    const runner = new MigrationRunner(migrations, { db: databaseClient })
    await runner.run(direction)

    return {
      total: migrations.length,
      direction,
      executedAt: new Date().toISOString(),
    }
  }
}

