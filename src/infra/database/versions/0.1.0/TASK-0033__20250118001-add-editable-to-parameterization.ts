import type { Migration } from "../../migrations/Migration";

export const addEditableToParameterization20250118001: Migration = {
  id: "20250118001",
  name: "add-editable-to-parameterization",
  async up({ db }) {
    await db.execute(`
      DO $$
      BEGIN
        -- Remove old CHECK constraint that references the old column name 'tipo'
        -- This constraint was created in TASK-0027 but not properly removed when column was renamed in TASK-0032
        IF EXISTS (
          SELECT 1 FROM pg_constraint c
          JOIN pg_class t ON t.oid = c.conrelid
          JOIN pg_namespace n ON n.oid = t.relnamespace
          WHERE n.nspname = 'public'
            AND t.relname = 'parameterization'
            AND c.conname = 'parameterization_tipo_check'
        ) THEN
          ALTER TABLE public.parameterization 
          DROP CONSTRAINT parameterization_tipo_check;
        END IF;

        -- Add editable column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'parameterization' 
          AND column_name = 'editable'
        ) THEN
          ALTER TABLE public.parameterization 
          ADD COLUMN editable BOOLEAN NOT NULL DEFAULT true;
        END IF;
      END $$;
    `);
  },
  async down({ db }) {
    await db.execute(`
      DO $$
      BEGIN
        -- Drop editable column
        ALTER TABLE public.parameterization 
        DROP COLUMN IF EXISTS editable;

        -- Optionally recreate the old constraint if needed (commented out)
        -- ALTER TABLE public.parameterization 
        -- ADD CONSTRAINT parameterization_tipo_check 
        -- CHECK (data_type IN ('Número', 'Texto', 'Data', 'Booleano'));
      END $$;
    `);
  },
};
