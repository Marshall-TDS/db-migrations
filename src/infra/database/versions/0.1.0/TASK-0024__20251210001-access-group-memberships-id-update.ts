
import type { Migration } from '../../migrations/Migration'

export const updateAccessGroupMembershipsId20251210001: Migration = {
    id: '20251210001',
    name: 'update-access-group-memberships-id',
    async up({ db }) {
        await db.execute(`
      DO $$
      BEGIN
        -- 1. Renomear id para seq_id
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'access_group_memberships' AND column_name = 'id' AND data_type != 'uuid'
        ) THEN
            ALTER TABLE public.access_group_memberships RENAME COLUMN id TO seq_id;
        END IF;

        -- 2. Criar a coluna id como UUID
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'access_group_memberships' AND column_name = 'id'
        ) THEN
            ALTER TABLE public.access_group_memberships ADD COLUMN id UUID NOT NULL DEFAULT gen_random_uuid();
        END IF;

        -- 3. Renomear sequence se existir (de id para seq_id)
        -- 3. Renomear sequence se existir (de id para seq_id)
        IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'access_group_memberships_id_seq') 
           AND NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'access_group_memberships_seq_id_seq') THEN
            ALTER SEQUENCE public.access_group_memberships_id_seq RENAME TO access_group_memberships_seq_id_seq;
        END IF;
        
        -- Caso a tabela tenha sido renomeada mas a sequence ainda esteja como user_group_memberships_id_seq (caso o rename anterior tenha falhado ou algo assim, mas vamos assumir o padrão atual)
        -- O rename anterior (TASK-0002) tentou renomear sequences.
        
        -- 4. Ajustar Primary Key
        -- A PK antiga provavelmente se chama 'user_group_memberships_pkey' ou 'access_group_memberships_pkey'
        -- Vamos dropar a constraint PK existente (que está no seq_id agora) e criar na nova id (UUID)
        
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_group_memberships_pkey') THEN
            ALTER TABLE public.access_group_memberships DROP CONSTRAINT user_group_memberships_pkey;
        END IF;

        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'access_group_memberships_pkey') THEN
            ALTER TABLE public.access_group_memberships DROP CONSTRAINT access_group_memberships_pkey;
        END IF;

        -- Criar nova PK no UUID id
        ALTER TABLE public.access_group_memberships ADD CONSTRAINT access_group_memberships_pkey PRIMARY KEY (id);

        -- Criar índice único para o seq_id
        CREATE UNIQUE INDEX IF NOT EXISTS idx_access_group_memberships_seq_id ON public.access_group_memberships(seq_id);
      END
      $$;
    `)
    },
    async down({ db }) {
        await db.execute(`
      DO $$
      BEGIN
        -- 1. Dropar a PK nova (UUID)
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'access_group_memberships_pkey') THEN
            ALTER TABLE public.access_group_memberships DROP CONSTRAINT access_group_memberships_pkey;
        END IF;

        -- 2. Restaurar PK no seq_id (que voltará a ser id)
        -- Primeiro removemos a coluna UUID
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'access_group_memberships' AND column_name = 'id' AND data_type = 'uuid'
        ) THEN
            ALTER TABLE public.access_group_memberships DROP COLUMN id;
        END IF;

        -- 3. Renomear seq_id de volta para id
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'access_group_memberships' AND column_name = 'seq_id'
        ) THEN
            ALTER TABLE public.access_group_memberships RENAME COLUMN seq_id TO id;
        END IF;

        -- 4. Renomear sequence de volta
        IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'access_group_memberships_seq_id_seq') 
           AND NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'access_group_memberships_id_seq') THEN
            ALTER SEQUENCE public.access_group_memberships_seq_id_seq RENAME TO access_group_memberships_id_seq;
        END IF;

        -- 5. Recriar PK (usando o nome original user_group_memberships_pkey se for o caso, ou access_group_memberships_pkey para manter consistência com o nome atual da tabela)
        -- O usuário pede consistência e sem conflito. Como o rename da tabela foi feito num passo anterior, o ideal é que a PK tenha o nome da tabela atual. 
        -- Mas se o down do rename anterior (TASK-0002) rodar DEPOIS deste down, ele esperaria user_group_memberships?
        -- Não, o down aqui reverte SÓ ESTAS mudanças. A tabela continua access_group_memberships.
        -- Então a PK deve ser access_group_memberships_pkey ou restaurar a user_group_memberships_pkey se quisermos ser puristas com o estado anterior.
        -- Como dropamos 'user_group_memberships_pkey' no UP, talvez devêssemos restaurá-la se ela existia?
        -- Para simplificar e evitar conflitos futuros, vamos usar access_group_memberships_pkey, pois o nome da tabela no DB é access_group_memberships neste ponto.
        
        ALTER TABLE public.access_group_memberships ADD CONSTRAINT access_group_memberships_pkey PRIMARY KEY (id);

        -- Remover indice do seq_id se sobrou (mas a coluna foi renomeada, o indice pode ter ido junto ou ficado invalido/renomeado)
        -- Se renomeamos seq_id para id, o índice idx_access_group_memberships_seq_id (criado no up) deve ser dropado.
        DROP INDEX IF EXISTS idx_access_group_memberships_seq_id;

      END
      $$;
    `)
    },
}
