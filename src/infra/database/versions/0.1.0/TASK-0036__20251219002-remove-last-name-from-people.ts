import type { Migration } from '../../migrations/Migration'

export const removeLastNameFromPeople20251219002: Migration = {
    id: '20251219002',
    name: 'remove-last-name-from-people',
    async up({ db }) {
        await db.execute(`
            ALTER TABLE public.people DROP COLUMN IF EXISTS last_name;
        `)
    },
    async down({ db }) {
        await db.execute(`
            ALTER TABLE public.people ADD COLUMN last_name VARCHAR(255);
        `)
    },
}
