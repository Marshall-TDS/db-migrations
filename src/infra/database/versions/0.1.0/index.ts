import type { Migration } from '../../migrations/Migration'
import { setupAuditLog20250101000 } from './TASK-0000__20250101000-setup-audit-log'
import { createUsersTable20250101001 } from './TASK-0001__20250101001-create-users-table'
import { createUserGroupsTable20251125001 } from './TASK-0002__20251125001-create-user-groups-table'
import { refactorAccessGroups20251126001 } from './TASK-0002__20251126001-rename-user-group'
import { addUserPasswordColumn20251125002 } from './TASK-0003__20251125002-add-user-password-column'
import { createRemetentesAndComunicacoesTables20250102001 } from './TASK-0004__20250102001-create-remetentes-and-comunicacoes-tables'
import { addAssuntoHtmlToComunicacoes20250102002 } from './TASK-0005__20250102002-add-assunto-html-to-comunicacoes'

import { createCustomerTables20251204001 } from './TASK-0021__20251204-create-customer-tables'
import { fixDocumentFileType20251209002 } from './TASK-0022__20251209-fix-document-file-type'
import { addDocumentMetadataColumns20251209003 } from './TASK-0023__20251209-add-doc-metadata'
import { updateAccessGroupMembershipsId20251210001 } from './TASK-0024__20251210001-access-group-memberships-id-update'
import { addSeqIdToUsers20251210002 } from './TASK-0025__20251210002-add-seq-id-to-users'
import { createProfitabilityModalityTable20251210003 } from './TASK-0026__20251210003-create-profitability-modality-table'

export const migrations: Migration[] = [
  setupAuditLog20250101000,
  createUsersTable20250101001,
  createUserGroupsTable20251125001,
  refactorAccessGroups20251126001,
  addUserPasswordColumn20251125002,
  createRemetentesAndComunicacoesTables20250102001,
  addAssuntoHtmlToComunicacoes20250102002,
  createCustomerTables20251204001,
  fixDocumentFileType20251209002,
  addDocumentMetadataColumns20251209003,
  updateAccessGroupMembershipsId20251210001,
  addSeqIdToUsers20251210002,
  createProfitabilityModalityTable20251210003,
]

