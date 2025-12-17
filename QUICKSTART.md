# Quick Start Guide

## Installation

```bash
npm install roles-privileges-payload-plugin
```

## Setup (3 steps)

### 1. Add Plugin to Config

```typescript
import { buildConfig } from 'payload'
import { rolesPrivilegesPayloadPlugin } from 'roles-privileges-payload-plugin'

export default buildConfig({
  collections: [
    // Your collections here
  ],
  plugins: [rolesPrivilegesPayloadPlugin()],
})
```

### 2. Add Roles Relationship to Users

```typescript
{
  slug: 'users',
  auth: true,
  fields: [
    {
      name: 'roles',
      type: 'relationship',
      relationTo: 'roles',
      hasMany: true,
      required: true,
    }
  ]
}
```

### 3. Start Your App

```bash
npm run dev
```

## What Happens Automatically

1. ✅ A `roles` collection is added to your admin panel
2. ✅ CRUD privileges are generated for every collection
3. ✅ A Super Admin role is created with all privileges
4. ✅ All collection access controls are wrapped with privilege checks
5. ✅ A beautiful UI for selecting privileges is available in the roles collection

## First Steps

1. **Create your first user** with the Super Admin role (it will be available in the roles dropdown)
2. **Log in** with that user
3. **Navigate to Roles** collection to see all auto-generated privileges
4. **Create custom roles** (Editor, Viewer, etc.) by selecting specific privileges
5. **Assign roles to other users** via the users collection

## Generated Privileges

For each collection, 4 privileges are created:

| Collection | Privileges Generated                                         |
| ---------- | ------------------------------------------------------------ |
| `posts`    | `posts-create`, `posts-read`, `posts-update`, `posts-delete` |
| `pages`    | `pages-create`, `pages-read`, `pages-update`, `pages-delete` |
| `media`    | `media-create`, `media-read`, `media-update`, `media-delete` |

## Example: Creating an Editor Role

1. Go to **Roles** collection in admin panel
2. Click **Create New**
3. Fill in:
   - Title: "Editor"
   - Select privileges:
     - ✅ posts-create
     - ✅ posts-read
     - ✅ posts-update
     - ✅ pages-create
     - ✅ pages-read
     - ✅ pages-update
4. Save

Now assign this role to users who should have editor access!

## Configuration Options

```typescript
rolesPrivilegesPayloadPlugin({
  // Exclude collections from privilege generation
  excludeCollections: ['media'],

  // Disable auto-wrapping of access controls
  wrapCollectionAccess: false,

  // Don't seed Super Admin role
  seedSuperAdmin: false,

  // Disable plugin entirely
  disabled: false,
})
```

## Advanced Usage

### Custom Access Controls

```typescript
import { hasPrivilege, hasAnyPrivilege } from 'roles-privileges-payload-plugin'

{
  slug: 'posts',
  access: {
    // Single privilege
    read: hasPrivilege('posts-read'),

    // Multiple privileges (OR logic)
    create: hasAnyPrivilege('posts-create', 'admin-access'),
  }
}
```

See [EXAMPLES.md](./EXAMPLES.md) for more advanced usage patterns.

## Troubleshooting

### "Access Denied" after adding plugin

**Solution**: Make sure your user has a role assigned. The first user should be assigned the Super Admin role.

### Privileges not showing in UI

**Solution**: The plugin needs to run during config initialization. Make sure the plugin is in the `plugins` array before starting the app.

### Can't access admin panel

**Solution**: Temporarily disable the plugin by setting `disabled: true`, create a user with Super Admin role, then re-enable the plugin.

## Next Steps

- Read the [full documentation](./PLUGIN_README.md)
- Check out [examples](./EXAMPLES.md)
- Review the [implementation details](./IMPLEMENTATION_SUMMARY.md)

## Support

For issues and questions, please open an issue on GitHub.
