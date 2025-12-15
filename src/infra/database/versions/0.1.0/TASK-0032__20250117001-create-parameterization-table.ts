import type { Migration } from "../../migrations/Migration";

export const createParameterizationTable20250117001: Migration = {
  id: "20250117001",
  name: "create-parameterization-table",
  async up({ db }) {
    // Create parameterization table
    await db.execute(`
      DO $$
      BEGIN
        -- Check if 'key' column exists (from TASK-0027) to rename it to 'technical_key'
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='parameterization' AND column_name='key') THEN
            ALTER TABLE public.parameterization RENAME COLUMN "key" TO technical_key;
        END IF;

        -- Rename other columns if they exist in old format
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='parameterization' AND column_name='nome_do_parametro') THEN
            ALTER TABLE public.parameterization RENAME COLUMN nome_do_parametro TO friendly_name;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='parameterization' AND column_name='tipo') THEN
            ALTER TABLE public.parameterization RENAME COLUMN tipo TO data_type;
            -- Drop CHECK constraint if it exists (names vary, but we can try to alter type which might override or we accept legacy checks for now if values compatible)
            ALTER TABLE public.parameterization ALTER COLUMN data_type TYPE VARCHAR(50); 
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='parameterization' AND column_name='escopo') THEN
            ALTER TABLE public.parameterization RENAME COLUMN escopo TO scope_type;
             ALTER TABLE public.parameterization ALTER COLUMN scope_type TYPE VARCHAR(50);
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='parameterization' AND column_name='id_usuario') THEN
            ALTER TABLE public.parameterization RENAME COLUMN id_usuario TO scope_target_id;
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS public.parameterization (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        seq_id BIGSERIAL,
        friendly_name VARCHAR(255) NOT NULL,
        technical_key VARCHAR(255) NOT NULL,
        data_type VARCHAR(50) NOT NULL,
        value TEXT NOT NULL,
        scope_type VARCHAR(50) NOT NULL,
        scope_target_id UUID[] NOT NULL DEFAULT '{}',
        created_by VARCHAR(160) NOT NULL,
        updated_by VARCHAR(160) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      
      CREATE UNIQUE INDEX IF NOT EXISTS idx_parameterization_seq_id ON public.parameterization(seq_id);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_parameterization_technical_key ON public.parameterization(technical_key);
    `);

    // Apply audit trigger
    await db.execute(`
      DROP TRIGGER IF EXISTS trg_audit_log ON public.parameterization;
      CREATE TRIGGER trg_audit_log
      AFTER INSERT OR UPDATE OR DELETE ON public.parameterization
      FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
    `);
  },
  async down({ db }) {
    await db.execute(`
      DROP TRIGGER IF EXISTS trg_audit_log ON public.parameterization;
      DROP TABLE IF EXISTS public.parameterization;
    `);
  },
};

