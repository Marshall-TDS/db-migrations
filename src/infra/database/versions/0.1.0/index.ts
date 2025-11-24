import type { Migration } from '../../migrations/Migration'
import { createUsersTable20250101001 } from './TASK-0001__20250101001-create-users-table'

export const migrations: Migration[] = [createUsersTable20250101001]

