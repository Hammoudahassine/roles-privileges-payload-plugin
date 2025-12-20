// Example: Basic Usage
import { buildConfig } from 'payload'
import { rolesPrivilegesPayloadPlugin } from 'roles-privileges-payload-plugin'

export default buildConfig({
collections: [
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
},
],
},
{
slug: 'posts',
fields: [
{ name: 'title', type: 'text' },
],
},
],
plugins: [
rolesPrivilegesPayloadPlugin(),
],
})

// Example: Advanced Configuration
import { buildConfig } from 'payload'
import { rolesPrivilegesPayloadPlugin } from 'roles-privileges-payload-plugin'

export default buildConfig({
collections: [
// ... your collections
],
plugins: [
rolesPrivilegesPayloadPlugin({
// Exclude these collections from privilege generation
excludeCollections: ['media', 'payload-preferences'],

      // Disable automatic access control wrapping
      wrapCollectionAccess: false,

      // Don't seed Super Admin role
      seedSuperAdmin: false,
    }),

],
})

// Example: Custom Access Controls with Privileges
import { buildConfig } from 'payload'
import {
rolesPrivilegesPayloadPlugin,
hasPrivilege,
hasAnyPrivilege,
hasAllPrivileges,
privilegesAccess,
} from 'roles-privileges-payload-plugin'

export default buildConfig({
collections: [
{
slug: 'posts',
access: {
// Simple: User needs posts-read privilege
read: hasPrivilege('posts-read'),

        // OR logic: User needs EITHER posts-create OR pages-create
        create: hasAnyPrivilege('posts-create', 'pages-create'),

        // AND logic: User needs BOTH posts-update AND posts-read
        update: hasAllPrivileges('posts-update', 'posts-read'),

        // Complex: (posts-delete AND posts-read) OR (admin-access)
        delete: privilegesAccess([
          ['posts-delete', 'posts-read'],
          ['admin-access']
        ]),
      },
    },
    {
      slug: 'pages',
      access: {
        // Combine with custom logic
        read: ({ req: { user } }) => {
          // Your custom logic
          if (user?.email?.endsWith('@admin.com')) {
            return true
          }
          // Fall back to privilege check
          return hasPrivilege('pages-read')({ req: { user } })
        },
      },
    },

],
plugins: [
rolesPrivilegesPayloadPlugin(),
],
})

// Example: Programmatic Access to Privileges
import {
getAllPrivileges,
getAllPrivilegeKeys,
allPrivilegesMap,
generateCollectionPrivileges,
} from 'roles-privileges-payload-plugin'

// Get all privileges
const privileges = getAllPrivileges()
console.log(privileges)
// [
// { privilegeKey: 'posts-create', label: {...}, description: {...} },
// { privilegeKey: 'posts-read', label: {...}, description: {...} },
// ...
// ]

// Get just the keys
const keys = getAllPrivilegeKeys()
console.log(keys)
// ['posts-create', 'posts-read', 'posts-update', 'posts-delete', ...]

// Access the privileges map
const postsPrivileges = allPrivilegesMap.get('posts')
console.log(postsPrivileges)
// {
// collectionSlug: 'posts',
// description: { en: '...', fr: '...' },
// privileges: {
// create: { privilegeKey: 'posts-create', ... },
// read: { privilegeKey: 'posts-read', ... },
// update: { privilegeKey: 'posts-update', ... },
// delete: { privilegeKey: 'posts-delete', ... }
// }
// }

// Generate privileges for a custom collection
const customCollection = {
slug: 'custom',
labels: {
singular: { en: 'Custom Item', fr: 'Élément personnalisé' },
plural: { en: 'Custom Items', fr: 'Éléments personnalisés' }
},
fields: []
}

const customPrivileges = generateCollectionPrivileges(customCollection)
console.log(customPrivileges)

// Example: Creating Roles Programmatically
import { Payload } from 'payload'

async function createEditorRole(payload: Payload) {
await payload.create({
collection: 'roles',
data: {
title: 'Editor',
slug: 'editor',
description: 'Can create and edit content',
privileges: [
{ privilege: 'posts-create' },
{ privilege: 'posts-read' },
{ privilege: 'posts-update' },
{ privilege: 'pages-create' },
{ privilege: 'pages-read' },
{ privilege: 'pages-update' },
]
}
})
}

async function createViewerRole(payload: Payload) {
await payload.create({
collection: 'roles',
data: {
title: 'Viewer',
slug: 'viewer',
description: 'Can only view content',
privileges: [
{ privilege: 'posts-read' },
{ privilege: 'pages-read' },
]
}
})
}

// Example: Assigning Roles to Users
async function assignRoleToUser(payload: Payload, userId: string, roleId: string) {
const user = await payload.findByID({
collection: 'users',
id: userId,
})

const existingRoles = user.roles || []

await payload.update({
collection: 'users',
id: userId,
data: {
roles: [...existingRoles, roleId]
}
})
}

// Example: Checking User Privileges
async function checkUserPrivileges(payload: Payload, userId: string) {
const user = await payload.findByID({
collection: 'users',
id: userId,
depth: 2, // Populate roles
})

const privileges = new Set<string>()

if (user.roles && Array.isArray(user.roles)) {
for (const role of user.roles) {
if (typeof role === 'object' && 'privileges' in role) {
for (const priv of role.privileges) {
if (typeof priv === 'object' && 'privilege' in priv) {
privileges.add(priv.privilege as string)
}
}
}
}
}

return Array.from(privileges)
}

// Usage
const userPrivileges = await checkUserPrivileges(payload, 'user-id')
console.log(userPrivileges)
// ['posts-read', 'posts-create', 'pages-read', ...]

// Example: Custom Roles Collection
import { buildConfig } from 'payload'
import {
rolesPrivilegesPayloadPlugin,
createRolesCollection,
} from 'roles-privileges-payload-plugin'

// Create a custom roles collection with additional fields
const customRolesCollection = createRolesCollection()

// Add a department field
customRolesCollection.fields.push({
name: 'department',
type: 'select',
options: ['Engineering', 'Marketing', 'Sales', 'Support'],
required: true,
admin: {
position: 'sidebar',
},
})

// Add an expiration date
customRolesCollection.fields.push({
name: 'expiresAt',
type: 'date',
admin: {
position: 'sidebar',
description: 'When this role expires',
},
})

// Add custom hooks
customRolesCollection.hooks = {
...customRolesCollection.hooks, // Preserve Super Admin protection
afterChange: [
async ({ doc, req, operation }) => {
req.payload.logger.info(
`Role "${doc.title}" was ${operation === 'create' ? 'created' : 'updated'}`
)
},
],
}

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

// For more details, see CUSTOM_ROLES_COLLECTION.md
