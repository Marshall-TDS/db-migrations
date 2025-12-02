import type { Migration } from '../../migrations/Migration'

export const createSystemAuditLog20251202002: Migration = {
    id: '20251202002',
    name: 'create-system-audit-log',
    async up({ db }) {
        // 1. Criar tabela system_audit_log
        await db.execute(`
            CREATE TABLE IF NOT EXISTS public.system_audit_log (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL ,
                schema_name TEXT NOT NULL,
                table_name TEXT NOT NULL,
                operation TEXT NOT NULL, -- 'INSERT', 'UPDATE', ou 'DELETE'
                origin TEXT NOT NULL DEFAULT 'system',
                changed_by TEXT NOT NULL DEFAULT 'system',
                changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                data_before JSONB, -- Estado da linha antes da alteração (NULL no INSERT)
                data_after JSONB   -- Estado da linha após a alteração (NULL no DELETE)
            );
        `)

        // 2. Criar índices
        await db.execute(`
            CREATE INDEX IF NOT EXISTS idx_audit_table ON public.system_audit_log(table_name);
            CREATE INDEX IF NOT EXISTS idx_audit_date ON public.system_audit_log(changed_at);
            CREATE INDEX IF NOT EXISTS idx_audit_after_json ON public.system_audit_log USING GIN (data_after);
        `)

        // 3. Criar função fn_audit_trigger
        await db.execute(`
            CREATE OR REPLACE FUNCTION public.fn_audit_trigger()
            RETURNS TRIGGER AS $$
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
            $$ LANGUAGE plpgsql;
        `)

        // 4. Aplicar triggers em todas as tabelas
        await db.execute(`
            DO $$
            DECLARE
                r RECORD;
            BEGIN
                FOR r IN 
                    SELECT tablename 
                    FROM pg_tables 
                    WHERE schemaname = 'public' 
                      AND tablename != 'system_audit_log' 
                LOOP
                    EXECUTE format('DROP TRIGGER IF EXISTS trg_audit_log ON %I', r.tablename);
                    
                    EXECUTE format('
                        CREATE TRIGGER trg_audit_log
                        AFTER INSERT OR UPDATE OR DELETE ON %I
                        FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger()', 
                        r.tablename
                    );
                    
                    RAISE NOTICE 'Trigger de auditoria aplicado na tabela: %', r.tablename;
                END LOOP;
            END;
            $$;
        `)
    },
    async down({ db }) {
        // Remover triggers
        await db.execute(`
            DO $$
            DECLARE
                r RECORD;
            BEGIN
                FOR r IN 
                    SELECT tablename 
                    FROM pg_tables 
                    WHERE schemaname = 'public' 
                      AND tablename != 'system_audit_log'
                LOOP
                    EXECUTE format('DROP TRIGGER IF EXISTS trg_audit_log ON %I', r.tablename);
                END LOOP;
            END;
            $$;
        `)

        // Remover função
        await db.execute(`DROP FUNCTION IF EXISTS public.fn_audit_trigger;`)

        // Remover tabela
        await db.execute(`DROP TABLE IF EXISTS public.system_audit_log;`)
    },
}
