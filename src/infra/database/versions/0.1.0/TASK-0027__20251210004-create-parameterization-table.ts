import type { Migration } from "../../migrations/Migration";

export const createParameterizationTable20251210004: Migration = {
  id: "20251210004",
  name: "create-parameterization-table",
  async up({ db }) {
    // Create parameterization table
    await db.execute(`
            CREATE TABLE IF NOT EXISTS public.parameterization (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                seq_id BIGSERIAL,
                nome_do_parametro VARCHAR(255) NOT NULL,
                key VARCHAR(255) NOT NULL,
                tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Numero', 'Texto', 'Data', 'Booleano')),
                value TEXT NOT NULL,
                escopo VARCHAR(20) NOT NULL CHECK (escopo IN ('Global', 'Usuario')),
                id_usuario UUID[] NOT NULL DEFAULT '{}',
                created_by VARCHAR(160) NOT NULL,
                updated_by VARCHAR(160) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            CREATE UNIQUE INDEX IF NOT EXISTS idx_parameterization_seq_id ON public.parameterization(seq_id);
            CREATE UNIQUE INDEX IF NOT EXISTS idx_parameterization_key ON public.parameterization(key);
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

