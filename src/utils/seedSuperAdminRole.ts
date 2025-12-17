import type { Payload } from 'payload'
import { getAllGlobalPrivileges } from './generateGlobalPrivileges.js'
import { getAllPrivileges } from './generatePrivileges.js'

/**
 * Seeds or updates the Super Admin role with all available privileges
 * This ensures the Super Admin role always has access to all privileges in the system
 */
export const seedSuperAdminRole = async (payload: Payload): Promise<void> => {
  try {
    // Get all available privileges from collections and globals
    const collectionPrivileges = getAllPrivileges()
    const globalPrivileges = getAllGlobalPrivileges()

    const privilegesArray = [
      ...collectionPrivileges.map((privilege) => ({
        privilege: privilege.privilegeKey,
      })),
      ...globalPrivileges.map((privilege) => ({
        privilege: privilege.privilegeKey,
      })),
    ] // Check if Super Admin role exists
    const existingRole = await payload.find({
      collection: 'roles',
      where: {
        slug: {
          equals: 'super-admin',
        },
      },
      limit: 1,
    })

    if (existingRole.docs.length > 0) {
      // Update existing Super Admin role
      await payload.update({
        collection: 'roles',
        id: existingRole.docs[0].id,
        data: {
          title: 'Super Admin',
          slug: 'super-admin',
          privileges: privilegesArray,
          description: 'Super administrator with full system access and all privileges',
        },
      })
      payload.logger.info('✅ Super Admin role updated with all privileges')
    } else {
      // Create new Super Admin role
      await payload.create({
        collection: 'roles',
        data: {
          title: 'Super Admin',
          slug: 'super-admin',
          privileges: privilegesArray,
          description: 'Super administrator with full system access and all privileges',
        },
      })
      payload.logger.info('✅ Super Admin role created with all privileges')
    }
  } catch (error) {
    payload.logger.error('❌ Error seeding Super Admin role:', error)
  }
}
