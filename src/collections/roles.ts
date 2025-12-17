import type {
  CollectionBeforeChangeHook,
  CollectionBeforeDeleteHook,
  CollectionConfig,
} from 'payload'
import type { GlobalPrivilege } from '../utils/generateGlobalPrivileges.js'
import type { Privilege } from '../utils/generatePrivileges.js'
import { hasPrivilege } from '../utils/privilegesAccess.js'

type CollectionData = {
  collectionSlug: string
  collectionLabel: { en: string; fr: string }
  privileges: Record<string, Privilege>
}

type GlobalData = {
  globalSlug: string
  globalLabel: { en: string; fr: string }
  privileges: Record<string, GlobalPrivilege>
}

/**
 * Hook to ensure the Super Admin role cannot be deleted
 */
const ensureSuperAdminDontGetDeleted: CollectionBeforeDeleteHook = async ({ req, id }) => {
  const role = await req.payload.findByID({
    collection: 'roles',
    id,
  })

  if (role && role.slug === 'super-admin') {
    throw new Error('Cannot delete the Super Admin role')
  }
}

/**
 * Hook to ensure the Super Admin role slug cannot be changed
 */
const ensureSuperAdminDontGetUpdated: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
}) => {
  if (originalDoc && originalDoc.slug === 'super-admin') {
    if (data.slug && data.slug !== 'super-admin') {
      throw new Error('Cannot modify the Super Admin role slug')
    }
  }
  return data
}

/**
 * Roles collection configuration
 * This collection manages user roles and their associated privileges
 */
export const createRolesCollection = (
  collections?: CollectionData[],
  globals?: GlobalData[],
): CollectionConfig => {
  return {
    slug: 'roles',
    labels: {
      singular: { en: 'Role', fr: 'Rôle' },
      plural: { en: 'Roles', fr: 'Rôles' },
    },
    access: {
      // Allow authenticated users to read roles (needed for user role resolution)
      read: () => true,
      // Require specific privileges for other operations
      create: hasPrivilege('roles-create'),
      update: hasPrivilege('roles-update'),
      delete: hasPrivilege('roles-delete'),
    },
    admin: {
      useAsTitle: 'title',
      defaultColumns: ['title', 'slug'],
    },
    fields: [
      {
        name: 'title',
        type: 'text',
        required: true,
        label: {
          en: 'Role Title',
          fr: 'Titre du rôle',
        },
      },
      {
        name: 'slug',
        type: 'text',
        required: true,
        unique: true,
        label: {
          en: 'Slug',
          fr: 'Slug',
        },
        admin: {
          description: {
            en: 'Unique identifier for this role',
            fr: 'Identifiant unique pour ce rôle',
          },
        },
        hooks: {
          beforeValidate: [
            ({ value }) => {
              if (typeof value === 'string') {
                return value
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/(^-|-$)/g, '')
              }
              return value
            },
          ],
        },
      },
      {
        name: 'privileges',
        type: 'array',
        label: {
          en: 'Privileges',
          fr: 'Privilèges',
        },
        admin: {
          description: {
            en: 'Select the privileges this role should have',
            fr: 'Sélectionnez les privilèges que ce rôle devrait avoir',
          },
          components: {
            Field: {
              path: 'roles-privileges-payload-plugin/client#PrivilegesSelect',
              clientProps: {
                collections: collections || [],
                globals: globals || [],
              },
            },
          },
        },
        minRows: 1,
        fields: [
          {
            name: 'privilege',
            type: 'text',
            required: true,
            label: {
              en: 'Privilege',
              fr: 'Privilège',
            },
          },
        ],
      },
      {
        name: 'description',
        type: 'textarea',
        label: {
          en: 'Description',
          fr: 'Description',
        },
        admin: {
          description: {
            en: 'Optional description of this role',
            fr: 'Description optionnelle de ce rôle',
          },
        },
      },
    ],
    hooks: {
      beforeChange: [ensureSuperAdminDontGetUpdated],
      beforeDelete: [ensureSuperAdminDontGetDeleted],
    },
  }
}
