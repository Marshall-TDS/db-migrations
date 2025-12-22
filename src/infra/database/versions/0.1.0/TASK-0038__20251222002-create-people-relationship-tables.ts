import type { Migration } from '../../migrations/Migration'

export const createPeopleRelationshipTables20251222002: Migration = {
    id: '20251222002',
    name: 'create-people-relationship-tables',
    async up({ db }) {
        await db.execute(`
            -- Create people_relationship_types table
            CREATE TABLE IF NOT EXISTS public.people_relationship_types (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                seq_id BIGSERIAL NOT NULL,
                connector_prefix VARCHAR(100) NOT NULL,
                relationship_source VARCHAR(100) NOT NULL,
                connector_suffix VARCHAR(100) NOT NULL,
                relationship_target VARCHAR(100) NOT NULL,
                inverse_type_id UUID NOT NULL,
                created_by VARCHAR(160) NOT NULL,
                updated_by VARCHAR(160) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            -- Add self-referencing foreign key for inverse_type_id
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_people_relationship_types_inverse') THEN
                    ALTER TABLE public.people_relationship_types 
                    ADD CONSTRAINT fk_people_relationship_types_inverse 
                    FOREIGN KEY (inverse_type_id) REFERENCES public.people_relationship_types(id)
                    DEFERRABLE INITIALLY DEFERRED;
                END IF;
            END $$;

            CREATE UNIQUE INDEX IF NOT EXISTS idx_people_rel_types_seq_id ON public.people_relationship_types(seq_id);

            -- Audit trigger for types
            DROP TRIGGER IF EXISTS trg_audit_log ON public.people_relationship_types;
            CREATE TRIGGER trg_audit_log
            AFTER INSERT OR UPDATE OR DELETE ON public.people_relationship_types
            FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();

            -- Sequence grant for types
            GRANT USAGE, SELECT, UPDATE ON SEQUENCE public.people_relationship_types_seq_id_seq TO system;

            -- Create people_relationship table
            CREATE TABLE IF NOT EXISTS public.people_relationship (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                seq_id BIGSERIAL NOT NULL,
                people_relationship_types_id UUID NOT NULL REFERENCES public.people_relationship_types(id),
                people_id_source UUID NOT NULL REFERENCES public.people(id),
                people_id_target UUID NOT NULL REFERENCES public.people(id),
                inverse_type_id UUID NOT NULL,
                created_by VARCHAR(160) NOT NULL,
                updated_by VARCHAR(160) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            -- Add self-referencing foreign key for inverse_type_id in relationship table
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_people_relationship_inverse') THEN
                    ALTER TABLE public.people_relationship 
                    ADD CONSTRAINT fk_people_relationship_inverse 
                    FOREIGN KEY (inverse_type_id) REFERENCES public.people_relationship(id)
                    DEFERRABLE INITIALLY DEFERRED;
                END IF;
            END $$;

            CREATE UNIQUE INDEX IF NOT EXISTS idx_people_rel_seq_id ON public.people_relationship(seq_id);

            -- Audit trigger for relationship
            DROP TRIGGER IF EXISTS trg_audit_log ON public.people_relationship;
            CREATE TRIGGER trg_audit_log
            AFTER INSERT OR UPDATE OR DELETE ON public.people_relationship
            FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();

            -- Sequence grant for relationship
            GRANT USAGE, SELECT, UPDATE ON SEQUENCE public.people_relationship_seq_id_seq TO system;

            -- Create function to sync reciprocity (via de mão dupla)
            CREATE OR REPLACE FUNCTION public.fn_sync_relationship_reciprocity() 
            RETURNS TRIGGER AS $$
            DECLARE
                v_inverse_id UUID;
                v_inverse_type_id UUID;
            BEGIN
                -- Avoid recursion
                IF pg_trigger_depth() > 1 THEN
                    RETURN NEW;
                END IF;

                IF TG_TABLE_NAME = 'people_relationship_types' THEN
                    -- Check if inverse record exists
                    SELECT id INTO v_inverse_id FROM public.people_relationship_types WHERE id = NEW.inverse_type_id;

                    IF v_inverse_id IS NULL THEN
                        -- INSERT INVERSE if not exists
                        -- Swap source/target to maintain reciprocity logic (keep prefix/suffix as is)
                        INSERT INTO public.people_relationship_types (
                            id, 
                            connector_prefix, relationship_source, connector_suffix, relationship_target,
                            inverse_type_id,
                            created_by, updated_by
                        ) VALUES (
                            NEW.inverse_type_id,
                            NEW.connector_prefix, NEW.relationship_target, NEW.connector_suffix, NEW.relationship_source,
                            NEW.id,
                            NEW.created_by, NEW.updated_by
                        );
                    ELSE
                        -- UPDATE INVERSE if exists but divergent
                        UPDATE public.people_relationship_types SET
                            inverse_type_id = NEW.id,
                            relationship_source = NEW.relationship_target,
                            relationship_target = NEW.relationship_source,
                            connector_prefix = NEW.connector_prefix,
                            connector_suffix = NEW.connector_suffix,
                            updated_by = NEW.updated_by,
                            updated_at = NOW()
                        WHERE id = v_inverse_id 
                          AND (inverse_type_id IS DISTINCT FROM NEW.id 
                               OR relationship_source IS DISTINCT FROM NEW.relationship_target
                               OR relationship_target IS DISTINCT FROM NEW.relationship_source
                               OR connector_prefix IS DISTINCT FROM NEW.connector_prefix
                               OR connector_suffix IS DISTINCT FROM NEW.connector_suffix);
                    END IF;

                ELSIF TG_TABLE_NAME = 'people_relationship' THEN
                    -- Find what the inverse type should be from the types table
                    SELECT inverse_type_id INTO v_inverse_type_id 
                    FROM public.people_relationship_types 
                    WHERE id = NEW.people_relationship_types_id;

                    -- Check if inverse relationship record exists
                    SELECT id INTO v_inverse_id FROM public.people_relationship WHERE id = NEW.inverse_type_id;

                    IF v_inverse_id IS NULL THEN
                        -- INSERT INVERSE RELATIONSHIP
                        INSERT INTO public.people_relationship (
                            id,
                            people_relationship_types_id,
                            people_id_source,
                            people_id_target,
                            inverse_type_id,
                            created_by, updated_by
                        ) VALUES (
                            NEW.inverse_type_id,
                            v_inverse_type_id,
                            NEW.people_id_target,
                            NEW.people_id_source,
                            NEW.id,
                            NEW.created_by, NEW.updated_by
                        );
                    ELSE
                        -- UPDATE INVERSE RELATIONSHIP if divergent
                        UPDATE public.people_relationship SET
                            inverse_type_id = NEW.id,
                            people_relationship_types_id = v_inverse_type_id,
                            people_id_source = NEW.people_id_target,
                            people_id_target = NEW.people_id_source,
                            updated_by = NEW.updated_by,
                            updated_at = NOW()
                        WHERE id = v_inverse_id
                          AND (inverse_type_id IS DISTINCT FROM NEW.id
                               OR people_id_source IS DISTINCT FROM NEW.people_id_target
                               OR people_id_target IS DISTINCT FROM NEW.people_id_source
                               OR people_relationship_types_id IS DISTINCT FROM v_inverse_type_id);
                    END IF;
                END IF;

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            -- Add triggers for reciprocity sync
            DROP TRIGGER IF EXISTS trg_sync_reciprocity ON public.people_relationship_types;
            CREATE TRIGGER trg_sync_reciprocity
            AFTER INSERT OR UPDATE ON public.people_relationship_types
            FOR EACH ROW EXECUTE FUNCTION public.fn_sync_relationship_reciprocity();

            DROP TRIGGER IF EXISTS trg_sync_reciprocity ON public.people_relationship;
            CREATE TRIGGER trg_sync_reciprocity
            AFTER INSERT OR UPDATE ON public.people_relationship
            FOR EACH ROW EXECUTE FUNCTION public.fn_sync_relationship_reciprocity();
        `)
    },
    async down({ db }) {
        await db.execute(`
            DROP TRIGGER IF EXISTS trg_check_reciprocity ON public.people_relationship;
            DROP TRIGGER IF EXISTS trg_check_reciprocity ON public.people_relationship_types;
            DROP FUNCTION IF EXISTS public.fn_check_relationship_reciprocity();

            DROP TRIGGER IF EXISTS trg_audit_log ON public.people_relationship;
            DROP TABLE IF EXISTS public.people_relationship;

            DROP TRIGGER IF EXISTS trg_audit_log ON public.people_relationship_types;
            DROP TABLE IF EXISTS public.people_relationship_types;
        `)
    },
}
