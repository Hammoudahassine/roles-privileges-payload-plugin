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
  description: {
    en: 'Ability to publish posts to make them publicly visible',
    fr: 'Capacité de publier des articles pour les rendre publiquement visibles',
  },
  label: {
    en: 'Publish Posts',
    fr: 'Publier les articles',
  },
  privilegeKey: 'posts-publish',
})

const featurePrivilege = registerCustomPrivilege('posts', {
  description: {
    en: 'Ability to feature posts on the homepage',
    fr: "Capacité de mettre en vedette des articles sur la page d'accueil",
  },
  label: {
    en: 'Feature Posts',
    fr: 'Mettre en vedette les articles',
  },
  privilegeKey: 'posts-feature',
})

// Register multiple custom privileges at once for site-settings global
const siteSettingsPrivileges = registerCustomPrivileges('site-settings', [
  {
    description: {
      en: 'Ability to update the site logo',
      fr: 'Capacité de mettre à jour le logo du site',
    },
    label: {
      en: 'Manage Logo',
      fr: 'Gérer le logo',
    },
    privilegeKey: 'site-settings-manage-logo',
  },
  {
    description: {
      en: 'Ability to modify the site name',
      fr: 'Capacité de modifier le nom du site',
    },
    label: {
      en: 'Change Site Name',
      fr: 'Changer le nom du site',
    },
    privilegeKey: 'site-settings-change-name',
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
        ],
      },
      {
        slug: 'posts',
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
            access: {
              // Only users with the custom publish privilege can set status to published
              update: ({ data, req }) => {
                if (data?.status === 'published') {
                  return checkPrivilege(publishPrivilege.privilegeKey, req.user)
                }
                return true
              },
            },
            defaultValue: 'draft',
            options: ['draft', 'published'],
          },
          {
            name: 'featured',
            type: 'checkbox',
            access: {
              // Only users with the custom feature privilege can mark posts as featured
              update: ({ req }) => {
                return checkPrivilege(featurePrivilege.privilegeKey, req.user)
              },
            },
            defaultValue: false,
          },
        ],
        labels: {
          plural: { en: 'Blog Posts', fr: 'Articles de blog' },
          singular: { en: 'Blog Post', fr: 'Article de blog' },
        },
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
    db: mongooseAdapter({
      ensureIndexes: true,
      url: process.env.DATABASE_URI || '',
    }),
    editor: lexicalEditor(),
    email: testEmailAdapter,
    globals: [
      {
        slug: 'site-settings',
        fields: [
          {
            name: 'siteName',
            type: 'text',
            access: {
              // Only users with the custom change-name privilege can update the site name
              update: ({ req }) => checkPrivilege(siteSettingsPrivileges[1].privilegeKey, req.user),
            },
            required: true,
          },
          {
            name: 'logo',
            type: 'upload',
            access: {
              // Only users with the custom manage-logo privilege can update the logo
              update: ({ req }) => checkPrivilege(siteSettingsPrivileges[0].privilegeKey, req.user),
            },
            relationTo: 'media',
          },
        ],
        label: {
          en: 'Site Settings',
          fr: 'Paramètres du site',
        },
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
    // onInit: async (payload) => {
    //   const { seed } = await import('./seed.js')
    //   await seed(payload)
    // },
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
