import type { Migration } from '../../migrations/Migration'

export const createRemetentesAndComunicacoesTables20250102001: Migration = {
  id: '20250102001',
  name: 'create-remetentes-and-comunicacoes-tables',
  async up({ db }) {
    // Criar tabela de remetentes
    await db.execute(`
      CREATE TABLE IF NOT EXISTS remetentes (
        id UUID PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(160) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        smtp_host VARCHAR(255) NOT NULL,
        smtp_port INTEGER NOT NULL,
        smtp_secure BOOLEAN NOT NULL DEFAULT false,
        created_by VARCHAR(160) NOT NULL,
        updated_by VARCHAR(160) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)

    // Criar tabela de comunicações
    await db.execute(`
      CREATE TABLE IF NOT EXISTS comunicacoes (
        id UUID PRIMARY KEY,
        tipo VARCHAR(50) NOT NULL DEFAULT 'email',
        descricao TEXT NOT NULL,
        remetente_id UUID NOT NULL,
        tipo_envio VARCHAR(50) NOT NULL DEFAULT 'imediato',
        chave VARCHAR(255) NOT NULL UNIQUE,
        created_by VARCHAR(160) NOT NULL,
        updated_by VARCHAR(160) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_comunicacao_remetente
          FOREIGN KEY (remetente_id)
          REFERENCES remetentes(id)
          ON DELETE RESTRICT
      );
    `)

    // Criar índice na chave de comunicações para busca rápida
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_comunicacoes_chave ON comunicacoes(chave);
    `)

    // Criar índice no remetente_id para busca rápida
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_comunicacoes_remetente_id ON comunicacoes(remetente_id);
    `)

    // Apply audit triggers
    await db.execute(`
      DROP TRIGGER IF EXISTS trg_audit_log ON public.remetentes;
      CREATE TRIGGER trg_audit_log
      AFTER INSERT OR UPDATE OR DELETE ON public.remetentes
      FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();

      DROP TRIGGER IF EXISTS trg_audit_log ON public.comunicacoes;
      CREATE TRIGGER trg_audit_log
      AFTER INSERT OR UPDATE OR DELETE ON public.comunicacoes
      FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
    `)
  },
  async down({ db }) {
    await db.execute('DROP TABLE IF EXISTS comunicacoes;')
    await db.execute('DROP TABLE IF EXISTS remetentes;')
  },
}

