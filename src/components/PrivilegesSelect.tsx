'use client'
import type { ArrayFieldClientComponent } from 'payload'

import { Collapsible, useField, useForm, useFormFields, useTranslation } from '@payloadcms/ui'
import { memo, useCallback } from 'react'
import type { GlobalPrivilege } from '../utils/generateGlobalPrivileges.js'
import type { Privilege } from '../utils/generatePrivileges.js'

type CollectionPrivileges = {
  collectionSlug: string
  collectionLabel: Record<string, string>
  privileges: Record<string, Privilege>
}

type GlobalPrivileges = {
  globalSlug: string
  globalLabel: Record<string, string>
  privileges: Record<string, GlobalPrivilege>
}

type PrivilegesSelectProps = {
  path: string
  collections: CollectionPrivileges[]
  globals: GlobalPrivileges[]
}

/**
 * Custom array field component for managing privileges in Payload CMS
 * @component
 * @param {Object} props - Component props from Payload CMS
 * @param {string} props.path - Path to the field in the form
 * @param {CollectionPrivileges[]} props.collections - Collections with their privileges
 * @param {GlobalPrivileges[]} props.globals - Globals with their privileges
 */
const PrivilegesSelect: ArrayFieldClientComponent = (props) => {
  const { path, collections = [], globals = [] } = props as any
  const { rows } = useField({ path, hasRows: true })
  const { addFieldRow, removeFieldRow, setModified } = useForm()
  const { dispatch } = useFormFields(([_, dispatch]) => ({ dispatch }))
  const { i18n } = useTranslation()
  const locale = i18n?.language || 'en'

  // Helper to get label in current locale with fallback
  const getLabel = (labels: Record<string, string>): string => {
    return labels[locale] || labels._default || labels.en || Object.values(labels)[0] || ''
  }

  // Use the collections and globals from props
  const collectionsArray = collections
  const globalsArray = globals

  /**
   * Get existing privilege values from form fields
   */
  const existingPrivileges = useFormFields(
    ([fields]) =>
      rows?.map((row, index) => {
        const value = fields[`${path}.${index}.privilege`]?.value
        return typeof value === 'string' ? value : ''
      }) || [],
  )

  /**
   * Get privilege label from privilegeKey
   */
  const getPrivilegeLabel = useCallback(
    (privilegeKey: string) => {
      // Check collections
      for (const collection of collectionsArray) {
        for (const privilege of Object.values(collection.privileges) as Privilege[]) {
          if (privilege.privilegeKey === privilegeKey) {
            return getLabel(privilege.label)
          }
        }
      }
      // Check globals
      for (const global of globalsArray) {
        for (const privilege of Object.values(global.privileges) as GlobalPrivilege[]) {
          if (privilege.privilegeKey === privilegeKey) {
            return getLabel(privilege.label)
          }
        }
      }
      return privilegeKey
    },
    [collectionsArray, globalsArray, locale],
  )

  /**
   * Check if a privilege is already selected
   */
  const isPrivilegeSelected = useCallback(
    (privilegeName: string) => {
      return existingPrivileges.includes(privilegeName)
    },
    [existingPrivileges],
  )

  /**
   * Handles privilege selection/deselection
   */
  const handlePrivilegeToggle = useCallback(
    (privilege: Privilege | GlobalPrivilege) => {
      const privilegeKey = privilege.privilegeKey
      const existingIndex = existingPrivileges.indexOf(privilegeKey)

      if (existingIndex >= 0) {
        // Remove privilege
        removeFieldRow({ path, rowIndex: existingIndex })
        setModified(true)
      } else {
        // Add privilege
        addFieldRow({
          path,
          schemaPath: `${path}.0.privilege`,
        })

        setTimeout(() => {
          dispatch({
            type: 'UPDATE',
            path: `${path}.${rows?.length || 0}.privilege`,
            value: privilegeKey,
          })
          setModified(true)
        }, 0)
      }
    },
    [addFieldRow, dispatch, existingPrivileges, path, removeFieldRow, rows?.length, setModified],
  )

  return (
    <div style={{ marginTop: '16px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Collections */}
        {collectionsArray.map((collection: CollectionPrivileges) => {
          const privileges = Object.values(collection.privileges) as Privilege[]
          const selectedCount = privileges.filter((p) => isPrivilegeSelected(p.privilegeKey)).length

          return (
            <Collapsible
              key={collection.collectionSlug}
              header={
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📦</span>
                    <span style={{ fontWeight: 500 }}>
                      {getLabel(collection.collectionLabel) || collection.collectionSlug}
                    </span>
                  </div>
                  {selectedCount > 0 && (
                    <span
                      style={{
                        padding: '2px 8px',
                        backgroundColor: 'var(--theme-success-100)',
                        color: 'var(--theme-success-800)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {selectedCount}
                    </span>
                  )}
                </div>
              }
            >
              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--theme-elevation-50)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {privileges.map((privilege) => {
                  const isSelected = isPrivilegeSelected(privilege.privilegeKey)
                  return (
                    <div
                      key={privilege.privilegeKey}
                      style={{
                        padding: '12px',
                        backgroundColor: 'var(--theme-elevation-0)',
                        border: `1px solid ${
                          isSelected ? 'var(--theme-success-300)' : 'var(--theme-elevation-300)'
                        }`,
                        borderRadius: '4px',
                        transition: 'all 0.2s',
                      }}
                    >
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handlePrivilegeToggle(privilege)}
                          style={{ marginTop: '2px', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: '14px',
                              color: 'var(--theme-elevation-1000)',
                              marginBottom: '4px',
                            }}
                          >
                            {getLabel(privilege.label)}
                          </div>
                          <div
                            style={{
                              fontSize: '13px',
                              color: 'var(--theme-elevation-700)',
                              lineHeight: '1.4',
                              marginBottom: '8px',
                            }}
                          >
                            {getLabel(privilege.description)}
                          </div>
                          <div
                            style={{
                              padding: '4px 8px',
                              backgroundColor: 'var(--theme-elevation-100)',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontFamily: 'monospace',
                              color: 'var(--theme-elevation-800)',
                              display: 'inline-block',
                            }}
                          >
                            {privilege.privilegeKey}
                          </div>
                        </div>
                      </label>
                    </div>
                  )
                })}
              </div>
            </Collapsible>
          )
        })}

        {/* Globals */}
        {globalsArray.map((global: GlobalPrivileges) => {
          const privileges = Object.values(global.privileges) as GlobalPrivilege[]
          const selectedCount = privileges.filter((p) => isPrivilegeSelected(p.privilegeKey)).length

          return (
            <Collapsible
              key={global.globalSlug}
              header={
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🌐</span>
                    <span style={{ fontWeight: 500 }}>
                      {getLabel(global.globalLabel) || global.globalSlug}
                    </span>
                  </div>
                  {selectedCount > 0 && (
                    <span
                      style={{
                        padding: '2px 8px',
                        backgroundColor: 'var(--theme-success-100)',
                        color: 'var(--theme-success-800)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {selectedCount}
                    </span>
                  )}
                </div>
              }
            >
              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--theme-elevation-50)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {privileges.map((privilege) => {
                  const isSelected = isPrivilegeSelected(privilege.privilegeKey)
                  return (
                    <div
                      key={privilege.privilegeKey}
                      style={{
                        padding: '12px',
                        backgroundColor: 'var(--theme-elevation-0)',
                        border: `1px solid ${
                          isSelected ? 'var(--theme-success-300)' : 'var(--theme-elevation-300)'
                        }`,
                        borderRadius: '4px',
                        transition: 'all 0.2s',
                      }}
                    >
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handlePrivilegeToggle(privilege)}
                          style={{ marginTop: '2px', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: '14px',
                              color: 'var(--theme-elevation-1000)',
                              marginBottom: '4px',
                            }}
                          >
                            {privilege.label[locale]}
                          </div>
                          <div
                            style={{
                              fontSize: '13px',
                              color: 'var(--theme-elevation-700)',
                              lineHeight: '1.4',
                              marginBottom: '8px',
                            }}
                          >
                            {privilege.description[locale]}
                          </div>
                          <div
                            style={{
                              padding: '4px 8px',
                              backgroundColor: 'var(--theme-elevation-100)',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontFamily: 'monospace',
                              color: 'var(--theme-elevation-800)',
                              display: 'inline-block',
                            }}
                          >
                            {privilege.privilegeKey}
                          </div>
                        </div>
                      </label>
                    </div>
                  )
                })}
              </div>
            </Collapsible>
          )
        })}
      </div>

      {/* Selected Privileges Summary */}
      {existingPrivileges.length > 0 && (
        <div
          style={{
            marginTop: '16px',
            padding: '16px',
            backgroundColor: 'var(--theme-elevation-100)',
            borderRadius: '4px',
          }}
        >
          <h5
            style={{
              margin: '0 0 12px 0',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--theme-elevation-1000)',
            }}
          >
            {(i18n.t as (key: string) => string)(
              'plugin-roles-privileges:privileges-selected-count',
            )}{' '}
            ({existingPrivileges.length})
          </h5>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {existingPrivileges.map((privilegeKey, index) => (
              <div
                key={`${privilegeKey}-${index}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  backgroundColor: 'var(--theme-success-100)',
                  border: '1px solid var(--theme-success-300)',
                  borderRadius: '16px',
                  fontSize: '12px',
                  color: 'var(--theme-success-800)',
                }}
              >
                <span>{getPrivilegeLabel(privilegeKey)}</span>
                <button
                  type="button"
                  onClick={() => {
                    removeFieldRow({ path, rowIndex: index })
                    setModified(true)
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--theme-success-600)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '16px',
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(PrivilegesSelect)
export type { CollectionPrivileges, GlobalPrivileges }
