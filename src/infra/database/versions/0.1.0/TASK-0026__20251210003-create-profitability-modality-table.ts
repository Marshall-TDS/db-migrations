import type { Migration } from "../../migrations/Migration";

export const createProfitabilityModalityTable20251210003: Migration = {
  id: "20251210003",
  name: "create-profitability-modality-table",
  async up({ db }) {
    // Create profitability_modality table
    await db.execute(`
            CREATE TABLE IF NOT EXISTS public.profitability_modality (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                seq_id BIGSERIAL,
                rentabilidade DECIMAL(5,2) NOT NULL,
                prazo INTEGER NOT NULL,
                ciclo VARCHAR(50) NOT NULL,
                frequencia VARCHAR(20) NOT NULL CHECK (frequencia IN ('Mensal', 'Trimestral', 'Final')),
                status VARCHAR(20) NOT NULL CHECK (status IN ('Ativo', 'Inativo')),
                created_by VARCHAR(160) NOT NULL,
                updated_by VARCHAR(160) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            CREATE UNIQUE INDEX IF NOT EXISTS idx_profitability_modality_seq_id ON public.profitability_modality(seq_id);
        `);

    // Apply audit trigger
    await db.execute(`
            DROP TRIGGER IF EXISTS trg_audit_log ON public.profitability_modality;
            CREATE TRIGGER trg_audit_log
            AFTER INSERT OR UPDATE OR DELETE ON public.profitability_modality
            FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
        `);
  },
  async down({ db }) {
    await db.execute(`
            DROP TRIGGER IF EXISTS trg_audit_log ON public.profitability_modality;
            DROP TABLE IF EXISTS public.profitability_modality;
        `);
  },
};




