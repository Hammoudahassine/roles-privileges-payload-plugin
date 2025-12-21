# Roles & Privileges Payload Plugin

[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
[![npm version](https://img.shields.io/npm/v/roles-privileges-payload-plugin.svg)](https://www.npmjs.com/package/roles-privileges-payload-plugin)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful Payload CMS plugin that automatically generates role-based access control (RBAC) with granular CRUD privileges for all your collections.

## Features

- 🔐 **Automatic Privilege Generation**: Automatically creates CRUD privileges for collections and read/update privileges for globals
- 🎯 **Smart Access Control Wrapping**: Seamlessly wraps existing collection and global access controls with privilege checks
- 🌐 **Full Global Support**: Generates privileges for Payload globals (read/update operations)
- 👑 **Super Admin Role**: Auto-seeds a Super Admin role with all privileges
- 🎨 **Beautiful UI**: Custom privilege selector component with collapsible interface showing both collections and globals
- ⭐ **Custom Privileges**: Register custom privileges that appear in the admin UI alongside auto-generated ones
- 🗣️ **Multilingual**: Full support for any language with fallback chains (\_default → en → first available)
- ⚙️ **Highly Configurable**: Exclude collections/globals, disable features, or customize behavior
- 🔄 **Zero Configuration**: Works out of the box with sensible defaults

## Installation

```bash
npm install roles-privileges-payload-plugin
# or
pnpm add roles-privileges-payload-plugin
# or
yarn add roles-privileges-payload-plugin
```

## Basic Usage

Add the plugin to your Payload configuration:

```ts
import { buildConfig } from 'payload'
import { rolesPrivilegesPayloadPlugin } from 'roles-privileges-payload-plugin'

export default buildConfig({
  collections: [
    // Your collections here
  ],
  plugins: [rolesPrivilegesPayloadPlugin()],
})
```

That's it! The plugin will:

1. Scan all your collections and globals
2. Generate CRUD privileges for each collection (create, read, update, delete)
3. Generate read/update privileges for each global
4. Add a `roles` collection with a privilege selector UI
5. Wrap all collection and global access controls with privilege checks
6. Seed a Super Admin role with all privileges
7. **Automatically assign the Super Admin role to the first user created** 🎯

### First User Super Admin Assignment

By default, the plugin automatically assigns the Super Admin role to the first user created in your system. This ensures that:

- Your initial user has full access to configure the system
- You don't get locked out during initial setup
- The user collection is automatically detected from `config.admin.user` (defaults to `'users'`)

This feature can be disabled by setting `assignSuperAdminToFirstUser: false` in the plugin options.

## Configuration Options

```ts
rolesPrivilegesPayloadPlugin({
  // Enable the plugin (defaults to true). When false, the plugin does nothing.
  enable: true,

  // Disable the plugin (roles collection will still be added for schema consistency)
  disabled: false,

  // Collections to exclude from automatic privilege generation
  excludeCollections: ['media', 'payload-preferences'],

  // Globals to exclude from automatic privilege generation
  excludeGlobals: [],

  // Automatically wrap collection access controls with privilege checks
  wrapCollectionAccess: true,

  // Automatically wrap global access controls with privilege checks
  wrapGlobalAccess: true,

  // Seed a Super Admin role with all privileges on init
  seedSuperAdmin: true,

  // Automatically assign Super Admin role to the first user created (defaults to true)
  // Ensures the initial user has full system access
  assignSuperAdminToFirstUser: true,

  // Provide a custom roles collection configuration (optional)
  // Use createRolesCollection() helper to create a base and customize it
  customRolesCollection: undefined,
})
```

## How It Works

### 1. Privilege Generation

**For Collections:**

The plugin automatically generates seven privileges for each collection:

- `{collection-slug}-admin`: Permission to access the collection's admin UI
- `{collection-slug}-create`: Permission to create new documents
- `{collection-slug}-read`: Permission to read/view documents
- `{collection-slug}-readVersions`: Permission to view document version history
- `{collection-slug}-update`: Permission to update existing documents
- `{collection-slug}-delete`: Permission to delete documents
- `{collection-slug}-unlock`: Permission to unlock documents being edited by others

Example for a `posts` collection:

- `posts-admin`
- `posts-create`
- `posts-read`
- `posts-readVersions`
- `posts-update`
- `posts-delete`
- `posts-unlock`

**For Globals:**

The plugin generates four privileges for each global:

- `{global-slug}-read`: Permission to read/view the global
- `{global-slug}-readDrafts`: Permission to view draft versions
- `{global-slug}-readVersions`: Permission to view version history
- `{global-slug}-update`: Permission to update the global

Example for a `site-settings` global:

- `site-settings-read`
- `site-settings-update`

### 2. Access Control Wrapping

The plugin wraps your existing collection access controls. For example:

**Before:**

```ts
{
  slug: 'posts',
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
  }
}
```

**After (automatically wrapped):**

```ts
{
  slug: 'posts',
  access: {
    read: async (args) => {
      const hasOriginalAccess = true // from original function
      if (!hasOriginalAccess) return false
      return hasPrivilege('posts-read')(args)
    },
    create: async (args) => {
      const hasOriginalAccess = !!args.req.user // from original function
      if (!hasOriginalAccess) return false
      return hasPrivilege('posts-create')(args)
    }
  }
}
```

### 3. The Roles Collection

The plugin adds a `roles` collection with:

- `title`: The role name
- `slug`: Unique identifier (auto-generated from title)
- `privileges`: Array of privilege keys
- `description`: Optional role description

The privileges field uses a custom UI component that provides:

- Collapsible interface organized by collections and globals
- Visual distinction between collections (📦) and globals (🌐)
- Star icon (⭐) for custom privileges
- Checkbox selection for easy privilege management
- Real-time privilege descriptions with multilingual support
- Badge counter showing selected privileges per collection/global

### 4. User Integration

To use roles in your users collection, add a relationship field:

```ts
{
  slug: 'users',
  fields: [
    {
      name: 'roles',
      type: 'relationship',
      relationTo: 'roles',
      hasMany: true,
      required: true,
    },
    // other fields...
  ]
}
```

## Advanced Usage

### Creating Custom Privileges

You can create custom privileges beyond the auto-generated CRUD operations. Custom privileges registered with `registerCustomPrivilege` will appear in the admin UI with a star icon (⭐) to differentiate them from auto-generated privileges:

```ts
import { registerCustomPrivilege, hasPrivilege } from 'roles-privileges-payload-plugin'

// Register a custom privilege (will appear in admin UI)
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

// Use it in your collection
export const Posts = {
  slug: 'posts',
  fields: [
    {
      name: 'status',
      type: 'select',
      options: ['draft', 'published'],
      access: {
        update: async ({ req, data }) => {
          if (data?.status === 'published') {
            return hasPrivilege(publishPrivilege.privilegeKey)({ req })
          }
          return true
        },
      },
    },
  ],
}

// Register multiple custom privileges at once
import { registerCustomPrivileges } from 'roles-privileges-payload-plugin'

const customPrivileges = registerCustomPrivileges('posts', [
  {
    privilegeKey: 'posts-publish',
    label: { en: 'Publish Posts' },
    description: { en: 'Publish posts to make them visible' },
  },
  {
    privilegeKey: 'posts-feature',
    label: { en: 'Feature Posts' },
    description: { en: 'Feature posts on the homepage' },
  },
])
```

Custom privileges are visually distinguished in the admin UI with:

- ⭐ Star icon next to the privilege label
- Yellow/warning background for the privilege key badge
- Clear separation from auto-generated CRUD privileges

For more details, see [CUSTOM_PRIVILEGES.md](./CUSTOM_PRIVILEGES.md).

### Custom Privilege Checks

You can use the privilege access functions in your own access controls:

```ts
import {
  hasPrivilege,
  hasAnyPrivilege,
  hasAllPrivileges,
  checkPrivilege,
} from 'roles-privileges-payload-plugin'

// Single privilege check (for collection/global access)
{
  access: {
    read: hasPrivilege('posts-read')
  }
}

// For field-level access, use checkPrivilege (synchronous)
{
  fields: [
    {
      name: 'sensitiveField',
      type: 'text',
      access: {
        read: ({ req }) => checkPrivilege('posts-admin', req.user),
        update: ({ req }) => checkPrivilege('posts-admin', req.user),
      },
    },
  ]
}

// Field-level access with ANY privilege (OR logic)
{
  fields: [
    {
      name: 'status',
      access: {
        update: ({ req }) => checkAnyPrivilege(req.user, 'posts-update', 'posts-admin'),
      },
    },
  ]
}

// Field-level access with ALL privileges (AND logic)
{
  fields: [
    {
      name: 'publishedDate',
      access: {
        update: ({ req }) => checkAllPrivileges(req.user, 'posts-update', 'posts-publish'),
      },
    },
  ]
}

// Complex field-level privilege logic
{
  fields: [
    {
      name: 'featured',
      access: {
        // User needs (posts-update AND posts-feature) OR (posts-admin)
        update: ({ req }) =>
          checkPrivileges([['posts-update', 'posts-feature'], ['posts-admin']], req.user),
      },
    },
  ]
}

// User needs ANY of these privileges (OR logic)
{
  access: {
    read: hasAnyPrivilege('posts-read', 'posts-update')
  }
}

// User needs ALL of these privileges (AND logic)
{
  access: {
    read: hasAllPrivileges('posts-read', 'posts-update')
  }
}

// Complex privilege logic
import { privilegesAccess } from 'roles-privileges-payload-plugin'

{
  access: {
    // User needs (posts-create AND posts-read) OR (pages-create AND pages-read)
    read: privilegesAccess([
      ['posts-create', 'posts-read'],
      ['pages-create', 'pages-read'],
    ])
  }
}
```

### Excluding Collections and Globals

Some collections or globals don't need privilege-based access control:

```ts
rolesPrivilegesPayloadPlugin({
  excludeCollections: [
    'media', // Public media access
    'payload-preferences', // User preferences
    'payload-migrations', // System migrations
  ],
  excludeGlobals: [
    'site-settings', // Public site settings
  ],
})
```

### Accessing Generated Privileges

You can access all generated privileges programmatically:

```ts
import {
  allPrivilegesMap,
  getAllPrivileges,
  getAllPrivilegeKeys,
  allGlobalPrivilegesMap,
  getAllGlobalPrivileges,
  getAllGlobalPrivilegeKeys,
} from 'roles-privileges-payload-plugin'

// Get all collection privileges as a Map
const privilegesMap = allPrivilegesMap

// Get all collection privileges as a flat array
const allPrivileges = getAllPrivileges()

// Get just the collection privilege keys
const privilegeKeys = getAllPrivilegeKeys()

// Get all global privileges
const globalPrivilegesMap = allGlobalPrivilegesMap
const allGlobalPrivileges = getAllGlobalPrivileges()
const globalPrivilegeKeys = getAllGlobalPrivilegeKeys()
```

### Custom Roles Collection

By default, the plugin creates a standard `roles` collection. However, you can provide your own custom roles collection configuration if you need to:

- Add additional fields to the roles collection
- Customize the collection's access control
- Add custom hooks or endpoints
- Modify the admin UI

```ts
import {
  rolesPrivilegesPayloadPlugin,
  createRolesCollection,
  ensureSuperAdminDontGetDeleted,
  ensureSuperAdminDontGetUpdated,
} from 'roles-privileges-payload-plugin'

// Create a custom roles collection based on the default
const customRolesCollection = createRolesCollection()

// Customize it by adding additional fields
customRolesCollection.fields.push({
  name: 'department',
  type: 'select',
  options: ['Engineering', 'Marketing', 'Sales'],
  admin: {
    position: 'sidebar',
  },
})

// Add custom hooks
customRolesCollection.hooks = {
  ...customRolesCollection.hooks,
  afterChange: [
    async ({ doc, req }) => {
      // Send notification when role is changed
      console.log(`Role ${doc.title} was modified`)
    },
  ],
}

// Use the custom collection in the plugin
export default buildConfig({
  collections: [
    // Your other collections
  ],
  plugins: [
    rolesPrivilegesPayloadPlugin({
      customRolesCollection,
    }),
  ],
})
```

**Important Notes:**

- The custom roles collection **must** have the slug `'roles'`
- The plugin provides helper functions to maintain Super Admin protection:
  - `createRolesCollection()`: Base factory function to create the roles collection
  - `ensureSuperAdminDontGetDeleted`: Hook to prevent Super Admin role deletion
  - `ensureSuperAdminDontGetUpdated`: Hook to prevent Super Admin slug modification
- You can start with `createRolesCollection()` and customize from there, or build entirely from scratch
- The `privileges` field must remain for the privilege system to work

**Available Exports for Custom Roles:**

```ts
import {
  // Collection creation
  createRolesCollection,

  // Types
  CollectionData,
  GlobalData,

  // Hooks
  ensureSuperAdminDontGetDeleted,
  ensureSuperAdminDontGetUpdated,

  // Utilities
  seedSuperAdminRole,
} from 'roles-privileges-payload-plugin'
```

## Super Admin Role

The plugin automatically creates/updates a Super Admin role with:

- Slug: `super-admin`
- All available privileges
- Protection against deletion and slug modification

To assign the Super Admin role to a user:

```ts
await payload.update({
  collection: 'users',
  id: userId,
  data: {
    roles: ['super-admin-role-id'],
  },
})
```

## Privilege Label Customization

Privilege labels are automatically generated based on collection labels:

```ts
// If your collection has labels:
{
  slug: 'blog-posts',
  labels: {
    singular: { en: 'Blog Post', fr: 'Article de blog' },
    plural: { en: 'Blog Posts', fr: 'Articles de blog' }
  }
}

// Generated privilege labels:
// - Create Blog Post / Créer un article de blog
// - Read Blog Post / Lire un article de blog
// - Update Blog Post / Modifier un article de blog
// - Delete Blog Post / Supprimer un article de blog
```

If no labels are provided, the plugin capitalizes the slug:

- `blog-posts` → "Blog Posts"

## TypeScript Support

The plugin is fully typed. All exports include TypeScript definitions:

```ts
import type {
  RolesPrivilegesPayloadPluginConfig,
  Privilege,
  CollectionPrivileges,
  PrivilegeType,
  GlobalPrivilege,
  GlobalPrivileges,
  GlobalPrivilegeType,
} from 'roles-privileges-payload-plugin'
```

## API Reference

### Plugin Configuration

```ts
type RolesPrivilegesPayloadPluginConfig = {
  enable?: boolean
  disabled?: boolean
  excludeCollections?: string[]
  excludeGlobals?: string[]
  wrapCollectionAccess?: boolean
  wrapGlobalAccess?: boolean
  seedSuperAdmin?: boolean
}
```

### Exported Functions

**Main Plugin:**

- `rolesPrivilegesPayloadPlugin(config?)`: Main plugin function

**Access Control (Collection/Global Level - Async):**

- `hasPrivilege(key: string)`: Check for a single privilege
- `hasAnyPrivilege(...keys: string[])`: Check for any privilege (OR logic)
- `hasAllPrivileges(...keys: string[])`: Check for all privileges (AND logic)
- `privilegesAccess(arrays: string[][])`: Complex privilege logic

**Access Control (Field Level - Synchronous):**

- `checkPrivilege(key: string, user: any)`: Check for a single privilege
- `checkAnyPrivilege(user: any, ...keys: string[])`: Check for any privilege (OR logic)
- `checkAllPrivileges(user: any, ...keys: string[])`: Check for all privileges (AND logic)
- `checkPrivileges(arrays: string[][], user: any)`: Complex privilege logic

**Collection Privileges:**

- `generateCollectionPrivileges(collection)`: Generate privileges for a collection
- `getAllPrivileges()`: Get all collection privileges
- `getAllPrivilegeKeys()`: Get all collection privilege keys
- `allPrivilegesMap`: Map of all collection privileges

**Global Privileges:**

- `generateGlobalPrivileges(global)`: Generate privileges for a global
- `getAllGlobalPrivileges()`: Get all global privileges
- `getAllGlobalPrivilegeKeys()`: Get all global privilege keys
- `allGlobalPrivilegesMap`: Map of all global privileges

**Custom Privileges:**

- `registerCustomPrivilege(slug, config, options?)`: Register a single custom privilege
- `registerCustomPrivileges(slug, configs, options?)`: Register multiple custom privileges
- `customPrivilegesRegistry`: Map of all registered custom privileges

## Best Practices

1. **Always use the roles relationship**: Connect users to roles via a relationship field
2. **Start with Super Admin**: Create your first user with the Super Admin role
3. **Exclude system collections**: Exclude collections like migrations and preferences
4. **Consider global permissions**: Remember that globals only have read/update (no create/delete)
5. **Register custom privileges early**: Register custom privileges before the plugin initializes
6. **Use multilingual labels**: Provide translations for all languages your app supports
7. **Test privilege combinations**: Test different role configurations thoroughly
8. **Document custom roles**: Maintain documentation for custom roles you create

## Troubleshooting

### Privileges not working

Ensure your users collection has the roles relationship:

```ts
describe('Plugin tests', () => {
  // Create tests to ensure expected behavior from the plugin
  it('some condition that must be met', () => {
   // Write your test logic here
   expect(...)
  })
})
```
