import type { Migration } from '../../migrations/Migration'

export const createUserGroupsTable20251125001: Migration = {
  id: '20251125001',
  name: 'create-user-groups-and-memberships',
  async up({ db }) {
    await db.execute(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      CREATE TABLE IF NOT EXISTS user_groups (
        seq_id BIGSERIAL PRIMARY KEY,
        id UUID NOT NULL DEFAULT gen_random_uuid(),
        name VARCHAR(160) NOT NULL,
        code VARCHAR(160) NOT NULL UNIQUE,
        features TEXT[] NOT NULL DEFAULT '{}',
        created_by VARCHAR(160) NOT NULL,
        updated_by VARCHAR(160) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (id)
      );

      ALTER TABLE users
        DROP COLUMN IF EXISTS user_group;

      CREATE TABLE IF NOT EXISTS user_group_memberships (
        id BIGSERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        group_id UUID NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, group_id)
      );
    `)
  },
  async down({ db }) {
    await db.execute(`
      DROP TABLE IF EXISTS user_group_memberships;
      DROP TABLE IF EXISTS user_groups;
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS user_group TEXT[] NOT NULL DEFAULT '{}';
    `)
  },
}


