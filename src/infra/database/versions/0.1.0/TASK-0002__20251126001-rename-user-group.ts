import type { Migration } from '../../migrations/Migration'
export const refactorAccessGroups20251126001: Migration = {
  id: '20251126001',
  name: 'refactor-user-groups-to-access-groups',
  async up({ db }) {
    await db.execute(`
      DO $$
      BEGIN
        -- Renomear tabelas apenas se ainda não tiverem sido renomeadas
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_groups')
           AND NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'access_groups') THEN
          ALTER TABLE user_groups RENAME TO access_groups;
        END IF;

        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_group_memberships')
           AND NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'access_group_memberships') THEN
          ALTER TABLE user_group_memberships RENAME TO access_group_memberships;
        END IF;

        -- Sequências
        IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'user_groups_seq_id_seq')
           AND NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'access_groups_seq_id_seq') THEN
          ALTER SEQUENCE user_groups_seq_id_seq RENAME TO access_groups_seq_id_seq;
        END IF;

        IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'user_group_memberships_id_seq')
           AND NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'access_group_memberships_id_seq') THEN
          ALTER SEQUENCE user_group_memberships_id_seq RENAME TO access_group_memberships_id_seq;
        END IF;

        -- Constraints: renomear apenas se existirem com o nome antigo
        IF EXISTS (
          SELECT 1
          FROM pg_constraint c
          JOIN pg_class t ON t.oid = c.conrelid
          JOIN pg_namespace n ON n.oid = t.relnamespace
          WHERE n.nspname = 'public'
            AND t.relname = 'access_group_memberships'
            AND c.conname = 'user_group_memberships_group_id_fkey'
        ) THEN
          ALTER TABLE access_group_memberships RENAME CONSTRAINT user_group_memberships_group_id_fkey TO access_group_memberships_group_id_fkey;
        END IF;

        IF EXISTS (
          SELECT 1
          FROM pg_constraint c
          JOIN pg_class t ON t.oid = c.conrelid
          JOIN pg_namespace n ON n.oid = t.relnamespace
          WHERE n.nspname = 'public'
            AND t.relname = 'access_group_memberships'
            AND c.conname = 'user_group_memberships_user_id_fkey'
        ) THEN
          ALTER TABLE access_group_memberships RENAME CONSTRAINT user_group_memberships_user_id_fkey TO access_group_memberships_user_id_fkey;
        END IF;

        IF EXISTS (
          SELECT 1
          FROM pg_constraint c
          JOIN pg_class t ON t.oid = c.conrelid
          JOIN pg_namespace n ON n.oid = t.relnamespace
          WHERE n.nspname = 'public'
            AND t.relname = 'access_group_memberships'
            AND c.conname = 'user_group_memberships_user_id_group_id_key'
        ) THEN
          ALTER TABLE access_group_memberships RENAME CONSTRAINT user_group_memberships_user_id_group_id_key TO access_group_memberships_user_id_group_id_key;
        END IF;
      END
      $$;
    `)
  },
  async down({ db }) {
    await db.execute(`
      DO $$
      BEGIN
        -- 1. Tables: Rename back to user_* first so constraints can be found on them
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'access_group_memberships')
           AND NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_group_memberships') THEN
          ALTER TABLE access_group_memberships RENAME TO user_group_memberships;
        END IF;

        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'access_groups')
           AND NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_groups') THEN
          ALTER TABLE access_groups RENAME TO user_groups;
        END IF;

        -- 2. Constraints: Rename on the now-restored table names
        IF EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'access_group_memberships_user_id_group_id_key'
        ) THEN
          ALTER TABLE IF EXISTS user_group_memberships RENAME CONSTRAINT access_group_memberships_user_id_group_id_key TO user_group_memberships_user_id_group_id_key;
        END IF;

        IF EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'access_group_memberships_user_id_fkey'
        ) THEN
          ALTER TABLE IF EXISTS user_group_memberships RENAME CONSTRAINT access_group_memberships_user_id_fkey TO user_group_memberships_user_id_fkey;
        END IF;

        IF EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'access_group_memberships_group_id_fkey'
        ) THEN
          ALTER TABLE IF EXISTS user_group_memberships RENAME CONSTRAINT access_group_memberships_group_id_fkey TO user_group_memberships_group_id_fkey;
        END IF;

        -- 3. Sequences
        IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'access_group_memberships_id_seq')
           AND NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'user_group_memberships_id_seq') THEN
          ALTER SEQUENCE access_group_memberships_id_seq RENAME TO user_group_memberships_id_seq;
        END IF;

        IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'access_groups_seq_id_seq')
           AND NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'user_groups_seq_id_seq') THEN
          ALTER SEQUENCE access_groups_seq_id_seq RENAME TO user_groups_seq_id_seq;
        END IF;
      END
      $$;
    `)
  },
}