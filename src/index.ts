import type { AcceptedLanguages } from '@payloadcms/translations'
import type { Config } from 'payload'
import { createRolesCollection } from './collections/roles.js'
import { translations } from './translations/index.js'
import type { PluginDefaultTranslationsObject } from './translations/types.js'
import {
  allGlobalPrivilegesMap,
  generateGlobalPrivilegeKey,
  generateGlobalPrivileges,
} from './utils/generateGlobalPrivileges.js'
import {
  allPrivilegesMap,
  generateCollectionPrivileges,
  generatePrivilegeKey,
} from './utils/generatePrivileges.js'
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

    // Step 3: Add the roles collection first (without privileges data yet)
    config.collections.push(createRolesCollection([], []))

    // Step 4: Generate privileges for the roles collection itself
    const rolesCollection = config.collections.find((c) => c.slug === 'roles')
    if (rolesCollection) {
      generateCollectionPrivileges(rolesCollection)
    }

    // Step 5: Extract ALL collections and globals data with privileges for the UI (including roles)
    // const collectionsData = Array.from(allPrivilegesMap.values()).map((collectionPrivileges) => ({
    //   collectionSlug: collectionPrivileges.collectionSlug,
    //   collectionLabel: collectionPrivileges.collectionLabel,
    //   privileges: collectionPrivileges.privileges,
    // }))

    // const globalsData = Array.from(allGlobalPrivilegesMap.values()).map((globalPrivileges) => ({
    //   globalSlug: globalPrivileges.globalSlug,
    //   globalLabel: globalPrivileges.globalLabel,
    //   privileges: globalPrivileges.privileges,
    // }))

    // Step 6: Update the roles collection with a function that returns all privilege data
    // This ensures we get ALL collections, including those added by plugins after this one
    if (rolesCollection) {
      const privilegesField = rolesCollection.fields.find(
        (field) => 'name' in field && field.name === 'privileges',
      )
      if (
        privilegesField &&
        'admin' in privilegesField &&
        privilegesField.admin?.components?.Field
      ) {
        const fieldComponent = privilegesField.admin.components.Field
        if (typeof fieldComponent === 'object' && 'clientProps' in fieldComponent) {
          // Use a getter function that will be evaluated when the component renders
          // This ensures we get the most up-to-date list of all collections/globals
          fieldComponent.clientProps = {
            get collections() {
              return Array.from(allPrivilegesMap.values()).map((collectionPrivileges) => ({
                collectionSlug: collectionPrivileges.collectionSlug,
                collectionLabel: collectionPrivileges.collectionLabel,
                privileges: collectionPrivileges.privileges,
              }))
            },
            get globals() {
              return Array.from(allGlobalPrivilegesMap.values()).map((globalPrivileges) => ({
                globalSlug: globalPrivileges.globalSlug,
                globalLabel: globalPrivileges.globalLabel,
                privileges: globalPrivileges.privileges,
              }))
            },
          }
        }
      }
    }

    /**
     * If the plugin is disabled, we still want to keep the roles collection
     * so the database schema is consistent which is important for migrations.
     */
    if (pluginOptions.disabled) {
      return config
    }

    // Step 7: Wrap collection access controls with privilege checks
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

        // Wrap admin access
        const adminPrivilegeKey = generatePrivilegeKey(collection.slug, 'admin')
        if (originalAccess.admin) {
          const originalAdmin = originalAccess.admin
          collection.access.admin = async (args): Promise<boolean> => {
            const hasOriginalAccess =
              typeof originalAdmin === 'function' ? await originalAdmin(args) : originalAdmin
            if (!hasOriginalAccess) return false
            const result = await hasPrivilege(adminPrivilegeKey)(args)
            return result === true
          }
        } else {
          collection.access.admin = async (args): Promise<boolean> => {
            const result = await hasPrivilege(adminPrivilegeKey)(args)
            return result === true
          }
        }

        // Wrap readVersions access
        const readVersionsPrivilegeKey = generatePrivilegeKey(collection.slug, 'readVersions')
        if (originalAccess.readVersions) {
          const originalReadVersions = originalAccess.readVersions
          collection.access.readVersions = async (args) => {
            const hasOriginalAccess =
              typeof originalReadVersions === 'function'
                ? await originalReadVersions(args)
                : originalReadVersions
            if (!hasOriginalAccess) return false
            return hasPrivilege(readVersionsPrivilegeKey)(args)
          }
        } else {
          collection.access.readVersions = hasPrivilege(readVersionsPrivilegeKey)
        }

        // Wrap unlock access
        const unlockPrivilegeKey = generatePrivilegeKey(collection.slug, 'unlock')
        if (originalAccess.unlock) {
          const originalUnlock = originalAccess.unlock
          collection.access.unlock = async (args) => {
            const hasOriginalAccess =
              typeof originalUnlock === 'function' ? await originalUnlock(args) : originalUnlock
            if (!hasOriginalAccess) return false
            return hasPrivilege(unlockPrivilegeKey)(args)
          }
        } else {
          collection.access.unlock = hasPrivilege(unlockPrivilegeKey)
        }
      }
    }

    // Step 7: Wrap global access controls with privilege checks
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

        // Wrap readDrafts access
        const readDraftsPrivilegeKey = generateGlobalPrivilegeKey(global.slug, 'readDrafts')
        if (originalAccess.readDrafts) {
          const originalReadDrafts = originalAccess.readDrafts
          global.access.readDrafts = async (args) => {
            const hasOriginalAccess =
              typeof originalReadDrafts === 'function'
                ? await originalReadDrafts(args)
                : originalReadDrafts
            if (!hasOriginalAccess) return false
            return hasPrivilege(readDraftsPrivilegeKey)(args)
          }
        } else {
          global.access.readDrafts = hasPrivilege(readDraftsPrivilegeKey)
        }

        // Wrap readVersions access
        const readVersionsPrivilegeKey = generateGlobalPrivilegeKey(global.slug, 'readVersions')
        if (originalAccess.readVersions) {
          const originalReadVersions = originalAccess.readVersions
          global.access.readVersions = async (args) => {
            const hasOriginalAccess =
              typeof originalReadVersions === 'function'
                ? await originalReadVersions(args)
                : originalReadVersions
            if (!hasOriginalAccess) return false
            return hasPrivilege(readVersionsPrivilegeKey)(args)
          }
        } else {
          global.access.readVersions = hasPrivilege(readVersionsPrivilegeKey)
        }
      }
    }

    // Step 8: Set up onInit to discover late-loaded collections and seed Super Admin role
    const incomingOnInit = config.onInit

    config.onInit = async (payload) => {
      // Ensure we are executing any existing onInit functions before running our own.
      if (incomingOnInit) {
        await incomingOnInit(payload)
      }

      // Discover and generate privileges for any collections added by plugins after ours
      const allCollectionSlugs = Object.keys(payload.collections)
      const existingPrivilegedCollections = Array.from(allPrivilegesMap.keys())

      for (const slug of allCollectionSlugs) {
        if (
          !existingPrivilegedCollections.includes(slug) &&
          !excludeCollections.includes(slug) &&
          slug !== 'payload-preferences' &&
          slug !== 'payload-migrations' &&
          slug !== 'payload-locked-documents'
        ) {
          const collection = payload.collections[slug]
          if (collection?.config) {
            payload.logger.info(`[Roles & Privileges] Discovered late-loaded collection: ${slug}`)
            generateCollectionPrivileges(collection.config)
          }
        }
      }

      // Discover and generate privileges for any globals added by plugins after ours
      const allGlobalSlugs = Object.keys(payload.globals)
      const existingPrivilegedGlobals = Array.from(allGlobalPrivilegesMap.keys())

      for (const slug of allGlobalSlugs) {
        if (!existingPrivilegedGlobals.includes(slug) && !excludeGlobals.includes(slug)) {
          const global = (payload.globals as any)[slug]
          if (global?.config) {
            payload.logger.info(`[Roles & Privileges] Discovered late-loaded global: ${slug}`)
            generateGlobalPrivileges(global.config)
          }
        }
      }

      // Seed or update the Super Admin role with all privileges (including late-loaded ones)
      if (seedSuperAdmin) {
        await seedSuperAdminRole(payload)
      }
    }

    // Step 9: Add plugin translations to config
    if (!config.i18n?.translations) {
      if (!config.i18n) {
        config.i18n = {}
      }
      config.i18n.translations = {}
    }

    // Merge plugin translations with existing translations
    Object.keys(translations).forEach((locale) => {
      const typedLocale = locale as AcceptedLanguages
      const pluginI18nObject = translations[typedLocale]

      if (!config.i18n?.translations?.[typedLocale]) {
        config.i18n!.translations![typedLocale] = {}
      }

      if (!('plugin-roles-privileges' in (config.i18n!.translations![typedLocale] || {}))) {
        ;(config.i18n!.translations![typedLocale] as PluginDefaultTranslationsObject)[
          'plugin-roles-privileges'
        ] = {} as PluginDefaultTranslationsObject['plugin-roles-privileges']
      }

      ;(config.i18n!.translations![typedLocale] as PluginDefaultTranslationsObject)[
        'plugin-roles-privileges'
      ] = {
        ...pluginI18nObject['plugin-roles-privileges'],
      }
    })

    return config
  }
