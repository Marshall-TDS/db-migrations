import type { Migration } from '../../migrations/Migration'

export const createCustomerDetailsTable20251215002: Migration = {
    id: '20251215002',
    name: 'create-customer-details-table',
    async up({ db }) {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS public.customer_details (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                seq_id BIGSERIAL,
                customer_id UUID NOT NULL REFERENCES public.customer(id) ON DELETE CASCADE,
                sex VARCHAR(10) CHECK (sex IN ('Homem', 'Mulher')),
                marital_status VARCHAR(50) CHECK (marital_status IN ('solteiro(a)', 'casado(a)', 'separado(a) judicialmente', 'divorciado(a)', 'viúvo(a)')),
                nationality VARCHAR(100) DEFAULT 'Brasileiro',
                occupation VARCHAR(255),
                created_by VARCHAR(160) NOT NULL,
                updated_by VARCHAR(160) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_details_seq_id ON public.customer_details(seq_id);
            CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_details_customer_id ON public.customer_details(customer_id);

            DROP TRIGGER IF EXISTS trg_audit_log ON public.customer_details;
            CREATE TRIGGER trg_audit_log
            AFTER INSERT OR UPDATE OR DELETE ON public.customer_details
            FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();

            GRANT USAGE, SELECT, UPDATE ON SEQUENCE public.customer_details_seq_id_seq TO system;
        `)
    },
    async down({ db }) {
        await db.execute(`
            DROP TRIGGER IF EXISTS trg_audit_log ON public.customer_details;
            DROP TABLE IF EXISTS public.customer_details;
        `)
    },
}
