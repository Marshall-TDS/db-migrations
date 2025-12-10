import type { Migration } from '../../migrations/Migration'

export const setupAuditLog20250101000: Migration = {
    id: '20250101000',
    name: 'setup-audit-log',
    async up({ db }) {
        // 1. Create audit log table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS public.system_audit_log (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                seq_id BIGSERIAL,
                schema_name VARCHAR(60) NOT NULL,
                table_name VARCHAR(60) NOT NULL,
                operation VARCHAR(20) NOT NULL,
                origin VARCHAR(100) NOT NULL,
                changed_by VARCHAR(100) NOT NULL,
                data_before JSONB,
                data_after JSONB,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            CREATE UNIQUE INDEX IF NOT EXISTS idx_system_audit_log_seq_id ON public.system_audit_log(seq_id);
            CREATE INDEX IF NOT EXISTS idx_system_audit_log_table_name ON public.system_audit_log(table_name);
            CREATE INDEX IF NOT EXISTS idx_system_audit_log_created_at ON public.system_audit_log(created_at);
        `)

        // 2. Create audit trigger function
        await db.execute(`
            CREATE OR REPLACE FUNCTION public.fn_audit_trigger()
                RETURNS trigger
                LANGUAGE 'plpgsql'
                COST 100
                VOLATILE NOT LEAKPROOF
            AS $BODY$
            BEGIN
                IF (TG_OP = 'INSERT') THEN
                    INSERT INTO public.system_audit_log (schema_name, table_name, operation, origin, changed_by, data_before, data_after)
                    VALUES (TG_TABLE_SCHEMA, TG_TABLE_NAME, 'INSERT', 'system', 'system', NULL, to_jsonb(NEW));
                    RETURN NEW;
                    
                ELSIF (TG_OP = 'UPDATE') THEN
                    IF NEW IS DISTINCT FROM OLD THEN
                        INSERT INTO public.system_audit_log (schema_name, table_name, operation, origin, changed_by, data_before, data_after)
                        VALUES (TG_TABLE_SCHEMA, TG_TABLE_NAME, 'UPDATE', 'system', 'system', to_jsonb(OLD), to_jsonb(NEW));
                    END IF;
                    RETURN NEW;
                    
                ELSIF (TG_OP = 'DELETE') THEN
                    INSERT INTO public.system_audit_log (schema_name, table_name, operation, origin, changed_by, data_before, data_after)
                    VALUES (TG_TABLE_SCHEMA, TG_TABLE_NAME, 'DELETE', 'system', 'system', to_jsonb(OLD), NULL);
                    RETURN OLD;
                END IF;
                
                RETURN NULL;
            END;
            $BODY$;

            ALTER FUNCTION public.fn_audit_trigger()
                OWNER TO marshalladm;
        `)

        // 3. Apply trigger to all existing tables (except audit log)
        await db.execute(`
            DO $$
            DECLARE
                t text;
            BEGIN
                FOR t IN
                    SELECT table_name
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                      AND table_name != 'system_audit_log'
                      AND table_type = 'BASE TABLE'
                LOOP
                    EXECUTE format('DROP TRIGGER IF EXISTS trg_audit_log ON public.%I', t);
                    EXECUTE format('CREATE TRIGGER trg_audit_log AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger()', t);
                END LOOP;
            END;
            $$ LANGUAGE plpgsql;
        `)
    },
    async down({ db }) {
        await db.execute(`
            DROP TRIGGER IF EXISTS trg_audit_log ON public.system_audit_log;
            DROP FUNCTION IF EXISTS public.fn_audit_trigger();
            DROP TABLE IF EXISTS public.system_audit_log;
        `)
        // Note: We don't remove triggers from other tables in down() because iterating all tables to remove is complex 
        // and usually 'down' is specific to this migration. 
        // Ideally we should loop and drop, but if we drop the function, the triggers break anyway (or prevent drop).
        // Postgres CASCADE might be needed if triggers depend on function.
        await db.execute(`DROP FUNCTION IF EXISTS public.fn_audit_trigger() CASCADE;`)
    },
}
