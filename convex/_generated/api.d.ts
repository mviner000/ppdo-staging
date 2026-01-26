/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accessRequests from "../accessRequests.js";
import type * as auth from "../auth.js";
import type * as blockedManagement from "../blockedManagement.js";
import type * as budgetAccess from "../budgetAccess.js";
import type * as budgetItemActivities from "../budgetItemActivities.js";
import type * as budgetItems from "../budgetItems.js";
import type * as budgetParticularAccess from "../budgetParticularAccess.js";
import type * as budgetParticulars from "../budgetParticulars.js";
import type * as budgetSharedAccess from "../budgetSharedAccess.js";
import type * as config from "../config.js";
import type * as config_onboardingConfig from "../config/onboardingConfig.js";
import type * as departments from "../departments.js";
import type * as fiscalYears from "../fiscalYears.js";
import type * as govtProjectActivities from "../govtProjectActivities.js";
import type * as govtProjects from "../govtProjects.js";
import type * as http from "../http.js";
import type * as implementingAgencies from "../implementingAgencies.js";
import type * as init_clearSeededData from "../init/clearSeededData.js";
import type * as init_seedBudgetParticulars from "../init/seedBudgetParticulars.js";
import type * as init_seedMockData from "../init/seedMockData.js";
import type * as init_seedProjectCategories from "../init/seedProjectCategories.js";
import type * as init_seedProjectParticulars from "../init/seedProjectParticulars.js";
import type * as inspections from "../inspections.js";
import type * as lib_aggregationUtils from "../lib/aggregationUtils.js";
import type * as lib_apiResponse from "../lib/apiResponse.js";
import type * as lib_breakdownBase from "../lib/breakdownBase.js";
import type * as lib_budgetActivityLogger from "../lib/budgetActivityLogger.js";
import type * as lib_budgetAggregation from "../lib/budgetAggregation.js";
import type * as lib_categoryActivityLogger from "../lib/categoryActivityLogger.js";
import type * as lib_checkBudgetAccess from "../lib/checkBudgetAccess.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_govtProjectActivityLogger from "../lib/govtProjectActivityLogger.js";
import type * as lib_nameUtils from "../lib/nameUtils.js";
import type * as lib_particularActivityLogger from "../lib/particularActivityLogger.js";
import type * as lib_projectActivityLogger from "../lib/projectActivityLogger.js";
import type * as lib_projectAggregation from "../lib/projectAggregation.js";
import type * as lib_rbac from "../lib/rbac.js";
import type * as lib_specialEducationFundActivityLogger from "../lib/specialEducationFundActivityLogger.js";
import type * as lib_specialEducationFundBreakdownActivityLogger from "../lib/specialEducationFundBreakdownActivityLogger.js";
import type * as lib_specialHealthFundActivityLogger from "../lib/specialHealthFundActivityLogger.js";
import type * as lib_specialHealthFundBreakdownActivityLogger from "../lib/specialHealthFundBreakdownActivityLogger.js";
import type * as lib_statusValidation from "../lib/statusValidation.js";
import type * as lib_trustFundActivityLogger from "../lib/trustFundActivityLogger.js";
import type * as lib_trustFundBreakdownActivityLogger from "../lib/trustFundBreakdownActivityLogger.js";
import type * as loginTrail from "../loginTrail.js";
import type * as media from "../media.js";
import type * as myFunctions from "../myFunctions.js";
import type * as obligations from "../obligations.js";
import type * as passwordReset from "../passwordReset.js";
import type * as passwordResetManagement from "../passwordResetManagement.js";
import type * as permissions from "../permissions.js";
import type * as projectActivities from "../projectActivities.js";
import type * as projectCategories from "../projectCategories.js";
import type * as projectParticulars from "../projectParticulars.js";
import type * as projects from "../projects.js";
import type * as remarks from "../remarks.js";
import type * as schema_accessRequests from "../schema/accessRequests.js";
import type * as schema_aggregations from "../schema/aggregations.js";
import type * as schema_audit from "../schema/audit.js";
import type * as schema_auth from "../schema/auth.js";
import type * as schema_budgetItemActivities from "../schema/budgetItemActivities.js";
import type * as schema_budgetParticularSharedAccess from "../schema/budgetParticularSharedAccess.js";
import type * as schema_budgetParticulars from "../schema/budgetParticulars.js";
import type * as schema_budgetSharedAccess from "../schema/budgetSharedAccess.js";
import type * as schema_budgets from "../schema/budgets.js";
import type * as schema_departments from "../schema/departments.js";
import type * as schema_fiscalYears from "../schema/fiscalYears.js";
import type * as schema_govtProjectBreakdownActivities from "../schema/govtProjectBreakdownActivities.js";
import type * as schema_govtProjectBreakdowns from "../schema/govtProjectBreakdowns.js";
import type * as schema_implementingAgencies from "../schema/implementingAgencies.js";
import type * as schema_inspections from "../schema/inspections.js";
import type * as schema_media from "../schema/media.js";
import type * as schema_misc from "../schema/misc.js";
import type * as schema_passwordReset from "../schema/passwordReset.js";
import type * as schema_permissions from "../schema/permissions.js";
import type * as schema_projectActivities from "../schema/projectActivities.js";
import type * as schema_projectCategories from "../schema/projectCategories.js";
import type * as schema_projectParticulars from "../schema/projectParticulars.js";
import type * as schema_projects from "../schema/projects.js";
import type * as schema_security from "../schema/security.js";
import type * as schema_shared_baseBreakdown from "../schema/shared/baseBreakdown.js";
import type * as schema_specialEducationFundActivities from "../schema/specialEducationFundActivities.js";
import type * as schema_specialEducationFundBreakdownActivities from "../schema/specialEducationFundBreakdownActivities.js";
import type * as schema_specialEducationFundBreakdowns from "../schema/specialEducationFundBreakdowns.js";
import type * as schema_specialEducationFundSharedAccess from "../schema/specialEducationFundSharedAccess.js";
import type * as schema_specialEducationFunds from "../schema/specialEducationFunds.js";
import type * as schema_specialHealthFundActivities from "../schema/specialHealthFundActivities.js";
import type * as schema_specialHealthFundBreakdownActivities from "../schema/specialHealthFundBreakdownActivities.js";
import type * as schema_specialHealthFundBreakdowns from "../schema/specialHealthFundBreakdowns.js";
import type * as schema_specialHealthFunds from "../schema/specialHealthFunds.js";
import type * as schema_tableSettings from "../schema/tableSettings.js";
import type * as schema_trustFundActivities from "../schema/trustFundActivities.js";
import type * as schema_trustFundBreakdownActivities from "../schema/trustFundBreakdownActivities.js";
import type * as schema_trustFundBreakdowns from "../schema/trustFundBreakdowns.js";
import type * as schema_trustFundSharedAccess from "../schema/trustFundSharedAccess.js";
import type * as schema_trustFunds from "../schema/trustFunds.js";
import type * as schema_users from "../schema/users.js";
import type * as specialEducationFundAccess from "../specialEducationFundAccess.js";
import type * as specialEducationFundActivities from "../specialEducationFundActivities.js";
import type * as specialEducationFundBreakdowns from "../specialEducationFundBreakdowns.js";
import type * as specialEducationFundSharedAccess from "../specialEducationFundSharedAccess.js";
import type * as specialEducationFunds from "../specialEducationFunds.js";
import type * as specialHealthFundBreakdowns from "../specialHealthFundBreakdowns.js";
import type * as specialHealthFunds from "../specialHealthFunds.js";
import type * as tableSettings from "../tableSettings.js";
import type * as trustFundAccess from "../trustFundAccess.js";
import type * as trustFundActivities from "../trustFundActivities.js";
import type * as trustFundBreakdowns from "../trustFundBreakdowns.js";
import type * as trustFundSharedAccess from "../trustFundSharedAccess.js";
import type * as trustFunds from "../trustFunds.js";
import type * as userManagement from "../userManagement.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accessRequests: typeof accessRequests;
  auth: typeof auth;
  blockedManagement: typeof blockedManagement;
  budgetAccess: typeof budgetAccess;
  budgetItemActivities: typeof budgetItemActivities;
  budgetItems: typeof budgetItems;
  budgetParticularAccess: typeof budgetParticularAccess;
  budgetParticulars: typeof budgetParticulars;
  budgetSharedAccess: typeof budgetSharedAccess;
  config: typeof config;
  "config/onboardingConfig": typeof config_onboardingConfig;
  departments: typeof departments;
  fiscalYears: typeof fiscalYears;
  govtProjectActivities: typeof govtProjectActivities;
  govtProjects: typeof govtProjects;
  http: typeof http;
  implementingAgencies: typeof implementingAgencies;
  "init/clearSeededData": typeof init_clearSeededData;
  "init/seedBudgetParticulars": typeof init_seedBudgetParticulars;
  "init/seedMockData": typeof init_seedMockData;
  "init/seedProjectCategories": typeof init_seedProjectCategories;
  "init/seedProjectParticulars": typeof init_seedProjectParticulars;
  inspections: typeof inspections;
  "lib/aggregationUtils": typeof lib_aggregationUtils;
  "lib/apiResponse": typeof lib_apiResponse;
  "lib/breakdownBase": typeof lib_breakdownBase;
  "lib/budgetActivityLogger": typeof lib_budgetActivityLogger;
  "lib/budgetAggregation": typeof lib_budgetAggregation;
  "lib/categoryActivityLogger": typeof lib_categoryActivityLogger;
  "lib/checkBudgetAccess": typeof lib_checkBudgetAccess;
  "lib/errors": typeof lib_errors;
  "lib/govtProjectActivityLogger": typeof lib_govtProjectActivityLogger;
  "lib/nameUtils": typeof lib_nameUtils;
  "lib/particularActivityLogger": typeof lib_particularActivityLogger;
  "lib/projectActivityLogger": typeof lib_projectActivityLogger;
  "lib/projectAggregation": typeof lib_projectAggregation;
  "lib/rbac": typeof lib_rbac;
  "lib/specialEducationFundActivityLogger": typeof lib_specialEducationFundActivityLogger;
  "lib/specialEducationFundBreakdownActivityLogger": typeof lib_specialEducationFundBreakdownActivityLogger;
  "lib/specialHealthFundActivityLogger": typeof lib_specialHealthFundActivityLogger;
  "lib/specialHealthFundBreakdownActivityLogger": typeof lib_specialHealthFundBreakdownActivityLogger;
  "lib/statusValidation": typeof lib_statusValidation;
  "lib/trustFundActivityLogger": typeof lib_trustFundActivityLogger;
  "lib/trustFundBreakdownActivityLogger": typeof lib_trustFundBreakdownActivityLogger;
  loginTrail: typeof loginTrail;
  media: typeof media;
  myFunctions: typeof myFunctions;
  obligations: typeof obligations;
  passwordReset: typeof passwordReset;
  passwordResetManagement: typeof passwordResetManagement;
  permissions: typeof permissions;
  projectActivities: typeof projectActivities;
  projectCategories: typeof projectCategories;
  projectParticulars: typeof projectParticulars;
  projects: typeof projects;
  remarks: typeof remarks;
  "schema/accessRequests": typeof schema_accessRequests;
  "schema/aggregations": typeof schema_aggregations;
  "schema/audit": typeof schema_audit;
  "schema/auth": typeof schema_auth;
  "schema/budgetItemActivities": typeof schema_budgetItemActivities;
  "schema/budgetParticularSharedAccess": typeof schema_budgetParticularSharedAccess;
  "schema/budgetParticulars": typeof schema_budgetParticulars;
  "schema/budgetSharedAccess": typeof schema_budgetSharedAccess;
  "schema/budgets": typeof schema_budgets;
  "schema/departments": typeof schema_departments;
  "schema/fiscalYears": typeof schema_fiscalYears;
  "schema/govtProjectBreakdownActivities": typeof schema_govtProjectBreakdownActivities;
  "schema/govtProjectBreakdowns": typeof schema_govtProjectBreakdowns;
  "schema/implementingAgencies": typeof schema_implementingAgencies;
  "schema/inspections": typeof schema_inspections;
  "schema/media": typeof schema_media;
  "schema/misc": typeof schema_misc;
  "schema/passwordReset": typeof schema_passwordReset;
  "schema/permissions": typeof schema_permissions;
  "schema/projectActivities": typeof schema_projectActivities;
  "schema/projectCategories": typeof schema_projectCategories;
  "schema/projectParticulars": typeof schema_projectParticulars;
  "schema/projects": typeof schema_projects;
  "schema/security": typeof schema_security;
  "schema/shared/baseBreakdown": typeof schema_shared_baseBreakdown;
  "schema/specialEducationFundActivities": typeof schema_specialEducationFundActivities;
  "schema/specialEducationFundBreakdownActivities": typeof schema_specialEducationFundBreakdownActivities;
  "schema/specialEducationFundBreakdowns": typeof schema_specialEducationFundBreakdowns;
  "schema/specialEducationFundSharedAccess": typeof schema_specialEducationFundSharedAccess;
  "schema/specialEducationFunds": typeof schema_specialEducationFunds;
  "schema/specialHealthFundActivities": typeof schema_specialHealthFundActivities;
  "schema/specialHealthFundBreakdownActivities": typeof schema_specialHealthFundBreakdownActivities;
  "schema/specialHealthFundBreakdowns": typeof schema_specialHealthFundBreakdowns;
  "schema/specialHealthFunds": typeof schema_specialHealthFunds;
  "schema/tableSettings": typeof schema_tableSettings;
  "schema/trustFundActivities": typeof schema_trustFundActivities;
  "schema/trustFundBreakdownActivities": typeof schema_trustFundBreakdownActivities;
  "schema/trustFundBreakdowns": typeof schema_trustFundBreakdowns;
  "schema/trustFundSharedAccess": typeof schema_trustFundSharedAccess;
  "schema/trustFunds": typeof schema_trustFunds;
  "schema/users": typeof schema_users;
  specialEducationFundAccess: typeof specialEducationFundAccess;
  specialEducationFundActivities: typeof specialEducationFundActivities;
  specialEducationFundBreakdowns: typeof specialEducationFundBreakdowns;
  specialEducationFundSharedAccess: typeof specialEducationFundSharedAccess;
  specialEducationFunds: typeof specialEducationFunds;
  specialHealthFundBreakdowns: typeof specialHealthFundBreakdowns;
  specialHealthFunds: typeof specialHealthFunds;
  tableSettings: typeof tableSettings;
  trustFundAccess: typeof trustFundAccess;
  trustFundActivities: typeof trustFundActivities;
  trustFundBreakdowns: typeof trustFundBreakdowns;
  trustFundSharedAccess: typeof trustFundSharedAccess;
  trustFunds: typeof trustFunds;
  userManagement: typeof userManagement;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
