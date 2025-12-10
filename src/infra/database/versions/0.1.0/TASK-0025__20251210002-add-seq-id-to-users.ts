
import type { Migration } from '../../migrations/Migration'

export const addSeqIdToUsers20251210002: Migration = {
    id: '20251210002',
    name: 'add-seq-id-to-users',
    async up({ db }) {
        await db.execute(`
      DO $$
      BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'seq_id'
        ) THEN
            ALTER TABLE public.users ADD COLUMN seq_id BIGSERIAL;
        END IF;

        -- Create unique index for seq_id
        IF NOT EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = 'idx_users_seq_id'
            AND n.nspname = 'public'
        ) THEN
            CREATE UNIQUE INDEX idx_users_seq_id ON public.users(seq_id);
        END IF;
      END
      $$;
    `)
    },
    async down({ db }) {
        await db.execute(`
      DO $$
      BEGIN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'seq_id'
        ) THEN
            ALTER TABLE public.users DROP COLUMN seq_id;
        END IF;
      END
      $$;
    `)
    },
}
