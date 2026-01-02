import type { Migration } from '../../migrations/Migration'

export const addConteudoToContracts20250125002: Migration = {
    id: '20250125002',
    name: 'add-conteudo-to-contracts',
    async up({ db }) {
        await db.execute(`
            -- Add content column to contracts table
            ALTER TABLE public.contracts
            ADD COLUMN IF NOT EXISTS content JSONB;

            -- Add index for content if needed (optional, for JSONB queries)
            CREATE INDEX IF NOT EXISTS idx_contracts_content ON public.contracts USING GIN (content);

            -- Remove template_id column as it's no longer needed (content replaces it)
            ALTER TABLE public.contracts
            DROP COLUMN IF EXISTS template_id;

            -- Ensure contract_attachments table exists (if not already created in previous migration)
            CREATE TABLE IF NOT EXISTS public.contract_attachments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                seq_id BIGSERIAL NOT NULL,
                contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
                file BYTEA NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                file_type VARCHAR(100),
                file_size VARCHAR(50),
                created_by VARCHAR(160) NOT NULL,
                updated_by VARCHAR(160) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            -- Add file_size column if it doesn't exist
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'contract_attachments' 
                    AND column_name = 'file_size'
                ) THEN
                    ALTER TABLE public.contract_attachments ADD COLUMN file_size VARCHAR(50);
                END IF;
            END $$;

            -- Adjust contract_attachments table: change file to BYTEA to match people_documents pattern
            -- This will work even if the table already exists
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'contract_attachments' 
                    AND column_name = 'file'
                ) THEN
                    -- If it's TEXT or VARCHAR, convert to BYTEA
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'contract_attachments' 
                        AND column_name = 'file' 
                        AND (data_type = 'text' OR data_type = 'character varying')
                    ) THEN
                        ALTER TABLE public.contract_attachments ALTER COLUMN file TYPE BYTEA USING file::bytea;
                    END IF;
                END IF;
            END $$;

            -- Ensure contract_signers table exists (if not already created in previous migration)
            CREATE TABLE IF NOT EXISTS public.contract_signers (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                seq_id BIGSERIAL NOT NULL,
                contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
                person_id UUID NOT NULL REFERENCES public.people(id),
                relationship VARCHAR(255),
                created_by VARCHAR(160) NOT NULL,
                updated_by VARCHAR(160) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            -- Create indexes if they don't exist
            CREATE UNIQUE INDEX IF NOT EXISTS idx_contract_attachments_seq_id ON public.contract_attachments(seq_id);
            CREATE INDEX IF NOT EXISTS idx_contract_attachments_contract_id ON public.contract_attachments(contract_id);
            CREATE UNIQUE INDEX IF NOT EXISTS idx_contract_signers_seq_id ON public.contract_signers(seq_id);
            CREATE INDEX IF NOT EXISTS idx_contract_signers_contract_id ON public.contract_signers(contract_id);
            CREATE INDEX IF NOT EXISTS idx_contract_signers_person_id ON public.contract_signers(person_id);

            -- Apply audit triggers if they don't exist
            DROP TRIGGER IF EXISTS trg_audit_log ON public.contract_attachments;
            CREATE TRIGGER trg_audit_log
            AFTER INSERT OR UPDATE OR DELETE ON public.contract_attachments
            FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();

            DROP TRIGGER IF EXISTS trg_audit_log ON public.contract_signers;
            CREATE TRIGGER trg_audit_log
            AFTER INSERT OR UPDATE OR DELETE ON public.contract_signers
            FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();

            -- Grant access to sequences for user system
            GRANT USAGE, SELECT, UPDATE ON SEQUENCE public.contract_attachments_seq_id_seq TO system;
            GRANT USAGE, SELECT, UPDATE ON SEQUENCE public.contract_signers_seq_id_seq TO system;
        `)
    },
    async down({ db }) {
        await db.execute(`
            -- Restore template_id column
            ALTER TABLE public.contracts
            ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.contracts_templates(id);

            -- Drop index
            DROP INDEX IF EXISTS idx_contracts_content;

            -- Drop column
            ALTER TABLE public.contracts
            DROP COLUMN IF EXISTS content;
        `)
    },
}

