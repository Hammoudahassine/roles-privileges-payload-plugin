import type { Payload } from 'payload'

import { devUser } from './helpers/credentials.js'

export const seed = async (payload: Payload) => {
  // Wait for Super Admin role to be created by the plugin
  const { totalDocs: roleCount } = await payload.count({
    collection: 'roles',
    where: {
      slug: {
        equals: 'super-admin',
      },
    },
  })

  if (roleCount === 0) {
    console.log('⏳ Waiting for Super Admin role to be created...')
    return
  }

  const superAdminRole = await payload.find({
    collection: 'roles',
    where: {
      slug: {
        equals: 'super-admin',
      },
    },
  })

  const { totalDocs } = await payload.count({
    collection: 'users',
    where: {
      email: {
        equals: devUser.email,
      },
    },
  })

  if (!totalDocs && superAdminRole.docs[0]) {
    await payload.create({
      collection: 'users',
      data: {
        ...devUser,
        roles: [superAdminRole.docs[0].id],
      },
    })
    console.log('✅ Dev user created with Super Admin role')
  }
}
