import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import path from 'path'
import { buildConfig } from 'payload'
import {
  checkPrivilege,
  registerCustomPrivilege,
  registerCustomPrivileges,
  rolesPrivilegesPayloadPlugin,
} from 'roles-privileges-payload-plugin'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { testEmailAdapter } from './helpers/testEmailAdapter.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.ROOT_DIR) {
  process.env.ROOT_DIR = dirname
}

// Register custom privileges for posts collection
const publishPrivilege = registerCustomPrivilege('posts', {
  privilegeKey: 'posts-publish',
  label: {
    en: 'Publish Posts',
    fr: 'Publier les articles',
  },
  description: {
    en: 'Ability to publish posts to make them publicly visible',
    fr: 'Capacité de publier des articles pour les rendre publiquement visibles',
  },
})

const featurePrivilege = registerCustomPrivilege('posts', {
  privilegeKey: 'posts-feature',
  label: {
    en: 'Feature Posts',
    fr: 'Mettre en vedette les articles',
  },
  description: {
    en: 'Ability to feature posts on the homepage',
    fr: "Capacité de mettre en vedette des articles sur la page d'accueil",
  },
})

// Register multiple custom privileges at once for site-settings global
const siteSettingsPrivileges = registerCustomPrivileges('site-settings', [
  {
    privilegeKey: 'site-settings-manage-logo',
    label: {
      en: 'Manage Logo',
      fr: 'Gérer le logo',
    },
    description: {
      en: 'Ability to update the site logo',
      fr: 'Capacité de mettre à jour le logo du site',
    },
  },
  {
    privilegeKey: 'site-settings-change-name',
    label: {
      en: 'Change Site Name',
      fr: 'Changer le nom du site',
    },
    description: {
      en: 'Ability to modify the site name',
      fr: 'Capacité de modifier le nom du site',
    },
  },
])

const buildConfigWithMemoryDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    const memoryDB = await MongoMemoryReplSet.create({
      replSet: {
        count: 3,
        dbName: 'payloadmemory',
      },
    })

    process.env.DATABASE_URI = `${memoryDB.getUri()}&retryWrites=true`
  }

  return buildConfig({
    admin: {
      importMap: {
        baseDir: path.resolve(dirname),
      },
    },
    collections: [
      {
        slug: 'users',
        auth: true,
        fields: [
          {
            name: 'name',
            type: 'text',
            required: true,
          },
          {
            name: 'roles',
            type: 'relationship',
            relationTo: 'roles',
            hasMany: true,
            required: true,
          },
        ],
      },
      {
        slug: 'posts',
        labels: {
          singular: { en: 'Blog Post', fr: 'Article de blog' },
          plural: { en: 'Blog Posts', fr: 'Articles de blog' },
        },
        fields: [
          {
            name: 'title',
            type: 'text',
            required: true,
          },
          {
            name: 'content',
            type: 'richText',
          },
          {
            name: 'status',
            type: 'select',
            options: ['draft', 'published'],
            defaultValue: 'draft',
            access: {
              // Only users with the custom publish privilege can set status to published
              update: ({ req, data }) => {
                if (data?.status === 'published') {
                  return checkPrivilege(publishPrivilege.privilegeKey, req.user)
                }
                return true
              },
            },
          },
          {
            name: 'featured',
            type: 'checkbox',
            defaultValue: false,
            access: {
              // Only users with the custom feature privilege can mark posts as featured
              update: ({ req }) => {
                return checkPrivilege(featurePrivilege.privilegeKey, req.user)
              },
            },
          },
        ],
      },
      {
        slug: 'pages',
        fields: [
          {
            name: 'title',
            type: 'text',
            required: true,
          },
          {
            name: 'slug',
            type: 'text',
            required: true,
          },
        ],
      },
      {
        slug: 'media',
        fields: [],
        upload: {
          staticDir: path.resolve(dirname, 'media'),
        },
      },
    ],
    globals: [
      {
        slug: 'site-settings',
        label: {
          en: 'Site Settings',
          fr: 'Paramètres du site',
        },
        fields: [
          {
            name: 'siteName',
            type: 'text',
            required: true,
            access: {
              // Only users with the custom change-name privilege can update the site name
              update: ({ req }) => checkPrivilege(siteSettingsPrivileges[1].privilegeKey, req.user),
            },
          },
          {
            name: 'logo',
            type: 'upload',
            relationTo: 'media',
            access: {
              // Only users with the custom manage-logo privilege can update the logo
              update: ({ req }) => checkPrivilege(siteSettingsPrivileges[0].privilegeKey, req.user),
            },
          },
        ],
      },
      {
        slug: 'header',
        fields: [
          {
            name: 'navItems',
            type: 'array',
            fields: [
              {
                name: 'label',
                type: 'text',
              },
            ],
          },
        ],
      },
    ],
    db: mongooseAdapter({
      ensureIndexes: true,
      url: process.env.DATABASE_URI || '',
    }),
    editor: lexicalEditor(),
    email: testEmailAdapter,
    onInit: async (payload) => {
      const { seed } = await import('./seed.js')
      await seed(payload)
    },
    plugins: [
      rolesPrivilegesPayloadPlugin({
        // Exclude media from automatic privilege wrapping
        excludeCollections: ['payload-preferences'],
        // Automatically wrap all collection access with privilege checks
        wrapCollectionAccess: true,
        // Seed Super Admin role with all privileges
        seedSuperAdmin: true,
      }),
    ],
    secret: process.env.PAYLOAD_SECRET || 'test-secret_key',
    sharp,
    typescript: {
      outputFile: path.resolve(dirname, 'payload-types.ts'),
    },
  })
}

export default buildConfigWithMemoryDB()
