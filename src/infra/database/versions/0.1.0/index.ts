import type { Migration } from '../../migrations/Migration'
import { createUsersTable20250101001 } from './TASK-0001__20250101001-create-users-table'
import { createUserGroupsTable20251125001 } from './TASK-0002__20251125001-create-user-groups-table'
import { addUserPasswordColumn20251125002 } from './TASK-0003__20251125002-add-user-password-column'

export const migrations: Migration[] = [
  addUserPasswordColumn20251125002,
]

