import type { Migration } from '../../migrations/Migration'

export const createContractsTables20250125001: Migration = {
    id: '20250125001',
    name: 'create-contracts-tables',
    async up({ db }) {
        await db.execute(`
            -- Create contracts table
            CREATE TABLE IF NOT EXISTS public.contracts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                seq_id BIGSERIAL NOT NULL,
                cliente_id UUID REFERENCES public.people(id),
                ciclo_id UUID REFERENCES public.profitability_cycle(id),
                modalidade_id UUID REFERENCES public.profitability_modality(id),
                status VARCHAR(50) NOT NULL DEFAULT 'Rascunho',
                vendedor_id UUID REFERENCES public.users(id),
                template_id UUID REFERENCES public.contracts_templates(id),
                created_by VARCHAR(160) NOT NULL,
                updated_by VARCHAR(160) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            -- Create unique index for seq_id
            CREATE UNIQUE INDEX IF NOT EXISTS idx_contracts_seq_id ON public.contracts(seq_id);

            -- Create index for cliente_id
            CREATE INDEX IF NOT EXISTS idx_contracts_cliente_id ON public.contracts(cliente_id);

            -- Apply audit trigger
            DROP TRIGGER IF EXISTS trg_audit_log ON public.contracts;
            CREATE TRIGGER trg_audit_log
            AFTER INSERT OR UPDATE OR DELETE ON public.contracts
            FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();

            -- Grant access to sequence for user system
            GRANT USAGE, SELECT, UPDATE ON SEQUENCE public.contracts_seq_id_seq TO system;

            -- Create contracts_anexos table
            CREATE TABLE IF NOT EXISTS public.contracts_anexos (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                seq_id BIGSERIAL NOT NULL,
                contrato_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
                file VARCHAR(500) NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                file_type VARCHAR(100),
                created_by VARCHAR(160) NOT NULL,
                updated_by VARCHAR(160) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            -- Create unique index for seq_id
            CREATE UNIQUE INDEX IF NOT EXISTS idx_contracts_anexos_seq_id ON public.contracts_anexos(seq_id);

            -- Create index for contrato_id
            CREATE INDEX IF NOT EXISTS idx_contracts_anexos_contrato_id ON public.contracts_anexos(contrato_id);

            -- Apply audit trigger
            DROP TRIGGER IF EXISTS trg_audit_log ON public.contracts_anexos;
            CREATE TRIGGER trg_audit_log
            AFTER INSERT OR UPDATE OR DELETE ON public.contracts_anexos
            FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();

            -- Grant access to sequence for user system
            GRANT USAGE, SELECT, UPDATE ON SEQUENCE public.contracts_anexos_seq_id_seq TO system;

            -- Create contracts_assinantes table
            CREATE TABLE IF NOT EXISTS public.contracts_assinantes (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                seq_id BIGSERIAL NOT NULL,
                contrato_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
                pessoa_id UUID NOT NULL REFERENCES public.people(id),
                vinculo VARCHAR(255),
                created_by VARCHAR(160) NOT NULL,
                updated_by VARCHAR(160) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            -- Create unique index for seq_id
            CREATE UNIQUE INDEX IF NOT EXISTS idx_contracts_assinantes_seq_id ON public.contracts_assinantes(seq_id);

            -- Create index for contrato_id
            CREATE INDEX IF NOT EXISTS idx_contracts_assinantes_contrato_id ON public.contracts_assinantes(contrato_id);

            -- Create index for pessoa_id
            CREATE INDEX IF NOT EXISTS idx_contracts_assinantes_pessoa_id ON public.contracts_assinantes(pessoa_id);

            -- Apply audit trigger
            DROP TRIGGER IF EXISTS trg_audit_log ON public.contracts_assinantes;
            CREATE TRIGGER trg_audit_log
            AFTER INSERT OR UPDATE OR DELETE ON public.contracts_assinantes
            FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();

            -- Grant access to sequence for user system
            GRANT USAGE, SELECT, UPDATE ON SEQUENCE public.contracts_assinantes_seq_id_seq TO system;

            -- Create contracts_clausulas table
            CREATE TABLE IF NOT EXISTS public.contracts_clausulas (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                seq_id BIGSERIAL NOT NULL,
                contrato_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
                descricao TEXT NOT NULL,
                ordem INTEGER NOT NULL DEFAULT 0,
                created_by VARCHAR(160) NOT NULL,
                updated_by VARCHAR(160) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            -- Create unique index for seq_id
            CREATE UNIQUE INDEX IF NOT EXISTS idx_contracts_clausulas_seq_id ON public.contracts_clausulas(seq_id);

            -- Create index for contrato_id
            CREATE INDEX IF NOT EXISTS idx_contracts_clausulas_contrato_id ON public.contracts_clausulas(contrato_id);

            -- Apply audit trigger
            DROP TRIGGER IF EXISTS trg_audit_log ON public.contracts_clausulas;
            CREATE TRIGGER trg_audit_log
            AFTER INSERT OR UPDATE OR DELETE ON public.contracts_clausulas
            FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();

            -- Grant access to sequence for user system
            GRANT USAGE, SELECT, UPDATE ON SEQUENCE public.contracts_clausulas_seq_id_seq TO system;
        `)
    },
    async down({ db }) {
        await db.execute(`
            -- Drop audit triggers
            DROP TRIGGER IF EXISTS trg_audit_log ON public.contracts_clausulas;
            DROP TRIGGER IF EXISTS trg_audit_log ON public.contracts_assinantes;
            DROP TRIGGER IF EXISTS trg_audit_log ON public.contracts_anexos;
            DROP TRIGGER IF EXISTS trg_audit_log ON public.contracts;

            -- Drop tables
            DROP TABLE IF EXISTS public.contracts_clausulas;
            DROP TABLE IF EXISTS public.contracts_assinantes;
            DROP TABLE IF EXISTS public.contracts_anexos;
            DROP TABLE IF EXISTS public.contracts;
        `)
    },
}

