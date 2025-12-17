import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import path from 'path'
import { buildConfig } from 'payload'
import { rolesPrivilegesPayloadPlugin } from 'roles-privileges-payload-plugin'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { testEmailAdapter } from './helpers/testEmailAdapter.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.ROOT_DIR) {
  process.env.ROOT_DIR = dirname
}

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
          },
          {
            name: 'logo',
            type: 'upload',
            relationTo: 'media',
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
