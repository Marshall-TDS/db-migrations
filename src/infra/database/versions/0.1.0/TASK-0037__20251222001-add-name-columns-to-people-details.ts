import type { Migration } from '../../migrations/Migration'

export const addNameColumnsToPeopleDetails20251222001: Migration = {
    id: '20251222001',
    name: 'add-name-columns-to-people-details',
    async up({ db }) {
        await db.execute(`
            ALTER TABLE public.people_details 
            ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS surname VARCHAR(255),
            ADD COLUMN IF NOT EXISTS legal_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS trade_name VARCHAR(255);
        `)
    },
    async down({ db }) {
        await db.execute(`
            ALTER TABLE public.people_details 
            DROP COLUMN IF EXISTS first_name,
            DROP COLUMN IF EXISTS surname,
            DROP COLUMN IF EXISTS legal_name,
            DROP COLUMN IF EXISTS trade_name;
        `)
    },
}
