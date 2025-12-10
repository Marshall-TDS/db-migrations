import type { Migration } from '../../migrations/Migration'

export const createUsersTable20250101001: Migration = {
  id: '20250101001',
  name: 'create-users-table',
  async up({ db }) {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        login VARCHAR(80) NOT NULL UNIQUE,
        email VARCHAR(160) NOT NULL UNIQUE,
        user_group TEXT[] NOT NULL,
        allow_features TEXT[] NOT NULL DEFAULT '{}',
        denied_features TEXT[] NOT NULL DEFAULT '{}',
        created_by VARCHAR(160) NOT NULL,
        updated_by VARCHAR(160) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      DROP TRIGGER IF EXISTS trg_audit_log ON public.users;
      CREATE TRIGGER trg_audit_log
      AFTER INSERT OR UPDATE OR DELETE ON public.users
      FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
    `)
  },
  async down({ db }) {
    await db.execute('DROP TABLE IF EXISTS users;')
  },
}

