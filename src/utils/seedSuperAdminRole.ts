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
      limit: 1,
      where: {
        slug: {
          equals: 'super-admin',
        },
      },
    })

    if (existingRole.docs.length > 0) {
      // Update existing Super Admin role
      await payload.update({
        id: existingRole.docs[0].id,
        collection: 'roles',
        data: {
          slug: 'super-admin',
          description: 'Super administrator with full system access and all privileges',
          privileges: privilegesArray,
          title: 'Super Admin',
        },
      })
      payload.logger.info('✅ Super Admin role updated with all privileges')
    } else {
      // Create new Super Admin role
      await payload.create({
        collection: 'roles',
        data: {
          slug: 'super-admin',
          description: 'Super administrator with full system access and all privileges',
          privileges: privilegesArray,
          title: 'Super Admin',
        },
      })
      payload.logger.info('✅ Super Admin role created with all privileges')
    }
  } catch (error) {
    payload.logger.error('❌ Error seeding Super Admin role:', error)
  }
}
