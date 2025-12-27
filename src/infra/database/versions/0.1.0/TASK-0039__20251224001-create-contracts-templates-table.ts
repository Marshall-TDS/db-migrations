import type { Migration } from '../../migrations/Migration'

export const createContractsTemplatesTable20251224001: Migration = {
    id: '20251224001',
    name: 'create-contracts-templates-table',
    async up({ db }) {
        await db.execute(`
            -- Create contracts_templates table
            CREATE TABLE IF NOT EXISTS public.contracts_templates (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                seq_id BIGSERIAL NOT NULL,
                name VARCHAR(255) NOT NULL,
                description VARCHAR(255) NOT NULL,
                content JSONB,
                created_by VARCHAR(160) NOT NULL,
                updated_by VARCHAR(160) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            -- Create unique index for seq_id
            CREATE UNIQUE INDEX IF NOT EXISTS idx_contracts_templates_seq_id ON public.contracts_templates(seq_id);

            -- Apply audit trigger
            DROP TRIGGER IF EXISTS trg_audit_log ON public.contracts_templates;
            CREATE TRIGGER trg_audit_log
            AFTER INSERT OR UPDATE OR DELETE ON public.contracts_templates
            FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();

            -- Grant access to sequence for user system
            GRANT USAGE, SELECT, UPDATE ON SEQUENCE public.contracts_templates_seq_id_seq TO system;
        `)
    },
    async down({ db }) {
        await db.execute(`
            -- Drop audit trigger
            DROP TRIGGER IF EXISTS trg_audit_log ON public.contracts_templates;

            -- Drop table
            DROP TABLE IF EXISTS public.contracts_templates;
        `)
    },
}
