import type { Migration } from '../../migrations/Migration'
export const refactorAccessGroups20251126001: Migration = {
  id: '20251126001',
  name: 'refactor-user-groups-to-access-groups',
  async up({ db }) {
    await db.execute(`
      ALTER TABLE user_groups RENAME TO access_groups;
      ALTER TABLE user_group_memberships RENAME TO access_group_memberships;
      
      ALTER SEQUENCE IF EXISTS user_groups_seq_id_seq RENAME TO access_groups_seq_id_seq;
      ALTER SEQUENCE IF EXISTS user_group_memberships_id_seq RENAME TO access_group_memberships_id_seq;
      ALTER TABLE access_group_memberships RENAME CONSTRAINT user_group_memberships_group_id_fkey TO access_group_memberships_group_id_fkey;
      ALTER TABLE access_group_memberships RENAME CONSTRAINT user_group_memberships_user_id_fkey TO access_group_memberships_user_id_fkey;
      ALTER TABLE access_group_memberships RENAME CONSTRAINT user_group_memberships_user_id_group_id_key TO access_group_memberships_user_id_group_id_key;
    `)
  },
  async down({ db }) {
    await db.execute(`
      ALTER TABLE access_group_memberships RENAME CONSTRAINT access_group_memberships_user_id_group_id_key TO user_group_memberships_user_id_group_id_key;
      ALTER TABLE access_group_memberships RENAME CONSTRAINT access_group_memberships_user_id_fkey TO user_group_memberships_user_id_fkey;
      ALTER TABLE access_group_memberships RENAME CONSTRAINT access_group_memberships_group_id_fkey TO user_group_memberships_group_id_fkey;
      ALTER SEQUENCE IF EXISTS access_group_memberships_id_seq RENAME TO user_group_memberships_id_seq;
      ALTER SEQUENCE IF EXISTS access_groups_seq_id_seq RENAME TO user_groups_seq_id_seq;
      ALTER TABLE access_group_memberships RENAME TO user_group_memberships;
      ALTER TABLE access_groups RENAME TO user_groups;
    `)
  },
}