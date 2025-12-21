// Re-export roles collection creation helper
export {
  createRolesCollection,
  ensureSuperAdminDontGetDeleted,
  ensureSuperAdminDontGetUpdated,
} from '../collections/roles.js'

// Re-export first user super admin assignment utilities
export {
  assignSuperAdminToFirstUser,
  wrapUserCollectionWithSuperAdminHook,
} from '../utils/assignSuperAdminToFirstUser.js'

// Re-export custom privilege registration utilities
export {
  customPrivilegesRegistry,
  registerCustomPrivilege,
  registerCustomPrivileges,
  type CustomGlobalPrivilege,
  type CustomPrivilegeConfig,
} from '../utils/createCustomPrivilege.js'

// Re-export global privilege utilities
export {
  allGlobalPrivilegesMap,
  generateGlobalPrivilegeKey,
  generateGlobalPrivileges,
  getAllGlobalPrivilegeKeys,
  getAllGlobalPrivileges,
} from '../utils/generateGlobalPrivileges.js'

// Re-export collection privilege utilities
export {
  allPrivilegesMap,
  generateCollectionPrivileges,
  generatePrivilegeKey,
  getAllPrivilegeKeys,
  getAllPrivileges,
} from '../utils/generatePrivileges.js'

// Re-export utility functions for access control
export {
  checkAllPrivileges,
  checkAnyPrivilege,
  checkPrivilege,
  checkPrivileges,
  hasAllPrivileges,
  hasAnyPrivilege,
  hasPrivilege,
  privilegesAccess,
} from '../utils/privilegesAccess.js'

// Re-export seed super admin utility
export { seedSuperAdminRole } from '../utils/seedSuperAdminRole.js'
