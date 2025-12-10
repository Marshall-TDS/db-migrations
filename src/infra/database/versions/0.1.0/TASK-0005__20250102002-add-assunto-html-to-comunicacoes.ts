import type { Migration } from '../../migrations/Migration'

export const addAssuntoHtmlToComunicacoes20250102002: Migration = {
  id: '20250102002',
  name: 'add-assunto-html-to-comunicacoes',
  async up({ db }) {
    // Adicionar coluna assunto
    await db.execute(`
      ALTER TABLE comunicacoes
      ADD COLUMN IF NOT EXISTS assunto VARCHAR(255);
    `)

    // Atualizar registros existentes com valor padrão
    await db.execute(`
      UPDATE comunicacoes
      SET assunto = ''
      WHERE assunto IS NULL;
    `)

    // Tornar a coluna NOT NULL
    await db.execute(`
      ALTER TABLE comunicacoes
      ALTER COLUMN assunto SET NOT NULL;
    `)

    // Adicionar coluna html
    await db.execute(`
      ALTER TABLE comunicacoes
      ADD COLUMN IF NOT EXISTS html TEXT;
    `)

    // Atualizar registros existentes com valor padrão
    await db.execute(`
      UPDATE comunicacoes
      SET html = ''
      WHERE html IS NULL;
    `)

    // Tornar a coluna NOT NULL
    await db.execute(`
      ALTER TABLE comunicacoes
      ALTER COLUMN html SET NOT NULL;
    `)
  },
  async down({ db }) {
    await db.execute(`
      DO $$
      BEGIN
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comunicacoes') THEN
          ALTER TABLE comunicacoes DROP COLUMN IF EXISTS html;
          ALTER TABLE comunicacoes DROP COLUMN IF EXISTS assunto;
        END IF;
      END $$;
    `)
  },
}

