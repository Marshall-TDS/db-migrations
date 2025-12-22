import type { Migration } from '../../migrations/Migration'

export const refactorCustomerToPeople20251219001: Migration = {
    id: '20251219001',
    name: 'refactor-customer-to-people',
    async up({ db }) {
        // 1. Rename tables safely
        await db.execute(`
            DO $$ 
            BEGIN 
                IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customer') AND 
                   NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'people') THEN
                    ALTER TABLE public.customer RENAME TO people;
                END IF;

                IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customer_address') AND 
                   NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'people_address') THEN
                    ALTER TABLE public.customer_address RENAME TO people_address;
                END IF;

                IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customer_contact') AND 
                   NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'people_contact') THEN
                    ALTER TABLE public.customer_contact RENAME TO people_contact;
                END IF;

                IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customer_bank_account') AND 
                   NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'people_bank_account') THEN
                    ALTER TABLE public.customer_bank_account RENAME TO people_bank_account;
                END IF;

                IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customer_documents') AND 
                   NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'people_documents') THEN
                    ALTER TABLE public.customer_documents RENAME TO people_documents;
                END IF;

                IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customer_details') AND 
                   NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'people_details') THEN
                    ALTER TABLE public.customer_details RENAME TO people_details;
                END IF;
            END $$;
        `)

        // 2. Rename columns safely
        await db.execute(`
            DO $$ 
            BEGIN 
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'people_address' AND column_name = 'customer_id') THEN
                    ALTER TABLE public.people_address RENAME COLUMN customer_id TO people_id;
                END IF;

                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'people_contact' AND column_name = 'customer_id') THEN
                    ALTER TABLE public.people_contact RENAME COLUMN customer_id TO people_id;
                END IF;

                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'people_bank_account' AND column_name = 'customer_id') THEN
                    ALTER TABLE public.people_bank_account RENAME COLUMN customer_id TO people_id;
                END IF;

                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'people_documents' AND column_name = 'customer_id') THEN
                    ALTER TABLE public.people_documents RENAME COLUMN customer_id TO people_id;
                END IF;

                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'people_details' AND column_name = 'customer_id') THEN
                    ALTER TABLE public.people_details RENAME COLUMN customer_id TO people_id;
                END IF;
            END $$;
        `)

        // 3. Rename sequences safely
        await db.execute(`
            DO $$ 
            BEGIN 
                IF EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = 'customer_seq_id_seq') AND 
                   NOT EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = 'people_seq_id_seq') THEN
                    ALTER SEQUENCE public.customer_seq_id_seq RENAME TO people_seq_id_seq;
                END IF;

                IF EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = 'customer_address_seq_id_seq') AND 
                   NOT EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = 'people_address_seq_id_seq') THEN
                    ALTER SEQUENCE public.customer_address_seq_id_seq RENAME TO people_address_seq_id_seq;
                END IF;

                IF EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = 'customer_contact_seq_id_seq') AND 
                   NOT EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = 'people_contact_seq_id_seq') THEN
                    ALTER SEQUENCE public.customer_contact_seq_id_seq RENAME TO people_contact_seq_id_seq;
                END IF;

                IF EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = 'customer_bank_account_seq_id_seq') AND 
                   NOT EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = 'people_bank_account_seq_id_seq') THEN
                    ALTER SEQUENCE public.customer_bank_account_seq_id_seq RENAME TO people_bank_account_seq_id_seq;
                END IF;

                IF EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = 'customer_documents_seq_id_seq') AND 
                   NOT EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = 'people_documents_seq_id_seq') THEN
                    ALTER SEQUENCE public.customer_documents_seq_id_seq RENAME TO people_documents_seq_id_seq;
                END IF;

                IF EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = 'customer_details_seq_id_seq') AND 
                   NOT EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = 'people_details_seq_id_seq') THEN
                    ALTER SEQUENCE public.customer_details_seq_id_seq RENAME TO people_details_seq_id_seq;
                END IF;
            END $$;
        `)

        // 4. Rename indices safely
        await db.execute(`
            DO $$ 
            BEGIN 
                IF EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'i' AND relname = 'idx_customer_seq_id') AND 
                   NOT EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'i' AND relname = 'idx_people_seq_id') THEN
                    ALTER INDEX idx_customer_seq_id RENAME TO idx_people_seq_id;
                END IF;

                IF EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'i' AND relname = 'idx_customer_address_seq_id') AND 
                   NOT EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'i' AND relname = 'idx_people_address_seq_id') THEN
                    ALTER INDEX idx_customer_address_seq_id RENAME TO idx_people_address_seq_id;
                END IF;

                IF EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'i' AND relname = 'idx_customer_address_customer_id') AND 
                   NOT EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'i' AND relname = 'idx_people_address_people_id') THEN
                    ALTER INDEX idx_customer_address_customer_id RENAME TO idx_people_address_people_id;
                END IF;

                IF EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'i' AND relname = 'idx_customer_contact_seq_id') AND 
                   NOT EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'i' AND relname = 'idx_people_contact_seq_id') THEN
                    ALTER INDEX idx_customer_contact_seq_id RENAME TO idx_people_contact_seq_id;
                END IF;

                IF EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'i' AND relname = 'idx_customer_contact_customer_id') AND 
                   NOT EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'i' AND relname = 'idx_people_contact_people_id') THEN
                    ALTER INDEX idx_customer_contact_customer_id RENAME TO idx_people_contact_people_id;
                END IF;

                IF EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'i' AND relname = 'idx_customer_bank_account_seq_id') AND 
                   NOT EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'i' AND relname = 'idx_people_bank_account_seq_id') THEN
                    ALTER INDEX idx_customer_bank_account_seq_id RENAME TO idx_people_bank_account_seq_id;
                END IF;

                IF EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'i' AND relname = 'idx_customer_bank_account_customer_id') AND 
                   NOT EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'i' AND relname = 'idx_people_bank_account_people_id') THEN
                    ALTER INDEX idx_customer_bank_account_customer_id RENAME TO idx_people_bank_account_people_id;
                END IF;

                IF EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'i' AND relname = 'idx_customer_documents_seq_id') AND 
                   NOT EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'i' AND relname = 'idx_people_documents_seq_id') THEN
                    ALTER INDEX idx_customer_documents_seq_id RENAME TO idx_people_documents_seq_id;
                END IF;

                IF EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'i' AND relname = 'idx_customer_documents_customer_id') AND 
                   NOT EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'i' AND relname = 'idx_people_documents_people_id') THEN
                    ALTER INDEX idx_customer_documents_customer_id RENAME TO idx_people_documents_people_id;
                END IF;

                IF EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'i' AND relname = 'idx_customer_details_seq_id') AND 
                   NOT EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'i' AND relname = 'idx_people_details_seq_id') THEN
                    ALTER INDEX idx_customer_details_seq_id RENAME TO idx_people_details_seq_id;
                END IF;

                IF EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'i' AND relname = 'idx_customer_details_customer_id') AND 
                   NOT EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'i' AND relname = 'idx_people_details_people_id') THEN
                    ALTER INDEX idx_customer_details_customer_id RENAME TO idx_people_details_people_id;
                END IF;
            END $$;
        `)

        // 5. Re-apply audit triggers (with new table names)
        const tables = ['people', 'people_address', 'people_contact', 'people_bank_account', 'people_documents', 'people_details'];
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
        // 1. Revert indices
        await db.execute(`
            ALTER INDEX IF EXISTS idx_people_seq_id RENAME TO idx_customer_seq_id;
            ALTER INDEX IF EXISTS idx_people_address_seq_id RENAME TO idx_customer_address_seq_id;
            ALTER INDEX IF EXISTS idx_people_address_people_id RENAME TO idx_customer_address_customer_id;
            ALTER INDEX IF EXISTS idx_people_contact_seq_id RENAME TO idx_customer_contact_seq_id;
            ALTER INDEX IF EXISTS idx_people_contact_people_id RENAME TO idx_customer_contact_customer_id;
            ALTER INDEX IF EXISTS idx_people_bank_account_seq_id RENAME TO idx_customer_bank_account_seq_id;
            ALTER INDEX IF EXISTS idx_people_bank_account_people_id RENAME TO idx_customer_bank_account_customer_id;
            ALTER INDEX IF EXISTS idx_people_documents_seq_id RENAME TO idx_customer_documents_seq_id;
            ALTER INDEX IF EXISTS idx_people_documents_people_id RENAME TO idx_customer_documents_customer_id;
            ALTER INDEX IF EXISTS idx_people_details_seq_id RENAME TO idx_customer_details_seq_id;
            ALTER INDEX IF EXISTS idx_people_details_people_id RENAME TO idx_customer_details_customer_id;
        `)

        // 2. Revert sequences
        await db.execute(`
            ALTER SEQUENCE IF EXISTS public.people_seq_id_seq RENAME TO customer_seq_id_seq;
            ALTER SEQUENCE IF EXISTS public.people_address_seq_id_seq RENAME TO customer_address_seq_id_seq;
            ALTER SEQUENCE IF EXISTS public.people_contact_seq_id_seq RENAME TO customer_contact_seq_id_seq;
            ALTER SEQUENCE IF EXISTS public.people_bank_account_seq_id_seq RENAME TO customer_bank_account_seq_id_seq;
            ALTER SEQUENCE IF EXISTS public.people_documents_seq_id_seq RENAME TO customer_documents_seq_id_seq;
            ALTER SEQUENCE IF EXISTS public.people_details_seq_id_seq RENAME TO customer_details_seq_id_seq;
        `)

        // 3. Revert columns
        await db.execute(`
            ALTER TABLE public.people_address RENAME COLUMN people_id TO customer_id;
            ALTER TABLE public.people_contact RENAME COLUMN people_id TO customer_id;
            ALTER TABLE public.people_bank_account RENAME COLUMN people_id TO customer_id;
            ALTER TABLE public.people_documents RENAME COLUMN people_id TO customer_id;
            ALTER TABLE public.people_details RENAME COLUMN people_id TO customer_id;
        `)

        // 4. Revert tables
        await db.execute(`
            ALTER TABLE public.people RENAME TO customer;
            ALTER TABLE public.people_address RENAME TO customer_address;
            ALTER TABLE public.people_contact RENAME TO customer_contact;
            ALTER TABLE public.people_bank_account RENAME TO customer_bank_account;
            ALTER TABLE public.people_documents RENAME TO customer_documents;
            ALTER TABLE public.people_details RENAME TO customer_details;
        `)

        // 5. Re-apply audit triggers
        const tables = ['customer', 'customer_address', 'customer_contact', 'customer_bank_account', 'customer_documents', 'customer_details'];
        for (const table of tables) {
            await db.execute(`
                DROP TRIGGER IF EXISTS trg_audit_log ON public.${table};
                CREATE TRIGGER trg_audit_log
                AFTER INSERT OR UPDATE OR DELETE ON public.${table}
                FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
            `);
        }
    },
}
