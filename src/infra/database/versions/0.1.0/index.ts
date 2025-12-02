import type { Migration } from '../../migrations/Migration'
import { createUsersTable20250101001 } from './TASK-0001__20250101001-create-users-table'
import { createUserGroupsTable20251125001 } from './TASK-0002__20251125001-create-user-groups-table'
import { addUserPasswordColumn20251125002 } from './TASK-0003__20251125002-add-user-password-column'
import { createRemetentesAndComunicacoesTables20250102001 } from './TASK-0004__20250102001-create-remetentes-and-comunicacoes-tables'
import { addAssuntoHtmlToComunicacoes20250102002 } from './TASK-0005__20250102002-add-assunto-html-to-comunicacoes'

import { ajusteSeqId20251202001 } from './TASK-0006__20251202-ajuste-seq_id'
import { createSystemAuditLog20251202002 } from './TASK-0007__20251202-create-system-audit-log'

export const migrations: Migration[] = [
  createRemetentesAndComunicacoesTables20250102001,
  addAssuntoHtmlToComunicacoes20250102002,
  ajusteSeqId20251202001,
  createSystemAuditLog20251202002,
]

