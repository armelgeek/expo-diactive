import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl, Platform, Linking } from 'react-native'
import { Text, Card, Button, List, Searchbar, Divider } from 'react-native-paper'
import * as Contacts from 'expo-contacts'
import { supabase } from '../../services/supabase'

export default function SocialScreen({navigation}) {
  const [loading, setLoading] = useState(false)
  const [contacts, setContacts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [appUsers, setAppUsers] = useState([])
  const [error, setError] = useState(null)

  // Charger les contacts du téléphone
  const loadContacts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Demander la permission d'accéder aux contacts
      const { status } = await Contacts.requestPermissionsAsync()
      if (status !== 'granted') {
        setError('Permission d\'accéder aux contacts refusée')
        return
      }

      // Récupérer tous les contacts
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      })

      // Filtrer les contacts avec des numéros de téléphone
      const contactsWithPhones = data
        .filter(contact => contact.phoneNumbers && contact.phoneNumbers.length > 0)
        .map(contact => ({
          id: contact.id,
          name: contact.name,
          phoneNumber: contact.phoneNumbers[0].number.replace(/\s+/g, ''), // Nettoyer le numéro
        }))

      setContacts(contactsWithPhones)

      // Vérifier quels contacts sont sur l'application
      const { data: users, error: usersError } = await supabase
        .from('profile')
        .select('id, user_name, phone')
        .in('phone', contactsWithPhones.map(c => c.phoneNumber))

        users.map(user => {
          user.full_name = user.user_name
          return user
        })
      if (usersError) throw usersError

      setAppUsers(users || [])
    } catch (err) {
      console.error('Error loading contacts:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Inviter un contact par SMS
  const inviteContact = useCallback(async (contact) => {
    try {
      const message = 'Rejoins-nous sur DiActive ! Une super app pour gagner des points en marchant et les échanger contre des récompenses.'
      const phoneNumber = contact.phoneNumber

      // Construire l'URL pour le SMS
      let url
      if (Platform.OS === 'android') {
        url = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`
      } else {
        url = `sms:${phoneNumber}&body=${encodeURIComponent(message)}`
      }

      const canOpen = await Linking.canOpenURL(url)
      if (!canOpen) {
        throw new Error('Impossible d\'ouvrir l\'application SMS')
      }

      await Linking.openURL(url)
    } catch (err) {
      console.error('Error sending SMS:', err)
      setError(err.message)
    }
  }, [])

  // Ajouter un ami déjà sur l'application
  const addFriend = useCallback(async (userId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { error: friendError } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: userId,
          status: 'pending'
        })

      if (friendError) throw friendError

      // Rafraîchir la liste
      await loadContacts()
    } catch (err) {
      console.error('Error adding friend:', err)
      setError(err.message)
    }
  }, [loadContacts])

  // Charger les contacts au démarrage
  useEffect(() => {
    loadContacts()
  }, [loadContacts])

  // Filtrer les contacts selon la recherche
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Rechercher un contact"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadContacts} />
        }
      >
        {error && (
          <Text style={styles.error}>{error}</Text>
        )}

        <List.Section>
          <List.Subheader>Contacts sur DiActive</List.Subheader>
          {filteredContacts
            .filter(contact => appUsers.some(user => user.phone === contact.phoneNumber))
            .map(contact => {
              const appUser = appUsers.find(user => user.phone === contact.phoneNumber)
              return (
                <List.Item
                  key={contact.id}
                  title={contact.name}
                  description="Déjà sur DiActive"
                  left={props => <List.Icon {...props} icon="account" />}
                  right={props => (
                    <Button
                      mode="contained"
                      onPress={() => addFriend(appUser.id)}
                      compact
                    >
                      Ajouter
                    </Button>
                  )}
                />
              )
            })
          }
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Inviter des contacts</List.Subheader>
          {filteredContacts
            .filter(contact => !appUsers.some(user => user.phone === contact.phoneNumber))
            .map(contact => (
              <List.Item
                key={contact.id}
                title={contact.name}
                description={contact.phoneNumber}
                left={props => <List.Icon {...props} icon="account-plus" />}
                right={props => (
                  <Button
                    mode="outlined"
                    onPress={() => inviteContact(contact)}
                    compact
                  >
                    Inviter
                  </Button>
                )}
              />
            ))
          }
        </List.Section>
      </ScrollView>

      <Button
        mode="contained"
        onPress={() => navigation.navigate('Profile' , {screen: 'Institutes'})}
        style={styles.button}
      >
        Faire un don
      </Button>

      <Button
        mode="outlined"
        onPress={() => navigation.navigate('Profile' , {screen: 'Donations'})}
        style={styles.button}
      >
        Voir mes dons
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchbar: {
    margin: 16,
  },
  error: {
    color: '#ff190c',
    margin: 16,
  },
  button: {
    margin: 16,
  },
})
