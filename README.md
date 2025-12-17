# Roles & Privileges Payload Plugin

A powerful Payload CMS plugin that automatically generates role-based access control (RBAC) with granular CRUD privileges for all your collections.

## Features

- 🔐 **Automatic Privilege Generation**: Automatically creates CRUD privileges for collections and read/update privileges for globals
- 🎯 **Smart Access Control Wrapping**: Seamlessly wraps existing collection and global access controls with privilege checks
- 🌐 **Full Global Support**: Generates privileges for Payload globals (read/update operations)
- 👑 **Super Admin Role**: Auto-seeds a Super Admin role with all privileges
- 🎨 **Beautiful UI**: Custom privilege selector component with multi-column interface showing both collections and globals
- 🗣️ **Multilingual**: Built-in support for English and French labels
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

## Configuration Options

```ts
rolesPrivilegesPayloadPlugin({
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

- Three-column interface (Collections & Globals | Privileges | Description)
- Visual distinction between collections (📦) and globals (🌐)
- Checkbox selection for easy privilege management
- Real-time privilege descriptions
- Selected privileges summary

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

### Custom Privilege Checks

You can use the privilege access functions in your own access controls:

```ts
import { hasPrivilege, hasAnyPrivilege, hasAllPrivileges } from 'roles-privileges-payload-plugin'

// Single privilege check
{
  access: {
    read: hasPrivilege('posts-read')
  }
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

**Access Control:**

- `hasPrivilege(key: string)`: Check for a single privilege
- `hasAnyPrivilege(...keys: string[])`: Check for any privilege (OR logic)
- `hasAllPrivileges(...keys: string[])`: Check for all privileges (AND logic)
- `privilegesAccess(arrays: string[][])`: Complex privilege logic

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

## Best Practices

1. **Always use the roles relationship**: Connect users to roles via a relationship field
2. **Start with Super Admin**: Create your first user with the Super Admin role
3. **Exclude system collections**: Exclude collections like migrations and preferences
4. **Consider global permissions**: Remember that globals only have read/update (no create/delete)
5. **Test privilege combinations**: Test different role configurations thoroughly
6. **Document custom roles**: Maintain documentation for custom roles you create

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

## Best practices

With this tutorial and the plugin template, you should have everything you need to start building your own plugin.
In addition to the setup, here are other best practices aim we follow:

- **Providing an enable / disable option:** For a better user experience, provide a way to disable the plugin without uninstalling it. This is especially important if your plugin adds additional webpack aliases, this will allow you to still let the webpack run to prevent errors.
- **Include tests in your GitHub CI workflow**: If you’ve configured tests for your package, integrate them into your workflow to run the tests each time you commit to the plugin repository. Learn more about [how to configure tests into your GitHub CI workflow.](https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs)
- **Publish your finished plugin to NPM**: The best way to share and allow others to use your plugin once it is complete is to publish an NPM package. This process is straightforward and well documented, find out more [creating and publishing a NPM package here.](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/).
- **Add payload-plugin topic tag**: Apply the tag **payload-plugin **to your GitHub repository. This will boost the visibility of your plugin and ensure it gets listed with [existing payload plugins](https://github.com/topics/payload-plugin).
- **Use [Semantic Versioning](https://semver.org/) (SemVar)** - With the SemVar system you release version numbers that reflect the nature of changes (major, minor, patch). Ensure all major versions reference their Payload compatibility.

# Questions

Please contact [Payload](mailto:dev@payloadcms.com) with any questions about using this plugin template.
