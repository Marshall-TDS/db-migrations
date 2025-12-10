import type { Migration } from '../../migrations/Migration'
import { createUsersTable20250101001 } from './TASK-0001__20250101001-create-users-table'
import { createUserGroupsTable20251125001 } from './TASK-0002__20251125001-create-user-groups-table'
import { addUserPasswordColumn20251125002 } from './TASK-0003__20251125002-add-user-password-column'
import { createRemetentesAndComunicacoesTables20250102001 } from './TASK-0004__20250102001-create-remetentes-and-comunicacoes-tables'
import { addAssuntoHtmlToComunicacoes20250102002 } from './TASK-0005__20250102002-add-assunto-html-to-comunicacoes'
import { refactorAccessGroups20251126001 } from './TASK-0002__20251126001-rename-user-group'

export const migrations: Migration[] = [
  createUsersTable20250101001,
  createRemetentesAndComunicacoesTables20250102001,
  addAssuntoHtmlToComunicacoes20250102002,
  createUserGroupsTable20251125001,
  addUserPasswordColumn20251125002,
  refactorAccessGroups20251126001,
]

