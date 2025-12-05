import type { Migration } from '../../migrations/Migration'

export const createCustomerTables20251204001: Migration = {
    id: '20251204001',
    name: 'create-customer-tables',
    async up({ db }) {
        // 1. Create customer table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS public.customer (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                seq_id BIGSERIAL,
                name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                cpf_cnpj VARCHAR(20) NOT NULL,
                birth_date DATE,
                created_by VARCHAR(160) NOT NULL,
                updated_by VARCHAR(160) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_seq_id ON public.customer(seq_id);
        `)

        // 2. Create customer_address table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS public.customer_address (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                seq_id BIGSERIAL,
                customer_id UUID NOT NULL REFERENCES public.customer(id) ON DELETE CASCADE,
                address_type VARCHAR(20) CHECK (address_type IN ('Residencial', 'Comercial', 'Outros')),
                postal_code VARCHAR(20) NOT NULL,
                street VARCHAR(255) NOT NULL,
                number VARCHAR(20) NOT NULL,
                complement VARCHAR(255),
                neighborhood VARCHAR(255) NOT NULL,
                city VARCHAR(255) NOT NULL,
                state VARCHAR(255) NOT NULL,
                created_by VARCHAR(160) NOT NULL,
                updated_by VARCHAR(160) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_address_seq_id ON public.customer_address(seq_id);
            CREATE INDEX IF NOT EXISTS idx_customer_address_customer_id ON public.customer_address(customer_id);
        `)

        // 3. Create customer_contact table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS public.customer_contact (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                seq_id BIGSERIAL,
                customer_id UUID NOT NULL REFERENCES public.customer(id) ON DELETE CASCADE,
                contact_type VARCHAR(20) NOT NULL CHECK (contact_type IN ('Email', 'Telefone', 'Whatsapp')),
                contact_value VARCHAR(255) NOT NULL,
                label VARCHAR(255),
                is_default BOOLEAN NOT NULL DEFAULT false,
                created_by VARCHAR(160) NOT NULL,
                updated_by VARCHAR(160) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_contact_seq_id ON public.customer_contact(seq_id);
            CREATE INDEX IF NOT EXISTS idx_customer_contact_customer_id ON public.customer_contact(customer_id);
        `)

        // 4. Create customer_bank_account table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS public.customer_bank_account (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                seq_id BIGSERIAL,
                customer_id UUID NOT NULL REFERENCES public.customer(id) ON DELETE CASCADE,
                bank_code VARCHAR(20) NOT NULL,
                branch_code VARCHAR(20) NOT NULL,
                account_number VARCHAR(50) NOT NULL,
                account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('Pagamento', 'Poupança')),
                pix_key VARCHAR(255),
                is_default_receipt BOOLEAN NOT NULL DEFAULT false,
                created_by VARCHAR(160) NOT NULL,
                updated_by VARCHAR(160) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_bank_account_seq_id ON public.customer_bank_account(seq_id);
            CREATE INDEX IF NOT EXISTS idx_customer_bank_account_customer_id ON public.customer_bank_account(customer_id);
        `)

        // 5. Create customer_documents table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS public.customer_documents (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                seq_id BIGSERIAL,
                customer_id UUID NOT NULL REFERENCES public.customer(id) ON DELETE CASCADE,
                document_type VARCHAR(50) CHECK (document_type IN ('RG - Digital', 'RG - Frente', 'RG - Verso', 'CNH - Digital', 'CNH - Impressa', 'CPF - Digital', 'CPF - Impresso', 'Selfie com Doc', 'Comprovante de Residência', 'Contrato Social')),
                file VARCHAR(255) NOT NULL,
                verification_status VARCHAR(20) NOT NULL CHECK (verification_status IN ('Pendente', 'Aprovado', 'Rejeitado', 'Expirado')),
                rejection_reason TEXT NOT NULL,
                expiration_date DATE NOT NULL,
                document_internal_data JSONB NOT NULL,
                created_by VARCHAR(160) NOT NULL,
                updated_by VARCHAR(160) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_documents_seq_id ON public.customer_documents(seq_id);
            CREATE INDEX IF NOT EXISTS idx_customer_documents_customer_id ON public.customer_documents(customer_id);
        `)

        // 99. Apply audit triggers
        const tables = ['customer', 'customer_address', 'customer_contact', 'customer_bank_account', 'customer_documents'];
        for (const table of tables) {
            await db.execute(`
                DROP TRIGGER IF EXISTS trg_audit_log ON public.${table};
                CREATE TRIGGER trg_audit_log
                AFTER INSERT OR UPDATE OR DELETE ON public.${table}
                FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
            `);
        }
    },
    async down({ db }) {
        const tables = ['customer_documents', 'customer_bank_account', 'customer_contact', 'customer_address', 'customer'];
        for (const table of tables) {
            await db.execute(`DROP TABLE IF EXISTS public.${table};`);
        }
    },
}
