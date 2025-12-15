import type { Migration } from "../../migrations/Migration";

export const createParameterizationTable20250117001: Migration = {
  id: "20250117001",
  name: "create-parameterization-table",
  async up({ db }) {
    // Create parameterization table
    await db.execute(`
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

