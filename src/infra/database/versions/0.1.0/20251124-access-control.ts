import type { Migration } from '../../migrations/Migration'

export const createUsersTable20250101001: Migration = {
    id: '20250101001',
    name: 'create-users-table',
    async up({ db }) {
        await db.execute(`
        -- 1. Habilitar extensão pgcrypto (necessária para bytes aleatórios seguros)
        CREATE EXTENSION IF NOT EXISTS "pgcrypto";

        -- ==========================================
        -- FUNÇÃO AUXILIAR: UUID v7 (Padrão RFC 9562)
        -- ==========================================
        -- Esta função gera UUIDs ordenáveis por tempo (Time-Sorted).
        -- Melhora drasticamente a performance de INSERT em tabelas grandes comparado ao v4.
        CREATE OR REPLACE FUNCTION uuid_generate_v7()
        RETURNS uuid
        AS $$
        DECLARE
        unix_ts_ms bytea;
        uuid_bytes bytea;
        BEGIN
        -- 1. Obter timestamp atual em milissegundos (BigInt) e converter para bytes
        -- Multiplica por 1000 para ms, converte para bigint, e pega os bytes relevantes
        unix_ts_ms = substring(int8send(floor(extract(epoch from clock_timestamp()) * 1000)::bigint) from 3);
        
        -- 2. Preencher o restante com bytes aleatórios seguros (da pgcrypto)
        uuid_bytes = unix_ts_ms || gen_random_bytes(10);
        
        -- 3. Definir a versão 7 (0111) nos bits apropriados (high nibble do 7º byte)
        uuid_bytes = set_byte(uuid_bytes, 6, (get_byte(uuid_bytes, 6) & x'0f'::int) | x'70'::int);
        
        -- 4. Definir a variante 1 (10xx) (high nibble do 9º byte)
        uuid_bytes = set_byte(uuid_bytes, 8, (get_byte(uuid_bytes, 8) & x'3f'::int) | x'80'::int);
        
        RETURN encode(uuid_bytes, 'hex')::uuid;
        END;
        $$ LANGUAGE plpgsql VOLATILE;

        -- ==========================================
        -- TABELA 1: DEFINIÇÃO DE TASKS (Task-Oriented)
        -- ==========================================
        CREATE TABLE system_tasks (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v7(), -- UUID v7 (Ordenável)
            seq_id BIGSERIAL UNIQUE,                        -- ID Numérico Humano
            task_code VARCHAR(100) UNIQUE NOT NULL,
            description TEXT NOT NULL,
            category VARCHAR(50) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- ==========================================
        -- TABELA 2: GRUPOS DE ACESSO
        -- ==========================================
        CREATE TABLE access_groups (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v7(), -- UUID v7
            seq_id BIGSERIAL UNIQUE,
            name VARCHAR(100) UNIQUE NOT NULL,
            description TEXT,
            
            -- Array de permissões padrão
            default_tasks VARCHAR(100)[] DEFAULT '{}',
            
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- ==========================================
        -- TABELA 3: USUÁRIOS
        -- ==========================================
        CREATE TABLE users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v7(), -- UUID v7
            seq_id BIGSERIAL UNIQUE,
            first_name VARCHAR(150) NOT NULL,
            full_name VARCHAR(150) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            
            password_hash VARCHAR(255) NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            
            -- RBAC + ABAC Híbrido
            assigned_group_ids UUID[] DEFAULT '{}',
            tasks_allowed VARCHAR(100)[] DEFAULT '{}',
            tasks_denied VARCHAR(100)[] DEFAULT '{}',
            
            last_login_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- ==========================================
        -- ÍNDICES
        -- ==========================================
        CREATE INDEX idx_users_assigned_groups ON users USING GIN (assigned_group_ids);
        CREATE INDEX idx_users_tasks_allowed ON users USING GIN (tasks_allowed);
        CREATE INDEX idx_users_tasks_denied ON users USING GIN (tasks_denied);
        CREATE INDEX idx_groups_default_tasks ON access_groups USING GIN (default_tasks);

        -- Opcional: Índice BRIN para created_at em tabelas gigantes, 
        -- embora o UUID v7 já forneça correlação temporal.

        -- ==========================================
        -- VIEW AUXILIAR: PERMISSÕES EFETIVAS
        -- ==========================================
        CREATE OR REPLACE VIEW view_user_effective_permissions AS
        WITH user_groups_expanded AS (
            SELECT 
                u.id AS user_id,
                u.seq_id AS user_seq_id,
                unnest(u.assigned_group_ids) AS group_id
            FROM users u
        ),
        group_tasks AS (
            SELECT 
                uge.user_id,
                uge.user_seq_id,
                unnest(ag.default_tasks) AS task_code
            FROM user_groups_expanded uge
            JOIN access_groups ag ON ag.id = uge.group_id
        ),
        all_allowed AS (
            SELECT user_id, user_seq_id, task_code FROM group_tasks
            UNION
            SELECT u.id, u.seq_id, unnest(u.tasks_allowed) FROM users u
        )
        SELECT DISTINCT 
            aa.user_id,
            aa.user_seq_id,
            aa.task_code
        FROM all_allowed aa
        LEFT JOIN users u ON u.id = aa.user_id
        WHERE aa.task_code <> ALL(u.tasks_denied);
    `)
    },
    async down({ db }) {
        //await db.execute('DROP TABLE IF EXISTS users;')
    },
}