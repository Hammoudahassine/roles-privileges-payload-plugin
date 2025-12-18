import type { Access, AccessArgs } from 'payload'

/**
 * Check if user has specific privileges based on their roles
 * @param privilegeArrays - Multiple arrays of privileges. Within each array is AND logic, between arrays is OR logic
 * @returns Access function that checks if user has required privileges
 * @example
 * // User must have BOTH pages-create AND pages-read
 * privilegesAccess([['pages-create', 'pages-read']])
 *
 * // User must have EITHER pages-create OR posts-create
 * privilegesAccess([['pages-create'], ['posts-create']])
 *
 * // User must have (pages-create AND pages-read) OR (posts-create AND posts-read)
 * privilegesAccess([['pages-create', 'pages-read'], ['posts-create', 'posts-read']])
 */
export const privilegesAccess = (privilegeArrays: string[][]): Access => {
  return ({ req: { user } }: AccessArgs) => {
    if (!user) {
      return false
    }

    // Get all privileges from user's roles
    const userPrivileges = new Set<string>()

    if (user.roles && Array.isArray(user.roles)) {
      for (const role of user.roles) {
        if (typeof role === 'object' && role !== null && 'privileges' in role) {
          const rolePrivileges = role.privileges
          if (Array.isArray(rolePrivileges)) {
            for (const priv of rolePrivileges) {
              if (typeof priv === 'object' && priv !== null && 'privilege' in priv) {
                userPrivileges.add(priv.privilege as string)
              }
            }
          }
        }
      }
    }

    // Check if user satisfies any of the privilege arrays (OR logic between arrays)
    return privilegeArrays.some((privilegeArray) => {
      // Check if user has all privileges in this array (AND logic within array)
      return privilegeArray.every((privilege) => userPrivileges.has(privilege))
    })
  }
}

/**
 * Check if user has a specific privilege (synchronous version for field access)
 * @param privilegeKey - The privilege key to check
 * @param user - The user object from req
 * @returns Boolean indicating if user has the privilege
 */
export const checkPrivilege = (privilegeKey: string, user: any): boolean => {
  if (!user) {
    return false
  }

  // Get all privileges from user's roles
  const userPrivileges = new Set<string>()

  if (user.roles && Array.isArray(user.roles)) {
    for (const role of user.roles) {
      if (typeof role === 'object' && role !== null && 'privileges' in role) {
        const rolePrivileges = role.privileges
        if (Array.isArray(rolePrivileges)) {
          for (const priv of rolePrivileges) {
            if (typeof priv === 'object' && priv !== null && 'privilege' in priv) {
              userPrivileges.add(priv.privilege as string)
            }
          }
        }
      }
    }
  }

  return userPrivileges.has(privilegeKey)
}

/**
 * Create a simple single-privilege check access function
 * @param privilegeKey - The privilege key to check
 * @returns Access function that checks if user has the required privilege
 */
export const hasPrivilege = (privilegeKey: string): Access => {
  return privilegesAccess([[privilegeKey]])
}

/**
 * Combine privileges access with OR logic (user needs ANY of the privileges)
 * @param privilegeKeys - Array of privilege keys where ANY must match
 * @returns Access function that checks if user has any of the required privileges
 */
export const hasAnyPrivilege = (...privilegeKeys: string[]): Access => {
  return privilegesAccess(privilegeKeys.map((key) => [key]))
}

/**
 * Combine privileges access with AND logic (user needs ALL of the privileges)
 * @param privilegeKeys - Array of privilege keys where ALL must match
 * @returns Access function that checks if user has all of the required privileges
 */
export const hasAllPrivileges = (...privilegeKeys: string[]): Access => {
  return privilegesAccess([privilegeKeys])
}
