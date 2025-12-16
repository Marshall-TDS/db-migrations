import type { Migration } from "../../migrations/Migration";

export const updateParameterizationScopeTypeConstraint20250119001: Migration = {
  id: "20250119001",
  name: "update-parameterization-scope-type-constraint",
  async up({ db }) {
    await db.execute(`
      DO $$
      DECLARE
        constraint_name text;
        scope_type_attnum smallint;
      BEGIN
        -- Obtém o número do atributo da coluna scope_type
        SELECT attnum INTO scope_type_attnum
        FROM pg_attribute 
        WHERE attrelid = 'public.parameterization'::regclass 
        AND attname = 'scope_type';

        -- Encontra e remove todas as constraints CHECK na coluna scope_type
        FOR constraint_name IN 
          SELECT conname 
          FROM pg_constraint 
          WHERE conrelid = 'public.parameterization'::regclass 
          AND contype = 'c'
          AND scope_type_attnum = ANY(conkey)
        LOOP
          EXECUTE format('ALTER TABLE public.parameterization DROP CONSTRAINT IF EXISTS %I', constraint_name);
        END LOOP;
      END $$;

      -- Adiciona a nova constraint com valores em maiúsculas
      ALTER TABLE public.parameterization 
      ADD CONSTRAINT parameterization_scope_type_check 
      CHECK (scope_type::text = ANY (ARRAY['GLOBAL'::character varying::text, 'USER'::character varying::text]));
    `);
  },
  async down({ db }) {
    await db.execute(`
      DO $$
      BEGIN
        -- Remove a constraint nova
        IF EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'parameterization_scope_type_check' 
          AND table_name = 'parameterization'
        ) THEN
          ALTER TABLE public.parameterization DROP CONSTRAINT parameterization_scope_type_check;
        END IF;

        -- Restaura a constraint antiga
        ALTER TABLE public.parameterization 
        ADD CONSTRAINT parameterization_escopo_check 
        CHECK (scope_type::text = ANY (ARRAY['Global'::character varying::text, 'Usuario'::character varying::text]));
      END $$;
    `);
  },
};

