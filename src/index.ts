import type { Config } from 'payload'
import { createRolesCollection } from './collections/roles.js'
import {
  generateGlobalPrivilegeKey,
  generateGlobalPrivileges,
} from './utils/generateGlobalPrivileges.js'
import { generateCollectionPrivileges, generatePrivilegeKey } from './utils/generatePrivileges.js'
import { hasPrivilege } from './utils/privilegesAccess.js'
import { seedSuperAdminRole } from './utils/seedSuperAdminRole.js'

export type RolesPrivilegesPayloadPluginConfig = {
  /**
   * Disable the plugin (roles collection will still be added to maintain schema consistency)
   */
  disabled?: boolean
  /**
   * Collections to exclude from automatic privilege generation
   */
  excludeCollections?: string[]
  /**
   * Globals to exclude from automatic privilege generation
   */
  excludeGlobals?: string[]
  /**
   * Whether to automatically wrap collection access controls with privilege checks
   * @default true
   */
  wrapCollectionAccess?: boolean
  /**
   * Whether to automatically wrap global access controls with privilege checks
   * @default true
   */
  wrapGlobalAccess?: boolean
  /**
   * Whether to seed a Super Admin role with all privileges on init
   * @default true
   */
  seedSuperAdmin?: boolean
}

// Re-export utilities and types from organized export files
export * from './exports/types.js'
export * from './exports/utilities.js'

export const rolesPrivilegesPayloadPlugin =
  (pluginOptions: RolesPrivilegesPayloadPluginConfig = {}) =>
  (config: Config): Config => {
    const {
      excludeCollections = [],
      excludeGlobals = [],
      wrapCollectionAccess = true,
      wrapGlobalAccess = true,
      seedSuperAdmin = true,
    } = pluginOptions

    if (!config.collections) {
      config.collections = []
    }

    if (!config.globals) {
      config.globals = []
    }

    // Step 1: Generate privileges for all existing collections (except excluded ones)
    for (const collection of config.collections) {
      if (!excludeCollections.includes(collection.slug) && collection.slug !== 'roles') {
        generateCollectionPrivileges(collection)
      }
    }

    // Step 2: Generate privileges for all existing globals (except excluded ones)
    for (const global of config.globals) {
      if (!excludeGlobals.includes(global.slug)) {
        generateGlobalPrivileges(global)
      }
    }

    // Step 3: Add the roles collection
    config.collections.push(createRolesCollection())

    // Step 4: Generate privileges for the roles collection itself
    const rolesCollection = config.collections.find((c) => c.slug === 'roles')
    if (rolesCollection) {
      generateCollectionPrivileges(rolesCollection)
    }

    /**
     * If the plugin is disabled, we still want to keep the roles collection
     * so the database schema is consistent which is important for migrations.
     */
    if (pluginOptions.disabled) {
      return config
    }

    // Step 5: Wrap collection access controls with privilege checks
    if (wrapCollectionAccess) {
      for (const collection of config.collections) {
        // Skip excluded collections and the roles collection (already has access controls)
        if (excludeCollections.includes(collection.slug) || collection.slug === 'roles') {
          continue
        }

        // Initialize access object if it doesn't exist
        if (!collection.access) {
          collection.access = {}
        }

        // Store original access functions
        const originalAccess = { ...collection.access }

        // Wrap create access
        const createPrivilegeKey = generatePrivilegeKey(collection.slug, 'create')
        if (originalAccess.create) {
          const originalCreate = originalAccess.create
          collection.access.create = async (args) => {
            const hasOriginalAccess =
              typeof originalCreate === 'function' ? await originalCreate(args) : originalCreate
            if (!hasOriginalAccess) return false
            return hasPrivilege(createPrivilegeKey)(args)
          }
        } else {
          collection.access.create = hasPrivilege(createPrivilegeKey)
        }

        // Wrap read access
        const readPrivilegeKey = generatePrivilegeKey(collection.slug, 'read')
        if (originalAccess.read) {
          const originalRead = originalAccess.read
          collection.access.read = async (args) => {
            const hasOriginalAccess =
              typeof originalRead === 'function' ? await originalRead(args) : originalRead
            if (!hasOriginalAccess) return false
            return hasPrivilege(readPrivilegeKey)(args)
          }
        } else {
          collection.access.read = hasPrivilege(readPrivilegeKey)
        }

        // Wrap update access
        const updatePrivilegeKey = generatePrivilegeKey(collection.slug, 'update')
        if (originalAccess.update) {
          const originalUpdate = originalAccess.update
          collection.access.update = async (args) => {
            const hasOriginalAccess =
              typeof originalUpdate === 'function' ? await originalUpdate(args) : originalUpdate
            if (!hasOriginalAccess) return false
            return hasPrivilege(updatePrivilegeKey)(args)
          }
        } else {
          collection.access.update = hasPrivilege(updatePrivilegeKey)
        }

        // Wrap delete access
        const deletePrivilegeKey = generatePrivilegeKey(collection.slug, 'delete')
        if (originalAccess.delete) {
          const originalDelete = originalAccess.delete
          collection.access.delete = async (args) => {
            const hasOriginalAccess =
              typeof originalDelete === 'function' ? await originalDelete(args) : originalDelete
            if (!hasOriginalAccess) return false
            return hasPrivilege(deletePrivilegeKey)(args)
          }
        } else {
          collection.access.delete = hasPrivilege(deletePrivilegeKey)
        }
      }
    }

    // Step 6: Wrap global access controls with privilege checks
    if (wrapGlobalAccess) {
      for (const global of config.globals) {
        // Skip excluded globals
        if (excludeGlobals.includes(global.slug)) {
          continue
        }

        // Initialize access object if it doesn't exist
        if (!global.access) {
          global.access = {}
        }

        // Store original access functions
        const originalAccess = { ...global.access }

        // Wrap read access
        const readPrivilegeKey = generateGlobalPrivilegeKey(global.slug, 'read')
        if (originalAccess.read) {
          const originalRead = originalAccess.read
          global.access.read = async (args) => {
            const hasOriginalAccess =
              typeof originalRead === 'function' ? await originalRead(args) : originalRead
            if (!hasOriginalAccess) return false
            return hasPrivilege(readPrivilegeKey)(args)
          }
        } else {
          global.access.read = hasPrivilege(readPrivilegeKey)
        }

        // Wrap update access
        const updatePrivilegeKey = generateGlobalPrivilegeKey(global.slug, 'update')
        if (originalAccess.update) {
          const originalUpdate = originalAccess.update
          global.access.update = async (args) => {
            const hasOriginalAccess =
              typeof originalUpdate === 'function' ? await originalUpdate(args) : originalUpdate
            if (!hasOriginalAccess) return false
            return hasPrivilege(updatePrivilegeKey)(args)
          }
        } else {
          global.access.update = hasPrivilege(updatePrivilegeKey)
        }
      }
    }

    // Step 7: Set up onInit to seed Super Admin role
    if (seedSuperAdmin) {
      const incomingOnInit = config.onInit

      config.onInit = async (payload) => {
        // Ensure we are executing any existing onInit functions before running our own.
        if (incomingOnInit) {
          await incomingOnInit(payload)
        }

        // Seed or update the Super Admin role with all privileges
        await seedSuperAdminRole(payload)
      }
    }

    return config
  }
