import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { Text, Overlay, CheckBox, Button, SearchBar } from 'react-native-elements'
import { Ionicons } from '@expo/vector-icons'

export const ContactSelectionModal = ({
  isVisible,
  onClose,
  contacts,
  onInviteSelected,
  existingUsers,
}) => {
  const [search, setSearch] = useState('')
  const [selectedContacts, setSelectedContacts] = useState({})

  // Filtrer les contacts en fonction de la recherche
  const filteredContacts = contacts.filter(contact => {
    const searchTerm = search.toLowerCase()
    const name = (contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`).toLowerCase()
    return name.includes(searchTerm)
  })

  const handleToggleContact = (contact, type, value) => {
    setSelectedContacts(prev => {
      const current = prev[contact.id] || {}
      const newValue = {
        ...current,
        contact,
        [type]: value,
      }
      
      // Mettre à jour selected seulement si au moins un moyen de contact est sélectionné
      newValue.selected = newValue.email || newValue.phone
      
      return {
        ...prev,
        [contact.id]: newValue
      }
    })
  }

  const handleInvite = () => {
    const contactsToInvite = Object.values(selectedContacts)
      .filter(item => item.selected)
      .map(item => {
        const contact = item.contact
        const email = item.email && contact.emails?.[0]?.email ? contact.emails[0].email : null
        const phone = item.phone && contact.phoneNumbers?.[0]?.number ? contact.phoneNumbers[0].number.replace(/\s+/g, '') : null
        
        // Vérifier qu'au moins un moyen de contact est sélectionné
        if (!email && !phone) {
          throw new Error(`Veuillez sélectionner au moins un moyen de contact pour ${contact.name || contact.firstName || 'le contact'}`)
        }

        return {
          full_name: contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
          email,
          phone,
        }
      })

    if (contactsToInvite.length === 0) {
      alert('Veuillez sélectionner au moins un contact à inviter')
      return
    }
    
    onInviteSelected(contactsToInvite)
    setSelectedContacts({})
    setSearch('')
  }

  const isExistingUser = (contact) => {
    return existingUsers.some(user => 
      (contact.emails?.[0]?.email && user.email === contact.emails[0].email) ||
      (contact.phoneNumbers?.[0]?.number && user.phone === contact.phoneNumbers[0].number.replace(/\s+/g, ''))
    )
  }

  return (
    <Overlay
      isVisible={isVisible}
      onBackdropPress={onClose}
      overlayStyle={styles.overlay}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text h4>Sélectionner des contacts</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <SearchBar
          placeholder="Rechercher un contact..."
          onChangeText={setSearch}
          value={search}
          containerStyle={styles.searchContainer}
          inputContainerStyle={styles.searchInput}
          lightTheme
        />

        <ScrollView style={styles.contactsList}>
          {filteredContacts.map(contact => {
            const isOnPlatform = isExistingUser(contact)
            const name = contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`
            const hasEmail = contact.emails?.length > 0
            const hasPhone = contact.phoneNumbers?.length > 0
            const selected = selectedContacts[contact.id]

            return (
              <View key={contact.id} style={styles.contactItem}>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{name}</Text>
                  {isOnPlatform && (
                    <Text style={styles.platformStatus}>Déjà sur la plateforme</Text>
                  )}
                  {!isOnPlatform && (
                    <View style={styles.contactMethods}>
                      {hasEmail && (
                        <View style={styles.methodContainer}>
                          <CheckBox
                            checked={selected?.email}
                            onPress={() => handleToggleContact(contact, 'email', !selected?.email)}
                            title={contact.emails[0].email}
                            containerStyle={styles.checkbox}
                          />
                        </View>
                      )}
                      {hasPhone && (
                        <View style={styles.methodContainer}>
                          <CheckBox
                            checked={selected?.phone}
                            onPress={() => handleToggleContact(contact, 'phone', !selected?.phone)}
                            title={contact.phoneNumbers[0].number}
                            containerStyle={styles.checkbox}
                          />
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
            )
          })}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Inviter les contacts sélectionnés"
            onPress={handleInvite}
            disabled={Object.values(selectedContacts).filter(item => item.selected).length === 0}
          />
        </View>
      </View>
    </Overlay>
  )
}

const styles = StyleSheet.create({
  overlay: {
    width: '90%',
    height: '80%',
    padding: 0,
    borderRadius: 10,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    padding: 10,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  contactsList: {
    flex: 1,
  },
  contactItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  platformStatus: {
    color: '#2089dc',
    fontSize: 12,
    marginBottom: 5,
  },
  contactMethods: {
    marginLeft: 10,
  },
  methodContainer: {
    marginVertical: 2,
  },
  checkbox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
}) 