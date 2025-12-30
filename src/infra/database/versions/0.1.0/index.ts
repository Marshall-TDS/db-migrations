import type { Migration } from "../../migrations/Migration";
import { setupAuditLog20250101000 } from "./TASK-0000__20250101000-setup-audit-log";
import { createUsersTable20250101001 } from "./TASK-0001__20250101001-create-users-table";
import { createUserGroupsTable20251125001 } from "./TASK-0002__20251125001-create-user-groups-table";
import { refactorAccessGroups20251126001 } from "./TASK-0002__20251126001-rename-user-group";
import { addUserPasswordColumn20251125002 } from "./TASK-0003__20251125002-add-user-password-column";
import { createRemetentesAndComunicacoesTables20250102001 } from "./TASK-0004__20250102001-create-remetentes-and-comunicacoes-tables";
import { addAssuntoHtmlToComunicacoes20250102002 } from "./TASK-0005__20250102002-add-assunto-html-to-comunicacoes";

import { createCustomerTables20251204001 } from "./TASK-0021__20251204-create-customer-tables";
import { fixDocumentFileType20251209002 } from "./TASK-0022__20251209-fix-document-file-type";
import { addDocumentMetadataColumns20251209003 } from "./TASK-0023__20251209-add-doc-metadata";
import { updateAccessGroupMembershipsId20251210001 } from "./TASK-0024__20251210001-access-group-memberships-id-update";
import { addSeqIdToUsers20251210002 } from "./TASK-0025__20251210002-add-seq-id-to-users";
import { createModalidadesRentabilidadeTable20250115001 } from "./TASK-0028__20250115001-create-modalidades-rentabilidade-table";
import { createCiclosAndUpdateModalidades20251215001 } from "./TASK-0029__20251215001-create-ciclos-and-update-modalidades";
import { alterFrequenciaPagamentoToInteger20250116001 } from "./TASK-0030__20250116001-alter-frequencia-pagamento-to-integer";
import { createCustomerDetailsTable20251215002 } from "./TASK-0031__20251215002-create-customer-details-table";
import { createParameterizationTable20250117001 } from "./TASK-0032__20250117001-create-parameterization-table";
import { addEditableToParameterization20250118001 } from "./TASK-0033__20250118001-add-editable-to-parameterization";
import { updateParameterizationScopeTypeConstraint20250119001 } from "./TASK-0034__20250119001-update-parameterization-scope-type-constraint";
import { refactorCustomerToPeople20251219001 } from "./TASK-0035__20251219001-refactor-customer-to-people";
import { removeLastNameFromPeople20251219002 } from "./TASK-0036__20251219002-remove-last-name-from-people";
import { addNameColumnsToPeopleDetails20251222001 } from "./TASK-0037__20251222001-add-name-columns-to-people-details";
import { createPeopleRelationshipTables20251222002 } from "./TASK-0038__20251222002-create-people-relationship-tables";
import { createContractsTemplatesTable20251224001 } from "./TASK-0039__20251224001-create-contracts-templates-table";
import { createContractsTables20250125001 } from "./TASK-0040__20250125001-create-contracts-tables";


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
  createModalidadesRentabilidadeTable20250115001,
  createCiclosAndUpdateModalidades20251215001,
  alterFrequenciaPagamentoToInteger20250116001,
  createCustomerDetailsTable20251215002,
  createParameterizationTable20250117001,
  addEditableToParameterization20250118001,
  updateParameterizationScopeTypeConstraint20250119001,
  refactorCustomerToPeople20251219001,
  removeLastNameFromPeople20251219002,
  addNameColumnsToPeopleDetails20251222001,
  createPeopleRelationshipTables20251222002,
  createContractsTemplatesTable20251224001,
  createContractsTables20250125001
];

