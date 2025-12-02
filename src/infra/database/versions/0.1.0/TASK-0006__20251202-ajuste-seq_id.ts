import type { Migration } from '../../migrations/Migration'

export const ajusteSeqId20251202001: Migration = {
    id: '20251202001',
    name: 'ajuste-seq_id',
    async up({ db }) {
        // users
        await db.execute(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS seq_id BIGSERIAL;
    `)
        await db.execute(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_seq_id ON users(seq_id);
    `)

        // access_group_memberships
        // Renomear id atual (BIGSERIAL) para seq_id
        await db.execute(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'access_group_memberships' AND column_name = 'id' AND table_schema = 'public') 
           AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'access_group_memberships' AND column_name = 'seq_id' AND table_schema = 'public') THEN
            ALTER TABLE access_group_memberships RENAME COLUMN id TO seq_id;
        END IF;
      END $$;
    `)

        // Remover constraint de chave primária antiga (pode estar com nome antigo ou novo)
        await db.execute(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_group_memberships_pkey') THEN
            ALTER TABLE access_group_memberships DROP CONSTRAINT user_group_memberships_pkey;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'access_group_memberships_pkey') THEN
            ALTER TABLE access_group_memberships DROP CONSTRAINT access_group_memberships_pkey;
        END IF;
      END $$;
    `)

        // Adicionar novo id UUID
        await db.execute(`
      ALTER TABLE access_group_memberships ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() NOT NULL;
    `)

        // Definir novo id como Primary Key
        await db.execute(`
      ALTER TABLE access_group_memberships ADD PRIMARY KEY (id);
    `)

        // Garantir índice único no seq_id
        await db.execute(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_access_group_memberships_seq_id ON access_group_memberships(seq_id);
    `)

        // remetentes
        await db.execute(`
      ALTER TABLE remetentes ADD COLUMN IF NOT EXISTS seq_id BIGSERIAL;
    `)
        await db.execute(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_remetentes_seq_id ON remetentes(seq_id);
    `)

        // comunicacoes
        await db.execute(`
      ALTER TABLE comunicacoes ADD COLUMN IF NOT EXISTS seq_id BIGSERIAL;
    `)
        await db.execute(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_comunicacoes_seq_id ON comunicacoes(seq_id);
    `)
    },
    async down({ db }) {
        // Revert access_group_memberships
        await db.execute(`
        ALTER TABLE access_group_memberships DROP CONSTRAINT access_group_memberships_pkey;
        ALTER TABLE access_group_memberships DROP COLUMN id;
        ALTER TABLE access_group_memberships ADD PRIMARY KEY (seq_id);
        ALTER TABLE access_group_memberships RENAME COLUMN seq_id TO id;
    `)

        await db.execute(`ALTER TABLE comunicacoes DROP COLUMN IF EXISTS seq_id;`)
        await db.execute(`ALTER TABLE remetentes DROP COLUMN IF EXISTS seq_id;`)
        await db.execute(`ALTER TABLE users DROP COLUMN IF EXISTS seq_id;`)
    },
}
