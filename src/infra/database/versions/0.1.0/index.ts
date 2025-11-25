import type { Migration } from '../../migrations/Migration'
import { createUsersTable20250101001 } from './TASK-0001__20250101001-create-users-table'
import { createUserGroupsTable20251125001 } from './TASK-0002__20251125001-create-user-groups-table'

export const migrations: Migration[] = [
  createUsersTable20250101001,
  createUserGroupsTable20251125001,
]

