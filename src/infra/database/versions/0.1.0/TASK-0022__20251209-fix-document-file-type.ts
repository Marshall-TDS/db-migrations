
import type { Migration } from '../../migrations/Migration'

export const fixDocumentFileType20251209002: Migration = {
    id: '20251209002',
    name: 'fix-document-file-type-v2',
    async up({ db }) {
        // Relax constraints
        await db.execute(`
            ALTER TABLE public.customer_documents ALTER COLUMN rejection_reason DROP NOT NULL;
            ALTER TABLE public.customer_documents ALTER COLUMN expiration_date DROP NOT NULL;
            ALTER TABLE public.customer_documents ALTER COLUMN document_internal_data DROP NOT NULL;
        `)

        // Convert file column to BYTEA
        // We use USING file::bytea to convert existing string data to bytes. 
        // If file content is not valid for simple cast (unlikely for varchar), it might error, but assuming it's okay.
        await db.execute(`
            ALTER TABLE public.customer_documents ALTER COLUMN file TYPE BYTEA USING file::bytea;
        `)
    },
    async down({ db }) {
        // Revert is best effort
        await db.execute(`
            -- Revert file type (best effort)
            ALTER TABLE public.customer_documents ALTER COLUMN file TYPE VARCHAR(255) USING encode(file, 'escape');

            -- Fill possible NULLs before setting NOT NULL
            UPDATE public.customer_documents SET rejection_reason = '' WHERE rejection_reason IS NULL;
            UPDATE public.customer_documents SET expiration_date = CURRENT_DATE WHERE expiration_date IS NULL;
            UPDATE public.customer_documents SET document_internal_data = '{}'::jsonb WHERE document_internal_data IS NULL;

            -- Re-apply NOT NULL constraints
            ALTER TABLE public.customer_documents ALTER COLUMN rejection_reason SET NOT NULL;
            ALTER TABLE public.customer_documents ALTER COLUMN expiration_date SET NOT NULL;
            ALTER TABLE public.customer_documents ALTER COLUMN document_internal_data SET NOT NULL;
        `)
    },
}
