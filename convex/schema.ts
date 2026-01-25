// convex/schema.ts

import { defineSchema } from "convex/server";
import { authTables } from "./schema/auth";
import { userTables } from "./schema/users";
import { projectTables } from "./schema/projects";
import { budgetTables } from "./schema/budgets";
import { inspectionTables } from "./schema/inspections";
import { mediaTables } from "./schema/media";
import { departmentTables } from "./schema/departments";
import { permissionTables } from "./schema/permissions";
import { auditTables } from "./schema/audit";
import { securityTables } from "./schema/security";
import { miscTables } from "./schema/misc";
import { accessRequestTables } from "./schema/accessRequests";
import { budgetSharedAccessTables } from "./schema/budgetSharedAccess";
import { passwordResetTables } from "./schema/passwordReset";
import { govtProjectBreakdownTables } from "./schema/govtProjectBreakdowns";
import { aggregationTables } from "./schema/aggregations";
import { govtProjectBreakdownActivityTables } from "./schema/govtProjectBreakdownActivities";
import { tableSettingsTables } from "./schema/tableSettings";
import { projectActivityTables } from "./schema/projectActivities";
import { budgetItemActivityTables } from "./schema/budgetItemActivities";
import { budgetParticularTables } from "./schema/budgetParticulars";
import { projectParticularTables } from "./schema/projectParticulars";
import { implementingAgencyTables } from "./schema/implementingAgencies";
import { projectCategoryTables } from "./schema/projectCategories"; // 🆕 ADDED
import { budgetParticularSharedAccessTables } from "./schema/budgetParticularSharedAccess";
import { fiscalYearTables } from "./schema/fiscalYears";
import { trustFundTables } from "./schema/trustFunds";
import { trustFundActivityTables } from "./schema/trustFundActivities";
import { trustFundSharedAccessTables } from "./schema/trustFundSharedAccess";
import { trustFundBreakdownTables } from "./schema/trustFundBreakdowns";
import { trustFundBreakdownActivityTables } from "./schema/trustFundBreakdownActivities";

export default defineSchema({
  ...authTables,
  ...userTables,
  ...projectTables,
  ...budgetTables,
  ...inspectionTables,
  ...mediaTables,
  ...departmentTables,
  ...permissionTables,
  ...auditTables,
  ...securityTables,
  ...accessRequestTables,
  ...budgetSharedAccessTables,
  ...passwordResetTables,
  ...miscTables,
  ...govtProjectBreakdownTables,
  ...aggregationTables,
  ...govtProjectBreakdownActivityTables,
  ...tableSettingsTables,
  ...projectActivityTables,
  ...budgetItemActivityTables,
  ...budgetParticularTables,
  ...projectParticularTables,
  ...implementingAgencyTables,
  ...projectCategoryTables,
  ...budgetParticularSharedAccessTables,
  ...fiscalYearTables,
  ...trustFundTables,
  ...trustFundActivityTables,
  ...trustFundSharedAccessTables,
  ...trustFundBreakdownTables,
  ...trustFundBreakdownActivityTables,
});