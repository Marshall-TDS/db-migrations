
import type { Migration } from '../../migrations/Migration'

export const addDocumentMetadataColumns20251209003: Migration = {
    id: '20251209003',
    name: 'add-document-metadata-columns',
    async up({ db }) {
        await db.execute(`
            ALTER TABLE public.customer_documents ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
            ALTER TABLE public.customer_documents ADD COLUMN IF NOT EXISTS file_size VARCHAR(50);
        `)
    },
    async down({ db }) {
        await db.execute(`
            ALTER TABLE public.customer_documents DROP COLUMN IF EXISTS file_name;
            ALTER TABLE public.customer_documents DROP COLUMN IF EXISTS file_size;
        `)
    },
}
