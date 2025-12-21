'use client'
import type { ArrayFieldClientComponent } from 'payload'

import { Collapsible, useField, useForm, useFormFields, useTranslation } from '@payloadcms/ui'
import { memo, useCallback } from 'react'

import type { GlobalPrivilege } from '../utils/generateGlobalPrivileges.js'
import type { Privilege } from '../utils/generatePrivileges.js'

type CollectionPrivileges = {
  collectionLabel: Record<string, string>
  collectionSlug: string
  privileges: Record<string, Privilege>
}

type GlobalPrivileges = {
  globalLabel: Record<string, string>
  globalSlug: string
  privileges: Record<string, GlobalPrivilege>
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
  const {
    collections = [],
    globals = [],
    path,
  } = props as {
    collections?: CollectionPrivileges[]
    globals?: GlobalPrivileges[]
    path: string
  }
  const { rows } = useField({ hasRows: true, path })
  const { addFieldRow, removeFieldRow, setModified } = useForm()
  const { dispatch } = useFormFields(([_, dispatch]) => ({ dispatch }))
  const { i18n } = useTranslation()
  const locale = i18n?.language || 'en'

  // Helper to get label in current locale with fallback
  const getLabel = useCallback(
    (labels: Record<string, string>): string => {
      return labels[locale] || labels._default || labels.en || Object.values(labels)[0] || ''
    },
    [locale],
  )

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
        for (const privilege of Object.values(collection.privileges)) {
          if (privilege.privilegeKey === privilegeKey) {
            return getLabel(privilege.label)
          }
        }
      }
      // Check globals
      for (const global of globalsArray) {
        for (const privilege of Object.values(global.privileges)) {
          if (privilege.privilegeKey === privilegeKey) {
            return getLabel(privilege.label)
          }
        }
      }
      return privilegeKey
    },
    [collectionsArray, globalsArray, getLabel],
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
    (privilege: GlobalPrivilege | Privilege) => {
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
    <div style={{ marginBottom: '16px', marginTop: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Collections */}
        {collectionsArray.map((collection: CollectionPrivileges) => {
          const privileges = Object.values(collection.privileges)
          const selectedCount = privileges.filter((p) => isPrivilegeSelected(p.privilegeKey)).length

          return (
            <Collapsible
              header={
                <div
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <div style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
                    <span aria-label="Collection" role="img">
                      📦
                    </span>
                    <span style={{ fontWeight: 500 }}>
                      {getLabel(collection.collectionLabel) || collection.collectionSlug}
                    </span>
                  </div>
                  {selectedCount > 0 && (
                    <span
                      style={{
                        backgroundColor: 'var(--theme-success-100)',
                        borderRadius: '12px',
                        color: 'var(--theme-success-800)',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '2px 8px',
                      }}
                    >
                      {selectedCount}
                    </span>
                  )}
                </div>
              }
              key={collection.collectionSlug}
            >
              <div
                style={{
                  backgroundColor: 'var(--theme-elevation-50)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '16px',
                }}
              >
                {privileges.map((privilege) => {
                  const isSelected = isPrivilegeSelected(privilege.privilegeKey)
                  const isCustom = privilege.isCustom === true
                  return (
                    <div
                      key={privilege.privilegeKey}
                      style={{
                        backgroundColor: 'var(--theme-elevation-0)',
                        border: `1px solid ${
                          isSelected ? 'var(--theme-success-300)' : 'var(--theme-elevation-300)'
                        }`,
                        borderRadius: '4px',
                        padding: '12px',
                        transition: 'all 0.2s',
                      }}
                    >
                      <label
                        aria-label={`Select privilege: ${getLabel(privilege.label)}`}
                        htmlFor={`global-privilege-${privilege.privilegeKey}`}
                        style={{
                          alignItems: 'flex-start',
                          cursor: 'pointer',
                          display: 'flex',
                          gap: '12px',
                        }}
                      >
                        <input
                          aria-label={`Select privilege: ${getLabel(privilege.label)}`}
                          checked={isSelected}
                          id={`global-privilege-${privilege.privilegeKey}`}
                          onChange={() => handlePrivilegeToggle(privilege)}
                          style={{ cursor: 'pointer', marginTop: '2px' }}
                          type="checkbox"
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              alignItems: 'center',
                              color: 'var(--theme-elevation-1000)',
                              display: 'flex',
                              fontSize: '14px',
                              fontWeight: 600,
                              gap: '6px',
                              marginBottom: '4px',
                            }}
                          >
                            {isCustom && (
                              <span
                                aria-label="Custom privilege"
                                role="img"
                                style={{ fontSize: '16px' }}
                              >
                                ⭐
                              </span>
                            )}
                            {getLabel(privilege.label)}
                          </div>
                          <div
                            style={{
                              color: 'var(--theme-elevation-700)',
                              fontSize: '13px',
                              lineHeight: '1.4',
                              marginBottom: '8px',
                            }}
                          >
                            {getLabel(privilege.description)}
                          </div>
                          <div
                            style={{
                              backgroundColor: isCustom
                                ? 'var(--theme-warning-100)'
                                : 'var(--theme-elevation-100)',
                              borderRadius: '4px',
                              color: isCustom
                                ? 'var(--theme-warning-900)'
                                : 'var(--theme-elevation-800)',
                              display: 'inline-block',
                              fontFamily: 'monospace',
                              fontSize: '11px',
                              padding: '4px 8px',
                            }}
                          >
                            {isCustom && '⭐ '}
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
          const privileges = Object.values(global.privileges)
          const selectedCount = privileges.filter((p) => isPrivilegeSelected(p.privilegeKey)).length

          return (
            <Collapsible
              header={
                <div
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <div style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
                    <span aria-label="Global" role="img">
                      🌐
                    </span>
                    <span style={{ fontWeight: 500 }}>
                      {getLabel(global.globalLabel) || global.globalSlug}
                    </span>
                  </div>
                  {selectedCount > 0 && (
                    <span
                      style={{
                        backgroundColor: 'var(--theme-success-100)',
                        borderRadius: '12px',
                        color: 'var(--theme-success-800)',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '2px 8px',
                      }}
                    >
                      {selectedCount}
                    </span>
                  )}
                </div>
              }
              key={global.globalSlug}
            >
              <div
                style={{
                  backgroundColor: 'var(--theme-elevation-50)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '16px',
                }}
              >
                {privileges.map((privilege) => {
                  const isSelected = isPrivilegeSelected(privilege.privilegeKey)
                  const isCustom = privilege.isCustom === true
                  return (
                    <div
                      key={privilege.privilegeKey}
                      style={{
                        backgroundColor: 'var(--theme-elevation-0)',
                        border: `1px solid ${
                          isSelected ? 'var(--theme-success-300)' : 'var(--theme-elevation-300)'
                        }`,
                        borderRadius: '4px',
                        padding: '12px',
                        transition: 'all 0.2s',
                      }}
                    >
                      <label
                        aria-label={`Select privilege: ${getLabel(privilege.label)}`}
                        htmlFor={`global-privilege-${privilege.privilegeKey}`}
                        style={{
                          alignItems: 'flex-start',
                          cursor: 'pointer',
                          display: 'flex',
                          gap: '12px',
                        }}
                      >
                        <input
                          aria-label={`Select privilege: ${getLabel(privilege.label)}`}
                          checked={isSelected}
                          id={`global-privilege-${privilege.privilegeKey}`}
                          onChange={() => handlePrivilegeToggle(privilege)}
                          style={{ cursor: 'pointer', marginTop: '2px' }}
                          type="checkbox"
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              alignItems: 'center',
                              color: 'var(--theme-elevation-1000)',
                              display: 'flex',
                              fontSize: '14px',
                              fontWeight: 600,
                              gap: '6px',
                              marginBottom: '4px',
                            }}
                          >
                            {isCustom && (
                              <span
                                aria-label="Custom privilege"
                                role="img"
                                style={{ fontSize: '16px' }}
                              >
                                ⭐
                              </span>
                            )}
                            {getLabel(privilege.label)}
                          </div>
                          <div
                            style={{
                              color: 'var(--theme-elevation-700)',
                              fontSize: '13px',
                              lineHeight: '1.4',
                              marginBottom: '8px',
                            }}
                          >
                            {getLabel(privilege.description)}
                          </div>
                          <div
                            style={{
                              backgroundColor: isCustom
                                ? 'var(--theme-warning-100)'
                                : 'var(--theme-elevation-100)',
                              borderRadius: '4px',
                              color: isCustom
                                ? 'var(--theme-warning-900)'
                                : 'var(--theme-elevation-800)',
                              display: 'inline-block',
                              fontFamily: 'monospace',
                              fontSize: '11px',
                              padding: '4px 8px',
                            }}
                          >
                            {isCustom && '⭐ '}
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
            backgroundColor: 'var(--theme-elevation-100)',
            borderRadius: '4px',
            marginTop: '16px',
            padding: '16px',
          }}
        >
          <h5
            style={{
              color: 'var(--theme-elevation-1000)',
              fontSize: '14px',
              fontWeight: 600,
              margin: '0 0 12px 0',
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
                  alignItems: 'center',
                  backgroundColor: 'var(--theme-success-100)',
                  border: '1px solid var(--theme-success-300)',
                  borderRadius: '16px',
                  color: 'var(--theme-success-800)',
                  display: 'inline-flex',
                  fontSize: '12px',
                  gap: '8px',
                  padding: '6px 12px',
                }}
              >
                <span>{getPrivilegeLabel(privilegeKey)}</span>
                <button
                  onClick={() => {
                    removeFieldRow({ path, rowIndex: index })
                    setModified(true)
                  }}
                  style={{
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    color: 'var(--theme-success-600)',
                    cursor: 'pointer',
                    display: 'flex',
                    fontSize: '16px',
                    lineHeight: 1,
                    padding: 0,
                  }}
                  type="button"
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
