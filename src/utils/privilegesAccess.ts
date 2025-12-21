import type { Access, AccessArgs } from 'payload'

/**
 * Internal configuration for the roles field name
 * @internal
 */
let rolesFieldName = 'roles'

/**
 * Set the roles field name to use when checking privileges
 * @param fieldName - The name of the roles field in the user collection
 * @internal
 */
export const setRolesFieldName = (fieldName: string): void => {
  rolesFieldName = fieldName
}

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

    if (user[rolesFieldName] && Array.isArray(user[rolesFieldName])) {
      for (const role of user[rolesFieldName]) {
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
 * Check if user has specific privileges based on their roles (synchronous version for field access)
 * @param privilegeArrays - Multiple arrays of privileges. Within each array is AND logic, between arrays is OR logic
 * @param user - The user object from req
 * @returns Boolean indicating if user has required privileges
 * @example
 * // User must have BOTH pages-create AND pages-read
 * checkPrivileges([['pages-create', 'pages-read']], req.user)
 *
 * // User must have EITHER pages-create OR posts-create
 * checkPrivileges([['pages-create'], ['posts-create']], req.user)
 *
 * // User must have (pages-create AND pages-read) OR (posts-create AND posts-read)
 * checkPrivileges([['pages-create', 'pages-read'], ['posts-create', 'posts-read']], req.user)
 */
export const checkPrivileges = (privilegeArrays: string[][], user: any): boolean => {
  if (!user) {
    return false
  }

  // Get all privileges from user's roles
  const userPrivileges = new Set<string>()

  if (user[rolesFieldName] && Array.isArray(user[rolesFieldName])) {
    for (const role of user[rolesFieldName]) {
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

/**
 * Check if user has a specific privilege (synchronous version for field access)
 * @param privilegeKey - The privilege key to check
 * @param user - The user object from req
 * @returns Boolean indicating if user has the privilege
 */
export const checkPrivilege = (privilegeKey: string, user: any): boolean => {
  return checkPrivileges([[privilegeKey]], user)
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

/**
 * Check if user has ANY of the privileges (OR logic, synchronous version for field access)
 * @param user - The user object from req
 * @param privilegeKeys - Array of privilege keys where ANY must match
 * @returns Boolean indicating if user has any of the required privileges
 */
export const checkAnyPrivilege = (user: any, ...privilegeKeys: string[]): boolean => {
  return checkPrivileges(
    privilegeKeys.map((key) => [key]),
    user,
  )
}

/**
 * Check if user has ALL of the privileges (AND logic, synchronous version for field access)
 * @param user - The user object from req
 * @param privilegeKeys - Array of privilege keys where ALL must match
 * @returns Boolean indicating if user has all of the required privileges
 */
export const checkAllPrivileges = (user: any, ...privilegeKeys: string[]): boolean => {
  return checkPrivileges([privilegeKeys], user)
}
