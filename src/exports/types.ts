// Re-export roles collection types
export type { CollectionData, GlobalData } from '../collections/roles.js'

// Re-export types for external use
export type {
  GlobalPrivilege,
  GlobalPrivileges,
  GlobalPrivilegeType,
} from '../utils/generateGlobalPrivileges.js'

export type { CollectionPrivileges, Privilege, PrivilegeType } from '../utils/generatePrivileges.js'
