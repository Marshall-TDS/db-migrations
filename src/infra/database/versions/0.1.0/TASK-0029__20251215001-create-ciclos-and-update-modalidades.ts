import type { Migration } from "../../migrations/Migration";

export const createCiclosAndUpdateModalidades20251215001: Migration = {
  id: "20251215001",
  name: "create-ciclos-and-update-modalidades",
  async up({ db }) {
    // 1. Create profitability_cycle table (ciclos)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS public.profitability_cycle (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        seq_id BIGSERIAL,
        descricao VARCHAR(200) NOT NULL,
        dia_inicio_ciclo SMALLINT NOT NULL,
        dia_fim_ciclo SMALLINT NOT NULL,
        dia_pagamento_ciclo SMALLINT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_by VARCHAR(160) NOT NULL,
        updated_by VARCHAR(160) NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_profitability_cycle_seq_id ON public.profitability_cycle(seq_id);
    `);

    // 2. Apply audit trigger for profitability_cycle
    await db.execute(`
      DROP TRIGGER IF EXISTS trg_audit_log ON public.profitability_cycle;
      CREATE TRIGGER trg_audit_log
      AFTER INSERT OR UPDATE OR DELETE ON public.profitability_cycle
      FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
    `);

    // 3. Update profitability_modality structure
    await db.execute(`
      -- Add new columns
      ALTER TABLE public.profitability_modality
        ADD COLUMN IF NOT EXISTS rentabilidade_percentual NUMERIC(10,4) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS prazo_meses INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS ciclo_pagamento_id UUID,
        ADD COLUMN IF NOT EXISTS frequencia_pagamento VARCHAR(20) NOT NULL DEFAULT 'MENSAL';

      -- Create FK for ciclo_pagamento_id (idempotente)
      ALTER TABLE public.profitability_modality
        DROP CONSTRAINT IF EXISTS fk_profitability_modality_cycle;

      ALTER TABLE public.profitability_modality
        ADD CONSTRAINT fk_profitability_modality_cycle
        FOREIGN KEY (ciclo_pagamento_id)
        REFERENCES public.profitability_cycle(id);

      -- Drop old unique index on codigo before removing the column
      DROP INDEX IF EXISTS idx_profitability_modality_codigo;

      -- Drop legacy columns no longer used in the domain
      ALTER TABLE public.profitability_modality
        DROP COLUMN IF EXISTS nome,
        DROP COLUMN IF EXISTS codigo,
        DROP COLUMN IF EXISTS descricao,
        DROP COLUMN IF EXISTS ativo;
    `);
  },
  async down({ db }) {
    // 1. Recreate legacy columns in profitability_modality
    await db.execute(`
      -- Remove FK and new columns
      ALTER TABLE public.profitability_modality
        DROP CONSTRAINT IF EXISTS fk_profitability_modality_cycle,
        DROP COLUMN IF EXISTS rentabilidade_percentual,
        DROP COLUMN IF EXISTS prazo_meses,
        DROP COLUMN IF EXISTS ciclo_pagamento_id,
        DROP COLUMN IF EXISTS frequencia_pagamento;

      -- Recreate legacy columns (best-effort, defaults may differ from original data)
      ALTER TABLE public.profitability_modality
        ADD COLUMN IF NOT EXISTS nome VARCHAR(120) NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS codigo VARCHAR(100) NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS descricao VARCHAR(500),
        ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT true;

      -- Restore unique index on codigo
      CREATE UNIQUE INDEX IF NOT EXISTS idx_profitability_modality_codigo ON public.profitability_modality(codigo);
    `);

    // 2. Drop audit trigger and table profitability_cycle
    await db.execute(`
      DROP TRIGGER IF EXISTS trg_audit_log ON public.profitability_cycle;
      DROP TABLE IF EXISTS public.profitability_cycle;
    `);
  },
};


