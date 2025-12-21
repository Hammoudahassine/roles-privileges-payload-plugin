import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'

/**
 * Create a hook to assign the Super Admin role to the first user created in the system
 * This ensures that the initial user has full access to configure the system
 */
export const createAssignSuperAdminToFirstUserHook =
  (rolesFieldName: string = 'roles'): CollectionAfterChangeHook =>
  async ({ collection, doc, operation, req }) => {
    // Only process on user creation
    if (operation !== 'create') {
      return doc
    }

    try {
      // Check if this is the first user in the system
      const users = await req.payload.find({
        collection: collection.slug,
        limit: 2, // We only need to know if there are 1 or 2+ users
      })

      // If this is the first user (only 1 user exists), assign super admin role
      if (users.totalDocs === 1) {
        // Find the Super Admin role
        const superAdminRole = await req.payload.find({
          collection: 'roles',
          limit: 1,
          where: {
            slug: {
              equals: 'super-admin',
            },
          },
        })

        if (superAdminRole.docs.length > 0) {
          const roleId = superAdminRole.docs[0].id

          // Update the user with the Super Admin role
          const updatedUser = await req.payload.update({
            id: doc.id,
            collection: collection.slug,
            data: {
              ...doc,
              [rolesFieldName]: [roleId],
            },
          })

          req.payload.logger.info(
            `✅ First user created - Super Admin role assigned to user: ${updatedUser.id}`,
          )

          return updatedUser
        } else {
          req.payload.logger.warn(
            '⚠️ Super Admin role not found. First user created without role assignment.',
          )
        }
      }
    } catch (error) {
      req.payload.logger.error('❌ Error assigning Super Admin role to first user:', error)
    }

    return doc
  }

/**
 * Wrap a user collection config to add the first user super admin assignment hook
 */
export const wrapUserCollectionWithSuperAdminHook = (
  collection: CollectionConfig,
  rolesFieldName: string = 'roles',
): CollectionConfig => {
  const existingAfterChange = collection.hooks?.afterChange || []
  const afterChangeArray = Array.isArray(existingAfterChange)
    ? existingAfterChange
    : [existingAfterChange]

  return {
    ...collection,
    hooks: {
      ...collection.hooks,
      afterChange: [...afterChangeArray, createAssignSuperAdminToFirstUserHook(rolesFieldName)],
    },
  }
}
