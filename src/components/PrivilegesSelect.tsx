'use client'
import type { ArrayFieldClientComponent } from 'payload'

import { useField, useForm, useFormFields, useTranslation } from '@payloadcms/ui'
import { memo, useCallback, useState } from 'react'
import { allGlobalPrivilegesMap, type GlobalPrivilege } from '../utils/generateGlobalPrivileges.js'
import { allPrivilegesMap, type Privilege } from '../utils/generatePrivileges.js'

/**
 * Custom array field component for managing privileges in Payload CMS
 * @component
 * @param {Object} props - Component props from Payload CMS
 * @param {string} props.path - Path to the field in the form
 */
const PrivilegesSelect: ArrayFieldClientComponent = ({ path }) => {
  const { rows } = useField({ path, hasRows: true })
  const { addFieldRow, removeFieldRow, setModified } = useForm()
  const { dispatch } = useFormFields(([_, dispatch]) => ({ dispatch }))
  const { i18n } = useTranslation()
  const locale = (i18n?.language || 'en') as 'en' | 'fr'

  const [selectedType, setSelectedType] = useState<'collection' | 'global' | null>(null)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [selectedPrivilege, setSelectedPrivilege] = useState<Privilege | GlobalPrivilege | null>(
    null,
  )

  // Convert maps to arrays for rendering
  const collectionsArray = Array.from(allPrivilegesMap.values())
  const globalsArray = Array.from(allGlobalPrivilegesMap.values())

  // Get selected data
  const selectedCollection =
    selectedType === 'collection' && selectedSlug ? allPrivilegesMap.get(selectedSlug) : null
  const selectedGlobal =
    selectedType === 'global' && selectedSlug ? allGlobalPrivilegesMap.get(selectedSlug) : null

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
      for (const collection of allPrivilegesMap.values()) {
        for (const privilege of Object.values(collection.privileges)) {
          if (privilege.privilegeKey === privilegeKey) {
            return privilege.label[locale]
          }
        }
      }
      // Check globals
      for (const global of allGlobalPrivilegesMap.values()) {
        for (const privilege of Object.values(global.privileges)) {
          if (privilege.privilegeKey === privilegeKey) {
            return privilege.label[locale]
          }
        }
      }
      return privilegeKey
    },
    [locale],
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
   * Handles collection/global selection
   */
  const handleItemClick = useCallback((type: 'collection' | 'global', slug: string) => {
    setSelectedType(type)
    setSelectedSlug(slug)
    setSelectedPrivilege(null)
  }, [])

  /**
   * Handles privilege selection/deselection
   */
  const handlePrivilegeToggle = useCallback(
    (privilege: Privilege) => {
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

  /**
   * Handles privilege click for description display
   */
  const handlePrivilegeClick = useCallback((privilege: Privilege) => {
    setSelectedPrivilege(privilege)
  }, [])

  return (
    <div style={{ marginTop: '16px', marginBottom: '16px' }}>
      <div
        style={{
          border: '1px solid var(--theme-elevation-400)',
          borderRadius: '4px',
          overflow: 'hidden',
          backgroundColor: 'var(--theme-elevation-50)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '250px 250px 1fr',
            borderBottom: '1px solid var(--theme-elevation-400)',
          }}
        >
          {/* Collections Column */}
          <div style={{ borderRight: '1px solid var(--theme-elevation-400)' }}>
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--theme-elevation-400)',
                backgroundColor: 'var(--theme-elevation-100)',
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'var(--theme-elevation-800)',
                }}
              >
                Collections & Globals
              </h4>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {collectionsArray.map((collection) => {
                const isSelected =
                  selectedType === 'collection' && selectedSlug === collection.collectionSlug
                return (
                  <button
                    key={collection.collectionSlug}
                    onClick={() => handleItemClick('collection', collection.collectionSlug)}
                    type="button"
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 16px',
                      border: 'none',
                      borderBottom: '1px solid var(--theme-elevation-200)',
                      backgroundColor: isSelected ? 'var(--theme-elevation-200)' : 'transparent',
                      color: 'var(--theme-elevation-1000)',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'var(--theme-elevation-150)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ textTransform: 'capitalize' }}>
                        📦 {collection.collectionSlug.replace(/-/g, ' ')}
                      </span>
                    </div>
                  </button>
                )
              })}
              {globalsArray.map((global) => {
                const isSelected = selectedType === 'global' && selectedSlug === global.globalSlug
                return (
                  <button
                    key={global.globalSlug}
                    onClick={() => handleItemClick('global', global.globalSlug)}
                    type="button"
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 16px',
                      border: 'none',
                      borderBottom: '1px solid var(--theme-elevation-200)',
                      backgroundColor: isSelected ? 'var(--theme-elevation-200)' : 'transparent',
                      color: 'var(--theme-elevation-1000)',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'var(--theme-elevation-150)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ textTransform: 'capitalize' }}>
                        🌐 {global.globalSlug.replace(/-/g, ' ')}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Privileges Column */}
          <div style={{ borderRight: '1px solid var(--theme-elevation-400)' }}>
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--theme-elevation-400)',
                backgroundColor: 'var(--theme-elevation-100)',
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'var(--theme-elevation-800)',
                }}
              >
                Privileges
              </h4>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {selectedCollection || selectedGlobal ? (
                Object.values(
                  selectedCollection ? selectedCollection.privileges : selectedGlobal!.privileges,
                ).map((privilege) => {
                  const isSelected = isPrivilegeSelected(privilege.privilegeKey)
                  return (
                    <div
                      key={privilege.privilegeKey}
                      style={{
                        borderBottom: '1px solid var(--theme-elevation-200)',
                      }}
                    >
                      <button
                        onClick={() => handlePrivilegeClick(privilege)}
                        type="button"
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '12px 16px',
                          border: 'none',
                          backgroundColor:
                            selectedPrivilege?.privilegeKey === privilege.privilegeKey
                              ? 'var(--theme-elevation-200)'
                              : 'transparent',
                          color: 'var(--theme-elevation-1000)',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          fontSize: '14px',
                        }}
                        onMouseEnter={(e) => {
                          if (selectedPrivilege?.privilegeKey !== privilege.privilegeKey) {
                            e.currentTarget.style.backgroundColor = 'var(--theme-elevation-150)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedPrivilege?.privilegeKey !== privilege.privilegeKey) {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handlePrivilegeToggle(privilege)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ cursor: 'pointer' }}
                          />
                          <span>{privilege.label[locale]}</span>
                        </div>
                      </button>
                    </div>
                  )
                })
              ) : (
                <div
                  style={{
                    padding: '24px 16px',
                    color: 'var(--theme-elevation-600)',
                    fontSize: '14px',
                    textAlign: 'center',
                  }}
                >
                  Select a collection or global to view privileges
                </div>
              )}
            </div>
          </div>

          {/* Description Column */}
          <div>
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--theme-elevation-400)',
                backgroundColor: 'var(--theme-elevation-100)',
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'var(--theme-elevation-800)',
                }}
              >
                Description
              </h4>
            </div>
            <div style={{ padding: '16px', maxHeight: '400px', overflowY: 'auto' }}>
              {selectedPrivilege ? (
                <div>
                  <h5
                    style={{
                      margin: '0 0 8px 0',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--theme-elevation-1000)',
                    }}
                  >
                    {selectedPrivilege.label[locale]}
                  </h5>
                  <p
                    style={{
                      margin: '0 0 12px 0',
                      fontSize: '13px',
                      color: 'var(--theme-elevation-700)',
                      lineHeight: '1.5',
                    }}
                  >
                    {selectedPrivilege.description[locale]}
                  </p>
                  <div
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'var(--theme-elevation-100)',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      color: 'var(--theme-elevation-800)',
                    }}
                  >
                    {selectedPrivilege.privilegeKey}
                  </div>
                </div>
              ) : selectedCollection ? (
                <div>
                  <h5
                    style={{
                      margin: '0 0 8px 0',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--theme-elevation-1000)',
                      textTransform: 'capitalize',
                    }}
                  >
                    📦 {selectedCollection.collectionSlug.replace(/-/g, ' ')}
                  </h5>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '13px',
                      color: 'var(--theme-elevation-700)',
                      lineHeight: '1.5',
                    }}
                  >
                    {selectedCollection.description[locale]}
                  </p>
                </div>
              ) : selectedGlobal ? (
                <div>
                  <h5
                    style={{
                      margin: '0 0 8px 0',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--theme-elevation-1000)',
                      textTransform: 'capitalize',
                    }}
                  >
                    🌐 {selectedGlobal.globalSlug.replace(/-/g, ' ')}
                  </h5>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '13px',
                      color: 'var(--theme-elevation-700)',
                      lineHeight: '1.5',
                    }}
                  >
                    {selectedGlobal.description[locale]}
                  </p>
                </div>
              ) : (
                <p
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    color: 'var(--theme-elevation-600)',
                    textAlign: 'center',
                  }}
                >
                  Select a privilege to view its description
                </p>
              )}
            </div>
          </div>
        </div>
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
            Selected Privileges ({existingPrivileges.length})
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
