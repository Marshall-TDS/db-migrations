export interface DatabaseClient {
  execute(sql: string, params?: unknown[]): Promise<void>
}

class FakeDatabaseClient implements DatabaseClient {
  async execute(sql: string, params: unknown[] = []) {
    console.info('[DB] Executando SQL:')
    console.info(sql.trim())
    if (params.length > 0) {
      console.info('[DB] Params:', params)
    }
  }
}

export const databaseClient: DatabaseClient = new FakeDatabaseClient()

