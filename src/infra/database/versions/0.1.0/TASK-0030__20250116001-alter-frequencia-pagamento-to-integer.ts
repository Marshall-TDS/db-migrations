import type { Migration } from "../../migrations/Migration";

export const alterFrequenciaPagamentoToInteger20250116001: Migration = {
  id: "20250116001",
  name: "alter-frequencia-pagamento-to-integer",
  async up({ db }) {
    // Alter frequencia_pagamento from VARCHAR to INTEGER
    // First, we need to convert existing string values to integers
    // Mapping: 'MENSAL' -> 1, 'TRIMESTRAL' -> 3, 'FINAL' -> 0 (or appropriate value)
    // Since we're changing the data type, we'll use a default value for existing records
    await db.execute(`
      -- Step 1: Add a temporary column with INTEGER type
      ALTER TABLE public.profitability_modality
        ADD COLUMN IF NOT EXISTS frequencia_pagamento_temp INTEGER;

      -- Step 2: Convert existing string values to integers
      -- Default mapping: MENSAL=1, TRIMESTRAL=3, FINAL=0
      UPDATE public.profitability_modality
      SET frequencia_pagamento_temp = CASE
        WHEN frequencia_pagamento = 'MENSAL' THEN 1
        WHEN frequencia_pagamento = 'TRIMESTRAL' THEN 3
        WHEN frequencia_pagamento = 'FINAL' THEN 0
        ELSE 1
      END;

      -- Step 3: Set default value for any NULL values
      UPDATE public.profitability_modality
      SET frequencia_pagamento_temp = 1
      WHERE frequencia_pagamento_temp IS NULL;

      -- Step 4: Drop the old column
      ALTER TABLE public.profitability_modality
        DROP COLUMN IF EXISTS frequencia_pagamento;

      -- Step 5: Rename the temporary column to the original name
      ALTER TABLE public.profitability_modality
        RENAME COLUMN frequencia_pagamento_temp TO frequencia_pagamento;

      -- Step 6: Set NOT NULL constraint and default value
      ALTER TABLE public.profitability_modality
        ALTER COLUMN frequencia_pagamento SET NOT NULL,
        ALTER COLUMN frequencia_pagamento SET DEFAULT 1;
    `);
  },
  async down({ db }) {
    // Revert frequencia_pagamento from INTEGER back to VARCHAR
    await db.execute(`
      -- Step 1: Add a temporary column with VARCHAR type
      ALTER TABLE public.profitability_modality
        ADD COLUMN IF NOT EXISTS frequencia_pagamento_temp VARCHAR(20);

      -- Step 2: Convert integer values back to strings
      -- Mapping: 1 -> 'MENSAL', 3 -> 'TRIMESTRAL', 0 -> 'FINAL'
      UPDATE public.profitability_modality
      SET frequencia_pagamento_temp = CASE
        WHEN frequencia_pagamento = 1 THEN 'MENSAL'
        WHEN frequencia_pagamento = 3 THEN 'TRIMESTRAL'
        WHEN frequencia_pagamento = 0 THEN 'FINAL'
        ELSE 'MENSAL'
      END;

      -- Step 3: Set default value for any NULL values
      UPDATE public.profitability_modality
      SET frequencia_pagamento_temp = 'MENSAL'
      WHERE frequencia_pagamento_temp IS NULL;

      -- Step 4: Drop the old column
      ALTER TABLE public.profitability_modality
        DROP COLUMN IF EXISTS frequencia_pagamento;

      -- Step 5: Rename the temporary column to the original name
      ALTER TABLE public.profitability_modality
        RENAME COLUMN frequencia_pagamento_temp TO frequencia_pagamento;

      -- Step 6: Set NOT NULL constraint and default value
      ALTER TABLE public.profitability_modality
        ALTER COLUMN frequencia_pagamento SET NOT NULL,
        ALTER COLUMN frequencia_pagamento SET DEFAULT 'MENSAL';
    `);
  },
};

