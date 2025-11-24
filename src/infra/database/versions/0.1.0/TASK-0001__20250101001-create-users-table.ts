import type { Migration } from '../../migrations/Migration'

export const createUsersTable20250101001: Migration = {
  id: '20250101001',
  name: 'create-users-table',
  async up({ db }) {
    await db.execute(`
      CREATE TABLE users (
        id UUID PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        login VARCHAR(80) NOT NULL UNIQUE,
        email VARCHAR(160) NOT NULL UNIQUE,
        user_group TEXT[] NOT NULL,
        features TEXT[] NOT NULL DEFAULT '{}',
        created_by VARCHAR(160) NOT NULL,
        updated_by VARCHAR(160) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)
  },
  async down({ db }) {
    await db.execute('DROP TABLE IF EXISTS users;')
  },
}

