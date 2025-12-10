import type { Migration } from '../../migrations/Migration'

export const addUserPasswordColumn20251125002: Migration = {
  id: '20251125002',
  name: 'add-user-password-column',
  async up({ db }) {
    await db.execute(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS password VARCHAR(255) DEFAULT NULL;
    `)
  },
  async down({ db }) {
    await db.execute(`
      ALTER TABLE IF EXISTS users
      DROP COLUMN IF EXISTS password;
    `)
  },
}

