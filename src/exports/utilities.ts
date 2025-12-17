// Re-export utility functions for access control
export {
  hasAllPrivileges,
  hasAnyPrivilege,
  hasPrivilege,
  privilegesAccess,
} from '../utils/privilegesAccess.js'

// Re-export collection privilege utilities
export {
  allPrivilegesMap,
  generateCollectionPrivileges,
  generatePrivilegeKey,
  getAllPrivilegeKeys,
  getAllPrivileges,
} from '../utils/generatePrivileges.js'

// Re-export global privilege utilities
export {
  allGlobalPrivilegesMap,
  generateGlobalPrivilegeKey,
  generateGlobalPrivileges,
  getAllGlobalPrivilegeKeys,
  getAllGlobalPrivileges,
} from '../utils/generateGlobalPrivileges.js'
